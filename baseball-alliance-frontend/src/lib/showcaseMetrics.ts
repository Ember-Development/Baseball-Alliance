/**
 * Showcase event CSV → normalized metrics → BAMS MatchRequestV1.metrics.
 * Raw CSV stats are a separate display layer from API-graded metricAssessment.
 */

export interface ShowcaseMetrics {
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
}

export interface MatchMetrics {
  maxExitVelocity?: number;
  avgExitVelocity?: number;
  sixtyTime?: number;
  infThrowingVelocity?: number;
  ofThrowingVelocity?: number;
  catcherArmVelocity?: number;
  catcherPopTime?: number;
  fastballVelocity?: number;
  topVelocity?: number;
  heightInches?: number;
  weightLbs?: number;
}

export const CSV_COLUMNS = {
  sixtyTime: "60-time",
  shuttle510: "5-10-5-shuttle",
  exitVelocity: "exit-velocity",
  outfieldVelocity: "outfield-velocity",
  infieldVelocity: "infield-velocity",
  catcherVelocity: "catcher-velocity",
  popTime: "pop-time",
  fastballVelocity: "fastball-velocity",
  offspeedVelocity: "offspeed-velocity",
  changeupVelocity: "changeup-velocity",
} as const;

export type ShowcaseStatKey = keyof ShowcaseMetrics;

export const SHOWCASE_STAT_LABELS: Record<ShowcaseStatKey, string> = {
  sixtyTime: "60-yard",
  exitVelocity: "Exit velo",
  shuttle510: "5-10 shuttle",
  infieldVelocity: "IF throw",
  outfieldVelocity: "OF throw",
  catcherVelocity: "Catcher throw",
  popTime: "Pop time",
  fastballVelocity: "Fastball",
  offspeedVelocity: "Offspeed",
  changeupVelocity: "Changeup",
};

/** Graded metricAssessment keys → showcase stat keys (for optional-station labels). */
const GRADED_TO_SHOWCASE: Record<string, ShowcaseStatKey> = {
  EXIT_VELOCITY: "exitVelocity",
  SIXTY_TIME: "sixtyTime",
  ARM_STRENGTH_INF: "infieldVelocity",
  ARM_STRENGTH_OF: "outfieldVelocity",
  CATCHER_POP_TIME: "popTime",
  CATCHER_ARM_VELO: "catcherVelocity",
  PITCHING_VELO_RHP: "fastballVelocity",
  PITCHING_VELO_LHP: "fastballVelocity",
};

