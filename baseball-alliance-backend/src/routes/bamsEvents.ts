import { Router } from "express";
import express from "express";
import { z } from "zod";
import { BamsMatchStatus, Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireBamsAccess } from "../middleware/requireBamsAccess.js";
import { bamsUploadRateLimit } from "../middleware/bamsUploadLimit.js";
import {
  BamsApiError,
  bamsErrorToHttp,
  postBamsMatch,
} from "../services/bamsApiClient.js";
import { parseEventExportCsv } from "../services/eventCsvParser.js";
import { buildMatchRequestFromEventRow } from "../services/eventCsvToMatchRequest.js";
import { mergeMatchPreferences } from "../services/mergeMatchPreferences.js";
import {
  canRunBamsMatch,
  membershipUsageSummary,
} from "../services/bamsMembership.js";

const r = Router();

r.use(express.json({ limit: "6mb" }));
r.use(requireAuth);
r.use(requireBamsAccess);

const UploadBodySchema = z.object({
  csv: z.string().min(1),
  fileName: z.string().optional(),
});

const MatchPreferencesSchema = z
  .object({
    preferredStates: z.array(z.string()).optional(),
    preferredDivisions: z.array(z.string()).optional(),
    preferredConferences: z.array(z.string()).optional(),
    schoolTypePreference: z.string().optional(),
    schoolSizePreference: z.enum(["small", "medium", "large"]).optional(),
    tuitionPreference: z.string().optional(),
    priorities: z
      .object({
        athleticFit: z.number().min(0).max(1).optional(),
        locationFit: z.number().min(0).max(1).optional(),
        schoolFit: z.number().min(0).max(1).optional(),
        affordabilityFit: z.number().min(0).max(1).optional(),
      })
      .optional(),
  })
  .optional();

const MatchBodySchema = z.object({
  athleteUuids: z.array(z.string().min(1)).optional(),
  eventName: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
  preferences: MatchPreferencesSchema,
});

function athleteSummary(row: {
  id: string;
  athleteUuid: string;
  firstName: string | null;
  lastName: string | null;
  primaryPosition: string;
  gradYear: number | null;
  eventName: string | null;
  eventStartDate: string | null;
  athleteUrl: string | null;
  parseErrors: unknown;
  matchStatus: BamsMatchStatus;
  matchError: string | null;
}) {
  const name =
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    row.athleteUuid;
  const parseErrors = Array.isArray(row.parseErrors)
    ? (row.parseErrors as string[])
    : [];
  return {
    id: row.id,
    athleteUuid: row.athleteUuid,
    displayName: name,
    primaryPosition: row.primaryPosition,
    gradYear: row.gradYear,
    eventName: row.eventName,
    eventStartDate: row.eventStartDate,
    athleteUrl: row.athleteUrl,
    parseErrors,
    matchStatus: row.matchStatus,
    matchError: row.matchError,
  };
}

async function getMemberPlaybookId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { playbookId: true },
  });
  return user?.playbookId?.trim() || null;
}

const uploadWithAthletesArgs = Prisma.validator<Prisma.BamsEventUploadDefaultArgs>()({
  include: { athletes: { orderBy: { rowIndex: "asc" } } },
});

type UploadWithAthletes = Prisma.BamsEventUploadGetPayload<
  typeof uploadWithAthletesArgs
>;

type UploadAccess = {
  upload: UploadWithAthletes;
  fullAccess: boolean;
  playbookId: string | null;
};

async function assertUploadAccess(
  uploadId: string,
  userId: string
): Promise<UploadAccess | null> {
  const upload = await prisma.bamsEventUpload.findUnique({
    where: { id: uploadId },
    include: { athletes: { orderBy: { rowIndex: "asc" } } },
  });
  if (!upload) return null;

  if (upload.userId === userId) {
    return { upload, fullAccess: true, playbookId: null };
  }

  const playbookId = await getMemberPlaybookId(userId);
  if (!playbookId) return null;

  const linked = upload.athletes.some(
    (a) => (a.playerId?.trim() || "") === playbookId
  );
  if (!linked) return null;

  return { upload, fullAccess: false, playbookId };
}

function filterAthletesForAccess(
  athletes: UploadAccess["upload"]["athletes"],
  access: UploadAccess
) {
  if (access.fullAccess) return athletes;
  if (!access.playbookId) return [];
  return athletes.filter(
    (a) => (a.playerId?.trim() || "") === access.playbookId
  );
}

function syncedAthleteDisplayName(row: {
  firstName: string | null;
  lastName: string | null;
  athleteUuid: string;
}): string {
  const name = [row.firstName, row.lastName].filter(Boolean).join(" ");
  return name || row.athleteUuid;
}

