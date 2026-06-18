import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AthleteProfile } from "@/types/collegeMatch";
import { formatFallbackFitEntry, normalizeMetricAssessment } from "@/types/collegeMatch";
import type { ShowcaseMetrics } from "@/lib/showcaseMetrics";
import {
  formatShowcaseStatEntries,
  showcaseExplainerCopy,
} from "@/lib/showcaseMetrics";
import {
  buildGradedMetricCompareBullets,
  formatProjectedLevel,
  hasStatBasedLevel,
  metricDisplayName,
  metricFitBandClass,
  metricFitBandLabel,
  sortMetricAssessment,
} from "./matchResultsUi";
import { MATCH_COPY, fitLabelBadgeClass } from "./matchResultsCopy";

function confidenceCopy(
  confidence: AthleteProfile["confidence"],
  verified?: boolean
): string {
  if (confidence === "high") {
    return verified
      ? MATCH_COPY.confidence.highVerified
      : MATCH_COPY.confidence.high;
  }
  if (confidence === "medium") return MATCH_COPY.confidence.medium;
  return MATCH_COPY.confidence.low;
}

function confidenceTone(
  confidence: AthleteProfile["confidence"]
): "positive" | "neutral-positive" | "neutral" {
  if (confidence === "high") return "positive";
  if (confidence === "medium") return "neutral-positive";
  return "neutral";
}

type Props = {
  athleteProfile: AthleteProfile;
  showcaseMetrics?: ShowcaseMetrics | null;
  primaryPosition?: string;
  secondaryPosition?: string;
  playerType?: "pitcher" | "hitter";
  /** When false, showcase stats render only in the parent athlete header. */
  showShowcaseHeader?: boolean;
};

function athleteFlags(ap: AthleteProfile): string[] {
  const flags: string[] = [];
  const f = ap.flags;
  if (f?.verifiedData) flags.push(MATCH_COPY.athlete.verifiedBadge);
  if (f?.twoWay) flags.push("Two-way player");
  if (f?.multiPosition) flags.push("Multi-position");
  if (f?.leftHandedBoost) flags.push("Left-handed boost");
  if (f?.academicTier) {
    flags.push(`Academic tier: ${f.academicTier}`);
  }
  return flags;
}

export default function AthleteProjectionCard({
  athleteProfile: ap,
  showcaseMetrics,
  primaryPosition,
  secondaryPosition,
  playerType = "hitter",
  showShowcaseHeader = true,
}: Props) {
  const [metricsOpen, setMetricsOpen] = useState(false);
  const projected = formatProjectedLevel(ap.resolvedLevel, ap.resolvedTier);
  const statBased = hasStatBasedLevel(ap);
  const metrics = sortMetricAssessment(ap.metricAssessment);
  const gradedMetricKeys = useMemo(
    () => normalizeMetricAssessment(ap.metricAssessment).map((m) => m.metric),
    [ap.metricAssessment]
  );
  const showcaseEntries = useMemo(
    () =>
      showcaseMetrics
        ? formatShowcaseStatEntries(showcaseMetrics, {
            primaryPosition,
            gradedMetricKeys,
            playerType,
            secondaryPosition,
          })
        : [],
    [
      showcaseMetrics,
      primaryPosition,
      gradedMetricKeys,
      playerType,
      secondaryPosition,
    ]
  );
  const gradedCompareBullets = useMemo(
    () => buildGradedMetricCompareBullets(ap),
    [ap]
  );
  const layerCExplainer = useMemo(() => {
    if (!showcaseMetrics || !projected) return null;
    return showcaseExplainerCopy(
      showcaseMetrics,
      metrics.length,
      primaryPosition ?? "",
      projected
    );
  }, [showcaseMetrics, metrics.length, primaryPosition, projected]);
  const fallbackChips = (ap.fallbackFits ?? [])
    .map((f) => formatFallbackFitEntry(f))
    .filter((s): s is string => Boolean(s));
  const profileFlags = athleteFlags(ap);

  if (!statBased) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
        <h3 className="text-base font-bold text-amber-950">
          {MATCH_COPY.athlete.lowConfidenceTitle}
        </h3>
        <p className="text-sm text-amber-900/90 leading-relaxed">
          {MATCH_COPY.athlete.lowConfidenceBody}
        </p>
        {showcaseEntries.length > 0 && showShowcaseHeader && (
          <ShowcaseStatsBlock entries={showcaseEntries} />
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-[#163968]/20 bg-gradient-to-br from-[#163968]/[0.07] to-white p-5 sm:p-6 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#163968]">
          {MATCH_COPY.athlete.headline}
        </p>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#163968] tracking-tight">
          {projected}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`text-xs font-semibold rounded-full border px-3 py-1.5 ${fitLabelBadgeClass(confidenceTone(ap.confidence))}`}
        >
          {confidenceCopy(ap.confidence, ap.flags?.verifiedData)}
        </span>
        {profileFlags
          .filter((f) => f !== MATCH_COPY.athlete.verifiedBadge)
          .map((flag) => (
            <span
              key={flag}
              className="text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-700 px-3 py-1.5"
            >
              {flag}
            </span>
          ))}
      </div>

      {fallbackChips.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">
            {MATCH_COPY.athlete.alsoWithinRange}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fallbackChips.map((chip) => (
              <span
                key={chip}
                className="text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 px-2.5 py-1"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {showcaseEntries.length > 0 && showShowcaseHeader && (
        <ShowcaseStatsBlock entries={showcaseEntries} />
      )}

      {layerCExplainer && (
        <p className="text-sm text-slate-600 leading-relaxed rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
          {layerCExplainer}
        </p>
      )}

      <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
        {MATCH_COPY.athlete.explainer}
      </p>

      {gradedCompareBullets.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {MATCH_COPY.athlete.benchmarkHeadline}
          </p>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
            {gradedCompareBullets.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {metrics.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white/80">
          <button
            type="button"
            onClick={() => setMetricsOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700"
            aria-expanded={metricsOpen}
          >
            Metric breakdown
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${metricsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {metricsOpen && (
            <div className="border-t border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-3 py-2 font-semibold">Stat</th>
                    <th className="px-3 py-2 font-semibold">Value</th>
                    <th className="px-3 py-2 font-semibold">Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.map((m) => (
                    <tr key={m.metric}>
                      <td className="px-3 py-2 text-slate-800">
                        {metricDisplayName(m.metric)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{m.value}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${metricFitBandClass(m.fitBand)}`}
                        >
                          {metricFitBandLabel(m.fitBand)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ShowcaseStatsBlock({
  entries,
}: {
  entries: ReturnType<typeof formatShowcaseStatEntries>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Showcase metrics (from export)
      </p>
      <div className="flex flex-wrap gap-2">
        {entries.map((m) => (
          <span
            key={m.key}
            className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
            title={m.annotation}
          >
            {m.label}: <strong>{m.value}</strong>
            {m.annotation && (
              <span className="text-slate-500 font-normal ml-1">
                ({m.annotation})
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MatchLegalFooter() {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 text-center">
        Important
      </p>
      <p className="text-sm sm:text-base leading-relaxed text-slate-700 text-center max-w-3xl mx-auto">
        {MATCH_COPY.footer}
      </p>
    </div>
  );
}
