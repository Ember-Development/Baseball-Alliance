import { z } from "zod";
import type { EventPublic } from "../types.js";

const optionalNullableString = z
  .union([z.string(), z.null()])
  .optional();

const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional()
  .transform((v) =>
    v === "" || v === undefined ? undefined : v === null ? null : v
  );

export const ContactCtaSchema = z
  .object({
    lines: z.array(z.string()).optional(),
    buttonLabel: z.string().optional(),
    mailto: z.string().optional(),
    imageUrl: optionalUrl,
  })
  .optional()
  .nullable();

export const SiteImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  alt: optionalNullableString,
  title: optionalNullableString,
  body: optionalNullableString,
  order: z.number().int().optional().default(0),
});

export const SolutionItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: optionalNullableString,
  order: z.number().int().optional().default(0),
});

export const SolutionCategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  order: z.number().int().optional().default(0),
  items: z.array(SolutionItemInputSchema),
});

export const CtaInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  href: z.string().min(1),
  style: optionalNullableString,
  order: z.number().int().optional().default(0),
});

export const StructureItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  order: z.number().int().optional().default(0),
});

export const MembershipInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  blurb: optionalNullableString,
  perks: z.array(z.string()).optional().nullable(),
  priceCents: z.number().int().nullable().optional(),
  order: z.number().int().optional().default(0),
});

export const PageHeaderInputSchema = z.object({
  id: z.string().optional(),
  pageKey: z.string().min(1),
  title: z.string().min(1),
  subtitle: optionalNullableString,
  imageUrl: optionalUrl,
});

export const MembershipFeatureSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string(),
});

export const MembershipPagePayloadSchema = z
  .object({
    heroEyebrow: z.string().nullable(),
    heroCtaLabel: z.string().nullable(),
    overviewSectionTitle: z.string().nullable(),
    videoSectionTitle: z.string().nullable(),
    whatsIncludedTitle: z.string().nullable(),
    introBlurb: z.string().nullable(),
    features: z.array(MembershipFeatureSchema),
    bottomCtaTitle: z.string().nullable(),
    bottomCtaBody: z.string().nullable(),
    bottomCtaButtonLabel: z.string().nullable(),
  })
  .strict();

export const LeadershipStatSchema = z.object({
  id: z.string().min(1),
  highlight: z.string(),
  description: z.string(),
});

export const LeadershipPersonSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  title: z.string(),
  shortBio: z.string(),
  fullBio: z.string(),
  imageUrl: optionalNullableString,
  videoUrl: optionalNullableString,
});

export const LeadershipVideoSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  name: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  category: z.string(),
  posterImageUrl: optionalNullableString,
});

export const WhoWeAreSectionSchema = z.object({
  id: z.string().min(1),
  variant: z.enum(["lead", "body"]),
  body: z.string(),
});

export const LeadershipPagePayloadSchema = z
  .object({
    heroEyebrow: z.string().nullable(),
    introParagraph: z.string().nullable(),
    byTheNumbersTitle: z.string().nullable(),
    stats: z.array(LeadershipStatSchema),
    leadershipSectionTitle: z.string().nullable(),
    teamLeadershipSectionTitle: z.string().nullable(),
    gallerySectionTitle: z.string().nullable(),
    leadership: z.array(LeadershipPersonSchema),
    teamLeadership: z.array(LeadershipPersonSchema),
    videos: z.array(LeadershipVideoSchema),
    galleryPlaceholderTitle: z.string().nullable(),
    galleryPlaceholderBody: z.string().nullable(),
  })
  .strict();

