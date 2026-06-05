import "dotenv/config";
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
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
    MAGIC_LINK_TTL_MINUTES: Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 30),
    /** Resend API key for magic-link emails (required in production) */
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "Baseball Alliance <noreply@baseballalliance.co>",
    /** External BAMS college-match-service (server-side only) */
    BAMS_API_URL: process.env.BAMS_API_URL ?? "https://api.bams.baseballalliance.co",
};
