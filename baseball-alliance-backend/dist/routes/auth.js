import { Router } from "express";
import { prisma } from "../db.js";
import { ENV } from "../env.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/requireAuth.js";
const r = Router();
/** Request body type for login */
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
/** Strongly-typed signer */
function signToken(payload) {
    return jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: ENV.JWT_EXPIRES_IN,
    });
}
/** Map DB user → public user shape */
function toUserPublic(u) {
    return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        roles: u.roles.map((r) => r.role), // cast to your RoleName union
    };
}
/** POST /auth/login */
r.post("/login", async (req, res) => {
    try {
        if (!ENV.JWT_SECRET) {
            console.error("JWT_SECRET is not set — add it to .env for login to work");
            return res.status(500).json({ error: "Server configuration error" });
        }
        const parsed = LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
        if (!user?.passwordHash) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.role),
        };
        const token = signToken(payload);
        return res.json({
            token,
            user: toUserPublic(user),
        });
    }
    catch (e) {
        console.error("POST /auth/login:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/** GET /auth/me */
r.get("/me", requireAuth, async (req, res) => {
    const me = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { roles: true },
    });
    if (!me)
        return res.status(404).json({ error: "Not found" });
    return res.json(toUserPublic(me));
});
export default r;
