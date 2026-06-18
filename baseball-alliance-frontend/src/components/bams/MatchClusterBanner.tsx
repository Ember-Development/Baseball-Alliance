import type { ScoreBreakdown } from "@/types/collegeMatch";
import { MATCH_COPY } from "./matchResultsCopy";
import {
  type MatchPreferenceContext,
  athleticDimensionLabel,
  affordabilityNeutralInfo,
  locationNeutralInfo,
  schoolNeutralInfo,
} from "./matchResultsCluster";
import type { MatchRowV1 } from "@/types/collegeMatch";

type Props = {
  scoreBreakdown: ScoreBreakdown;
  sampleMatch: MatchRowV1;
  preferences: MatchPreferenceContext;
};

export default function MatchClusterBanner({
  scoreBreakdown,
  sampleMatch,
  preferences,
}: Props) {
  const location = locationNeutralInfo(sampleMatch, preferences);
  const school = schoolNeutralInfo(sampleMatch, preferences);
  const affordability = affordabilityNeutralInfo(
    preferences,
    scoreBreakdown.affordabilityFit
  );

  const dimensions = [
    {
      label: MATCH_COPY.breakdown.athleticFit.label,
      display: athleticDimensionLabel(sampleMatch),
    },
    {
      label: MATCH_COPY.breakdown.locationFit.label,
      display: location.isNeutral
        ? location.detail ?? "Neutral"
        : String(Math.round(scoreBreakdown.locationFit)),
    },
    {
      label: MATCH_COPY.breakdown.schoolFit.label,
      display: school.isNeutral
        ? school.detail ?? "Neutral"
        : String(Math.round(scoreBreakdown.schoolFit)),
    },
    {
      label: MATCH_COPY.breakdown.affordabilityFit.label,
      display: affordability.isNeutral
        ? affordability.detail ?? "Neutral"
        : String(Math.round(scoreBreakdown.affordabilityFit)),
    },
  ];

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-sm font-bold text-sky-950">
        {MATCH_COPY.cluster.bannerTitle}
      </p>
      <p className="mt-1 text-sm text-sky-900/90 leading-relaxed">
        {MATCH_COPY.cluster.bannerBody}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {dimensions.map((d) => (
          <span
            key={d.label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/80 bg-white/70 px-2.5 py-1 text-xs text-slate-700"
          >
            <span className="font-semibold text-slate-800">{d.label}:</span>
            {d.display}
          </span>
        ))}
      </div>
    </div>
  );
}
