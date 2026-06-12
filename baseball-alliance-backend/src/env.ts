import "dotenv/config";

const PRODUCTION_FRONTEND_URL = "https://baseballalliance.co";
const DEV_FRONTEND_URL = "http://localhost:5173";

function resolveFrontendUrl(): string {
  const isProd = (process.env.NODE_ENV ?? "development") === "production";
  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const useProductionUrl = isProd || resendConfigured;
  const raw = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");

  if (!raw) {
    return useProductionUrl ? PRODUCTION_FRONTEND_URL : DEV_FRONTEND_URL;
  }

  if (/localhost|127\.0\.0\.1/i.test(raw) && useProductionUrl) {
    console.warn(
      `[env] FRONTEND_URL is "${raw}" but production email is configured — using ${PRODUCTION_FRONTEND_URL} for magic links`
    );
    return PRODUCTION_FRONTEND_URL;
  }

  return raw;
}

export const ENV = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  /** Required for /api/auth/login and requireAuth */
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  /** S3-compatible presigned uploads (optional; POST /api/site/media/upload-url) */
  S3_BUCKET: process.env.S3_BUCKET ?? "",
  S3_REGION: process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  /** Base URL for objects after upload, e.g. https://my-bucket.s3.us-east-1.amazonaws.com */
  S3_PUBLIC_URL_PREFIX: process.env.S3_PUBLIC_URL_PREFIX ?? "",

  /** Frontend origin for magic-link redirects (no trailing slash) */
  FRONTEND_URL: resolveFrontendUrl(),
  MAGIC_LINK_TTL_MINUTES: Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 30),

  /** Resend API key for magic-link emails (required in production) */
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  EMAIL_FROM:
    process.env.EMAIL_FROM ?? "Baseball Alliance <noreply@baseballalliance.co>",

  /** External BAMS college-match-service (server-side only) */
  BAMS_API_URL:
    process.env.BAMS_API_URL ?? "https://api.bams.baseballalliance.co",
};
