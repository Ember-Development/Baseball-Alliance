/**
 * Maps a parsed event CSV row → BAMS MatchRequestV1 JSON.
 * Only fields in this shape are sent to BAMS (not buyer_*, medical_*, etc.).
 */

export type EventCsvRow = Record<string, string>;

const PITCHER_POSITIONS = new Set(["RHP", "LHP", "P", "RP", "CP"]);
const METRIC_CSV_KEYS = [
  "60-time",
  "5-10-5-shuttle",
  "exit-velocity",
  "outfield-velocity",
  "infield-velocity",
  "catcher-velocity",
  "pop-time",
  "fastball-velocity",
  "offspeed-velocity",
  "changeup-velocity",
] as const;

export const REQUIRED_EVENT_HEADERS = [
  "event_name",
  "event_start_date",
  "athlete_uuid",
  "primary_position",
  "grad_year",
] as const;

type ShowcaseMetrics = {
  sixtyTime?: number;
  exitVelocity?: number;
  shuttle510?: number;
  infieldVelocity?: number;
  outfieldVelocity?: number;
  catcherVelocity?: number;
  popTime?: number;
  fastballVelocity?: number;
  offspeedVelocity?: number;
  changeupVelocity?: number;
};

type PositionGroup =
  | "CORNER_OF"
  | "CF"
  | "MIDDLE_IF"
  | "CORNER_IF"
  | "C"
  | "RHP"
  | "LHP";

function isBlank(val: string | undefined): boolean {
  if (val === undefined) return true;
  return val.trim() === "";
}

function parseNumber(val: string | undefined): number | undefined {
  if (val === undefined || isBlank(val)) return undefined;
  const n = Number(val.trim());
  return Number.isFinite(n) ? n : undefined;
}

/** GPA, ACT, SAT: 0 means missing */
function parsePositiveNumber(val: string | undefined): number | undefined {
  const n = parseNumber(val);
  if (n === undefined || n <= 0) return undefined;
  return n;
}

function handLetter(raw: string | undefined): string | undefined {
  if (raw === undefined || isBlank(raw)) return undefined;
  const t = raw.trim().toLowerCase();
  if (t.startsWith("r") || t === "right") return "R";
  if (t.startsWith("l") || t === "left") return "L";
  if (t.startsWith("s") || t === "switch") return "S";
  return raw.trim().charAt(0).toUpperCase();
}

function parseShowcaseFromRow(row: EventCsvRow): ShowcaseMetrics {
  return {
    sixtyTime: parseNumber(row["60-time"]),
    shuttle510: parseNumber(row["5-10-5-shuttle"]),
    exitVelocity: parseNumber(row["exit-velocity"]),
    outfieldVelocity: parseNumber(row["outfield-velocity"]),
    infieldVelocity: parseNumber(row["infield-velocity"]),
    catcherVelocity: parseNumber(row["catcher-velocity"]),
    popTime: parseNumber(row["pop-time"]),
    fastballVelocity: parseNumber(row["fastball-velocity"]),
    offspeedVelocity: parseNumber(row["offspeed-velocity"]),
    changeupVelocity: parseNumber(row["changeup-velocity"]),
  };
}

function normalizePositionGroup(primaryPosition: string): PositionGroup {
  const p = primaryPosition.trim().toLowerCase();
  if (
    ["rf", "lf", "of", "outfield", "right field", "left field"].some((k) =>
      p.includes(k)
    )
  ) {
    return "CORNER_OF";
  }
  if (["cf", "center field"].some((k) => p.includes(k))) return "CF";
  if (["ss", "2b", "shortstop", "second base"].some((k) => p.includes(k))) {
    return "MIDDLE_IF";
  }
  if (["3b", "1b", "third base", "first base"].some((k) => p.includes(k))) {
    return "CORNER_IF";
  }
  if (["c", "catcher"].some((k) => p.includes(k))) return "C";
  if (["lhp", "left"].some((k) => p.includes(k) && p.includes("p"))) {
    return "LHP";
  }
  return "RHP";
}

function resolveArmVelocity(
  showcase: ShowcaseMetrics,
  group: PositionGroup
): { inf?: number; of?: number } {
  const inf = showcase.infieldVelocity;
  const of = showcase.outfieldVelocity;
  if (group === "CORNER_OF" || group === "CF") {
    return { of: of ?? inf };
  }
  if (group === "MIDDLE_IF" || group === "CORNER_IF") {
    return { inf: inf ?? of };
  }
  return { inf, of };
}

function detectTwoWay(
  playerType: string,
  primaryPosition: string,
  secondaryPosition: string | undefined,
  showcase: ShowcaseMetrics
): boolean {
  const hasPitchingData = showcase.fastballVelocity != null;
  const primaryIsHitter =
    playerType === "hitter" &&
    !["rhp", "lhp", "p", "pitcher"].includes(
      primaryPosition.trim().toLowerCase()
    );
  const secondaryIsPitcher =
    secondaryPosition != null &&
    ["rhp", "lhp", "p", "pitcher"].some((pos) =>
      secondaryPosition.toLowerCase().includes(pos)
    );
  return primaryIsHitter && hasPitchingData && secondaryIsPitcher;
}

