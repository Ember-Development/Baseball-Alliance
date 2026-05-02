import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import { ENV } from "../env.js";
const IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
export function isS3UploadConfigured() {
    return Boolean(ENV.S3_BUCKET &&
        ENV.AWS_ACCESS_KEY_ID &&
        ENV.AWS_SECRET_ACCESS_KEY &&
        ENV.S3_PUBLIC_URL_PREFIX);
}
function extFromContentType(ct) {
    const map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov",
    };
    return map[ct] ?? "bin";
}
export function assertAllowedUpload(contentType, kind) {
    const ok = kind === "image" ? IMAGE_TYPES.has(contentType) : VIDEO_TYPES.has(contentType);
    if (!ok) {
        const err = new Error(`Content type not allowed for ${kind} upload`);
        err.status = 400;
        throw err;
    }
}
export async function createPresignedPutUrl(params) {
    if (!isS3UploadConfigured()) {
        const err = new Error("Uploads are not configured on this server");
        err.status = 503;
        throw err;
    }
    assertAllowedUpload(params.contentType, params.kind);
    const safeBase = params.filename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 80);
    const ext = extFromContentType(params.contentType);
    const key = `site/${params.kind}/${Date.now()}-${randomBytes(8).toString("hex")}-${safeBase || "file"}.${ext}`;
    const client = new S3Client({
        region: ENV.S3_REGION,
        credentials: {
            accessKeyId: ENV.AWS_ACCESS_KEY_ID,
            secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
        },
    });
    const cmd = new PutObjectCommand({
        Bucket: ENV.S3_BUCKET,
        Key: key,
        ContentType: params.contentType,
    });
    const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 3600 });
    const prefix = ENV.S3_PUBLIC_URL_PREFIX.replace(/\/$/, "");
    const publicUrl = `${prefix}/${key}`;
    return { uploadUrl, publicUrl, key };
}
