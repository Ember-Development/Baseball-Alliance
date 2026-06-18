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
  /** BAMS may return an array or a keyed object — use normalizeMetricAssessment(). */
  metricAssessment?: MetricAssessmentEntry[] | Record<string, unknown>;
  /** BAMS may return an array or a keyed object — use normalizeGapMetrics(). */
  gapMetrics?: GapMetric[] | Record<string, unknown>;
  fallbackFits?: FallbackFitEntry[];
  flags?: {
    leftHandedBoost?: boolean;
    multiPosition?: boolean;
    twoWay?: boolean;
    academicTier?: string;
    verifiedData?: boolean;
  };
};

function metricAssessmentEntryFrom(
  metric: string,
  raw: unknown
): MetricAssessmentEntry | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const fitBand =
    typeof o.fitBand === "string"
      ? o.fitBand
      : typeof o.fit_band === "string"
        ? o.fit_band
        : "";
  const levelFit =
    typeof o.levelFit === "string"
      ? o.levelFit
      : typeof o.level_fit === "string"
        ? o.level_fit
        : "";
  const valueRaw = o.value ?? o.metricValue;
  const value =
    typeof valueRaw === "number"
      ? valueRaw
      : valueRaw != null && valueRaw !== ""
        ? Number(valueRaw)
        : NaN;
  if (!fitBand && Number.isNaN(value)) return null;
  return {
    metric: typeof o.metric === "string" ? o.metric : metric,
    value: Number.isNaN(value) ? 0 : value,
    fitBand,
    levelFit,
  };
}

/** BAMS may send metricAssessment as an array or as { [metricKey]: { value, fitBand, ... } }. */
export function normalizeMetricAssessment(
  raw: AthleteProfile["metricAssessment"] | unknown
): MetricAssessmentEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((entry) =>
        entry && typeof entry === "object" && "metric" in entry
          ? metricAssessmentEntryFrom(
              String((entry as MetricAssessmentEntry).metric),
              entry
            )
          : null
      )
      .filter((e): e is MetricAssessmentEntry => e != null);
  }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .map(([key, val]) => metricAssessmentEntryFrom(key, val))
      .filter((e): e is MetricAssessmentEntry => e != null);
  }
  return [];
}

function gapMetricFrom(key: string, val: unknown): GapMetric | null {
  if (!val || typeof val !== "object") return null;
  const o = val as Record<string, unknown>;
  const metric =
    typeof o.metric === "string" && o.metric.trim() ? o.metric.trim() : key;
  const deltaRaw = o.delta ?? o.gap ?? o.value;
  const delta =
    typeof deltaRaw === "number" ? deltaRaw : Number(deltaRaw);
  const direction =
    typeof o.direction === "string"
      ? o.direction
      : typeof o.direction === "number"
        ? String(o.direction)
        : "";
  if (Number.isNaN(delta)) return null;
  return { metric, delta, direction };
}

/** BAMS may send gapMetrics as an array or as { [metricKey]: { delta, direction, ... } }. */
export function normalizeGapMetrics(
  raw: AthleteProfile["gapMetrics"] | unknown
): GapMetric[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((entry) =>
        entry && typeof entry === "object" && "metric" in entry
          ? gapMetricFrom(String((entry as GapMetric).metric), entry)
          : entry && typeof entry === "object"
            ? gapMetricFrom("", entry)
            : null
      )
      .filter((e): e is GapMetric => e != null);
  }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .map(([key, val]) => gapMetricFrom(key, val))
      .filter((e): e is GapMetric => e != null);
  }
  return [];
}

function numField(o: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (v != null && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

/** Normalize BAMS athleticFitBreakdown object sub-scores. */
export function normalizeAthleticSubBreakdown(
  raw: MatchRowV1["athleticFitBreakdown"] | unknown
): AthleticSubBreakdown | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const levelTierFit = numField(o, "levelTierFit", "level_tier_fit");
  const metricBenchmarkFit = numField(
    o,
    "metricBenchmarkFit",
    "metric_benchmark_fit"
  );
  const flagsProjectionFit = numField(
    o,
    "flagsProjectionFit",
    "flags_projection_fit"
  );
  const scarcityBoost = numField(o, "scarcityBoost", "scarcity_boost");
  if (
    levelTierFit == null &&
    metricBenchmarkFit == null &&
    flagsProjectionFit == null &&
    scarcityBoost == null
  ) {
    return null;
  }
  return {
    levelTierFit: levelTierFit ?? 0,
    metricBenchmarkFit: metricBenchmarkFit ?? 0,
    flagsProjectionFit: flagsProjectionFit ?? 0,
    scarcityBoost: scarcityBoost ?? 0,
  };
}

/** Legacy per-metric athletic breakdown (array shape). */
export function normalizeMetricAthleticBreakdown(
  raw: MatchRowV1["athleticFitBreakdown"] | unknown
): AthleticFitBreakdownEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const o = entry as Record<string, unknown>;
      const metricName =
        typeof o.metricName === "string"
          ? o.metricName
          : typeof o.metric === "string"
            ? o.metric
            : "";
      const scoreRaw = o.score ?? o.value;
      const score =
        typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
      const label = typeof o.label === "string" ? o.label : "";
      if (!metricName || Number.isNaN(score)) return null;
      return { metricName, score, label };
    })
    .filter((e): e is AthleticFitBreakdownEntry => e != null);
}

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
    return `${level} Tier ${tierNum}`;
  }
  if (level) return level;
  return null;
}

export type AthleticFitBreakdownEntry = {
  metricName: string;
  score: number;
  label: string;
};

/** BAMS athletic sub-scores when benchmarks are available (object shape). */
export type AthleticSubBreakdown = {
  levelTierFit: number;
  metricBenchmarkFit: number;
  flagsProjectionFit: number;
  scarcityBoost: number;
};

export type MatchRowV1 = {
  id: string;
  schoolName: string;
  division: string;
  conference: string;
  state: string;
  city?: string | null;
  schoolType?: string | null;
  enrollment?: number | null;
  overallScore: number;
  matchFitBand?: string | null;
  matchFitBandLabel?: string | null;
  similarFitGroup?: string | null;
  scoreBreakdown: ScoreBreakdown;
  fitLabel: string;
  reasons: string[];
  conferenceTier?: number;
  conferenceTierLabel?: string;
  /** Legacy array of per-metric scores, or BAMS object sub-breakdown. */
  athleticFitBreakdown?:
    | AthleticFitBreakdownEntry[]
    | AthleticSubBreakdown
    | Record<string, unknown>;
};

/** Alias for BAMS match row (MatchResultV1). */
export type MatchResultV1 = MatchRowV1;

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
