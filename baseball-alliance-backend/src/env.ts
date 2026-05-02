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
};
