import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 20;

const uploadsByUser = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

/** Simple in-memory rate limit for BAMS CSV uploads per user */
export function bamsUploadRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) return next();

  const now = Date.now();
  const prev = uploadsByUser.get(userId) ?? [];
  const active = prune(prev, now);

  if (active.length >= MAX_UPLOADS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many uploads. Try again in an hour.",
    });
  }

  active.push(now);
  uploadsByUser.set(userId, active);
  next();
}
