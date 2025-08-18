import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtUser = { id: string; email: string; roles: string[] };

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.substring("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...allowed: string[]) {
  return (req: any, res: any, next: any) => {
    const roles: string[] = req.user?.roles ?? [];
    if (!roles.some((r) => allowed.includes(r)))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
