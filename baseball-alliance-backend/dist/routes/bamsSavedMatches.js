import { Router } from "express";
import express from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireBamsAccess } from "../middleware/requireBamsAccess.js";
const r = Router();
r.use(express.json({ limit: "4mb" }));
r.use(requireAuth);
r.use(requireBamsAccess);
/**
 * The match response is stored as an opaque snapshot. We validate only the
 * envelope fields we rely on for listing/preview; the full payload is passed
 * through so the saved view renders identically to the live result.
 */
const SaveBodySchema = z.object({
    uploadId: z.string().min(1).optional(),
    athleteUuid: z.string().min(1).optional(),
    athleteName: z.string().min(1).max(200),
    primaryPosition: z.string().max(50).optional(),
    gradYear: z.number().int().min(1900).max(2100).optional(),
    eventName: z.string().max(200).optional(),
    eventStartDate: z.string().max(50).optional(),
    label: z.string().max(120).optional(),
    matchResponse: z.record(z.string(), z.unknown()),
    preferences: z.record(z.string(), z.unknown()).optional(),
});
const SAVED_MATCH_LIMIT = 100;
function matchCount(matchResponse) {
    if (matchResponse &&
        typeof matchResponse === "object" &&
        Array.isArray(matchResponse.matches)) {
        return matchResponse.matches.length;
    }
    return 0;
}
/** POST /api/bams/saved-matches — persist a match snapshot to the member profile */
r.post("/", async (req, res) => {
    const parsed = SaveBodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const existing = await prisma.bamsSavedMatch.count({
        where: { userId: req.user.id },
    });
    if (existing >= SAVED_MATCH_LIMIT) {
        return res.status(409).json({
            error: `Saved match limit reached (${SAVED_MATCH_LIMIT}). Delete older matches first.`,
        });
    }
    const data = parsed.data;
    const saved = await prisma.bamsSavedMatch.create({
        data: {
            userId: req.user.id,
            uploadId: data.uploadId,
            athleteUuid: data.athleteUuid,
            athleteName: data.athleteName,
            primaryPosition: data.primaryPosition,
            gradYear: data.gradYear,
            eventName: data.eventName,
            eventStartDate: data.eventStartDate,
            label: data.label,
            matchResponse: data.matchResponse,
            preferences: data.preferences
                ? data.preferences
                : undefined,
        },
    });
    return res.status(201).json({
        id: saved.id,
        athleteName: saved.athleteName,
        matchCount: matchCount(saved.matchResponse),
        createdAt: saved.createdAt,
    });
});
/** GET /api/bams/saved-matches — list saved matches (summary only) */
r.get("/", async (req, res) => {
    const saved = await prisma.bamsSavedMatch.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: SAVED_MATCH_LIMIT,
    });
    return res.json({
        savedMatches: saved.map((s) => ({
            id: s.id,
            athleteName: s.athleteName,
            primaryPosition: s.primaryPosition,
            gradYear: s.gradYear,
            eventName: s.eventName,
            eventStartDate: s.eventStartDate,
            label: s.label,
            matchCount: matchCount(s.matchResponse),
            createdAt: s.createdAt,
        })),
    });
});
/** GET /api/bams/saved-matches/:id — full saved match snapshot */
r.get("/:id", async (req, res) => {
    const saved = await prisma.bamsSavedMatch.findFirst({
        where: { id: req.params.id, userId: req.user.id },
    });
    if (!saved)
        return res.status(404).json({ error: "Saved match not found" });
    return res.json({
        id: saved.id,
        athleteName: saved.athleteName,
        primaryPosition: saved.primaryPosition,
        gradYear: saved.gradYear,
        eventName: saved.eventName,
        eventStartDate: saved.eventStartDate,
        label: saved.label,
        matchResponse: saved.matchResponse,
        preferences: saved.preferences,
        createdAt: saved.createdAt,
    });
});
/** DELETE /api/bams/saved-matches/:id */
r.delete("/:id", async (req, res) => {
    const result = await prisma.bamsSavedMatch.deleteMany({
        where: { id: req.params.id, userId: req.user.id },
    });
    if (result.count === 0) {
        return res.status(404).json({ error: "Saved match not found" });
    }
    return res.status(204).end();
});
export default r;
