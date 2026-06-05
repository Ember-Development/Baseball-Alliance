/** User-facing copy for BAMS match results (i18n-ready). */

export const MATCH_COPY = {
  athlete: {
    headline: "Your projected level",
    explainer:
      "This is based on your showcase metrics and position — not a scholarship offer or guarantee.",
    verifiedBadge: "Verified showcase data",
    alsoWithinRange: "Also within range:",
    lowConfidenceTitle: "Add showcase metrics to see your projected level",
    lowConfidenceBody:
      "Add showcase metrics (60 time, exit velocity, arm strength, etc.) to see your projected level. Until then, matches are based mainly on preferences.",
    preferencesOnlyNote:
      "Until then, matches are based mainly on your school and location preferences.",
  },
  confidence: {
    high: "High confidence (3+ metrics)",
    highVerified: "High confidence (verified showcase data)",
    medium: "Medium confidence (add more stats for sharper results)",
    low: "Add showcase metrics for a stat-based projection",
  },
  school: {
    matchFitLabel: "School compatibility",
    matchFitShort: "Match fit",
    whyThisMatch: "Why this match?",
    programCompetitiveness: "Program competitiveness",
    topReasonsPrefix: "Why we matched this school",
  },
  results: {
    heading: (count: number) => `Top ${count} school matches`,
    subheading: (total: number) =>
      `${total} programs evaluated — ranked by how well each school fits you`,
    filterPlaceholder: "Filter schools…",
    compareToggle: (total: number, open: boolean) =>
      open
        ? "Hide comparison tools"
        : `Compare & filter all ${total} programs`,
    preferencesUpdated:
      "Results updated based on your location preferences.",
    targetRangeNote:
      "Your top matches are in the Target range — that's normal. Check your projected level above for how your numbers compare to college benchmarks.",
    noMatches: "No matches returned for this athlete.",
  },
  explainer: {
    triggerGlobal: "How match fit works",
    triggerSchool: "Why this number?",
    sections: [
      {
        title: "What does match fit mean?",
        body: "Match fit is how well this specific school matches your stats, location, and preferences together. It is NOT a grade on you as a player. Most realistic targets land in the 50–80 range.",
      },
      {
        title: "Why is my top match only 69?",
        body: "69 means this is a good fit (Target) — a realistic school to explore, not that you're a below-average athlete. The number blends athletics, location, school preferences, and affordability (25% each by default). When many factors are neutral, scores often cluster in the 60s and 70s.",
      },
      {
        title: "Where do I see if I'm \"good enough\" for college baseball?",
        body: "Look at Your projected level at the top (e.g. D2 · Tier 2). That's driven by your showcase metrics vs recruiting benchmarks. Match fit is \"how right is this school for you,\" not \"how good am I.\"",
      },
      {
        title: "Why did my top school change when I added a state preference?",
        body: "Location becomes part of the blend. In-state schools score higher; out-of-state schools score lower. Your ability didn't change — your preferences did.",
      },
      {
        title: "What's the difference between my level and a school's tier?",
        body: "Your projected level = where your stats fit our benchmark ladder. Program tier (e.g. on each school) = how competitive that school's conference is. We compare them for reach vs fit messaging in reasons.",
      },
    ] as const,
  },
  breakdown: {
    athleticFit: {
      label: "Athletic fit",
      tooltip:
        "How your stats and level align with this program's conference and benchmarks",
    },
    locationFit: {
      label: "Location",
      tooltip:
        "How well this school matches states you preferred (neutral if you didn't pick any)",
    },
    schoolFit: {
      label: "School preferences",
      tooltip:
        "Division, conference, school type, and size vs what you asked for",
    },
    affordabilityFit: {
      label: "Affordability",
      tooltip: "Tuition vs your cost preference",
    },
    athleticDetails: "Athletic details",
    levelTierFit: "Level & conference alignment",
    metricBenchmarkFit: "Showcase metrics vs this program",
    flagsProjectionFit: "Profile factors (verified data, position, etc.)",
    scarcityBoost: "Position value",
  },
  footer:
    "Projections are for recruiting exploration only. Coaches consider academics, video, character, and roster needs — not just showcase numbers.",
} as const;

export type FitLabelTone = "positive" | "neutral-positive" | "neutral";

/** Map BAMS fitLabel enum to user-friendly badge text. */
export function fitLabelDisplay(raw: string): { label: string; tone: FitLabelTone } {
  const n = raw.trim().toLowerCase().replace(/[_-]/g, " ");
  if (n.includes("strong")) {
    return { label: "Strong fit", tone: "positive" };
  }
  if (n.includes("development")) {
    return { label: "Long shot", tone: "neutral" };
  }
  if (n.includes("reach")) {
    return { label: "Stretch", tone: "neutral" };
  }
  if (n.includes("target") || n.includes("good match") || n === "good fit") {
    return { label: "Good fit", tone: "neutral-positive" };
  }
  if (n.includes("fair") || n.includes("moderate")) {
    return { label: "Good fit", tone: "neutral-positive" };
  }
  return { label: raw.trim() || "Match", tone: "neutral-positive" };
}

export function fitLabelBadgeClass(tone: FitLabelTone): string {
  switch (tone) {
    case "positive":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "neutral-positive":
      return "bg-sky-100 text-sky-900 border-sky-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/** Format overallScore — never as a percentage. */
export function formatMatchFitValue(score: number): string {
  const rounded = Math.round(score * 10) / 10;
  return Number.isInteger(rounded) ? String(Math.round(rounded)) : rounded.toFixed(1);
}