function buildPositionAwareMetrics(
  showcase: ShowcaseMetrics,
  playerType: "pitcher" | "hitter",
  primaryPosition: string,
  secondaryPosition?: string
): Record<string, number> {
  const group = normalizePositionGroup(primaryPosition);
  const arm = resolveArmVelocity(showcase, group);
  const isPitcher =
    playerType === "pitcher" || group === "RHP" || group === "LHP";
  const isTwoWay = detectTwoWay(
    playerType,
    primaryPosition,
    secondaryPosition,
    showcase
  );
  const metrics: Record<string, number> = {};

  if (showcase.exitVelocity != null) {
    metrics.maxExitVelocity = showcase.exitVelocity;
  }
  if (showcase.sixtyTime != null) metrics.sixtyTime = showcase.sixtyTime;

  if (arm.inf != null) metrics.infThrowingVelocity = arm.inf;
  if (arm.of != null) metrics.ofThrowingVelocity = arm.of;

  if (group === "C") {
    if (showcase.catcherVelocity != null) {
      metrics.catcherArmVelocity = showcase.catcherVelocity;
    }
    if (showcase.popTime != null) metrics.catcherPopTime = showcase.popTime;
  }

  if (isPitcher || isTwoWay) {
    if (showcase.fastballVelocity != null) {
      metrics.fastballVelocity = showcase.fastballVelocity;
      metrics.topVelocity = showcase.fastballVelocity;
    }
  }

  return metrics;
}

export function handednessFromBatThrow(row: EventCsvRow): string | undefined {
  const bat = handLetter(row.bat ?? row.bats);
  const thr = handLetter(row.throw ?? row.throws);
  if (!bat || !thr) return undefined;
  return `${bat}/${thr}`;
}

export function resolvePlayerType(row: EventCsvRow): "pitcher" | "hitter" {
  const pitchFlag = row.do_you_pitch?.trim() === "1";
  const pos = (row.primary_position ?? "").trim().toUpperCase();
  if (pitchFlag || PITCHER_POSITIONS.has(pos)) return "pitcher";
  return "hitter";
}

export function buildMatchRequestFromEventRow(
  row: EventCsvRow
): { request: Record<string, unknown>; errors: string[] } {
  const errors: string[] = [];

  const primaryPosition = (row.primary_position ?? "").trim();
  if (!primaryPosition) errors.push("primary_position is required");

  const gradYearRaw = parseNumber(row.grad_year);
  if (gradYearRaw === undefined) {
    errors.push("grad_year is required and must be a valid year");
  } else if (gradYearRaw < 2000 || gradYearRaw > 2040) {
    errors.push("grad_year must be between 2000 and 2040");
  }

  const playerType = resolvePlayerType(row);
  const showcase = parseShowcaseFromRow(row);

  let secondary =
    row.secondary_position?.trim() ||
    row.secondaryposition?.trim() ||
    undefined;

  if (
    detectTwoWay(playerType, primaryPosition, secondary, showcase) &&
    !secondary
  ) {
    secondary = "RHP";
  }

  const metrics = buildPositionAwareMetrics(
    showcase,
    playerType,
    primaryPosition,
    secondary
  );

  const feet = parseNumber(row.height_feet);
  const inches = parseNumber(row.height_inches) ?? 0;
  if (feet !== undefined && feet >= 0) {
    const total = Math.round(feet * 12 + inches);
    if (total > 0) metrics.heightInches = total;
  }

  const weight = parseNumber(row.weight);
  if (weight !== undefined && weight > 0) metrics.weightLbs = weight;

  const gpa = parsePositiveNumber(row.gpa);
  const handedness = handednessFromBatThrow(row);
  const hasMetrics = Object.keys(metrics).length > 0;

  const request: Record<string, unknown> = {
    playerType,
    primaryPosition,
    preferredStates: [],
    preferredDivisions: [],
    preferredConferences: [],
  };

  if (gradYearRaw !== undefined) request.gradYear = Math.trunc(gradYearRaw);
  if (secondary) request.secondaryPosition = secondary;
  if (handedness) request.handedness = handedness;
  if (gpa !== undefined) request.gpa = gpa;
  if (hasMetrics) {
    request.metrics = metrics;
    request.verifiedData = true;
  }

  if (!hasMetrics) {
    errors.push("No showcase metrics mapped for this row");
  }

  return { request, errors };
}

export function metricColumnsPresent(headers: string[]): boolean {
  const normalized = new Set(headers.map((h) => h.replace(/_/g, "-")));
  return METRIC_CSV_KEYS.some((k) => normalized.has(k));
}

export function displayNameFromRow(row: EventCsvRow): string {
  const first = row.first_name?.trim();
  const last = row.last_name?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return row.athlete_uuid?.trim() || "Athlete";
}