/** POST /api/bams/events/upload */
r.post("/upload", bamsUploadRateLimit, async (req, res) => {
  const parsed = UploadBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { athletes, fileErrors, warnings } = parseEventExportCsv(
    parsed.data.csv
  );

  if (fileErrors.length > 0 && athletes.length === 0) {
    return res.status(400).json({
      error: "Could not parse event CSV",
      errors: fileErrors,
    });
  }

  const primaryEvent = athletes[0];

  const upload = await prisma.bamsEventUpload.create({
    data: {
      userId: req.user!.id,
      fileName: parsed.data.fileName,
      eventName: primaryEvent?.eventName,
      eventStartDate: primaryEvent?.eventStartDate,
      rowCount: athletes.length,
      warnings: warnings.length ? warnings : undefined,
      athletes: {
        create: athletes.map((a) => ({
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
    include: { athletes: true },
  });

  const eventMap = new Map<
    string,
    { eventName: string | null; eventStartDate: string | null; athleteCount: number }
  >();
  for (const a of upload.athletes) {
    const key = `${a.eventName ?? ""}|${a.eventStartDate ?? ""}`;
    const cur = eventMap.get(key);
    if (cur) cur.athleteCount += 1;
    else
      eventMap.set(key, {
        eventName: a.eventName,
        eventStartDate: a.eventStartDate,
        athleteCount: 1,
      });
  }
  const events = [...eventMap.values()];

  return res.status(201).json({
    uploadId: upload.id,
    rowCount: upload.rowCount,
    warnings,
    parseErrors: fileErrors,
    events,
    rows: upload.athletes.map(athleteSummary),
  });
});

/** GET /api/bams/events/member-options — synced event rows + own uploads */
r.get("/member-options", async (req, res) => {
  const userId = req.user!.id;
  const playbookId = await getMemberPlaybookId(userId);

  const myUploads = await prisma.bamsEventUpload.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fileName: true,
      eventName: true,
      eventStartDate: true,
      rowCount: true,
      createdAt: true,
    },
  });

  const syncedRows = playbookId
    ? await prisma.bamsEventAthleteRow.findMany({
        where: { playerId: playbookId },
        include: {
          upload: {
            select: {
              id: true,
              fileName: true,
              eventName: true,
              eventStartDate: true,
              createdAt: true,
            },
          },
        },
        orderBy: [{ upload: { createdAt: "desc" } }, { rowIndex: "asc" }],
      })
    : [];

  return res.json({
    playbookId,
    syncedEvents: syncedRows.map((row) => ({
      athleteRowId: row.id,
      uploadId: row.uploadId,
      athleteUuid: row.athleteUuid,
      displayName: syncedAthleteDisplayName(row),
      primaryPosition: row.primaryPosition,
      gradYear: row.gradYear,
      eventName: row.eventName ?? row.upload.eventName,
      eventStartDate: row.eventStartDate ?? row.upload.eventStartDate,
      fileName: row.upload.fileName,
      matchStatus: row.matchStatus,
      uploadCreatedAt: row.upload.createdAt,
    })),
    myUploads,
  });
});

/** GET /api/bams/events/uploads — recent uploads for current user */
r.get("/uploads", async (req, res) => {
  const uploads = await prisma.bamsEventUpload.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fileName: true,
      eventName: true,
      eventStartDate: true,
      rowCount: true,
      createdAt: true,
    },
  });
  return res.json({ uploads });
});

