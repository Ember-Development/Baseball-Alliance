import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { MatchRowV1 } from "@/types/collegeMatch";
import { normalizeAthleticSubBreakdown } from "@/types/collegeMatch";
import ModalPortal, { BAMS_MODAL_Z } from "./ModalPortal";
import { MATCH_COPY, fitLabelDisplay, formatMatchFitValue } from "./matchResultsCopy";
import {
  type MatchPreferenceContext,
  athleticDimensionLabel,
  affordabilityNeutralInfo,
  fitBandHeadline,
  locationNeutralInfo,
  schoolNeutralInfo,
} from "./matchResultsCluster";

type Props = {
  open: boolean;
  onClose: () => void;
  match: MatchRowV1;
  preferences: MatchPreferenceContext;
};

export default function MatchScoreBreakdownModal({
  open,
  onClose,
  match,
  preferences,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sb = match.scoreBreakdown;
  const fit = fitLabelDisplay(match.fitLabel);
  const headline = fitBandHeadline(match);
  const athleticSub = normalizeAthleticSubBreakdown(match.athleticFitBreakdown);
  const location = locationNeutralInfo(match, preferences);
  const school = schoolNeutralInfo(match, preferences);
  const affordability = affordabilityNeutralInfo(
    preferences,
    sb.affordabilityFit
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rows: {
    label: string;
    score: number;
    neutral: DimensionNeutralInfo;
    explanation: string;
  }[] = [
    {
      label: MATCH_COPY.breakdown.athleticFit.label,
      score: sb.athleticFit,
      neutral: { isNeutral: false, label: athleticDimensionLabel(match) },
      explanation: match.conferenceTierLabel
        ? `Your metrics vs ${match.conferenceTierLabel} benchmarks. Same athletic score for all schools in this tier.`
        : "How your showcase metrics align with this program's conference level.",
    },
    {
      label: MATCH_COPY.breakdown.locationFit.label,
      score: sb.locationFit,
      neutral: location,
      explanation: location.detail ?? "Based on your state preferences.",
    },
    {
      label: MATCH_COPY.breakdown.schoolFit.label,
      score: sb.schoolFit,
      neutral: school,
      explanation: school.detail ?? "Based on division, conference, and school preferences.",
    },
    {
      label: MATCH_COPY.breakdown.affordabilityFit.label,
      score: sb.affordabilityFit,
      neutral: affordability,
      explanation: affordability.detail ?? "Based on your tuition preference.",
    },
  ];

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 ${BAMS_MODAL_Z} flex items-end sm:items-center justify-center p-0 sm:p-4`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-breakdown-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40"
          aria-label="Close"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-200"
        >
          <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
            <h2
              id="score-breakdown-title"
              className="text-lg font-bold text-slate-900"
            >
              {MATCH_COPY.school.whyThisNumber}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-5">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="font-semibold text-slate-900">{match.schoolName}</p>
              <p className="mt-1 text-sm text-slate-600">{fit.label}</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-xl font-bold text-[#163968]">
                  {headline.primary}
                </span>
                <span className="text-sm text-slate-500 tabular-nums">
                  Overall {formatMatchFitValue(match.overallScore)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {row.label} ({Math.round(row.score)})
                    </span>
                    {row.neutral.isNeutral && (
                      <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        {row.neutral.detail ?? "Neutral"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {row.explanation}
                  </p>
                </div>
              ))}
            </div>

            {athleticSub && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">
                  {MATCH_COPY.breakdown.athleticDetails}
                </p>
                <p>
                  Level & conference: {Math.round(athleticSub.levelTierFit)} ·
                  Metrics: {Math.round(athleticSub.metricBenchmarkFit)} · Profile:{" "}
                  {Math.round(athleticSub.flagsProjectionFit)}
                </p>
              </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-800">Ranking note: </span>
              {MATCH_COPY.explainer.rankingNote}
            </p>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

type DimensionNeutralInfo = {
  isNeutral: boolean;
  label: string;
  detail?: string;
};
