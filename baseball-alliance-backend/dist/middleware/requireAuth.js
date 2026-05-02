import jwt from "jsonwebtoken";
import { ENV } from "../env.js";
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Missing or invalid Authorization header" });
    }
    const token = header.substring("Bearer ".length);
    try {
        const payload = jwt.verify(token, ENV.JWT_SECRET);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
export function requireRole(...allowed) {
    return (req, res, next) => {
        const roles = req.user?.roles ?? [];
        if (!roles.some((r) => allowed.includes(r)))
            return res.status(403).json({ error: "Forbidden" });
        next();
    };
}
