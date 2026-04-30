// src/types/prisma.ts
import { z } from "zod";

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

export const CombineRegistrationInput = z.object({
  // from the form (strings -> coerce/trim)
  playerFullName: z.string().min(1),
  dob: z.coerce.date(), // yyyy-mm-dd
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(1),
  playerPhone: z.string().min(1),
  playerEmail: z
    .string()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  parentFullName: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  parentPhone: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  parentEmail: z
    .string()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  parentConsentUnder13: z.boolean().optional().default(false),

  emergencyName: z.string().min(1),
  emergencyPhone: z.string().min(1),

  primaryPosition: z.string().min(1),
  secondaryPosition: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bats: z.enum(["Right", "Left", "Switch"]),
  throws: z.enum(["Right", "Left", "Switch"]),
  height: z.string().min(1),
  weight: z.string().min(1),

  gradYear: z.string().min(1),
  schoolGrade: z
    .enum([
      "",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "JUCO",
    ])
    .transform((v) => v || "1"),
  schoolName: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  schoolLocation: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  clubTeam: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  coachName: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  coachContact: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  shirtSize: z.enum(["YS", "YM", "YL", "S", "M", "L", "XL", "XXL"]),
  agreeToWaiver: z.boolean(),
  privacyAck: z.boolean(),
});

export type CombineRegistrationInputT = z.infer<
  typeof CombineRegistrationInput
>;

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

//payments
export const CreateAcceptHostedSessionSchema = z.object({
  registrationId: z.string().min(1),
  amountCents: z.number().int().positive().optional(),
});

export type CreateAcceptHostedSessionInput = z.infer<
  typeof CreateAcceptHostedSessionSchema
>;
