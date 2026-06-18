import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AthleticSubBreakdown, MatchRowV1, ScoreBreakdown } from "@/types/collegeMatch";
import { MATCH_COPY } from "./matchResultsCopy";
import {
  type MatchPreferenceContext,
  athleticDimensionLabel,
  affordabilityNeutralInfo,
  locationNeutralInfo,
  schoolNeutralInfo,
} from "./matchResultsCluster";

const DIMENSIONS = [
  {
    key: "athleticFit" as const,
    label: MATCH_COPY.breakdown.athleticFit.label,
    tooltip: MATCH_COPY.breakdown.athleticFit.tooltip,
  },
  {
    key: "locationFit" as const,
    label: MATCH_COPY.breakdown.locationFit.label,
    tooltip: MATCH_COPY.breakdown.locationFit.tooltip,
  },
  {
    key: "schoolFit" as const,
    label: MATCH_COPY.breakdown.schoolFit.label,
    tooltip: MATCH_COPY.breakdown.schoolFit.tooltip,
  },
  {
    key: "affordabilityFit" as const,
    label: MATCH_COPY.breakdown.affordabilityFit.label,
    tooltip: MATCH_COPY.breakdown.affordabilityFit.tooltip,
  },
];

const ATHLETIC_SUB = [
  { key: "levelTierFit" as const, label: MATCH_COPY.breakdown.levelTierFit },
  {
    key: "metricBenchmarkFit" as const,
    label: MATCH_COPY.breakdown.metricBenchmarkFit,
  },
  {
    key: "flagsProjectionFit" as const,
    label: MATCH_COPY.breakdown.flagsProjectionFit,
  },
  { key: "scarcityBoost" as const, label: MATCH_COPY.breakdown.scarcityBoost },
];

function Bar({
  label,
  value,
  tooltip,
  neutralDetail,
}: {
  label: string;
  value: number;
  tooltip?: string;
  neutralDetail?: string;
}) {
  if (neutralDetail) {
    return (
      <div className="text-xs">
        <div className="flex justify-between items-baseline gap-2 mb-0.5">
          <span className="text-slate-600" title={tooltip}>
            {label}
          </span>
          <span className="font-medium text-amber-800">{neutralDetail}</span>
        </div>
      </div>
    );
  }

  const display = Math.round(value);
  return (
    <div>
      <div className="flex justify-between items-baseline gap-2 text-xs mb-1">
        <span className="text-slate-600" title={tooltip}>
          {label}
        </span>
        <span
          className="font-medium text-slate-500 tabular-nums"
          aria-label={`${label}: ${display}`}
        >
          {display}
        </span>
      </div>
      <div
        className="h-2 bg-slate-100 rounded-full overflow-hidden"
        role="meter"
        aria-valuenow={display}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[#163968]/65 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function TextRow({ label, display }: { label: string; display: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-700 text-right">{display}</span>
    </div>
  );
}

type Props = {
  scoreBreakdown: ScoreBreakdown;
  athleticSubBreakdown?: AthleticSubBreakdown | null;
  compact?: boolean;
  defaultAthleticOpen?: boolean;
  variant?: "bars" | "text";
  match?: MatchRowV1;
  preferences?: MatchPreferenceContext;
};

function dimensionDisplay(
  key: (typeof DIMENSIONS)[number]["key"],
  scoreBreakdown: ScoreBreakdown,
  match: MatchRowV1 | undefined,
  preferences: MatchPreferenceContext | undefined,
  variant: "bars" | "text"
): { value: number; display: string; neutralDetail?: string } {
  const score = scoreBreakdown[key];

  if (key === "athleticFit" && match) {
    return { value: score, display: athleticDimensionLabel(match) };
  }

  if (!preferences || !match) {
    return { value: score, display: String(Math.round(score)) };
  }

  if (key === "locationFit") {
    const info = locationNeutralInfo(match, preferences);
    if (info.isNeutral) {
      return {
        value: score,
        display: info.detail ?? "Neutral",
        neutralDetail:
          variant === "bars"
            ? info.detail ?? "Neutral — no preference set"
            : undefined,
      };
    }
  }

  if (key === "schoolFit") {
    const info = schoolNeutralInfo(match, preferences);
    if (info.isNeutral) {
      return {
        value: score,
        display: info.detail ?? "Neutral",
        neutralDetail:
          variant === "bars"
            ? info.detail ?? "Neutral — no preference set"
            : undefined,
      };
    }
  }

  if (key === "affordabilityFit") {
    const info = affordabilityNeutralInfo(preferences, score);
    if (info.isNeutral) {
      return {
        value: score,
        display: info.detail ?? "Neutral",
        neutralDetail:
          variant === "bars"
            ? info.detail ?? "Neutral — no preference set"
            : undefined,
      };
    }
  }

  return { value: score, display: String(Math.round(score)) };
}

export default function MatchFitBreakdown({
  scoreBreakdown,
  athleticSubBreakdown,
  compact = false,
  defaultAthleticOpen = false,
  variant = "bars",
  match,
  preferences,
}: Props) {
  const [athleticOpen, setAthleticOpen] = useState(defaultAthleticOpen);

  if (variant === "text") {
    return (
      <div className="space-y-1.5 rounded-lg bg-slate-50/80 border border-slate-100 px-3 py-2">
        {DIMENSIONS.map(({ key, label }) => {
          const dim = dimensionDisplay(
            key,
            scoreBreakdown,
            match,
            preferences,
            "text"
          );
          return <TextRow key={key} label={label} display={dim.display} />;
        })}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      <div
        className={
          compact
            ? "grid grid-cols-1 gap-2.5"
            : "grid grid-cols-1 sm:grid-cols-2 gap-3"
        }
      >
        {DIMENSIONS.map(({ key, label, tooltip }) => {
          const dim = dimensionDisplay(
            key,
            scoreBreakdown,
            match,
            preferences,
            "bars"
          );
          return (
            <Bar
              key={key}
              label={label}
              value={dim.value}
              tooltip={tooltip}
              neutralDetail={dim.neutralDetail}
            />
          );
        })}
      </div>

      {athleticSubBreakdown && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setAthleticOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 text-xs font-semibold text-[#163968] hover:underline"
            aria-expanded={athleticOpen}
          >
            {MATCH_COPY.breakdown.athleticDetails}
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform ${athleticOpen ? "rotate-180" : ""}`}
            />
          </button>
          {athleticOpen && (
            <div className="mt-2 pl-1 space-y-2 border-l-2 border-slate-100 ml-0.5">
              {ATHLETIC_SUB.map(({ key, label }) => (
                <Bar
                  key={key}
                  label={label}
                  value={athleticSubBreakdown[key]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
