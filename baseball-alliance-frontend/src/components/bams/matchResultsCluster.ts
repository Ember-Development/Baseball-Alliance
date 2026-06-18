import type { MatchRowV1, ScoreBreakdown } from "@/types/collegeMatch";
import type { MatchPreferences } from "./matchPreferences";
import type { SavedMatchPreferencesInput } from "../../lib/api";
import { formatMatchFitValue } from "./matchResultsCopy";

export const NEUTRAL_FIT_SCORE = 70;
export const CLUSTER_MIN_SIZE = 3;

export type MatchPreferenceContext = {
  preferredStates: string[];
  preferredDivisions: string[];
  preferredConferences: string[];
  schoolTypePreference: string;
  schoolSizePreference: string;
  tuitionPreference: string;
};

export type MatchListSegment =
  | { kind: "single"; match: MatchRowV1; rank: number }
  | {
      kind: "cluster";
      groupKey: string;
      matches: MatchRowV1[];
      startRank: number;
      scoreBreakdown: ScoreBreakdown;
    };

const emptyPreferenceContext = (): MatchPreferenceContext => ({
  preferredStates: [],
  preferredDivisions: [],
  preferredConferences: [],
  schoolTypePreference: "",
  schoolSizePreference: "",
  tuitionPreference: "",
});

export function contextFromMatchPreferences(
  prefs: MatchPreferences
): MatchPreferenceContext {
  return {
    preferredStates: prefs.preferredStates,
    preferredDivisions: [],
    preferredConferences: [],
    schoolTypePreference: prefs.schoolTypePreference,
    schoolSizePreference: prefs.schoolSizePreference,
    tuitionPreference: prefs.tuitionPreference,
  };
}

export function contextFromSavedPreferences(
  prefs: SavedMatchPreferencesInput | null | undefined
): MatchPreferenceContext {
  if (!prefs) return emptyPreferenceContext();
  return {
    preferredStates: prefs.preferredStates ?? [],
    preferredDivisions: prefs.preferredDivisions ?? [],
    preferredConferences: prefs.preferredConferences ?? [],
    schoolTypePreference: prefs.schoolTypePreference ?? "",
    schoolSizePreference: prefs.schoolSizePreference ?? "",
    tuitionPreference: prefs.tuitionPreference ?? "",
  };
}

export function deriveSimilarFitGroup(match: MatchRowV1): string {
  if (match.similarFitGroup?.trim()) return match.similarFitGroup.trim();
  const sb = match.scoreBreakdown;
  return `fit-${sb.athleticFit}-${sb.locationFit}-${sb.schoolFit}-${sb.affordabilityFit}`;
}

export function buildMatchSegments(matches: MatchRowV1[]): MatchListSegment[] {
  const segments: MatchListSegment[] = [];
  let i = 0;
  while (i < matches.length) {
    const groupKey = deriveSimilarFitGroup(matches[i]);
    let j = i + 1;
    while (
      j < matches.length &&
      deriveSimilarFitGroup(matches[j]) === groupKey
    ) {
      j++;
    }
    const run = matches.slice(i, j);
    const startRank = i + 1;
    if (run.length >= CLUSTER_MIN_SIZE) {
      segments.push({
        kind: "cluster",
        groupKey,
        matches: run,
        startRank,
        scoreBreakdown: run[0].scoreBreakdown,
      });
    } else {
      for (let k = 0; k < run.length; k++) {
        segments.push({ kind: "single", match: run[k], rank: startRank + k });
      }
    }
    i = j;
  }
  return segments;
}

export function hasClusterInResults(matches: MatchRowV1[]): boolean {
  let i = 0;
  while (i < matches.length) {
    const key = deriveSimilarFitGroup(matches[i]);
    let j = i + 1;
    while (j < matches.length && deriveSimilarFitGroup(matches[j]) === key) j++;
    if (j - i >= CLUSTER_MIN_SIZE) return true;
    i = j;
  }
  return false;
}

export function isTiedWithPrevious(
  matches: MatchRowV1[],
  index: number
): boolean {
  if (index <= 0) return false;
  return (
    deriveSimilarFitGroup(matches[index]) ===
    deriveSimilarFitGroup(matches[index - 1])
  );
}

