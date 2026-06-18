import type {
  AthleteProfile,
  GapMetric,
  MatchRowV1,
  MetricAssessmentEntry,
} from "@/types/collegeMatch";
import {
  formatFallbackFitEntry,
  normalizeMetricAssessment,
} from "@/types/collegeMatch";

/** Number of recommended matches surfaced by default. */
export const TOP_MATCH_LIMIT = 30;

/** Normalize API / CSV / camelCase metric keys to snake_case for lookup. */
function normalizeMetricKey(metric: string): string {
  const s = metric.trim();
  const snake = s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
  return snake;
}

const METRIC_LABELS: Record<string, string> = {
  // BAMS API graded keys (SCREAMING_SNAKE)
  exit_velocity: "Exit velocity",
  sixty_time: "60-yard time",
  arm_strength_inf: "Infield arm",
  arm_strength_of: "Outfield arm",
  arm_strength_c: "Catcher arm",
  catcher_pop_time: "Pop time",
  catcher_arm_velo: "Catcher arm",
  pitching_velo_rhp: "Pitching velocity",
  pitching_velo_lhp: "Pitching velocity",
  // Legacy / alternate keys
  arm_strength: "Arm strength",
  pop_time: "Pop time",
  fastball_velocity: "Fastball velocity",
  top_velocity: "Top velocity",
  max_exit_velocity: "Max exit velocity",
  avg_exit_velocity: "Avg exit velocity",
  inf_throwing_velocity: "Infield throw velocity",
  of_throwing_velocity: "Outfield throw velocity",
  catcher_arm_velocity: "Catcher throw velocity",
  strike_percentage: "Strike percentage",
  // Match request / CSV camelCase
  sixtytime: "60-yard time",
  maxexitvelocity: "Max exit velocity",
  avgexitvelocity: "Avg exit velocity",
  infthrowingvelocity: "Infield throw velocity",
  ofthrowingvelocity: "Outfield throw velocity",
  catcherarmvelocity: "Catcher throw velocity",
  catcherpoptime: "Pop time",
  fastballvelocity: "Fastball velocity",
  topvelocity: "Top velocity",
  strikepercentage: "Strike percentage",
  heightinches: "Height",
  weightlbs: "Weight",
  // Event CSV (kebab → snake)
  infield_velocity: "Infield throw velocity",
  outfield_velocity: "Outfield throw velocity",
  catcher_velocity: "Catcher throw velocity",
  height_feet: "Height",
  weight: "Weight",
  gpa: "GPA",
};

