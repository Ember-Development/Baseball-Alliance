import type { MatchRowV1 } from "@/types/collegeMatch";
import { normalizeAthleticSubBreakdown } from "@/types/collegeMatch";
import MatchFitBreakdown from "./MatchFitBreakdown";
import {
  MATCH_COPY,
  fitLabelDisplay,
  formatMatchFitValue,
} from "./matchResultsCopy";

type Props = {
  match: MatchRowV1;
};

export default function SchoolMatchDetail({ match }: Props) {
  const fit = fitLabelDisplay(match.fitLabel);
  const athleticSub = normalizeAthleticSubBreakdown(match.athleticFitBreakdown);
  const matchFit = formatMatchFitValue(match.overallScore);

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-[5rem] text-center">
          <span className="text-xl font-bold text-slate-700 tabular-nums leading-none">
            {matchFit}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-tight">
            {MATCH_COPY.school.matchFitLabel}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{fit.label}</span>
          <span className="block text-xs text-slate-500 mt-0.5">
            How well this school matches your stats and preferences
          </span>
        </p>
      </div>

      <MatchFitBreakdown
        scoreBreakdown={match.scoreBreakdown}
        athleticSubBreakdown={athleticSub}
        defaultAthleticOpen
      />

      {match.conferenceTierLabel && (
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700">
            {MATCH_COPY.school.programCompetitiveness}:
          </span>{" "}
          {match.conferenceTierLabel}
        </p>
      )}

      {match.reasons.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Why we matched this school
          </p>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1.5">
            {match.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
