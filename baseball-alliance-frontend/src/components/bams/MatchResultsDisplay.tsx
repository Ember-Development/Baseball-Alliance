import { useMemo, useState } from "react";
import type { MatchResponseV1 } from "@/types/collegeMatch";
import { AlertCircle, BookmarkPlus, Check, Info, Loader2 } from "lucide-react";
import AthleteProjectionCard, { MatchLegalFooter } from "./AthleteProjectionCard";
import SchoolMatchCard from "./SchoolMatchCard";
import MatchComparePanel from "./MatchComparePanel";
import MatchFitExplainer, {
  MatchFitExplainerTrigger,
} from "./MatchFitExplainer";
import { MATCH_COPY } from "./matchResultsCopy";
import { TOP_MATCH_LIMIT, hasStatBasedLevel } from "./matchResultsUi";

type Props = {
  matchRes: MatchResponseV1 | null;
  error?: string | null;
  /** When true, show note that preferences changed the ranking. */
  preferencesUpdated?: boolean;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
  saved?: boolean;
};

export default function MatchResultsDisplay({
  matchRes,
  error,
  preferencesUpdated,
  onSave,
  saving,
  saved,
}: Props) {
  const [search, setSearch] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);

  const allMatches = matchRes?.matches ?? [];

  const topMatches = useMemo(
    () => allMatches.slice(0, TOP_MATCH_LIMIT),
    [allMatches]
  );

  const filteredTop = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topMatches;
    return topMatches.filter((m) => m.schoolName.toLowerCase().includes(q));
  }, [topMatches, search]);

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!matchRes) return null;

  const ap = matchRes.athleteProfile;
  const showSummary = ap != null || allMatches.length > 0;
  const hasMorePrograms = allMatches.length > TOP_MATCH_LIMIT;
  const topScore = allMatches[0]?.overallScore ?? 0;
  const showTargetNote =
    allMatches.length > 0 && topScore < 75 && hasStatBasedLevel(ap);

  return (
    <div className="space-y-6">
      {showSummary && (
        <AthleteProjectionCard athleteProfile={ap ?? { confidence: "low" }} />
      )}

      {preferencesUpdated && (
        <p className="flex items-start gap-2 text-sm text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          {MATCH_COPY.results.preferencesUpdated}
        </p>
      )}

      {allMatches.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">
                {MATCH_COPY.results.heading(
                  Math.min(TOP_MATCH_LIMIT, allMatches.length)
                )}
              </h3>
              <p className="text-sm text-slate-600">
                {MATCH_COPY.results.subheading(matchRes.total)}
              </p>
              <MatchFitExplainerTrigger onClick={() => setExplainerOpen(true)} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={MATCH_COPY.results.filterPlaceholder}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-full sm:w-48"
              />
              {onSave && (
                <button
                  type="button"
                  onClick={() => void onSave()}
                  disabled={saving || saved}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#163968] text-white font-semibold px-4 py-2 text-sm whitespace-nowrap disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4" />
                  )}
                  {saved ? "Saved" : "Save to profile"}
                </button>
              )}
            </div>
          </div>

          {showTargetNote && (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              {MATCH_COPY.results.targetRangeNote}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTop.map((m, i) => (
              <SchoolMatchCard key={m.id} match={m} rank={i + 1} />
            ))}
          </div>

          {hasMorePrograms && (
            <button
              type="button"
              onClick={() => setShowCompare((v) => !v)}
              className="text-sm font-medium text-[#163968] hover:underline"
            >
              {MATCH_COPY.results.compareToggle(allMatches.length, showCompare)}
            </button>
          )}

          {(showCompare || !hasMorePrograms) && allMatches.length > 1 && (
            <MatchComparePanel matches={allMatches} athleteProfile={ap} />
          )}
        </>
      )}

      {allMatches.length === 0 && matchRes.totalEvaluated > 0 && (
        <p className="text-sm text-slate-500 text-center py-8">
          {MATCH_COPY.results.noMatches}
        </p>
      )}

      {(showSummary || hasStatBasedLevel(ap)) && <MatchLegalFooter />}

      <MatchFitExplainer
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
      />
    </div>
  );
}
