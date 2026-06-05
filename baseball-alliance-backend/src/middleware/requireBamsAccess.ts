import type { Request, Response, NextFunction } from "express";
import { userHasBamsAccess } from "../services/playbookCsv.js";

export function requireBamsAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const roles = req.user?.roles ?? [];
  if (!userHasBamsAccess(roles.map((r) => ({ role: r })))) {
    return res.status(403).json({ error: "BAMS access required" });
  }
  next();
}
