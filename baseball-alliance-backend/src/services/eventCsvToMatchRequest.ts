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

  const metrics: Record<string, number> = {};

  const sixty = parseNumber(row["60-time"]);
  if (sixty !== undefined) metrics.sixtyTime = sixty;

  const exitVel = parseNumber(row["exit-velocity"]);
  if (exitVel !== undefined) {
    metrics.maxExitVelocity = exitVel;
  }

  const infVel = parseNumber(row["infield-velocity"]);
  if (infVel !== undefined) metrics.infThrowingVelocity = infVel;

  const ofVel = parseNumber(row["outfield-velocity"]);
  if (ofVel !== undefined) metrics.ofThrowingVelocity = ofVel;

  const pop = parseNumber(row["pop-time"]);
  if (pop !== undefined) metrics.catcherPopTime = pop;

  const catchVel = parseNumber(row["catcher-velocity"]);
  if (catchVel !== undefined) metrics.catcherArmVelocity = catchVel;

  const fb = parseNumber(row["fastball-velocity"]);
  if (fb !== undefined) {
    metrics.fastballVelocity = fb;
    metrics.topVelocity = fb;
  }

  const feet = parseNumber(row.height_feet);
  const inches = parseNumber(row.height_inches) ?? 0;
  if (feet !== undefined && feet >= 0) {
    const total = Math.round(feet * 12 + inches);
    if (total > 0) metrics.heightInches = total;
  }

  const weight = parseNumber(row.weight);
  if (weight !== undefined && weight > 0) metrics.weightLbs = weight;

  const gpa = parsePositiveNumber(row.gpa);

  const secondary =
    row.secondary_position?.trim() ||
    row.secondaryposition?.trim() ||
    undefined;

  const handedness = handednessFromBatThrow(row);

  const hasMetrics = Object.keys(metrics).length > 0;

  const request: Record<string, unknown> = {
    playerType: resolvePlayerType(row),
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
