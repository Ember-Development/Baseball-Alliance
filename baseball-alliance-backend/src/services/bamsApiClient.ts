import { ENV } from "../env.js";
import { validationFailed, zodErrorToDetails } from "../utils/zodHttp.js";

export type BamsMatchQuery = {
  limit?: number;
  offset?: number;
};

export class BamsApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "BamsApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * POST MatchRequestV1 to external BAMS college-match-service.
 */
export async function postBamsMatch(
  body: Record<string, unknown>,
  query: BamsMatchQuery = {}
): Promise<unknown> {
  if (!ENV.BAMS_API_URL) {
    throw new BamsApiError(
      "BAMS_API_URL is not configured",
      503,
      { error: "BAMS service unavailable" }
    );
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
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    if (
      res.status === 400 &&
      parsed &&
      typeof parsed === "object" &&
      "details" in (parsed as object)
    ) {
      throw new BamsApiError("BAMS validation failed", 400, parsed);
    }
    const msg =
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : `BAMS request failed (${res.status})`;
    throw new BamsApiError(msg, res.status, parsed);
  }

  return parsed;
}

export function bamsErrorToHttp(err: BamsApiError) {
  if (err.status === 400 && err.body && typeof err.body === "object") {
    const b = err.body as { details?: unknown; error?: string };
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
