import crypto from "crypto";
import { prisma } from "../db.js";
import { ENV } from "../env.js";
import { sendMagicLinkEmail } from "./email.js";
import { userHasBamsAccess } from "./playbookCsv.js";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildMagicLinkUrl(token: string): string {
  const base = ENV.FRONTEND_URL.replace(/\/$/, "");
  return `${base}/bams/auth/callback?token=${encodeURIComponent(token)}`;
}

export async function requestMagicLink(email: string): Promise<{
  ok: true;
  sent: boolean;
  devLink?: string;
  devNote?: "user_not_found" | "no_bams_access";
  devCheckedEmail?: string;
}> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: { roles: true },
  });

  // Do not reveal whether the account exists (dev fields are dev-only)
  if (!user || !userHasBamsAccess(user.roles)) {
    if (ENV.NODE_ENV !== "production") {
      const reason = !user ? "user not found" : "no MEMBER/ADMIN role";
      console.log(`[magic-link] No BAMS access for ${normalized} (${reason}) — email not sent`);
    }
    return {
      ok: true,
      sent: false,
      ...(ENV.NODE_ENV !== "production"
        ? {
            devNote: (!user ? "user_not_found" : "no_bams_access") as
              | "user_not_found"
              | "no_bams_access",
            devCheckedEmail: normalized,
          }
        : {}),
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + ENV.MAGIC_LINK_TTL_MINUTES * 60 * 1000
  );

  await prisma.magicLinkToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const url = buildMagicLinkUrl(rawToken);
  await sendMagicLinkEmail(user.email, url);

  const devLink =
    ENV.NODE_ENV !== "production" ? url : undefined;

  return { ok: true, sent: true, devLink };
}

export async function verifyMagicLink(token: string) {
  const tokenHash = hashToken(token.trim());
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { roles: true } } },
  });

  if (!record) {
    return { error: "Invalid or expired link" as const };
  }
  if (record.usedAt) {
    return { error: "This link has already been used" as const };
  }
  if (record.expiresAt < new Date()) {
    return { error: "Invalid or expired link" as const };
  }
  if (!userHasBamsAccess(record.user.roles)) {
    return { error: "BAMS access is not enabled for this account" as const };
  }

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { user: record.user };
}
