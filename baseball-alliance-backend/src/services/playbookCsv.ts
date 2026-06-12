import { BamsMembershipTier, RoleName } from "@prisma/client";
import { prisma } from "../db.js";
import { requestMagicLink } from "./magicLink.js";
import { parseMembershipTier } from "./bamsMembership.js";

export type PlaybookImportRow = {
  email: string;
  fullName: string;
  phone?: string;
  dob?: Date;
  playbookId?: string;
  membership?: BamsMembershipTier;
  gradYear?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  bats?: string;
  throws?: string;
  height?: string;
  weight?: string;
  schoolName?: string;
  schoolLocation?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type PlaybookImportMemberSummary = {
  email: string;
  fullName: string;
  action: "created" | "updated";
  signInEmailSent: boolean;
};

export type PlaybookImportResult = {
  created: number;
  updated: number;
  skipped: number;
  emailsSent: number;
  emailsFailed: number;
  members: PlaybookImportMemberSummary[];
  errors: Array<{ row: number; email?: string; message: string }>;
};

const COLUMN_ALIASES: Record<keyof Omit<PlaybookImportRow, "dob">, string[]> = {
  email: [
    "email",
    "e-mail",
    "email address",
    "user email",
    "primary email",
    "account email",
    "account e-mail",
    "participant email",
  ],
  fullName: ["full name", "name", "fullname", "participant name", "member name"],
  phone: [
    "phone",
    "mobile",
    "cell",
    "phone number",
    "mobile phone",
    "account phone",
  ],
  playbookId: [
    "playbook id",
    "user id",
    "external id",
    "participant id",
    "member id",
    "id",
  ],
  membership: ["membership", "bams membership", "bams tier", "tier", "plan"],
  gradYear: [
    "grad year",
    "grad year - hs",
    "grad year hs",
    "graduation year",
    "class of",
    "graduation",
  ],
  primaryPosition: ["primary position", "position", "primary pos"],
  secondaryPosition: ["secondary position", "secondary pos"],
  bats: ["bats", "batting"],
  throws: ["throws", "throwing"],
  height: ["height"],
  weight: ["weight"],
  schoolName: ["school", "school name", "high school"],
  schoolLocation: ["school location", "school city"],
  city: ["city", "home city"],
  state: ["state", "home state"],
  zip: ["zip", "zip code", "postal code", "postal"],
};

const FIRST_NAME_ALIASES = ["first name", "firstname", "first"];
const LAST_NAME_ALIASES = ["last name", "lastname", "last"];
const DOB_ALIASES = ["dob", "date of birth", "birthdate", "birth date"];

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text: string): string[][] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.map(parseCsvLine);
}

function resolveColumnIndex(
  headers: string[],
  aliases: string[]
): number | undefined {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx >= 0) return idx;
  }
  // Playbook exports often use longer headers (e.g. "Account Email", "Grad Year - HS").
  // Skip short aliases here so "name" does not match "first name", etc.
  for (const alias of aliases) {
    if (alias.length < 5) continue;
    const idx = normalized.findIndex((h) => h.includes(alias));
    if (idx >= 0) return idx;
  }
  return undefined;
}

function cell(row: string[], idx: number | undefined): string | undefined {
  if (idx === undefined) return undefined;
  const v = row[idx]?.trim();
  return v && v.length > 0 ? v : undefined;
}

