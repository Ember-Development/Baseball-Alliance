import { BamsMatchStatus, Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import {
  parseSyncEventExportCsv,
  type ParsedEventAthlete,
} from "./eventCsvParser.js";
import { buildMatchRequestFromEventRow } from "./eventCsvToMatchRequest.js";
import type { PlaybookImportRow } from "./playbookCsv.js";

export type PlaybookEventImportResult = {
  uploadId?: string;
  eventRowCount: number;
  linkedToMembers: number;
  unlinkedPlayerIds: string[];
  warnings: string[];
  parseErrors: Array<{ row: number; message: string }>;
  rowErrors: Array<{ row: number; playerId?: string; message: string }>;
};

type MemberProfileHint = {
  gradYear?: string;
  primaryPosition?: string;
};

function gradYearFromHint(hint?: MemberProfileHint): number | undefined {
  if (!hint?.gradYear) return undefined;
  const n = Number(hint.gradYear.trim());
  if (!Number.isFinite(n) || n < 2000 || n > 2040) return undefined;
  return Math.trunc(n);
}

function buildMemberLookup(
  importRows: PlaybookImportRow[]
): Map<string, MemberProfileHint> {
  const map = new Map<string, MemberProfileHint>();
  for (const row of importRows) {
    const id = row.playbookId?.trim();
    if (!id) continue;
    map.set(id, {
      gradYear: row.gradYear,
      primaryPosition: row.primaryPosition,
    });
  }
  return map;
}

async function loadMemberHintsFromDb(
  playerIds: string[]
): Promise<Map<string, MemberProfileHint>> {
  if (playerIds.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { playbookId: { in: playerIds } },
    select: {
      playbookId: true,
      bamsMember: {
        select: { gradYear: true, primaryPosition: true },
      },
    },
  });

  const map = new Map<string, MemberProfileHint>();
  for (const user of users) {
    const id = user.playbookId?.trim();
    if (!id) continue;
    map.set(id, {
      gradYear: user.bamsMember?.gradYear ?? undefined,
      primaryPosition: user.bamsMember?.primaryPosition ?? undefined,
    });
  }
  return map;
}

function enrichAthleteFromMember(
  athlete: ParsedEventAthlete,
  hints: Map<string, MemberProfileHint>
): ParsedEventAthlete {
  const playerId = athlete.playerId?.trim();
  if (!playerId) return athlete;

  const hint = hints.get(playerId);
  if (!hint) return athlete;

  const gradYear = athlete.gradYear ?? gradYearFromHint(hint);
  const primaryPosition =
    athlete.primaryPosition && athlete.primaryPosition !== "UNKNOWN"
      ? athlete.primaryPosition
      : hint.primaryPosition?.trim() || athlete.primaryPosition;

  const rawRow = {
    ...(athlete.rawRow as Record<string, string>),
    primary_position: primaryPosition === "UNKNOWN" ? "" : primaryPosition,
    grad_year:
      gradYear !== undefined
        ? String(gradYear)
        : (athlete.rawRow as Record<string, string>).grad_year ?? "",
  };

  const parseErrors = athlete.parseErrors.filter(
    (e) =>
      !e.includes("will use Playbook") &&
      e !== "primary_position is empty" &&
      e !== "Invalid grad_year" &&
      !e.startsWith("grad_year is missing") &&
      e !== "primary_position is required" &&
      !e.startsWith("grad_year is required")
  );

  const { request, errors: mapErrors } = buildMatchRequestFromEventRow(rawRow);
  parseErrors.push(...mapErrors);

  return {
    ...athlete,
    primaryPosition: primaryPosition || "UNKNOWN",
    gradYear,
    rawRow,
    parseErrors,
    matchRequest: parseErrors.length === 0 ? request : undefined,
  };
}

export async function importPlaybookSyncEvents(
  adminUserId: string,
  csvText: string,
  importRows: PlaybookImportRow[],
  fileName?: string
): Promise<PlaybookEventImportResult> {
  const parsed = parseSyncEventExportCsv(csvText);
  const result: PlaybookEventImportResult = {
    eventRowCount: 0,
    linkedToMembers: 0,
    unlinkedPlayerIds: [],
    warnings: parsed.warnings,
    parseErrors: parsed.fileErrors,
    rowErrors: [],
  };

  if (parsed.athletes.length === 0) {
    return result;
  }

  const playerIds = [
    ...new Set(
      parsed.athletes
        .map((a) => a.playerId?.trim())
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const hints = buildMemberLookup(importRows);
  const dbHints = await loadMemberHintsFromDb(playerIds);
  for (const [id, hint] of dbHints) {
    if (!hints.has(id)) hints.set(id, hint);
  }

  const enriched = parsed.athletes.map((a) => enrichAthleteFromMember(a, hints));
  const linkedIds = new Set<string>();

  for (const athlete of enriched) {
    const playerId = athlete.playerId?.trim();
    if (playerId && hints.has(playerId)) linkedIds.add(playerId);
    if (athlete.parseErrors.length > 0) {
      result.rowErrors.push({
        row: athlete.rowIndex + 1,
        playerId,
        message: athlete.parseErrors.join("; "),
      });
    }
  }

  result.linkedToMembers = linkedIds.size;
  result.unlinkedPlayerIds = playerIds.filter((id) => !linkedIds.has(id));

  const primaryEvent = enriched[0];
  const upload = await prisma.bamsEventUpload.create({
    data: {
      userId: adminUserId,
      fileName,
      eventName: primaryEvent?.eventName,
      eventStartDate: primaryEvent?.eventStartDate,
      rowCount: enriched.length,
      warnings: parsed.warnings.length ? parsed.warnings : undefined,
      athletes: {
        create: enriched.map((a) => ({
          rowIndex: a.rowIndex,
          athleteUuid: a.athleteUuid,
          eventName: a.eventName,
          eventStartDate: a.eventStartDate,
          eventDivision: a.eventDivision,
          eventLevel: a.eventLevel,
          orderDate: a.orderDate,
          firstName: a.firstName,
          lastName: a.lastName,
          playerId: a.playerId,
          athleteUrl: a.athleteUrl,
          primaryPosition: a.primaryPosition,
          gradYear: a.gradYear,
          rawRow: a.rawRow as Prisma.InputJsonValue,
          parseErrors: a.parseErrors.length
            ? (a.parseErrors as Prisma.InputJsonValue)
            : undefined,
          matchRequest: a.matchRequest
            ? (a.matchRequest as Prisma.InputJsonValue)
            : undefined,
          matchStatus:
            a.parseErrors.length > 0
              ? BamsMatchStatus.SKIPPED
              : BamsMatchStatus.PENDING,
        })),
      },
    },
  });

  result.uploadId = upload.id;
  result.eventRowCount = enriched.length;
  return result;
}
