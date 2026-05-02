import type { EventPublic } from "./event";

/** Mirrors GET /api/site (public) and /api/site/admin */
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

export type ContactCtaPayload = {
  lines?: string[];
  buttonLabel?: string;
  mailto?: string;
  imageUrl?: string | null;
};

export type MembershipFeaturePayload = {
  id: string;
  title: string;
  body: string;
};

export type MembershipPagePayload = {
  heroEyebrow: string | null;
  heroCtaLabel: string | null;
  overviewSectionTitle: string | null;
  videoSectionTitle: string | null;
  whatsIncludedTitle: string | null;
  introBlurb: string | null;
  features: MembershipFeaturePayload[];
  bottomCtaTitle: string | null;
  bottomCtaBody: string | null;
  bottomCtaButtonLabel: string | null;
};

export type LeadershipStatPayload = {
  id: string;
  highlight: string;
  description: string;
};

export type LeadershipPersonPayload = {
  id: string;
  name: string;
  title: string;
  shortBio: string;
  fullBio: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type LeadershipVideoPayload = {
  id: string;
  title: string;
  name: string;
  description: string;
  videoUrl: string;
  category: string;
  posterImageUrl?: string | null;
};

export type LeadershipPagePayload = {
  heroEyebrow: string | null;
  introParagraph: string | null;
  byTheNumbersTitle: string | null;
  stats: LeadershipStatPayload[];
  leadershipSectionTitle: string | null;
  teamLeadershipSectionTitle: string | null;
  gallerySectionTitle: string | null;
  leadership: LeadershipPersonPayload[];
  teamLeadership: LeadershipPersonPayload[];
  videos: LeadershipVideoPayload[];
  galleryPlaceholderTitle: string | null;
  galleryPlaceholderBody: string | null;
};

export type WhoWeAreSectionPayload = {
  id: string;
  variant: "lead" | "body";
  body: string;
};

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
  contactCta: ContactCtaPayload | null;
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

export type PublishedCmsPageResponse = {
  slug: string;
  title: string | null;
  blocks: Array<{
    id: string;
    blockType: string;
    sortOrder: number;
    props: Record<string, unknown>;
  }>;
};
