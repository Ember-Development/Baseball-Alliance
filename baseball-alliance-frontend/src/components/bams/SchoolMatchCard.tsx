import { useState } from "react";
import type { MatchRowV1 } from "@/types/collegeMatch";
import MatchScoreBreakdownModal from "./MatchScoreBreakdownModal";
import MatchFitBreakdown from "./MatchFitBreakdown";
import SchoolMatchDetail from "./SchoolMatchDetail";
import {
  MATCH_COPY,
  fitLabelBadgeClass,
  fitLabelDisplay,
} from "./matchResultsCopy";
import {
  type MatchPreferenceContext,
  fitBandHeadline,
  formatLocationLine,
  formatSchoolProfileLine,
  preferenceHitBadges,
  schoolSpecificReasons,
} from "./matchResultsCluster";

type Props = {
  match: MatchRowV1;
  rank?: number;
  preferences: MatchPreferenceContext;
  sharedReasons: Set<string>;
  inCluster?: boolean;
  tiedWithPrevious?: boolean;
};

export default function SchoolMatchCard({
  match,
  rank,
  preferences,
  sharedReasons,
  inCluster = false,
  tiedWithPrevious = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  const fit = fitLabelDisplay(match.fitLabel);
  const headline = fitBandHeadline(match);
  const prefBadges = preferenceHitBadges(match, preferences);
  const profileLine = formatSchoolProfileLine(match);
  const cardReasons = schoolSpecificReasons(match, sharedReasons).slice(0, 2);
  const showScoreSecondary = !inCluster;

  return (
    <>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
        <div className="flex items-start gap-3 min-w-0">
          {rank != null && (
            <span
              className="shrink-0 flex items-center justify-center min-w-[2.25rem] h-9 px-1.5 rounded-lg bg-slate-100 text-base font-bold text-slate-600 tabular-nums leading-none"
              aria-label={`Rank ${rank}`}
            >
              #{rank}
            </span>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {match.schoolName}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {match.division} · {match.conference}
              </p>
              <p className="text-sm text-slate-500">{formatLocationLine(match)}</p>
              {profileLine && (
                <p className="text-xs text-slate-500 mt-0.5">{profileLine}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${fitLabelBadgeClass(fit.tone)}`}
              >
                {fit.label}
              </span>
              {match.conferenceTierLabel && (
                <span className="inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-900 whitespace-nowrap">
                  {match.conferenceTierLabel}
                </span>
              )}
              {prefBadges.map((b) => (
                <span
                  key={b}
                  className="inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800"
                >
                  {b}
                </span>
              ))}
              {tiedWithPrevious && (
                <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                  {MATCH_COPY.school.tieBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#163968]/15 bg-[#163968]/[0.04] px-3 py-2.5">
          <p className="text-lg font-bold text-[#163968] leading-tight">
            {headline.primary}
          </p>
          {showScoreSecondary && (
            <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
              Score {headline.secondary}
            </p>
          )}
        </div>

        {!inCluster && (
          <div className="mt-3">
            <MatchFitBreakdown
              scoreBreakdown={match.scoreBreakdown}
              compact
              variant="bars"
              match={match}
              preferences={preferences}
            />
          </div>
        )}

        {inCluster && (
          <div className="mt-3">
            <MatchFitBreakdown
              scoreBreakdown={match.scoreBreakdown}
              variant="text"
              match={match}
              preferences={preferences}
            />
          </div>
        )}

        {cardReasons.length > 0 && (
          <ul className="mt-3 text-xs text-slate-600 space-y-1 list-none">
            {cardReasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-300 shrink-0">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-semibold text-[#163968] hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Hide details" : MATCH_COPY.school.whyThisMatch}
          </button>
          <button
            type="button"
            onClick={() => setScoreModalOpen(true)}
            className="text-xs font-medium text-slate-500 hover:text-[#163968] hover:underline"
          >
            {MATCH_COPY.school.whyThisNumber}
          </button>
        </div>

        {expanded && (
          <SchoolMatchDetail
            match={match}
            preferences={preferences}
            sharedReasons={sharedReasons}
          />
        )}
      </article>

      <MatchScoreBreakdownModal
        open={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        match={match}
        preferences={preferences}
      />
    </>
  );
}