function parseDob(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function buildFullName(
  row: string[],
  headers: string[],
  fullNameIdx: number | undefined,
  firstIdx: number | undefined,
  lastIdx: number | undefined
): string | undefined {
  const direct = cell(row, fullNameIdx);
  if (direct) return direct;
  const first = cell(row, firstIdx);
  const last = cell(row, lastIdx);
  const parts = [first, last].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return undefined;
}

export function parsePlaybookCsv(csvText: string): {
  rows: PlaybookImportRow[];
  errors: PlaybookImportResult["errors"];
} {
  const grid = parseCsv(csvText);
  if (grid.length < 2) {
    return {
      rows: [],
      errors: [{ row: 0, message: "CSV must include a header row and at least one data row" }],
    };
  }

  const headers = grid[0];
  const col: Record<string, number | undefined> = {};
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    col[key] = resolveColumnIndex(headers, aliases);
  }
  const firstIdx = resolveColumnIndex(headers, FIRST_NAME_ALIASES);
  const lastIdx = resolveColumnIndex(headers, LAST_NAME_ALIASES);
  const dobIdx = resolveColumnIndex(headers, DOB_ALIASES);
  const fullNameIdx = col.fullName;

  if (col.email === undefined) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message:
            'CSV must include an "Email" column (or alias: e-mail, email address, etc.)',
        },
      ],
    };
  }

  const rows: PlaybookImportRow[] = [];
  const errors: PlaybookImportResult["errors"] = [];

  for (let i = 1; i < grid.length; i++) {
    const line = grid[i];
    const rowNum = i + 1;
    const emailRaw = cell(line, col.email);
    if (!emailRaw) {
      errors.push({ row: rowNum, message: "Missing email" });
      continue;
    }
    const email = emailRaw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNum, email, message: "Invalid email" });
      continue;
    }

    const fullName = buildFullName(line, headers, fullNameIdx, firstIdx, lastIdx);
    if (!fullName) {
      errors.push({ row: rowNum, email, message: "Missing name (full name or first + last)" });
      continue;
    }

    const membershipRaw = cell(line, col.membership);
    let membership: BamsMembershipTier | undefined;
    if (membershipRaw) {
      membership = parseMembershipTier(membershipRaw);
      if (!membership) {
        errors.push({
          row: rowNum,
          email,
          message: 'Invalid membership (use "bams" or "bams-premium")',
        });
        continue;
      }
    }

    rows.push({
      email,
      fullName,
      phone: cell(line, col.phone),
      dob: parseDob(cell(line, dobIdx)),
      playbookId: cell(line, col.playbookId)?.trim() || undefined,
      membership,
      gradYear: cell(line, col.gradYear),
      primaryPosition: cell(line, col.primaryPosition),
      secondaryPosition: cell(line, col.secondaryPosition),
      bats: cell(line, col.bats),
      throws: cell(line, col.throws),
      height: cell(line, col.height),
      weight: cell(line, col.weight),
      schoolName: cell(line, col.schoolName),
      schoolLocation: cell(line, col.schoolLocation),
      city: cell(line, col.city),
      state: cell(line, col.state),
      zip: cell(line, col.zip),
    });
  }

  return { rows, errors };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function sendImportWelcomeEmail(email: string): Promise<boolean> {
  try {
    const out = await requestMagicLink(email);
    return out.sent;
  } catch (err) {
    console.error(`[playbook-import] Failed to send BAMS sign-in email to ${email}:`, err);
    return false;
  }
}

const importUserInclude = { roles: true, bamsMember: true } as const;
type ImportUser = NonNullable<
  Awaited<ReturnType<typeof prisma.user.findUnique<{ where: { email: string }; include: typeof importUserInclude }>>>
>;

async function findUserForImport(
  row: PlaybookImportRow,
  email: string
): Promise<{ user: ImportUser; matchedBy: "playbookId" | "email" } | null> {
  if (row.playbookId) {
    const byPlaybook = await prisma.user.findUnique({
      where: { playbookId: row.playbookId },
      include: importUserInclude,
    });
    if (byPlaybook) {
      return { user: byPlaybook, matchedBy: "playbookId" };
    }
  }

  const byEmail = await prisma.user.findUnique({
    where: { email },
    include: importUserInclude,
  });
  if (byEmail) {
    return { user: byEmail, matchedBy: "email" };
  }

  return null;
}

async function applyMemberImport(
  existing: ImportUser,
  row: PlaybookImportRow,
  email: string,
  profileData: Record<string, string | BamsMembershipTier | undefined>
): Promise<void> {
  await prisma.user.update({
    where: { id: existing.id },
    data: {
      email,
      fullName: row.fullName,
      phone: row.phone ?? existing.phone,
      dob: row.dob ?? existing.dob,
      playbookId: row.playbookId ?? existing.playbookId,
      playbookImportedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_role: { userId: existing.id, role: RoleName.MEMBER },
    },
    create: { userId: existing.id, role: RoleName.MEMBER },
    update: {},
  });

  await prisma.bamsMemberProfile.upsert({
    where: { userId: existing.id },
    create: { userId: existing.id, ...profileData },
    update: profileData,
  });
}

