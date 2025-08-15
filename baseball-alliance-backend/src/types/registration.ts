import { z } from "zod";

const phone = z.string().min(7).max(30);
const zip = z.string().min(3).max(10);

const basePerson = z.object({
  playerFullName: z.string().min(1),
  dob: z.coerce.date(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: zip,
  playerPhone: phone,
  playerEmail: z.string().email().optional(),
  parentFullName: z.string().optional(),
  parentPhone: phone.optional(),
  parentEmail: z.string().email().optional(),
  parentConsentUnder13: z.boolean().optional().default(false),
  emergencyName: z.string().min(1),
  emergencyPhone: phone,
  primaryPosition: z.string().min(1),
  secondaryPosition: z.string().optional(),
  bats: z.string().min(1), // "Right" | "Left" | "Switch"
  throws: z.string().min(1),
  height: z.string().min(1),
  weight: z.string().min(1),
  gradYear: z.string().min(2),
  schoolGrade: z.string().min(1),
  schoolName: z.string().optional(),
  schoolLocation: z.string().optional(),
  clubTeam: z.string().optional(),
  coachName: z.string().optional(),
  coachContact: z.string().optional(),
  shirtSize: z.string().min(1),
  agreeToWaiver: z.boolean(),
  privacyAck: z.boolean(),
});

export const CreateCombineRegistrationSchema = z.object({
  eventId: z.string().cuid(),
  userId: z.string().cuid(),
  payload: basePerson,
});

export const CreateShowcaseRegistrationSchema = z.object({
  eventId: z.string().cuid(),
  userId: z.string().cuid(),
  payload: basePerson,
});

export const CreateTournamentRegistrationSchema = z.object({
  eventId: z.string().cuid(),
  submittedByUserId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  teamName: z.string().min(1),
  orgName: z.string().optional(),
  ageDivision: z.enum([
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
  ]),
  teamCity: z.string().min(1),
  teamState: z.string().length(2),
  managerName: z.string().min(1),
  managerEmail: z.string().email(),
  managerPhone: phone,
  coachName: z.string().optional(),
  coachEmail: z.string().email().optional(),
  coachPhone: phone.optional(),
  rosterJson: z.any().optional(),
  notes: z.string().optional(),
});

export type CreateCombineRegistrationInput = z.infer<
  typeof CreateCombineRegistrationSchema
>;
export type CreateShowcaseRegistrationInput = z.infer<
  typeof CreateShowcaseRegistrationSchema
>;
export type CreateTournamentRegistrationInput = z.infer<
  typeof CreateTournamentRegistrationSchema
>;
