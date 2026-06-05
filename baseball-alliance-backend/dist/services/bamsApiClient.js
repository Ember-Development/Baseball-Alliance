import { ENV } from "../env.js";
export class BamsApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.name = "BamsApiError";
        this.status = status;
        this.body = body;
    }
}
/**
 * POST MatchRequestV1 to external BAMS college-match-service.
 */
export async function postBamsMatch(body, query = {}) {
    if (!ENV.BAMS_API_URL) {
        throw new BamsApiError("BAMS_API_URL is not configured", 503, { error: "BAMS service unavailable" });
    }
    const base = ENV.BAMS_API_URL.replace(/\/$/, "");
    const url = new URL(`${base}/api/match`);
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        }
        catch {
            parsed = text;
        }
    }
    if (!res.ok) {
        if (res.status === 400 &&
            parsed &&
            typeof parsed === "object" &&
            "details" in parsed) {
            throw new BamsApiError("BAMS validation failed", 400, parsed);
        }
        const msg = parsed &&
            typeof parsed === "object" &&
            "error" in parsed &&
            typeof parsed.error === "string"
            ? parsed.error
            : `BAMS request failed (${res.status})`;
        throw new BamsApiError(msg, res.status, parsed);
    }
    return parsed;
}
export function bamsErrorToHttp(err) {
    if (err.status === 400 && err.body && typeof err.body === "object") {
        const b = err.body;
        if (b.details && typeof b.details === "object") {
            return {
                status: 400,
                body: {
                    error: b.error ?? "BAMS validation failed",
                    details: b.details,
                },
            };
        }
    }
    return {
        status: err.status >= 400 && err.status < 600 ? err.status : 502,
        body: { error: err.message },
    };
}