export function findSharedBenchmarkReasons(
  matches: MatchRowV1[],
  minCount = 2
): string[] {
  const counts = new Map<string, number>();
  for (const m of matches) {
    for (const r of m.reasons) {
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= minCount)
    .map(([r]) => r)
    .sort((a, b) => a.localeCompare(b));
}

export function schoolSpecificReasons(
  match: MatchRowV1,
  sharedReasons: Set<string>
): string[] {
  return match.reasons.filter((r) => !sharedReasons.has(r));
}

export function formatEnrollment(
  enrollment: number | null | undefined
): string | null {
  if (enrollment == null || Number.isNaN(enrollment)) return null;
  return `~${enrollment.toLocaleString()} students`;
}

export function formatSchoolType(
  schoolType: string | null | undefined
): string | null {
  if (!schoolType?.trim()) return null;
  if (/public/i.test(schoolType)) return "Public";
  if (/private/i.test(schoolType)) return "Private";
  return schoolType.trim();
}

export function formatLocationLine(match: MatchRowV1): string {
  const city = match.city?.trim();
  if (city) return `${city}, ${match.state}`;
  return match.state;
}

export function formatSchoolProfileLine(match: MatchRowV1): string | null {
  const parts = [
    formatSchoolType(match.schoolType),
    formatEnrollment(match.enrollment),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function fitBandHeadline(match: MatchRowV1): {
  primary: string;
  secondary: string;
  inCluster: boolean;
} {
  const band = match.matchFitBand?.trim();
  const label = match.matchFitBandLabel?.trim();
  const secondary = formatMatchFitValue(match.overallScore);

  if (band && label) {
    return { primary: `${band} · ${label}`, secondary, inCluster: false };
  }
  if (band) {
    return { primary: band, secondary, inCluster: false };
  }

  const floor = Math.floor(match.overallScore / 5) * 5;
  return {
    primary: `${floor}–${floor + 4}`,
    secondary,
    inCluster: false,
  };
}

export function schoolPrefsUnset(ctx: MatchPreferenceContext): boolean {
  return (
    !ctx.schoolTypePreference.trim() &&
    !ctx.schoolSizePreference.trim() &&
    ctx.preferredDivisions.length === 0 &&
    ctx.preferredConferences.length === 0
  );
}

export function affordabilityPrefUnset(ctx: MatchPreferenceContext): boolean {
  const t = ctx.tuitionPreference.trim().toLowerCase();
  return !t || t === "any";
}

export type DimensionNeutralInfo = {
  isNeutral: boolean;
  label: string;
  detail?: string;
};

export function locationNeutralInfo(
  match: MatchRowV1,
  ctx: MatchPreferenceContext
): DimensionNeutralInfo {
  const score = match.scoreBreakdown.locationFit;
  if (score !== NEUTRAL_FIT_SCORE) {
    return { isNeutral: false, label: String(Math.round(score)) };
  }
  if (ctx.preferredStates.length === 0) {
    return {
      isNeutral: true,
      label: "Neutral",
      detail: "No preferred states selected",
    };
  }
  const hit = ctx.preferredStates.some(
    (s) => s.toUpperCase() === match.state?.toUpperCase()
  );
  if (!hit) {
    return {
      isNeutral: true,
      label: "Neutral",
      detail: "Not in your preferred states",
    };
  }
  return { isNeutral: false, label: String(Math.round(score)) };
}

export function schoolNeutralInfo(
  match: MatchRowV1,
  ctx: MatchPreferenceContext
): DimensionNeutralInfo {
  const score = match.scoreBreakdown.schoolFit;
  if (score !== NEUTRAL_FIT_SCORE) {
    return { isNeutral: false, label: String(Math.round(score)) };
  }
  if (schoolPrefsUnset(ctx)) {
    return {
      isNeutral: true,
      label: "Neutral",
      detail: "No school preferences set",
    };
  }
  return {
    isNeutral: true,
    label: "Neutral",
    detail: "No school preferences affecting score",
  };
}

export function affordabilityNeutralInfo(
  ctx: MatchPreferenceContext,
  score = NEUTRAL_FIT_SCORE
): DimensionNeutralInfo {
  if (score === NEUTRAL_FIT_SCORE && affordabilityPrefUnset(ctx)) {
    return {
      isNeutral: true,
      label: "Neutral",
      detail: "No tuition preference set",
    };
  }
  return { isNeutral: false, label: String(Math.round(score)) };
}

export function athleticDimensionLabel(match: MatchRowV1): string {
  const score = Math.round(match.scoreBreakdown.athleticFit);
  if (match.conferenceTierLabel) {
    return `${score} · ${match.conferenceTierLabel}`;
  }
  return String(score);
}

export function preferenceHitBadges(
  match: MatchRowV1,
  ctx: MatchPreferenceContext
): string[] {
  const badges: string[] = [];
  if (
    ctx.preferredStates.length > 0 &&
    match.state &&
    ctx.preferredStates.some(
      (s) => s.toUpperCase() === match.state.toUpperCase()
    )
  ) {
    badges.push("Preferred state");
  }
  if (
    ctx.preferredDivisions.length > 0 &&
    match.division &&
    ctx.preferredDivisions.some(
      (d) =>
        match.division.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(match.division.toLowerCase())
    )
  ) {
    badges.push("Preferred division");
  }
  if (
    ctx.preferredConferences.length > 0 &&
    match.conference &&
    ctx.preferredConferences.some(
      (c) => c.toLowerCase() === match.conference.toLowerCase()
    )
  ) {
    badges.push("Preferred conference");
  }
  return badges;
}

export function shouldShowPreferenceNudge(
  matches: MatchRowV1[],
  ctx: MatchPreferenceContext
): boolean {
  return hasClusterInResults(matches) && ctx.preferredStates.length === 0;
}

export function scoreBreakdownsEqual(
  a: ScoreBreakdown,
  b: ScoreBreakdown
): boolean {
  return (
    a.athleticFit === b.athleticFit &&
    a.locationFit === b.locationFit &&
    a.schoolFit === b.schoolFit &&
    a.affordabilityFit === b.affordabilityFit
  );
}