/** POST /api/bams/events/:uploadId/match */
r.post("/:uploadId/match", async (req, res) => {
  const parsed = MatchBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const access = await assertUploadAccess(req.params.uploadId, req.user!.id);
  if (!access) return res.status(404).json({ error: "Upload not found" });

  const memberProfile = await prisma.bamsMemberProfile.findUnique({
    where: { userId: req.user!.id },
    select: { membership: true, matchRunsUsed: true },
  });
  const membership = memberProfile?.membership ?? "BAMS";
  const matchRunsUsed = memberProfile?.matchRunsUsed ?? 0;
  const roles = req.user!.roles ?? [];

  const { upload } = access;
  let targets = filterAthletesForAccess(upload.athletes, access);
  if (parsed.data.eventName) {
    targets = targets.filter(
      (a: (typeof targets)[number]) => a.eventName === parsed.data.eventName
    );
  }
  if (parsed.data.athleteUuids?.length) {
    const set = new Set(parsed.data.athleteUuids);
    targets = targets.filter((a: (typeof targets)[number]) =>
      set.has(a.athleteUuid)
    );
  }

  if (targets.length === 0) {
    return res.status(400).json({ error: "No athletes selected to match" });
  }

  if (
    !canRunBamsMatch({
      roles,
      membership,
      matchRunsUsed,
    })
  ) {
    const usage = membershipUsageSummary({ membership, matchRunsUsed });
    return res.status(403).json({
      error: "BAMS match run limit reached",
      ...usage,
    });
  }

  const limit = parsed.data.limit ?? 50;
  const offset = parsed.data.offset ?? 0;

  const results: Array<{
    athleteUuid: string;
    matchStatus: BamsMatchStatus;
    matchError?: string;
    validationDetails?: unknown;
  }> = [];

  for (const row of targets) {
    if (row.matchStatus === BamsMatchStatus.SKIPPED || row.parseErrors) {
      const errs = Array.isArray(row.parseErrors)
        ? (row.parseErrors as string[])
        : ["Row skipped due to parse errors"];
      await prisma.bamsEventAthleteRow.update({
        where: { id: row.id },
        data: {
          matchStatus: BamsMatchStatus.SKIPPED,
          matchError: errs.join("; "),
        },
      });
      results.push({
        athleteUuid: row.athleteUuid,
        matchStatus: BamsMatchStatus.SKIPPED,
        matchError: errs.join("; "),
      });
      continue;
    }

    const built = buildMatchRequestFromEventRow(
      row.rawRow as Record<string, string>
    );
    if (built.errors.length > 0) {
      await prisma.bamsEventAthleteRow.update({
        where: { id: row.id },
        data: {
          matchStatus: BamsMatchStatus.FAILED,
          matchError: built.errors.join("; "),
        },
      });
      results.push({
        athleteUuid: row.athleteUuid,
        matchStatus: BamsMatchStatus.FAILED,
        matchError: built.errors.join("; "),
      });
      continue;
    }
    let matchBody = built.request;

    matchBody = mergeMatchPreferences(
      matchBody,
      parsed.data.preferences ?? undefined
    );

    try {
      const response = await postBamsMatch(matchBody, { limit, offset });
      await prisma.bamsEventAthleteRow.update({
        where: { id: row.id },
        data: {
          matchRequest: matchBody as Prisma.InputJsonValue,
          matchStatus: BamsMatchStatus.SUCCESS,
          matchResponse: response as Prisma.InputJsonValue,
          matchError: null,
        },
      });
      results.push({
        athleteUuid: row.athleteUuid,
        matchStatus: BamsMatchStatus.SUCCESS,
      });
    } catch (e) {
      if (e instanceof BamsApiError) {
        const http = bamsErrorToHttp(e);
        const errMsg =
          http.body && typeof http.body === "object" && "error" in http.body
            ? String((http.body as { error: string }).error)
            : e.message;
        await prisma.bamsEventAthleteRow.update({
          where: { id: row.id },
          data: {
            matchRequest: matchBody as Prisma.InputJsonValue,
            matchStatus: BamsMatchStatus.FAILED,
            matchError: errMsg,
            matchResponse:
              http.body && typeof http.body === "object"
                ? (http.body as Prisma.InputJsonValue)
                : undefined,
          },
        });
        results.push({
          athleteUuid: row.athleteUuid,
          matchStatus: BamsMatchStatus.FAILED,
          matchError: errMsg,
          validationDetails:
            http.status === 400 &&
            http.body &&
            typeof http.body === "object" &&
            "details" in http.body
              ? (http.body as { details: unknown }).details
              : undefined,
        });
        continue;
      }
      throw e;
    }
  }

  const shouldCountRun = !roles.includes("ADMIN");
  if (shouldCountRun) {
    await prisma.bamsMemberProfile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        membership,
        matchRunsUsed: 1,
      },
      update: {
        matchRunsUsed: { increment: 1 },
      },
    });
  }

  const usage = membershipUsageSummary({
    membership,
    matchRunsUsed: shouldCountRun ? matchRunsUsed + 1 : matchRunsUsed,
  });

  return res.json({
    uploadId: upload.id,
    matched: results.filter((r) => r.matchStatus === BamsMatchStatus.SUCCESS)
      .length,
    failed: results.filter((r) => r.matchStatus === BamsMatchStatus.FAILED)
      .length,
    skipped: results.filter((r) => r.matchStatus === BamsMatchStatus.SKIPPED)
      .length,
    results,
    ...usage,
  });
});

/** GET /api/bams/events/:uploadId/results */
r.get("/:uploadId/results", async (req, res) => {
  const access = await assertUploadAccess(req.params.uploadId, req.user!.id);
  if (!access) return res.status(404).json({ error: "Upload not found" });

  const { upload } = access;
  const eventFilter = req.query.eventName as string | undefined;

  let athletes = filterAthletesForAccess(upload.athletes, access);
  if (eventFilter) {
    athletes = athletes.filter(
      (a: (typeof athletes)[number]) => a.eventName === eventFilter
    );
  }

  const events = [
    ...new Map(
      athletes.map((a) => [
        `${a.eventName ?? ""}|${a.eventStartDate ?? ""}`,
        {
          eventName: a.eventName,
          eventStartDate: a.eventStartDate,
          eventDivision: a.eventDivision,
          eventLevel: a.eventLevel,
        },
      ])
    ).values(),
  ];

  return res.json({
    uploadId: upload.id,
    fileName: upload.fileName,
    rowCount: upload.rowCount,
    warnings: upload.warnings,
    events,
    athletes: athletes.map((a) => ({
      ...athleteSummary(a),
      eventDivision: a.eventDivision,
      eventLevel: a.eventLevel,
      orderDate: a.orderDate,
      playerId: a.playerId,
      rawRow: a.rawRow,
      matchRequest: a.matchRequest,
      matchResponse: a.matchResponse,
    })),
  });
});

export default r;
