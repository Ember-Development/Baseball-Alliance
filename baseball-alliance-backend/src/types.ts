// src/types/prisma.ts
// No imports from @prisma/client — keeps enums stable across Prisma versions.

/** Runtime arrays (great for dropdowns & Zod) + inferred union types */
export const RoleNameValues = [
  "PARENT",
  "PLAYER",
  "COACH",
  "SCOUT",
  "ADMIN",
  "FAN",
] as const;
export type RoleName = (typeof RoleNameValues)[number];

export const EventTypeValues = ["TOURNAMENT", "COMBINE", "SHOWCASE"] as const;
export type EventType = (typeof EventTypeValues)[number];

export const RegistrationStatusValues = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "REFUNDED",
] as const;
export type RegistrationStatus = (typeof RegistrationStatusValues)[number];

export const PaymentStatusValues = [
  "REQUIRES_ACTION",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PaymentStatusValues)[number];

export const AgeDivisionValues = [
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "JUCO",
] as const;
export type AgeDivision = (typeof AgeDivisionValues)[number];

export const MediaTypeValues = ["VIDEO", "HIGHLIGHT", "PODCAST"] as const;
export type MediaType = (typeof MediaTypeValues)[number];

export const VisibilityValues = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;
export type Visibility = (typeof VisibilityValues)[number];

/** Public shapes you can safely return to clients */
export type UserPublic = {
  id: string;
  email: string;
  fullName: string;
  roles: RoleName[];
};

export type EventPublic = {
  id: string;
  title: string;
  type: EventType;
  startDate: string; // ISO
  endDate: string; // ISO
  startTime?: string | null;
  city: string;
  state: string;
  venue?: string | null;
  isPublished: boolean;
};

export type CombineRegistrationPublic = {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  playerFullName: string;
  gradYear: string;
  schoolGrade: string;
  shirtSize: string;
  createdAt: string; // ISO
};

export type ShowcaseRegistrationPublic = CombineRegistrationPublic;

export type TournamentRegistrationPublic = {
  id: string;
  eventId: string;
  teamId?: string | null;
  status: RegistrationStatus;
  teamName: string;
  ageDivision: AgeDivision;
  teamCity: string;
  teamState: string;
  createdAt: string;
};
