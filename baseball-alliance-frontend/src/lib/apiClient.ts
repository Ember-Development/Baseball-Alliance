const rawBase = import.meta.env.VITE_API_BASE_URL ?? "";
const API_BASE = rawBase.replace(/\/$/, "");

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromErrorBody(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (typeof o.error === "string") return o.error;
    if (typeof o.message === "string") return o.message;
  }
  return `Request failed (${status})`;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const body = await parseResponseBody(res);
  if (!res.ok) {
    throw new ApiError(messageFromErrorBody(res.status, body), res.status, body);
  }
  return body as T;
}

export async function apiPostJson<T>(
  path: string,
  json: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(json),
  });
  const body = await parseResponseBody(res);
  if (!res.ok) {
    throw new ApiError(messageFromErrorBody(res.status, body), res.status, body);
  }
  return body as T;
}
