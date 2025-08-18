import type { CreateEventInput, EventPublic, EventType } from "./event";
import type { CombineRegistrationCreated } from "./registration";

export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

export async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // auth
  async login(email: string, password: string) {
    return request<{
      token: string;
      user: { id: string; email: string; fullName: string; roles: string[] };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async me() {
    return request<{
      id: string;
      email: string;
      fullName: string;
      roles: string[];
    }>("/auth/me");
  },

  // events
  async listEvents(type?: EventType) {
    const q = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<EventPublic[]>(`/events${q}`);
  },
  async getLatestEvent(type?: EventType) {
    const q = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<EventPublic>(`/events/latest${q}`);
  },
  async createEvent(body: CreateEventInput) {
    return request<EventPublic>("/events", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        // ensure dates are ISO strings for zod
        startDate: new Date(body.startDate).toISOString(),
        endDate: new Date(body.endDate).toISOString(),
      }),
    });
  },
  async updateEvent(id: string, patch: Partial<CreateEventInput>) {
    const payload: any = { ...patch };
    if (patch.startDate)
      payload.startDate = new Date(patch.startDate).toISOString();
    if (patch.endDate) payload.endDate = new Date(patch.endDate).toISOString();
    return request<EventPublic>(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  async publishEvent(id: string) {
    return request<EventPublic>(`/events/${id}/publish`, { method: "POST" });
  },
  async unpublishEvent(id: string) {
    return request<EventPublic>(`/events/${id}/unpublish`, { method: "POST" });
  },
  async deleteEvent(id: string) {
    await request<void>(`/events/${id}`, { method: "DELETE" });
  },

  // combine registration
  async createCombineRegistration(eventId: string, payload: any) {
    return request<CombineRegistrationCreated>(
      `/registrations/combine/${eventId}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  // Payment
  async createAcceptHostedSession(
    registrationId: string,
    amountCents?: number
  ) {
    return request<{ token: string; url: string; paymentId: string }>(
      "/payments/accept-hosted/session",
      { method: "POST", body: JSON.stringify({ registrationId, amountCents }) }
    );
  },
};
