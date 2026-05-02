import type {
  LeadershipPagePayload,
  LeadershipPersonPayload,
  MembershipPagePayload,
} from "./site";
import {
  BILL_BAVASI_FULL_BIO,
  EDDIE_CORNBLUM_FULL_BIO,
  JOHN_LINDSLEY_FULL_BIO,
  KEITH_JACKSON_FULL_BIO,
} from "./leadershipPageBios";

const JOHN_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FJohn_Lindsley_BA_1_xib4lv.mov?alt=media&token=c906434c-5951-404f-adef-ec768c568820";

const EDDIE_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FEddie_Video_1_xwxnsx.mov?alt=media&token=a87026db-ef4a-41d2-83d7-f6eb8c0364c2";

export const DEFAULT_MEMBERSHIP_PAGE: MembershipPagePayload = {
  heroEyebrow: "Baseball Alliance",
  heroCtaLabel: "Join Membership",
  overviewSectionTitle: "Membership Overview",
  videoSectionTitle: "Membership Information Video",
  whatsIncludedTitle: "What's Included",
  introBlurb:
    "Baseball Alliance Membership is designed to give players meaningful exposure and long-term support.",
  features: [
    {
      id: "feat-verified",
      title: "Verified Performance Data",
      body: "Members receive verified performance data that lives beyond events, helping elevate their profile through trusted metrics, leaderboards, and athlete features.",
    },
    {
      id: "feat-visibility",
      title: "Ongoing Visibility",
      body: "This information is paired with ongoing visibility through content, interviews, and event coverage that helps players stay relevant and discoverable over time.",
    },
    {
      id: "feat-education",
      title: "Educational Resources",
      body: "Membership unlocks access to exclusive interviews and insights from players, coaches, and industry voices.",
    },
    {
      id: "feat-college",
      title: "College-Matching System",
      body: "A college-matching system built to help athletes identify the right opportunities and pathways for their development.",
    },
    {
      id: "feat-community",
      title: "Community & Network",
      body: "Members gain access to livestreams, exclusive experiences, and a growing network focused on accountability, development, and opportunity.",
    },
    {
      id: "feat-partners",
      title: "Partners & Discounts",
      body: "Athletes unlock access to best-in-class partners, discounts, and opportunities designed to support training, performance, and long-term growth.",
    },
  ],
  bottomCtaTitle: "Ready to Elevate Your Game?",
  bottomCtaBody:
    "Join Baseball Alliance Membership and unlock the tools, visibility, and community you need to reach the next level.",
  bottomCtaButtonLabel: "Get Started Today",
};

export function mergeMembershipPage(raw: unknown): MembershipPagePayload {
  const d = DEFAULT_MEMBERSHIP_PAGE;
  const r =
    raw && typeof raw === "object"
      ? (raw as Partial<MembershipPagePayload>)
      : {};
  return {
    heroEyebrow: r.heroEyebrow ?? d.heroEyebrow,
    heroCtaLabel: r.heroCtaLabel ?? d.heroCtaLabel,
    overviewSectionTitle: r.overviewSectionTitle ?? d.overviewSectionTitle,
    videoSectionTitle: r.videoSectionTitle ?? d.videoSectionTitle,
    whatsIncludedTitle: r.whatsIncludedTitle ?? d.whatsIncludedTitle,
    introBlurb: r.introBlurb ?? d.introBlurb,
    features:
      Array.isArray(r.features) && r.features.length > 0
        ? r.features.map((f, i) => ({
            id: f.id || `feat-${i}`,
            title: f.title ?? "",
            body: f.body ?? "",
          }))
        : d.features,
    bottomCtaTitle: r.bottomCtaTitle ?? d.bottomCtaTitle,
    bottomCtaBody: r.bottomCtaBody ?? d.bottomCtaBody,
    bottomCtaButtonLabel: r.bottomCtaButtonLabel ?? d.bottomCtaButtonLabel,
  };
}

const defaultLeadershipPeople: LeadershipPersonPayload[] = [
  {
    id: "john-lindsley",
    name: "John Lindsley",
    title: "Partner",
    shortBio:
      "John is a seasoned professional with over 25 years of experience in real estate development, private equity, and commercial banking. His career spans leadership roles in both corporate finance and private development, marked by innovation, strategic growth, and a proven ability to deliver large-scale projects.",
    fullBio: JOHN_LINDSLEY_FULL_BIO,
    imageUrl: null,
    videoUrl: null,
  },
  {
    id: "bill-bavasi",
    name: "Bill Bavasi",
    title: "Partner",
    shortBio:
      "Bill brings over 40 years of Major League Baseball leadership experience, including senior roles with the Angels, Dodgers, Mariners, and Reds. He helped shape player development and scouting strategy across the league and now consults for organizations such as Perfect Game, the Pioneer Baseball League, and MLB's Commissioner's Office.",
    fullBio: BILL_BAVASI_FULL_BIO,
    imageUrl: null,
    videoUrl: null,
  },
  {
    id: "keith-jackson",
    name: "Keith Jackson",
    title: "Partner",
    shortBio:
      "Keith brings nearly 20 years of leadership in player development and youth baseball. As Executive Director of Action Baseball Club, he's guided countless players to reach their goals on and off the field, earning a reputation for mentorship, integrity, and community impact.",
    fullBio: KEITH_JACKSON_FULL_BIO,
    imageUrl: null,
    videoUrl: null,
  },
];

