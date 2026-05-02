import { z } from "zod";

const prioritiesSchema = z
  .object({
    athleticFit: z.number().min(0).max(1).optional(),
    locationFit: z.number().min(0).max(1).optional(),
    schoolFit: z.number().min(0).max(1).optional(),
    affordabilityFit: z.number().min(0).max(1).optional(),
  })
  .strict()
  .optional();

const metricsSchema = z
  .object({
    fastballVelocity: z.number().min(0).max(120).optional(),
    topVelocity: z.number().min(0).max(120).optional(),
    strikePercentage: z.number().min(0).max(100).optional(),
    avgExitVelocity: z.number().min(0).max(120).optional(),
    maxExitVelocity: z.number().min(0).max(120).optional(),
    sixtyTime: z.number().min(0).max(20).optional(),
  })
  .strict()
  .optional();

export const matchRequestV1Schema = z
  .object({
    playerType: z.enum(["pitcher", "hitter"]),
    primaryPosition: z.string().min(1, "primaryPosition is required"),
    secondaryPosition: z.string().optional(),
    gradYear: z.number().int().min(2000).max(2040).optional(),
    handedness: z.string().optional(),
    gpa: z.number().min(0).max(4.5).optional(),
    preferredStates: z.array(z.string()).optional().default([]),
    preferredDivisions: z.array(z.string()).optional().default([]),
    preferredConferences: z.array(z.string()).optional().default([]),
    schoolTypePreference: z.string().optional(),
    schoolSizePreference: z.enum(["small", "medium", "large"]).optional(),
    tuitionPreference: z.string().optional(),
    priorities: prioritiesSchema,
    metrics: metricsSchema,
  })
  .strict();

export type MatchRequestV1 = z.infer<typeof matchRequestV1Schema>;

export const matchQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type MatchQuery = z.infer<typeof matchQuerySchema>;

export const programsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  division: z.string().optional(),
  conference: z.string().optional(),
  state: z.string().optional(),
  schoolType: z.string().optional(),
  search: z.string().optional(),
});

export type ProgramsQuery = z.infer<typeof programsQuerySchema>;
