import type { MatchRowV1 } from "@/types/collegeMatch";
import { normalizeAthleticSubBreakdown } from "@/types/collegeMatch";
import MatchFitBreakdown from "./MatchFitBreakdown";
import {
  MATCH_COPY,
  fitLabelDisplay,
  formatMatchFitValue,
} from "./matchResultsCopy";
import {
  type MatchPreferenceContext,
  formatLocationLine,
  formatSchoolProfileLine,
  preferenceHitBadges,
  schoolSpecificReasons,
} from "./matchResultsCluster";

type Props = {
  match: MatchRowV1;
  preferences: MatchPreferenceContext;
  sharedReasons: Set<string>;
};

export default function SchoolMatchDetail({
  match,
  preferences,
  sharedReasons,
}: Props) {
  const fit = fitLabelDisplay(match.fitLabel);
  const athleticSub = normalizeAthleticSubBreakdown(match.athleticFitBreakdown);
  const reasons = schoolSpecificReasons(match, sharedReasons);
  const prefBadges = preferenceHitBadges(match, preferences);
  const profileLine = formatSchoolProfileLine(match);

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          {MATCH_COPY.school.schoolIdentity}
        </p>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>{formatLocationLine(match)}</li>
          <li>
            {[match.division, match.conference, match.state]
              .filter(Boolean)
              .join(" · ")}
          </li>
          {profileLine && <li>{profileLine}</li>}
        </ul>
      </div>

      {prefBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prefBadges.map((b) => (
            <span
              key={b}
              className="text-[10px] font-semibold uppercase tracking-wide rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-2 py-0.5"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{fit.label}</span>
          {match.conferenceTierLabel && (
            <span className="block text-xs text-slate-500 mt-0.5">
              {MATCH_COPY.school.programCompetitiveness}:{" "}
              {match.conferenceTierLabel}
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500 tabular-nums">
          Overall {formatMatchFitValue(match.overallScore)}
        </p>
      </div>

      <MatchFitBreakdown
        scoreBreakdown={match.scoreBreakdown}
        athleticSubBreakdown={athleticSub}
        match={match}
        preferences={preferences}
      />

      {reasons.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {MATCH_COPY.school.topReasonsPrefix}
          </p>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1.5">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
