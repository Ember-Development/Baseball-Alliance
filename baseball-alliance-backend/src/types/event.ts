import { z } from "zod";

export const EventTypeEnum = z.enum(["TOURNAMENT", "COMBINE", "SHOWCASE"]);

export const CreateEventSchema = z
  .object({
    title: z.string().min(1),
    type: EventTypeEnum,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    city: z.string().min(1),
    state: z.string().length(2),
    venue: z.string().optional(),
    isPublished: z.boolean().optional().default(false),
    startTime: z.string().trim().optional(), // required if COMBINE
  })
  .superRefine((val, ctx) => {
    if (val.type === "COMBINE" && !val.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime is required for COMBINE",
        path: ["startTime"],
      });
    }
    if (val.endDate < val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endDate must be on/after startDate",
        path: ["endDate"],
      });
    }
  });

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
