import { Router } from "express";
import { prisma } from "../db.js";
import { ENV } from "../env.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/requireAuth.js";
import { requestMagicLink, verifyMagicLink } from "../services/magicLink.js";
import { userHasBamsAccess } from "../services/playbookCsv.js";
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
const MagicLinkRequestSchema = z.object({
    email: z.string().email(),
});
/** POST /auth/magic-link — email a one-time BAMS sign-in link */
r.post("/magic-link", async (req, res) => {
    try {
        const parsed = MagicLinkRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const out = await requestMagicLink(parsed.data.email);
        const body = {
            ok: true,
            message: "If an account with BAMS access exists for that email, a sign-in link has been sent.",
        };
        if (out.devLink)
            body.devLink = out.devLink;
        if (out.devNote)
            body.devNote = out.devNote;
        if (out.devCheckedEmail)
            body.devCheckedEmail = out.devCheckedEmail;
        return res.json(body);
    }
    catch (e) {
        console.error("POST /auth/magic-link:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
const MagicLinkVerifySchema = z.object({
    token: z.string().min(16),
});
/** POST /auth/magic-link/verify — exchange token for JWT */
r.post("/magic-link/verify", async (req, res) => {
    try {
        if (!ENV.JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error" });
        }
        const parsed = MagicLinkVerifySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const result = await verifyMagicLink(parsed.data.token);
        if ("error" in result) {
            return res.status(401).json({ error: result.error });
        }
        const payload = {
            id: result.user.id,
            email: result.user.email,
            roles: result.user.roles.map((r) => r.role),
        };
        return res.json({
            token: signToken(payload),
            user: toUserPublic(result.user),
        });
    }
    catch (e) {
        console.error("POST /auth/magic-link/verify:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/** GET /auth/bams-profile — BAMS member profile for current user */
r.get("/bams-profile", requireAuth, async (req, res) => {
    const me = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { roles: true, bamsMember: true },
    });
    if (!me)
        return res.status(404).json({ error: "Not found" });
    if (!userHasBamsAccess(me.roles)) {
        return res.status(403).json({ error: "BAMS access required" });
    }
    return res.json({
        user: toUserPublic(me),
        profile: me.bamsMember,
        playbookId: me.playbookId,
        playbookImportedAt: me.playbookImportedAt,
    });
});
export default r;