function titleCaseFromSnake(key: string): string {
  const words = key.split("_").filter(Boolean);
  const label = words
    .map((w) => {
      if (w === "inf") return "infield";
      if (w === "of") return "outfield";
      if (w === "60" || w === "sixty") return "60-yard";
      return w;
    })
    .join(" ");
  return label.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatProjectedLevel(
  level?: string | null,
  tier?: number | null
): string | null {
  const l = level?.trim();
  if (!l) return null;
  if (tier != null && !Number.isNaN(tier)) {
    return `${l} · Tier ${tier}`;
  }
  return l;
}

export function formatFallbackFitsList(fits: AthleteProfile["fallbackFits"]): string {
  const list = Array.isArray(fits) ? fits : [];
  return list
    .map((f) => formatFallbackFitEntry(f))
    .filter((s): s is string => Boolean(s))
    .join(", ");
}

export function confidenceBadgeClass(
  confidence: AthleteProfile["confidence"]
): string {
  switch (confidence) {
    case "high":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function confidenceUserText(
  confidence: AthleteProfile["confidence"],
  verified?: boolean
): string {
  switch (confidence) {
    case "high":
      return verified
        ? "High (verified showcase data)"
        : "Based on 3+ showcase metrics";
    case "medium":
      return "Based on limited metrics — add more stats for a sharper projection";
    default:
      return "Preferences only — add showcase metrics for a stat-based level";
  }
}

export function metricDisplayName(metric: string): string {
  const key = normalizeMetricKey(metric);
  return METRIC_LABELS[key] ?? titleCaseFromSnake(key);
}

export function metricFitBandLabel(fitBand: string): string {
  const b = fitBand.toLowerCase().replace(/_/g, " ");
  if (b.includes("impact")) return "Impact";
  if (b.includes("competitive")) return "Competitive";
  if (b.includes("below")) return "Below floor";
  if (b.includes("floor")) return "Floor";
  return fitBand;
}

export function metricFitBandClass(fitBand: string): string {
  const b = fitBand.toLowerCase();
  if (b.includes("impact")) return "bg-violet-100 text-violet-900";
  if (b.includes("competitive")) return "bg-emerald-100 text-emerald-800";
  if (b.includes("below")) return "bg-slate-100 text-slate-600";
  if (b.includes("floor")) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export function hasStatBasedLevel(ap?: AthleteProfile | null): boolean {
  if (!ap) return false;
  return Boolean(ap.resolvedLevel?.trim()) && ap.confidence !== "low";
}

export function buildLevelSummarySentence(ap: AthleteProfile): string | null {
  const metrics = normalizeMetricAssessment(ap.metricAssessment)
    .filter((m) => m.fitBand?.toLowerCase().includes("competitive"))
    .map((m) => metricDisplayName(m.metric));
  const unique = [...new Set(metrics)];
  const level = formatProjectedLevel(ap.resolvedLevel, ap.resolvedTier);
  if (!level) return null;
  if (unique.length > 0) {
    const list =
      unique.length === 1
        ? unique[0]
        : unique.length === 2
          ? `${unique[0]} and ${unique[1]}`
          : `${unique.slice(0, -1).join(", ")}, and ${unique.at(-1)}`;
    return `Your ${list} were compared to ${ap.positionGroup ?? "position"} benchmarks. You project as competitive at this level.`;
  }
  return `Your showcase metrics were compared to ${ap.positionGroup ?? "position"} benchmarks at this level.`;
}

/** Prefer server-generated reasons; fall back to fit-label heuristics. */
export function programAlignmentCopy(match: MatchRowV1): string | null {
  const athleticReason = match.reasons.find((r) =>
    /reach|align|stronger|benchmark|competitive|floor|fit at this level|program tier/i.test(
      r
    )
  );
  if (athleticReason) return athleticReason;

  const label = match.fitLabel.toLowerCase();
  if (label.includes("strong") || label.includes("excellent")) {
    return "Your metrics align well with programs at this level.";
  }
  if (label.includes("reach")) {
    return "This conference projects as a reach based on your current metrics.";
  }
  if (
    label.includes("good") ||
    label.includes("fair") ||
    label.includes("moderate")
  ) {
    return "Your profile is stronger than this program's typical benchmark band — solid fit if you want playing time probability.";
  }
  return null;
}

/** Direction-aware, human-readable description of a metric gap to close. */
export function formatGapMetric(gap: GapMetric): {
  label: string;
  detail: string;
} {
  const label = metricDisplayName(gap.metric);
  const dir = gap.direction?.toLowerCase() ?? "";
  const magnitude = Math.abs(gap.delta);
  const rounded =
    magnitude >= 10
      ? Math.round(magnitude).toString()
      : magnitude.toFixed(1).replace(/\.0$/, "");
  const verb =
    dir.includes("decrease") || dir.includes("below") || dir.includes("lower")
      ? "lower"
      : "add";
  const detail =
    verb === "lower"
      ? `Lower by ~${rounded} to reach the competitive band`
      : `Gain ~${rounded} to reach the competitive band`;
  return { label, detail };
}

/** Distinct, sorted facet values from the full match pool. */
export function matchFacetValues(
  matches: MatchRowV1[],
  key: "division" | "conference" | "state"
): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    const v = m[key]?.trim();
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function sortMetricAssessment(
  entries: AthleteProfile["metricAssessment"] | unknown
): MetricAssessmentEntry[] {
  const order = ["impact", "competitive", "floor", "below"];
  return normalizeMetricAssessment(entries).sort((a, b) => {
    const ai = order.findIndex((o) => a.fitBand.toLowerCase().includes(o));
    const bi = order.findIndex((o) => b.fitBand.toLowerCase().includes(o));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Per-metric graded comparison bullets — one line per metricAssessment entry. */
export function buildGradedMetricCompareBullets(
  ap: AthleteProfile
): string[] {
  const level =
    formatProjectedLevel(ap.resolvedLevel, ap.resolvedTier) ?? "your level";
  return sortMetricAssessment(ap.metricAssessment).map((m) => {
    const name = metricDisplayName(m.metric);
    const band = metricFitBandLabel(m.fitBand);
    const levelFit = m.levelFit?.trim() || level;
    return `${name} (${m.value}): ${band} for ${levelFit}`;
  });
}
