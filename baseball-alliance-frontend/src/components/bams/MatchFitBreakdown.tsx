import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AthleticSubBreakdown, ScoreBreakdown } from "@/types/collegeMatch";
import { MATCH_COPY } from "./matchResultsCopy";

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
}: {
  label: string;
  value: number;
  tooltip?: string;
}) {
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

type Props = {
  scoreBreakdown: ScoreBreakdown;
  athleticSubBreakdown?: AthleticSubBreakdown | null;
  compact?: boolean;
  defaultAthleticOpen?: boolean;
};

export default function MatchFitBreakdown({
  scoreBreakdown,
  athleticSubBreakdown,
  compact = false,
  defaultAthleticOpen = false,
}: Props) {
  const [athleticOpen, setAthleticOpen] = useState(defaultAthleticOpen);

  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      <div
        className={
          compact
            ? "grid grid-cols-1 gap-2.5"
            : "grid grid-cols-1 sm:grid-cols-2 gap-3"
        }
      >
        {DIMENSIONS.map(({ key, label, tooltip }) => (
          <Bar
            key={key}
            label={label}
            value={scoreBreakdown[key]}
            tooltip={tooltip}
          />
        ))}
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
