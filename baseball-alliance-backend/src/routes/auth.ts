import { Router } from "express";
import { prisma } from "../db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JwtUser, requireAuth } from "../middleware/requireAuth";
import { UserPublic } from "../types";

const r = Router();

/** Request body type for login */
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Strongly-typed signer */
function signToken(payload: JwtUser) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    } as jwt.SignOptions
  );
}

/** Map DB user → public user shape */
function toUserPublic(u: {
  id: string;
  email: string;
  fullName: string;
  roles: { role: string }[];
}): UserPublic {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    roles: u.roles.map((r) => r.role as UserPublic["roles"][number]), // cast to your RoleName union
  };
}

/** POST /auth/login */
r.post("/login", async (req, res) => {
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

  const payload: JwtUser = {
    id: user.id,
    email: user.email,
    roles: user.roles.map(
      (r: { role: any }) => r.role as UserPublic["roles"][number]
    ),
  };

  const token = signToken(payload);
  return res.json({
    token,
    user: toUserPublic(user),
  });
});

/** GET /auth/me */
r.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { roles: true },
  });
  if (!me) return res.status(404).json({ error: "Not found" });

  return res.json(toUserPublic(me));
});

export default r;