export function parseCsvNumber(value: string | undefined): number | undefined {
  if (value == null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseShowcaseCsvRow(
  row: Record<string, string | undefined>
): ShowcaseMetrics {
  return {
    sixtyTime: parseCsvNumber(row[CSV_COLUMNS.sixtyTime]),
    shuttle510: parseCsvNumber(row[CSV_COLUMNS.shuttle510]),
    exitVelocity: parseCsvNumber(row[CSV_COLUMNS.exitVelocity]),
    outfieldVelocity: parseCsvNumber(row[CSV_COLUMNS.outfieldVelocity]),
    infieldVelocity: parseCsvNumber(row[CSV_COLUMNS.infieldVelocity]),
    catcherVelocity: parseCsvNumber(row[CSV_COLUMNS.catcherVelocity]),
    popTime: parseCsvNumber(row[CSV_COLUMNS.popTime]),
    fastballVelocity: parseCsvNumber(row[CSV_COLUMNS.fastballVelocity]),
    offspeedVelocity: parseCsvNumber(row[CSV_COLUMNS.offspeedVelocity]),
    changeupVelocity: parseCsvNumber(row[CSV_COLUMNS.changeupVelocity]),
  };
}

export function countShowcaseStats(showcase: ShowcaseMetrics): number {
  return Object.values(showcase).filter((v) => v != null).length;
}

export type PositionGroup =
  | "CORNER_OF"
  | "CF"
  | "MIDDLE_IF"
  | "CORNER_IF"
  | "C"
  | "RHP"
  | "LHP";

export function normalizePositionGroup(primaryPosition: string): PositionGroup {
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

export function resolveArmVelocity(
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

export function detectTwoWay(
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
  // Require explicit pitcher secondary — showcase circuits test all stations.
  return primaryIsHitter && hasPitchingData && secondaryIsPitcher;
}

export function buildMatchMetrics(
  showcase: ShowcaseMetrics,
  playerType: "pitcher" | "hitter",
  primaryPosition: string,
  _secondaryPosition?: string
): MatchMetrics {
  const group = normalizePositionGroup(primaryPosition);
  const arm = resolveArmVelocity(showcase, group);
  const isPitcher =
    playerType === "pitcher" || group === "RHP" || group === "LHP";
  const isTwoWay = detectTwoWay(
    playerType,
    primaryPosition,
    _secondaryPosition,
    showcase
  );
  const metrics: MatchMetrics = {};

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

export type ShowcaseStatDisplay = {
  key: ShowcaseStatKey;
  label: string;
  value: number;
  annotation?: string;
};

function gradedShowcaseKeys(
  gradedMetricKeys: Iterable<string>
): Set<ShowcaseStatKey> {
  const graded = new Set<ShowcaseStatKey>();
  for (const key of gradedMetricKeys) {
    const normalized = key.trim().toUpperCase().replace(/-/g, "_");
    const showcaseKey = GRADED_TO_SHOWCASE[normalized];
    if (showcaseKey) graded.add(showcaseKey);
  }
  return graded;
}

function optionalStationAnnotation(
  statKey: ShowcaseStatKey,
  primaryPosition: string,
  graded: Set<ShowcaseStatKey>,
  isTwoWay: boolean
): string | undefined {
  if (graded.has(statKey)) return undefined;

  const group = normalizePositionGroup(primaryPosition);

  if (statKey === "infieldVelocity" || statKey === "outfieldVelocity") {
    const primaryArm =
      group === "CORNER_OF" || group === "CF"
        ? "outfieldVelocity"
        : group === "MIDDLE_IF" || group === "CORNER_IF"
          ? "infieldVelocity"
          : null;
    if (primaryArm && statKey !== primaryArm) {
      return "optional station";
    }
    if (!primaryArm && (statKey === "infieldVelocity" || statKey === "outfieldVelocity")) {
      return "optional station";
    }
  }

  if (
    statKey === "fastballVelocity" &&
    !isTwoWay &&
    group !== "RHP" &&
    group !== "LHP"
  ) {
    return `pitching station — not graded for ${primaryPosition.trim() || "your position"} unless two-way`;
  }

  if (
    (statKey === "offspeedVelocity" || statKey === "changeupVelocity") &&
    !isTwoWay &&
    group !== "RHP" &&
    group !== "LHP"
  ) {
    return "pitching station — display only";
  }

  if (statKey === "shuttle510") {
    return "display only — not graded yet";
  }

  return undefined;
}

export function formatShowcaseStatEntries(
  showcase: ShowcaseMetrics,
  options?: {
    primaryPosition?: string;
    gradedMetricKeys?: Iterable<string>;
    playerType?: "pitcher" | "hitter";
    secondaryPosition?: string;
  }
): ShowcaseStatDisplay[] {
  const graded = gradedShowcaseKeys(options?.gradedMetricKeys ?? []);
  const isTwoWay = options?.primaryPosition
    ? detectTwoWay(
        options.playerType ?? "hitter",
        options.primaryPosition,
        options.secondaryPosition,
        showcase
      )
    : false;

  const order: ShowcaseStatKey[] = [
    "sixtyTime",
    "exitVelocity",
    "infieldVelocity",
    "outfieldVelocity",
    "catcherVelocity",
    "popTime",
    "fastballVelocity",
    "offspeedVelocity",
    "changeupVelocity",
    "shuttle510",
  ];

  return order
    .filter((key) => showcase[key] != null)
    .map((key) => ({
      key,
      label: SHOWCASE_STAT_LABELS[key],
      value: showcase[key]!,
      annotation: options?.primaryPosition
        ? optionalStationAnnotation(
            key,
            options.primaryPosition,
            graded,
            isTwoWay
          )
        : undefined,
    }));
}

export function showcaseExplainerCopy(
  showcase: ShowcaseMetrics,
  gradedCount: number,
  primaryPosition: string,
  projectedLevel: string
): string | null {
  const csvCount = countShowcaseStats(showcase);
  if (csvCount <= gradedCount) return null;
  const pos = primaryPosition.trim() || "your position";
  return `Graded stats reflect benchmarks for your primary position (${pos}) at your projected level (${projectedLevel}). Other showcase stats are shown above for context.`;
}
