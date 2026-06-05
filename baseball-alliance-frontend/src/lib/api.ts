import type { CreateEventInput, EventPublic, EventType } from "./event";
import { calendarDateToIso } from "./calendarDate";
import type { CombineRegistrationCreated } from "./registration";
import {
  normalizeProgramFiltersResponse,
  type MatchResponseV1,
} from "../types/collegeMatch";
import type {
  CmsPagePublic,
  PublishedCmsPageResponse,
  SitePublic,
} from "./site";

/** In dev, default to Vite proxy (/api → backend). Override with VITE_API_URL if needed. */
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "/api" : "http://localhost:4000/api");

export type BamsMemberProfile = {
  gradYear?: string | null;
  primaryPosition?: string | null;
  secondaryPosition?: string | null;
  bats?: string | null;
  throws?: string | null;
  height?: string | null;
  weight?: string | null;
  schoolName?: string | null;
  schoolLocation?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export type BamsProfileResponse = {
  user: { id: string; email: string; fullName: string; roles: string[] };
  profile: BamsMemberProfile | null;
  playbookId: string | null;
  playbookImportedAt: string | null;
};

export type SavedMatchPreferencesInput = {
  preferredStates?: string[];
  preferredDivisions?: string[];
  preferredConferences?: string[];
  schoolTypePreference?: string;
  schoolSizePreference?: "small" | "medium" | "large";
  tuitionPreference?: string;
  priorities?: {
    athleticFit?: number;
    locationFit?: number;
    schoolFit?: number;
    affordabilityFit?: number;
  };
};

export type SaveBamsMatchInput = {
  uploadId?: string;
  athleteUuid?: string;
  athleteName: string;
  primaryPosition?: string;
  gradYear?: number;
  eventName?: string;
  eventStartDate?: string;
  label?: string;
  matchResponse: MatchResponseV1;
  preferences?: SavedMatchPreferencesInput;
};

export type SavedMatchSummary = {
  id: string;
  athleteName: string;
  primaryPosition: string | null;
  gradYear: number | null;
  eventName: string | null;
  eventStartDate: string | null;
  label: string | null;
  matchCount: number;
  createdAt: string;
};

export type SavedMatchDetail = SavedMatchSummary & {
  matchResponse: MatchResponseV1;
  preferences: SavedMatchPreferencesInput | null;
};

export type PlaybookImportResult = {
  created: number;
  updated: number;
  skipped: number;
  emailsSent: number;
  emailsFailed: number;
  members?: Array<{
    email: string;
    fullName: string;
    action: "created" | "updated";
    signInEmailSent?: boolean;
  }>;
  errors: Array<{ row: number; email?: string; message: string }>;
  parseErrors: Array<{ row: number; email?: string; message: string }>;
};

export type BamsEventUploadSummary = {
  id: string;
  fileName: string | null;
  eventName: string | null;
  eventStartDate: string | null;
  rowCount: number;
  createdAt: string;
};

export type BamsSyncedEventSummary = {
  athleteRowId: string;
  uploadId: string;
  athleteUuid: string;
  displayName: string;
  primaryPosition: string;
  gradYear: number | null;
  eventName: string | null;
  eventStartDate: string | null;
  fileName: string | null;
  matchStatus: string;
  uploadCreatedAt: string;
};

export type BamsMemberEventOptionsResponse = {
  playbookId: string | null;
  syncedEvents: BamsSyncedEventSummary[];
  myUploads: BamsEventUploadSummary[];
};

export type BamsAthleteRowSummary = {
  id: string;
  athleteUuid: string;
  displayName: string;
  primaryPosition: string;
  gradYear: number | null;
  eventName: string | null;
  eventStartDate: string | null;
  athleteUrl: string | null;
  parseErrors: string[];
  matchStatus: string;
  matchError: string | null;
};

export type BamsEventUploadResponse = {
  uploadId: string;
  rowCount: number;
  warnings: string[];
  parseErrors: Array<{ row: number; message: string }>;
  events: Array<{
    eventName: string | null;
    eventStartDate: string | null;
    athleteCount: number;
  }>;
  rows: BamsAthleteRowSummary[];
};

export type BamsEventResultsResponse = {
  uploadId: string;
  fileName: string | null;
  rowCount: number;
  warnings: unknown;
  events: Array<{
    eventName: string | null;
    eventStartDate: string | null;
    eventDivision?: string | null;
    eventLevel?: string | null;
  }>;
  athletes: Array<
    BamsAthleteRowSummary & {
      eventDivision?: string | null;
      eventLevel?: string | null;
      orderDate?: string | null;
      playerId?: string | null;
      rawRow?: Record<string, string>;
      matchRequest?: Record<string, unknown>;
      matchResponse?: MatchResponseV1;
    }
  >;
};

function getToken() {
  return localStorage.getItem("token");
}
export function hasAuthToken() {
  return Boolean(getToken());
}
export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

function formatApiError(payload: Record<string, unknown>, status: number): string {
  const rowErrors = Array.isArray(payload.errors)
    ? payload.errors
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const row = "row" in entry ? entry.row : "?";
          const message =
            "message" in entry && typeof entry.message === "string"
              ? entry.message
              : "Invalid row";
          return `Row ${row}: ${message}`;
        })
        .filter(Boolean)
    : [];

  if (typeof payload.error === "string") {
    return rowErrors.length > 0
      ? `${payload.error} ${rowErrors.join(" ")}`
      : payload.error;
  }
  if (typeof payload.message === "string") return payload.message;
  return `HTTP ${status}`;
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
    throw new Error(formatApiError(err as Record<string, unknown>, res.status));
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
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

  async requestMagicLink(email: string) {
    return request<{
      ok: true;
      message: string;
      devLink?: string;
      devNote?: "user_not_found" | "no_bams_access";
      devCheckedEmail?: string;
    }>("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyMagicLink(token: string) {
    return request<{
      token: string;
      user: { id: string; email: string; fullName: string; roles: string[] };
    }>("/auth/magic-link/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async getBamsProfile() {
    return request<BamsProfileResponse>("/auth/bams-profile");
  },

  async importPlaybookUsers(csv: string) {
    return request<PlaybookImportResult>("/admin/users/import-playbook", {
      method: "POST",
      body: JSON.stringify({ csv }),
    });
  },

  async uploadBamsEventCsv(csv: string, fileName?: string) {
    return request<BamsEventUploadResponse>("/bams/events/upload", {
      method: "POST",
      body: JSON.stringify({ csv, fileName }),
    });
  },

  async listBamsEventUploads() {
    return request<{ uploads: BamsEventUploadSummary[] }>("/bams/events/uploads");
  },

  async listBamsMemberEventOptions() {
    return request<BamsMemberEventOptionsResponse>("/bams/events/member-options");
  },

  async getBamsEventResults(uploadId: string, eventName?: string) {
    const q = eventName
      ? `?eventName=${encodeURIComponent(eventName)}`
      : "";
    return request<BamsEventResultsResponse>(
      `/bams/events/${encodeURIComponent(uploadId)}/results${q}`
    );
  },

  async getProgramFilters() {
    const raw = await request<Record<string, unknown>>("/programs/filters");
    return normalizeProgramFiltersResponse(raw);
  },

  // BAMS saved matches
  async saveBamsMatch(input: SaveBamsMatchInput) {
    return request<{
      id: string;
      athleteName: string;
      matchCount: number;
      createdAt: string;
    }>("/bams/saved-matches", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async listSavedBamsMatches() {
    return request<{ savedMatches: SavedMatchSummary[] }>(
      "/bams/saved-matches"
    );
  },

  async getSavedBamsMatch(id: string) {
    return request<SavedMatchDetail>(
      `/bams/saved-matches/${encodeURIComponent(id)}`
    );
  },

  async deleteSavedBamsMatch(id: string) {
    await request<void>(`/bams/saved-matches/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async runBamsEventMatch(
    uploadId: string,
    body?: {
      athleteUuids?: string[];
      eventName?: string;
      limit?: number;
      offset?: number;
      preferences?: {
        preferredStates?: string[];
        preferredDivisions?: string[];
        preferredConferences?: string[];
        schoolTypePreference?: string;
        schoolSizePreference?: "small" | "medium" | "large";
        tuitionPreference?: string;
        priorities?: {
          athleticFit?: number;
          locationFit?: number;
          schoolFit?: number;
          affordabilityFit?: number;
        };
      };
    }
  ) {
    return request<{
      uploadId: string;
      matched: number;
      failed: number;
      skipped: number;
      results: Array<{
        athleteUuid: string;
        matchStatus: string;
        matchError?: string;
        validationDetails?: unknown;
      }>;
    }>(`/bams/events/${encodeURIComponent(uploadId)}/match`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
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
        startDate: calendarDateToIso(String(body.startDate)),
        endDate: calendarDateToIso(String(body.endDate)),
      }),
    });
  },
  async updateEvent(id: string, patch: Partial<CreateEventInput>) {
    const payload: any = { ...patch };
    if (patch.startDate)
      payload.startDate = calendarDateToIso(String(patch.startDate));
    if (patch.endDate)
      payload.endDate = calendarDateToIso(String(patch.endDate));
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
  async listEventsAdmin() {
    return request<EventPublic[]>("/events/admin/all");
  },

  // site CMS
  async getSite() {
    return request<SitePublic>("/site");
  },
  async getSiteAdmin() {
    return request<SitePublic>("/site/admin");
  },
  async patchSite(body: Record<string, unknown>) {
    return request<SitePublic>("/site", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  async presignSiteUpload(payload: {
    filename: string;
    contentType: string;
    kind?: "image" | "video";
  }) {
    return request<{ uploadUrl: string; publicUrl: string; key: string }>(
      "/site/media/upload-url",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
  async getPublishedCmsPage(slug: string) {
    return request<PublishedCmsPageResponse>(
      `/site/pages/${encodeURIComponent(slug)}`
    );
  },
  async putAdminCmsPage(
    slug: string,
    body: {
      title?: string | null;
      published?: boolean;
      blocks?: Array<{
        blockType: string;
        sortOrder?: number;
        props?: Record<string, unknown>;
      }>;
    }
  ) {
    return request<CmsPagePublic>(
      `/site/pages/${encodeURIComponent(slug)}`,
      { method: "PUT", body: JSON.stringify(body) }
    );
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
