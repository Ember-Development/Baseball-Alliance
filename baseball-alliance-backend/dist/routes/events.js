// src/routes/events.ts
import { Router } from "express";
import { prisma } from "../db.js";
import { CreateEventSchema } from "../types/event.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
const r = Router();
const toPublic = (e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    startTime: e.startTime,
    city: e.city,
    state: e.state,
    venue: e.venue,
    registerUrl: e.registerUrl ?? null,
    isPublished: e.isPublished,
});
r.get("/", async (req, res, next) => {
    try {
        const type = req.query.type;
        const events = await prisma.event.findMany({
            where: {
                isPublished: true,
                ...(type ? { type } : {}),
            },
            orderBy: { startDate: "asc" },
        });
        const payload = events.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.type,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate.toISOString(),
            startTime: e.startTime,
            city: e.city,
            state: e.state,
            venue: e.venue,
            registerUrl: e.registerUrl ?? null,
            isPublished: e.isPublished,
        }));
        res.json(payload);
    }
    catch (e) {
        next(e);
    }
});
r.get("/admin/all", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: "desc" },
            take: 200,
        });
        res.json(events.map(toPublic));
    }
    catch (e) {
        next(e);
    }
});
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        const data = CreateEventSchema.parse(req.body);
        const created = await prisma.event.create({ data });
        res.status(201).json(toPublic(created));
    }
    catch (e) {
        if (e?.issues)
            return res.status(400).json({ errors: e.flatten?.() ?? e });
        next(e);
    }
});
r.get("/latest", async (req, res, next) => {
    try {
        const type = req.query.type;
        const latest = await prisma.event.findFirst({
            where: {
                ...(type ? { type } : {}),
                isPublished: true, // public-safe default
            },
            orderBy: { createdAt: "desc" },
        });
        if (!latest)
            return res.status(404).json({ error: "No events found" });
        res.json(toPublic(latest));
    }
    catch (e) {
        next(e);
    }
});
r.get("/:id", async (req, res, next) => {
    try {
        const found = await prisma.event.findUnique({
            where: { id: req.params.id },
        });
        if (!found)
            return res.status(404).json({ error: "Not found" });
        res.json(toPublic(found));
    }
    catch (e) {
        next(e);
    }
});
r.patch("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        // reuse CreateEventSchema but mark all optional for PATCH
        const PartialSchema = CreateEventSchema.partial().superRefine((val, ctx) => {
            if (val.type === "COMBINE" && !val.startTime) {
                ctx.addIssue({
                    code: "custom",
                    message: "startTime is required for COMBINE",
                    path: ["startTime"],
                });
            }
            if (val.startDate && val.endDate && val.endDate < val.startDate) {
                ctx.addIssue({
                    code: "custom",
                    message: "endDate must be on/after startDate",
                    path: ["endDate"],
                });
            }
        });
        const data = PartialSchema.parse(req.body);
        const updated = await prisma.event.update({
            where: { id: req.params.id },
            data,
        });
        res.json(toPublic(updated));
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ error: "Not found" });
        if (e?.issues)
            return res.status(400).json({ errors: e.flatten?.() ?? e });
        next(e);
    }
});
r.post("/:id/publish", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        const updated = await prisma.event.update({
            where: { id: req.params.id },
            data: { isPublished: true },
        });
        res.json(toPublic(updated));
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ error: "Not found" });
        next(e);
    }
});
r.post("/:id/unpublish", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        const updated = await prisma.event.update({
            where: { id: req.params.id },
            data: { isPublished: false },
        });
        res.json(toPublic(updated));
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ error: "Not found" });
        next(e);
    }
});
r.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        await prisma.event.delete({ where: { id: req.params.id } });
        res.status(204).end();
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ error: "Not found" });
        next(e);
    }
});
export default r;
