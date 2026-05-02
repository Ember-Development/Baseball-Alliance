/**
 * One-off production admin bootstrap (ECS task).
 * Reads ADMIN_USERS_JSON; requires DATABASE_URL (and existing Prisma migrations).
 */
import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const AdminUserInputSchema = z.object({
  email: z.string().email(),

  /** Plain password (required key). Use empty string on existing users to leave the hash unchanged. */
  password: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const AdminUsersJsonSchema = z.array(AdminUserInputSchema).min(1);

function fullNameFrom(input: z.infer<typeof AdminUserInputSchema>): string {
  const parts = [input.firstName?.trim(), input.lastName?.trim()].filter(
    (p): p is string => Boolean(p && p.length > 0),
  );
  return parts.length > 0 ? parts.join(" ") : "Administrator";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parsePassword(row: z.infer<typeof AdminUserInputSchema>): string | undefined {
  const p = row.password;
  if (p === undefined) return undefined;
  const t = p.trim();
  return t.length === 0 ? undefined : t;
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is missing or empty");
    process.exit(1);
  }

  const raw = process.env.ADMIN_USERS_JSON;
  if (!raw?.trim()) {
    console.error("ADMIN_USERS_JSON is missing or empty");
    process.exit(1);
  }

  let entries: z.infer<typeof AdminUsersJsonSchema>;
  try {
    const json: unknown = JSON.parse(raw);
    entries = AdminUsersJsonSchema.parse(json);
  } catch (e) {
    console.error("Invalid ADMIN_USERS_JSON (parse or validation failed)");
    console.error(e);
    process.exit(1);
  }

  const seen = new Set<string>();
  for (const row of entries) {
    const key = normalizeEmail(row.email);
    if (seen.has(key)) {
      console.error(`Duplicate email in ADMIN_USERS_JSON: ${key}`);
      process.exit(1);
    }
    seen.add(key);
  }

  const prisma = new PrismaClient();
  const createdEmails: string[] = [];
  const updatedEmails: string[] = [];

  try {
    for (const row of entries) {
      const email = normalizeEmail(row.email);
      const passwordPlain = parsePassword(row);

      if (passwordPlain !== undefined && passwordPlain.length < 6) {
        console.error(
          `Password for ${email} must be at least 6 characters when provided`,
        );
        process.exit(1);
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        include: { roles: true },
      });

      if (!existing) {
        if (!passwordPlain) {
          console.error(`New admin ${email}: password is required`);
          process.exit(1);
        }

        const passwordHash = await bcrypt.hash(passwordPlain, 10);
        const fullName = fullNameFrom(row);

        await prisma.user.create({
          data: {
            email,
            fullName,
            passwordHash,
            roles: { create: [{ role: RoleName.ADMIN }] },
            admin: { create: {} },
          },
        });
        createdEmails.push(email);
        continue;
      }

      const data: {
        passwordHash?: string;
        fullName?: string;
      } = {};

      if (passwordPlain) {
        data.passwordHash = await bcrypt.hash(passwordPlain, 10);
      }

      if (row.firstName !== undefined || row.lastName !== undefined) {
        data.fullName = fullNameFrom(row);
      }

      if (Object.keys(data).length > 0) {
        await prisma.user.update({
          where: { id: existing.id },
          data,
        });
      }

      await prisma.userRole.upsert({
        where: {
          userId_role: { userId: existing.id, role: RoleName.ADMIN },
        },
        create: { userId: existing.id, role: RoleName.ADMIN },
        update: {},
      });

      await prisma.adminProfile.upsert({
        where: { userId: existing.id },
        create: { userId: existing.id },
        update: {},
      });

      updatedEmails.push(email);
    }

    for (const email of createdEmails) {
      console.log(`Created admin: ${email}`);
    }
    for (const email of updatedEmails) {
      console.log(`Updated admin: ${email}`);
    }
    console.log(`Total admins processed: ${entries.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("createAdmins failed:", e);
  process.exit(1);
});
