import { Router } from "express";
import { prisma } from "../db";
const r = Router();

r.get("/", async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: {
          include: {
            player: { select: { user: { select: { fullName: true } } } },
          },
        },
        coaches: { select: { user: { select: { fullName: true } } } },
      },
    });
    res.json(teams);
  } catch (e) {
    next(e);
  }
});

export default r;
