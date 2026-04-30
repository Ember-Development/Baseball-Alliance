export type MatchFormFields = {
  playerType: "pitcher" | "hitter";
  primaryPosition: string;
  secondaryPosition: string;
  gradYear: string;
  handedness: string;
  gpa: string;
  preferredStatesCsv: string;
  preferredDivisionsCsv: string;
  preferredConferencesCsv: string;
  schoolTypePreference: string;
  schoolSizePreference: "" | "small" | "medium" | "large";
  tuitionPreference: string;
  athleticFitW: string;
  locationFitW: string;
  schoolFitW: string;
  affordabilityFitW: string;
  fastballVelocity: string;
  topVelocity: string;
  strikePercentage: string;
  avgExitVelocity: string;
  maxExitVelocity: string;
  sixtyTime: string;
  infThrowingVelocity: string;
  ofThrowingVelocity: string;
  catcherPopTime: string;
  catcherArmVelocity: string;
  heightInches: string;
  weightLbs: string;
};

function toInt(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

function toFloat(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function csvToArr(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function prioritiesFromForm(f: MatchFormFields): Record<string, number> | undefined {
  const o: Record<string, number> = {};
  const a = toFloat(f.athleticFitW);
  const l = toFloat(f.locationFitW);
  const sc = toFloat(f.schoolFitW);
  const af = toFloat(f.affordabilityFitW);
  if (a !== undefined) o.athleticFit = a;
  if (l !== undefined) o.locationFit = l;
  if (sc !== undefined) o.schoolFit = sc;
  if (af !== undefined) o.affordabilityFit = af;
  return Object.keys(o).length ? o : undefined;
}

function metricsFromForm(f: MatchFormFields): Record<string, number> | undefined {
  const o: Record<string, number> = {};
  const add = (k: string, v: number | undefined) => {
    if (v !== undefined) o[k] = v;
  };
  add("fastballVelocity", toFloat(f.fastballVelocity));
  add("topVelocity", toFloat(f.topVelocity));
  add("strikePercentage", toFloat(f.strikePercentage));
  add("avgExitVelocity", toFloat(f.avgExitVelocity));
  add("maxExitVelocity", toFloat(f.maxExitVelocity));
  add("sixtyTime", toFloat(f.sixtyTime));
  add("infThrowingVelocity", toFloat(f.infThrowingVelocity));
  add("ofThrowingVelocity", toFloat(f.ofThrowingVelocity));
  add("catcherPopTime", toFloat(f.catcherPopTime));
  add("catcherArmVelocity", toFloat(f.catcherArmVelocity));
  add("heightInches", toFloat(f.heightInches));
  add("weightLbs", toFloat(f.weightLbs));
  return Object.keys(o).length ? o : undefined;
}

/** Build JSON body for POST /api/match (aligned with matchRequestV1Schema). */
export function buildMatchBody(f: MatchFormFields): Record<string, unknown> {
  const body: Record<string, unknown> = {
    playerType: f.playerType,
    primaryPosition: f.primaryPosition.trim(),
    preferredStates: csvToArr(f.preferredStatesCsv),
    preferredDivisions: csvToArr(f.preferredDivisionsCsv),
    preferredConferences: csvToArr(f.preferredConferencesCsv),
  };

  const sec = f.secondaryPosition.trim();
  if (sec) body.secondaryPosition = sec;

  const gy = toInt(f.gradYear);
  if (gy !== undefined) body.gradYear = gy;

  const hn = f.handedness.trim();
  if (hn) body.handedness = hn;

  const gpa = toFloat(f.gpa);
  if (gpa !== undefined) body.gpa = gpa;

  const st = f.schoolTypePreference.trim();
  if (st) body.schoolTypePreference = st;

  if (f.schoolSizePreference)
    body.schoolSizePreference = f.schoolSizePreference;

  const tu = f.tuitionPreference.trim();
  if (tu) body.tuitionPreference = tu;

  const pr = prioritiesFromForm(f);
  if (pr) body.priorities = pr;

  const met = metricsFromForm(f);
  if (met) body.metrics = met;

  return body;
}

/* ── position group helpers (exported for UI) ─────────────────── */

const PITCHER_POSITIONS = new Set(["RHP", "LHP", "RP", "CP"]);
const CATCHER_POSITIONS = new Set(["C"]);
const INFIELD_POSITIONS = new Set(["SS", "2B", "3B", "1B"]);
const OUTFIELD_POSITIONS = new Set(["CF", "LF", "RF", "OF"]);

export type PositionGroup = "pitcher" | "catcher" | "infield" | "outfield" | "unknown";

export function resolvePositionGroup(playerType: string, position: string): PositionGroup {
  if (playerType === "pitcher" || PITCHER_POSITIONS.has(position)) return "pitcher";
  if (CATCHER_POSITIONS.has(position)) return "catcher";
  if (INFIELD_POSITIONS.has(position)) return "infield";
  if (OUTFIELD_POSITIONS.has(position)) return "outfield";
  return "unknown";
}

export type MetricDef = {
  key: keyof MatchFormFields;
  label: string;
  placeholder: string;
  unit: string;
};

const PITCHER_METRICS: MetricDef[] = [
  { key: "topVelocity", label: "Top Velocity", placeholder: "e.g. 92", unit: "mph" },
  { key: "fastballVelocity", label: "Fastball Velocity", placeholder: "e.g. 88", unit: "mph" },
  { key: "strikePercentage", label: "Strike Percentage", placeholder: "e.g. 62", unit: "%" },
];

const CATCHER_METRICS: MetricDef[] = [
  { key: "maxExitVelocity", label: "Max Exit Velocity", placeholder: "e.g. 95", unit: "mph" },
  { key: "avgExitVelocity", label: "Avg Exit Velocity", placeholder: "e.g. 85", unit: "mph" },
  { key: "sixtyTime", label: "60-Yard Dash", placeholder: "e.g. 7.0", unit: "sec" },
  { key: "catcherPopTime", label: "Pop Time", placeholder: "e.g. 1.95", unit: "sec" },
  { key: "catcherArmVelocity", label: "Throwing Velocity", placeholder: "e.g. 78", unit: "mph" },
];

const INFIELD_METRICS: MetricDef[] = [
  { key: "maxExitVelocity", label: "Max Exit Velocity", placeholder: "e.g. 95", unit: "mph" },
  { key: "avgExitVelocity", label: "Avg Exit Velocity", placeholder: "e.g. 85", unit: "mph" },
  { key: "sixtyTime", label: "60-Yard Dash", placeholder: "e.g. 6.9", unit: "sec" },
  { key: "infThrowingVelocity", label: "Infield Throw Velocity", placeholder: "e.g. 82", unit: "mph" },
];

const OUTFIELD_METRICS: MetricDef[] = [
  { key: "maxExitVelocity", label: "Max Exit Velocity", placeholder: "e.g. 95", unit: "mph" },
  { key: "avgExitVelocity", label: "Avg Exit Velocity", placeholder: "e.g. 85", unit: "mph" },
  { key: "sixtyTime", label: "60-Yard Dash", placeholder: "e.g. 6.8", unit: "sec" },
  { key: "ofThrowingVelocity", label: "Outfield Throw Velocity", placeholder: "e.g. 88", unit: "mph" },
];

const UNIVERSAL_METRICS: MetricDef[] = [
  { key: "heightInches", label: "Height", placeholder: "e.g. 72 (6'0\")", unit: "in" },
  { key: "weightLbs", label: "Weight", placeholder: "e.g. 185", unit: "lbs" },
];

export function metricsForPosition(playerType: string, position: string): MetricDef[] {
  const group = resolvePositionGroup(playerType, position);
  switch (group) {
    case "pitcher": return [...PITCHER_METRICS, ...UNIVERSAL_METRICS];
    case "catcher": return [...CATCHER_METRICS, ...UNIVERSAL_METRICS];
    case "infield": return [...INFIELD_METRICS, ...UNIVERSAL_METRICS];
    case "outfield": return [...OUTFIELD_METRICS, ...UNIVERSAL_METRICS];
    default: return UNIVERSAL_METRICS;
  }
}

const PHYSICAL_KEYS = new Set<keyof MatchFormFields>(["heightInches", "weightLbs"]);
const PITCHING_KEYS = new Set<keyof MatchFormFields>([
  "topVelocity",
  "fastballVelocity",
  "strikePercentage",
]);
const HITTING_KEYS = new Set<keyof MatchFormFields>(["avgExitVelocity", "maxExitVelocity"]);
const ATHLETIC_KEYS = new Set<keyof MatchFormFields>(["sixtyTime"]);
const POSITION_DEFENSE_KEYS = new Set<keyof MatchFormFields>([
  "catcherPopTime",
  "catcherArmVelocity",
  "infThrowingVelocity",
  "ofThrowingVelocity",
]);

/** Split combined metric defs into UI sections (physical = height/weight). */
export function splitPositionMetrics(defs: MetricDef[]): {
  pitching: MetricDef[];
  hitting: MetricDef[];
  athletic: MetricDef[];
  positionDefense: MetricDef[];
  physical: MetricDef[];
} {
  const physical = defs.filter((d) => PHYSICAL_KEYS.has(d.key));
  const rest = defs.filter((d) => !PHYSICAL_KEYS.has(d.key));
  return {
    pitching: rest.filter((d) => PITCHING_KEYS.has(d.key)),
    hitting: rest.filter((d) => HITTING_KEYS.has(d.key)),
    athletic: rest.filter((d) => ATHLETIC_KEYS.has(d.key)),
    positionDefense: rest.filter((d) => POSITION_DEFENSE_KEYS.has(d.key)),
    physical,
  };
}

export function countFilledMetrics(f: MatchFormFields, defs: MetricDef[]): number {
  return defs.filter((d) => f[d.key].trim() !== "").length;
}