export async function importPlaybookMembers(
  rows: PlaybookImportRow[]
): Promise<PlaybookImportResult> {
  const result: PlaybookImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    emailsSent: 0,
    emailsFailed: 0,
    members: [],
    errors: [],
  };

  const seenEmails = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const email = normalizeEmail(row.email);

    if (seenEmails.has(email)) {
      result.skipped++;
      result.errors.push({
        row: rowNum,
        email,
        message: "Duplicate email in file",
      });
      continue;
    }
    seenEmails.add(email);

    try {
      const profileData = {
        gradYear: row.gradYear,
        primaryPosition: row.primaryPosition,
        secondaryPosition: row.secondaryPosition,
        bats: row.bats,
        throws: row.throws,
        height: row.height,
        weight: row.weight,
        schoolName: row.schoolName,
        schoolLocation: row.schoolLocation,
        city: row.city,
        state: row.state,
        zip: row.zip,
        membership: row.membership ?? BamsMembershipTier.BAMS,
      };

      const found = await findUserForImport(row, email);

      if (!found?.user) {
        await prisma.user.create({
          data: {
            email,
            fullName: row.fullName,
            phone: row.phone,
            dob: row.dob,
            playbookId: row.playbookId,
            playbookImportedAt: new Date(),
            roles: { create: [{ role: RoleName.MEMBER }] },
            bamsMember: { create: profileData },
          },
        });
        const signInEmailSent = await sendImportWelcomeEmail(email);
        console.log(`[playbook-import] created ${email} (${row.fullName})`);
        result.created++;
        result.members.push({
          email,
          fullName: row.fullName,
          action: "created",
          signInEmailSent,
        });
        if (signInEmailSent) result.emailsSent++;
        else result.emailsFailed++;
        continue;
      }

      const { user: existing, matchedBy } = found;

      if (existing.email !== email) {
        const emailOwner = await prisma.user.findUnique({ where: { email } });
        if (emailOwner && emailOwner.id !== existing.id) {
          result.skipped++;
          result.errors.push({
            row: rowNum,
            email,
            message: `Email already used by another account (${emailOwner.email})`,
          });
          continue;
        }
      }

      if (
        matchedBy === "email" &&
        row.playbookId &&
        row.playbookId !== existing.playbookId
      ) {
        const clash = await prisma.user.findFirst({
          where: { playbookId: row.playbookId, NOT: { id: existing.id } },
        });
        if (clash) {
          result.skipped++;
          result.errors.push({
            row: rowNum,
            email,
            message: `Playbook ID already assigned to ${clash.email}`,
          });
          continue;
        }
      }

      await applyMemberImport(existing, row, email, {
        ...profileData,
        membership:
          row.membership ??
          existing.bamsMember?.membership ??
          BamsMembershipTier.BAMS,
      });

      const signInEmailSent = await sendImportWelcomeEmail(email);
      const emailChanged =
        matchedBy === "playbookId" && existing.email !== email;
      console.log(
        `[playbook-import] updated ${email} (${row.fullName})${
          emailChanged ? ` — email was ${existing.email}` : ""
        }`
      );
      result.updated++;
      result.members.push({
        email,
        fullName: row.fullName,
        action: "updated",
        signInEmailSent,
      });
      if (signInEmailSent) result.emailsSent++;
      else result.emailsFailed++;
    } catch (e) {
      result.skipped++;
      result.errors.push({
        row: rowNum,
        email,
        message: e instanceof Error ? e.message : "Import failed",
      });
    }
  }

  return result;
}

export function userHasBamsAccess(roles: { role: string }[]): boolean {
  const names = roles.map((r) => r.role);
  return names.includes(RoleName.MEMBER) || names.includes(RoleName.ADMIN);
}
