export type CollegeProgram = {
  id: string;
  schoolName: string;
  normalizedSchoolName: string | null;
  sport: string | null;
  division: string;
  conference: string;
  city: string | null;
  state: string;
  region: string | null;
  sizeOfCity: string | null;
  schoolType: string;
  schoolSize: string;
  enrollment: number | null;
  religiousAffiliation: string | null;
  hbcuCommunityCollegeWomenOnly: string | null;
  averageGpa: string | null;
  satReadingLow: number | null;
  satReadingHigh: number | null;
  satMathLow: number | null;
  satMathHigh: number | null;
  actCompositeLow: number | null;
  actCompositeHigh: number | null;
  acceptanceRate: string | null;
  majorsOfferedUrl: string | null;
  tuitionInState: string | null;
  tuitionOutOfState: string | null;
  tuitionBand: string | null;
  schoolWebsite: string | null;
  athleticsUrl: string | null;
  recruitingUrl: string | null;
  rosterUrl: string | null;
  admissionsUrl: string | null;
  campUrl: string | null;
  nickname: string | null;
  stadium: string | null;
  isActive: boolean;
};

export type ProgramsListResponse = {
  data: CollegeProgram[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProgramFiltersResponse = {
  division: string[];
  conference: string[];
  state: string[];
  schoolType: string[];
};

/** Normalize API shape (singular or plural keys) to ProgramFiltersResponse. */
export function normalizeProgramFiltersResponse(
  raw: Record<string, unknown>,
): ProgramFiltersResponse {
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    division: arr(raw.division ?? raw.divisions),
    conference: arr(raw.conference ?? raw.conferences),
    state: arr(raw.state ?? raw.states),
    schoolType: arr(raw.schoolType ?? raw.schoolTypes),
  };
}

/* ── match response types ─────────────────────────────────────── */

export type ScoreBreakdown = {
  athleticFit: number;
  locationFit: number;
  schoolFit: number;
  affordabilityFit: number;
};

export type MetricAssessmentEntry = {
  metric: string;
  value: number;
  fitBand: string;
  levelFit: string;
};

export type GapMetric = {
  metric: string;
  delta: number;
  direction: string;
};

/** API may send level/tier, resolvedLevel/resolvedTier, or mixed shapes. */
export type FallbackFitEntry =
  | string
  | {
      level?: string;
      tier?: number;
      resolvedLevel?: string;
      resolvedTier?: number;
      division?: string;
      label?: string;
    };

export type AthleteProfile = {
  resolvedLevel?: string;
  resolvedTier?: number;
  positionGroup?: string;
  confidence: "high" | "medium" | "low";
  metricAssessment?: MetricAssessmentEntry[];
  gapMetrics?: GapMetric[];
  fallbackFits?: FallbackFitEntry[];
  flags?: {
    leftHandedBoost?: boolean;
    multiPosition?: boolean;
    twoWay?: boolean;
    academicTier?: string;
  };
};

/** Normalize one fallback-fit entry from the API into display text, or null if unusable. */
export function formatFallbackFitEntry(f: unknown): string | null {
  if (f == null) return null;
  if (typeof f === "string") {
    const t = f.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof f !== "object") return null;
  const o = f as Record<string, unknown>;
  const levelRaw =
    o.level ?? o.resolvedLevel ?? o.division ?? o.label ?? o.name;
  const tierRaw = o.tier ?? o.resolvedTier ?? o.tierIndex;
  const level =
    levelRaw != null && String(levelRaw).trim() !== ""
      ? String(levelRaw).trim()
      : null;
  const tierNum =
    tierRaw != null && tierRaw !== ""
      ? typeof tierRaw === "number"
        ? tierRaw
        : Number(tierRaw)
      : NaN;
  if (level && !Number.isNaN(tierNum)) {
    return `${level} T${tierNum}`;
  }
  if (level) return level;
  return null;
}

export type AthleticFitBreakdown = {
  metricName: string;
  score: number;
  label: string;
};

export type MatchRowV1 = {
  id: string;
  schoolName: string;
  division: string;
  conference: string;
  state: string;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  fitLabel: string;
  reasons: string[];
  conferenceTier?: number;
  conferenceTierLabel?: string;
  athleticFitBreakdown?: AthleticFitBreakdown[];
};

export type MatchResponseV1 = {
  matches: MatchRowV1[];
  totalEvaluated: number;
  totalReturned: number;
  total: number;
  athleteProfile?: AthleteProfile;
};

export type ValidationDetails = {
  formErrors: string[];
  fieldErrors: { path: string[]; messages: string[] }[];
};