const defaultTeamLeadership: LeadershipPersonPayload[] = [
  {
    id: "eddie-cornblum",
    name: "Eddie Cornblum",
    title: "Field Coordinator",
    shortBio:
      "Eddie brings more than 25 years of coaching experience and leadership across Central Texas high school baseball. A proven program builder and mentor, he has guided multiple championship teams and continues to shape the next generation of athletes through his work with Baseball Alliance.",
    fullBio: EDDIE_CORNBLUM_FULL_BIO,
    imageUrl: null,
    videoUrl: null,
  },
];

export const DEFAULT_LEADERSHIP_PAGE: LeadershipPagePayload = {
  heroEyebrow: "About Baseball Alliance",
  introParagraph:
    "The Baseball Alliance is led by a group of seasoned executives, coaches, and operators with decades of experience across professional and amateur baseball. Their shared mission is to strengthen the sport's foundation through player development, integrity, and innovation — connecting athletes, coaches, and communities nationwide.",
  byTheNumbersTitle: "By the Numbers",
  stats: [
    {
      id: "stat-1",
      highlight: "100+ Years",
      description:
        "Of Baseball Leadership across MLB, high school, and amateur levels",
    },
    {
      id: "stat-2",
      highlight: "40+ Years",
      description:
        "In MLB Front Offices including Angels, Mariners, Dodgers, Reds, and the MLB Commissioner's Office",
    },
    {
      id: "stat-3",
      highlight: "63 MLB Draft Picks",
      description: "Developed through Baseball Alliance Leadership",
    },
    {
      id: "stat-4",
      highlight: "636+ College Commitments",
      description: "Under Baseball Alliance Leadership",
    },
    {
      id: "stat-5",
      highlight: "400+ Career Wins",
      description:
        "High School Coaching Wins led by Eddie Cornblum, including the 2025 6A State Championship",
    },
  ],
  leadershipSectionTitle: "Leadership",
  teamLeadershipSectionTitle: "Team Leadership & Operations",
  gallerySectionTitle: "Gallery",
  leadership: defaultLeadershipPeople,
  teamLeadership: defaultTeamLeadership,
  videos: [
    {
      id: "john-lindsley-video",
      title: "John Lindsley - Partner",
      name: "John Lindsley",
      description:
        "Hear from John Lindsley about his vision for Baseball Alliance.",
      videoUrl: JOHN_VIDEO_URL,
      category: "Leadership Interview",
      posterImageUrl: null,
    },
    {
      id: "eddie-cornblum-video",
      title: "Eddie Cornblum - Field Coordinator",
      name: "Eddie Cornblum",
      description:
        "Eddie Cornblum shares insights on player development and coaching excellence.",
      videoUrl: EDDIE_VIDEO_URL,
      category: "Coaching Spotlight",
      posterImageUrl: null,
    },
  ],
  galleryPlaceholderTitle: "",
  galleryPlaceholderBody:
    "More leadership moments, team events, and interviews coming soon.",
};

function normalizePeople(
  incoming: Partial<LeadershipPersonPayload>[] | undefined,
  fallback: LeadershipPersonPayload[]
): LeadershipPersonPayload[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return fallback;
  return incoming.map((p, i) => {
    const d = p.id ? fallback.find((x) => x.id === p.id) : undefined;
    return {
      id: p.id ?? d?.id ?? `leader-${i}`,
      name: p.name ?? d?.name ?? "New leader",
      title: p.title ?? d?.title ?? "",
      shortBio: p.shortBio ?? d?.shortBio ?? "",
      fullBio: p.fullBio ?? d?.fullBio ?? "",
      imageUrl: p.imageUrl !== undefined ? p.imageUrl : d?.imageUrl ?? null,
      videoUrl: p.videoUrl !== undefined ? p.videoUrl : d?.videoUrl ?? null,
    };
  });
}

export function mergeLeadershipPage(raw: unknown): LeadershipPagePayload {
  const d = DEFAULT_LEADERSHIP_PAGE;
  const r =
    raw && typeof raw === "object"
      ? (raw as Partial<LeadershipPagePayload>)
      : {};
  return {
    heroEyebrow: r.heroEyebrow ?? d.heroEyebrow,
    introParagraph: r.introParagraph ?? d.introParagraph,
    byTheNumbersTitle: r.byTheNumbersTitle ?? d.byTheNumbersTitle,
    stats:
      Array.isArray(r.stats) && r.stats.length > 0
        ? r.stats.map((s, i) => ({
            id: s.id || `stat-${i}`,
            highlight: s.highlight ?? "",
            description: s.description ?? "",
          }))
        : d.stats,
    leadershipSectionTitle: r.leadershipSectionTitle ?? d.leadershipSectionTitle,
    teamLeadershipSectionTitle:
      r.teamLeadershipSectionTitle ?? d.teamLeadershipSectionTitle,
    gallerySectionTitle: r.gallerySectionTitle ?? d.gallerySectionTitle,
    leadership: normalizePeople(r.leadership, d.leadership),
    teamLeadership: normalizePeople(r.teamLeadership, d.teamLeadership),
    videos:
      Array.isArray(r.videos) && r.videos.length > 0
        ? r.videos.map((v, i) => ({
            id: v.id || `video-${i}`,
            title: v.title ?? "",
            name: v.name ?? "",
            description: v.description ?? "",
            videoUrl: v.videoUrl ?? "",
            category: v.category ?? "",
            posterImageUrl:
              v.posterImageUrl !== undefined ? v.posterImageUrl : null,
          }))
        : d.videos,
    galleryPlaceholderTitle:
      r.galleryPlaceholderTitle ?? d.galleryPlaceholderTitle,
    galleryPlaceholderBody:
      r.galleryPlaceholderBody ?? d.galleryPlaceholderBody,
  };
}