export const PatchSiteSchema = z
  .object({
    whoWeAre: z.string().optional(),
    whoWeAreSections: z
      .array(WhoWeAreSectionSchema)
      .nullable()
      .optional(),
    featuredEventId: z.string().nullable().optional(),
    heroEyebrow: optionalNullableString,
    heroHeadline: optionalNullableString,
    heroSubcopy: optionalNullableString,
    heroCtaLabel: optionalNullableString,
    heroCtaHref: optionalNullableString,
    heroPosterUrl: optionalUrl,
    heroVideoDesktopUrl: optionalUrl,
    heroVideoMobileUrl: optionalUrl,
    contactCta: ContactCtaSchema,
    membershipVideoUrl: optionalUrl,
    membershipCtaUrl: optionalUrl,
    membershipPage: MembershipPagePayloadSchema.nullable().optional(),
    leadershipPage: LeadershipPagePayloadSchema.nullable().optional(),
    whoWeAreImages: z.array(SiteImageInputSchema).optional(),
    solutions: z.array(SolutionCategoryInputSchema).optional(),
    ctas: z.array(CtaInputSchema).optional(),
    structure: z.array(StructureItemInputSchema).optional(),
    memberships: z.array(MembershipInputSchema).optional(),
    headers: z.array(PageHeaderInputSchema).optional(),
  })
  .strict();

export const UploadUrlRequestSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[^/\\]+$/, "Invalid filename"),
  contentType: z.string().min(1).max(200),
  kind: z.enum(["image", "video"]).optional().default("image"),
});

export const CmsBlockInputSchema = z.object({
  id: z.string().optional(),
  blockType: z.string().min(1).max(64),
  sortOrder: z.number().int().optional().default(0),
  props: z.record(z.string(), z.unknown()).optional().default({}),
});

export const PutCmsPageSchema = z
  .object({
    title: z.string().nullable().optional(),
    published: z.boolean().optional(),
    blocks: z.array(CmsBlockInputSchema).optional(),
  })
  .strict();

export type MembershipFeaturePayload = z.infer<typeof MembershipFeatureSchema>;
export type MembershipPagePayload = z.infer<typeof MembershipPagePayloadSchema>;
export type LeadershipStatPayload = z.infer<typeof LeadershipStatSchema>;
export type LeadershipPersonPayload = z.infer<typeof LeadershipPersonSchema>;
export type LeadershipVideoPayload = z.infer<typeof LeadershipVideoSchema>;
export type LeadershipPagePayload = z.infer<typeof LeadershipPagePayloadSchema>;
export type WhoWeAreSectionPayload = z.infer<typeof WhoWeAreSectionSchema>;

export type SitePublic = {
  id: string;
  whoWeAre: string;
  whoWeAreSections: WhoWeAreSectionPayload[] | null;
  featuredEventId: string | null;
  featuredEvent: EventPublic | null;
  heroEyebrow: string | null;
  heroHeadline: string | null;
  heroSubcopy: string | null;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  heroPosterUrl: string | null;
  heroVideoDesktopUrl: string | null;
  heroVideoMobileUrl: string | null;
  contactCta: Record<string, unknown> | null;
  membershipVideoUrl: string | null;
  membershipCtaUrl: string | null;
  membershipPage: MembershipPagePayload | null;
  leadershipPage: LeadershipPagePayload | null;
  whoWeAreImages: Array<{
    id: string;
    url: string;
    alt: string | null;
    title: string | null;
    body: string | null;
    order: number;
  }>;
  solutions: Array<{
    id: string;
    name: string;
    order: number;
    items: Array<{
      id: string;
      title: string;
      body: string;
      icon: string | null;
      order: number;
    }>;
  }>;
  ctas: Array<{
    id: string;
    label: string;
    href: string;
    style: string | null;
    order: number;
  }>;
  structure: Array<{
    id: string;
    title: string;
    body: string;
    order: number;
  }>;
  memberships: Array<{
    id: string;
    name: string;
    blurb: string | null;
    perks: unknown;
    priceCents: number | null;
    order: number;
  }>;
  headers: Array<{
    id: string;
    pageKey: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
  }>;
  pages: CmsPagePublic[];
};

export type CmsPagePublic = {
  id: string;
  slug: string;
  title: string | null;
  published: boolean;
  blocks: Array<{
    id: string;
    blockType: string;
    sortOrder: number;
    props: Record<string, unknown>;
  }>;
};
