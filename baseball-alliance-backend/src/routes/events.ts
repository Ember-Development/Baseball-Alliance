// src/routes/events.ts
import { Router } from "express";
import { prisma } from "../db";
import { type EventPublic } from "../types";
import { CreateEventSchema } from "../types/event";

const r = Router();

r.get("/", async (req, res, next) => {
  try {
    const type = req.query.type as
      | "TOURNAMENT"
      | "COMBINE"
      | "SHOWCASE"
      | undefined;
    const events = await prisma.event.findMany({
      where: type ? { type } : undefined,
      orderBy: { startDate: "asc" },
    });

    const payload: EventPublic[] = events.map(
      (e: {
        id: any;
        title: any;
        type: string;
        startDate: { toISOString: () => any };
        endDate: { toISOString: () => any };
        startTime: any;
        city: any;
        state: any;
        venue: any;
        isPublished: any;
      }) => ({
        id: e.id,
        title: e.title,
        type: e.type as EventPublic["type"],
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        startTime: e.startTime,
        city: e.city,
        state: e.state,
        venue: e.venue,
        isPublished: e.isPublished,
      })
    );

    res.json(payload);
  } catch (e) {
    next(e);
  }
});

r.post("/", async (req, res, next) => {
  try {
    const data = CreateEventSchema.parse(req.body);
    const created = await prisma.event.create({ data });
    const payload: EventPublic = {
      id: created.id,
      title: created.title,
      type: created.type as EventPublic["type"],
      startDate: created.startDate.toISOString(),
      endDate: created.endDate.toISOString(),
      startTime: created.startTime,
      city: created.city,
      state: created.state,
      venue: created.venue,
      isPublished: created.isPublished,
    };
    res.status(201).json(payload);
  } catch (e) {
    if (e instanceof Error && "issues" in (e as any)) {
      return res
        .status(400)
        .json({ errors: (e as any).flatten?.() ?? String(e) });
    }
    next(e);
  }
});

export default r;
