import { useState } from "react";
import type { MatchRowV1 } from "@/types/collegeMatch";
import MatchFitExplainer from "./MatchFitExplainer";
import MatchFitBreakdown from "./MatchFitBreakdown";
import SchoolMatchDetail from "./SchoolMatchDetail";
import {
  MATCH_COPY,
  fitLabelBadgeClass,
  fitLabelDisplay,
  formatMatchFitValue,
} from "./matchResultsCopy";

type Props = {
  match: MatchRowV1;
  rank?: number;
};

export default function SchoolMatchCard({ match, rank }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);

  const fit = fitLabelDisplay(match.fitLabel);
  const matchFit = formatMatchFitValue(match.overallScore);
  const topReasons = match.reasons.slice(0, 2);

  return (
    <>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 min-w-0">
              {rank != null && (
                <span
                  className="shrink-0 flex items-center justify-center min-w-[2.25rem] h-9 px-1.5 rounded-lg bg-slate-100 text-base font-bold text-slate-600 tabular-nums leading-none"
                  aria-label={`Rank ${rank}`}
                >
                  #{rank}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 leading-snug truncate">
                  {match.schoolName}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {match.division} · {match.conference} · {match.state}
                </p>
              </div>
            </div>
          </div>

          <div
            className="shrink-0 flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 min-w-[5rem] text-center"
            title={MATCH_COPY.school.matchFitLabel}
          >
            <span
              className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${fitLabelBadgeClass(fit.tone)}`}
            >
              {fit.label}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-700 tabular-nums leading-none">
                {matchFit}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-none">
                {MATCH_COPY.school.matchFitShort}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <MatchFitBreakdown
            scoreBreakdown={match.scoreBreakdown}
            compact
          />
        </div>

        {topReasons.length > 0 && (
          <ul className="mt-3 text-xs text-slate-600 space-y-1 list-none">
            {topReasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-300 shrink-0">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-semibold text-[#163968] hover:underline"
            aria-expanded={expanded}
          >
            {expanded
              ? "Hide details"
              : MATCH_COPY.school.whyThisMatch}
          </button>
          <button
            type="button"
            onClick={() => setExplainerOpen(true)}
            className="text-xs font-medium text-slate-500 hover:text-[#163968] hover:underline"
          >
            {MATCH_COPY.explainer.triggerSchool}
          </button>
        </div>

        {expanded && <SchoolMatchDetail match={match} />}
      </article>

      <MatchFitExplainer
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        schoolName={match.schoolName}
        matchFit={matchFit}
        fitLabel={fit.label}
      />
    </>
  );
}
