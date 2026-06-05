import { useMemo, useState } from "react";
import type { AthleteProfile, MatchRowV1 } from "@/types/collegeMatch";
import { normalizeGapMetrics, normalizeMetricAssessment, normalizeMetricAthleticBreakdown } from "@/types/collegeMatch";
import { Check, SlidersHorizontal, TrendingUp, X } from "lucide-react";
import {
  formatGapMetric,
  matchFacetValues,
  metricDisplayName,
} from "./matchResultsUi";
import {
  MATCH_COPY,
  fitLabelDisplay,
  formatMatchFitValue,
} from "./matchResultsCopy";

const MAX_COMPARE = 4;

type Props = {
  matches: MatchRowV1[];
  athleteProfile?: AthleteProfile | null;
};

function MultiChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition ${
                active
                  ? "bg-[#163968] text-white border-[#163968]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#163968]/40"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function compatibilityTextClass(_v: number) {
  return "text-slate-600";
}

export default function MatchComparePanel({ matches, athleteProfile }: Props) {
  const [search, setSearch] = useState("");
  const [divisions, setDivisions] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Set<string>>(new Set());
  const [conferences, setConferences] = useState<Set<string>>(new Set());
  const [minScore, setMinScore] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const divisionOpts = useMemo(
    () => matchFacetValues(matches, "division"),
    [matches]
  );
  const stateOpts = useMemo(() => matchFacetValues(matches, "state"), [matches]);
  const conferenceOpts = useMemo(
    () => matchFacetValues(matches, "conference"),
    [matches]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matches.filter((m) => {
      if (q && !m.schoolName.toLowerCase().includes(q)) return false;
      if (divisions.size > 0 && !divisions.has(m.division)) return false;
      if (states.size > 0 && !states.has(m.state)) return false;
      if (conferences.size > 0 && !conferences.has(m.conference)) return false;
      if (m.overallScore < minScore) return false;
      return true;
    });
  }, [matches, search, divisions, states, conferences, minScore]);

  const selectedMatches = useMemo(
    () =>
      selected
        .map((id) => matches.find((m) => m.id === id))
        .filter((m): m is MatchRowV1 => m != null),
    [selected, matches]
  );

  const comparisonMetrics = useMemo(() => {
    const names = new Set<string>();
    for (const m of selectedMatches) {
      for (const b of normalizeMetricAthleticBreakdown(m.athleticFitBreakdown)) {
        names.add(b.metricName);
      }
    }
    return [...names];
  }, [selectedMatches]);

  const gapMetrics = useMemo(
    () => normalizeGapMetrics(athleteProfile?.gapMetrics),
    [athleteProfile?.gapMetrics]
  );
  const belowBandMetrics = useMemo(() => {
    if (!athleteProfile) return [];
    return normalizeMetricAssessment(athleteProfile.metricAssessment).filter(
      (m) =>
        m.fitBand.toLowerCase().includes("below") ||
        m.fitBand.toLowerCase().includes("floor")
    );
  }, [athleteProfile]);

  function toggleSet(
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function resetFilters() {
    setSearch("");
    setDivisions(new Set());
    setStates(new Set());
    setConferences(new Set());
    setMinScore(0);
  }

  const hasFilters =
    search.trim() !== "" ||
    divisions.size > 0 ||
    states.size > 0 ||
    conferences.size > 0 ||
    minScore > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-[#163968]" />
        <h3 className="text-base font-bold text-slate-800">
          Compare programs & find gaps
        </h3>
      </div>
      <p className="text-sm text-slate-600 -mt-2">
        Filter the full pool of {matches.length} evaluated programs, then select
        up to {MAX_COMPARE} schools to compare side by side and see what to
        improve.
      </p>

      {/* Improvement guidance */}
      {(gapMetrics.length > 0 || belowBandMetrics.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <TrendingUp className="w-4 h-4" />
            What to improve
          </p>
          <ul className="mt-2 space-y-1.5">
            {gapMetrics.map((g, i) => {
              const { label, detail } = formatGapMetric(g);
              return (
                <li key={`gap-${i}`} className="text-sm text-amber-900">
                  <span className="font-medium">{label}:</span> {detail}
                </li>
              );
            })}
            {gapMetrics.length === 0 &&
              belowBandMetrics.map((m, i) => (
                <li key={`band-${i}`} className="text-sm text-amber-900">
                  <span className="font-medium">
                    {metricDisplayName(m.metric)}:
                  </span>{" "}
                  below the competitive band for your projected level
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools…"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Min {MATCH_COPY.school.matchFitShort.toLowerCase()}
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="accent-[#163968]"
            />
            <span className="w-8 font-medium text-slate-800">{minScore}</span>
          </label>
        </div>
        <MultiChips
          label="Division"
          options={divisionOpts}
          selected={divisions}
          onToggle={(v) => toggleSet(setDivisions, v)}
        />
        <MultiChips
          label="Conference"
          options={conferenceOpts}
          selected={conferences}
          onToggle={(v) => toggleSet(setConferences, v)}
        />
        <MultiChips
          label="State"
          options={stateOpts}
          selected={states}
          onToggle={(v) => toggleSet(setStates, v)}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-[#163968] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filtered list */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {filtered.length} program{filtered.length === 1 ? "" : "s"} match
          filters
        </p>
        <div className="rounded-xl border border-slate-200 divide-y max-h-72 overflow-y-auto">
          {filtered.map((m) => {
            const isSelected = selected.includes(m.id);
            const disabled = !isSelected && selected.length >= MAX_COMPARE;
            return (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleSelect(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
                  isSelected ? "bg-[#163968]/5" : "hover:bg-slate-50"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#163968] border-[#163968] text-white"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-800 truncate">
                    {m.schoolName}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {fitLabelDisplay(m.fitLabel).label} · {m.division} ·{" "}
                    {m.state}
                  </span>
                </span>
                <span
                  className="shrink-0 flex flex-col items-center text-center min-w-[2.75rem]"
                  title={MATCH_COPY.school.matchFitLabel}
                >
                  <span className="text-sm font-bold text-slate-700 tabular-nums leading-none">
                    {formatMatchFitValue(m.overallScore)}
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400 leading-none">
                    Fit
                  </span>
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400">
              No programs match these filters.
            </p>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {selectedMatches.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Comparison
            </p>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left font-medium text-slate-500 p-2 w-40"></th>
                {selectedMatches.map((m) => (
                  <th
                    key={m.id}
                    className="text-left font-semibold text-slate-800 p-2 align-bottom min-w-[8rem]"
                  >
                    {m.schoolName}
                    <span className="block text-xs font-normal text-slate-500">
                      {m.division} · {m.state}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label={MATCH_COPY.school.matchFitLabel}
                values={selectedMatches.map((m) =>
                  Number(formatMatchFitValue(m.overallScore))
                )}
                emphasize
              />
              <CompareRow
                label={MATCH_COPY.breakdown.athleticFit.label}
                values={selectedMatches.map((m) =>
                  Math.round(m.scoreBreakdown.athleticFit)
                )}
              />
              <CompareRow
                label={MATCH_COPY.breakdown.locationFit.label}
                values={selectedMatches.map((m) =>
                  Math.round(m.scoreBreakdown.locationFit)
                )}
              />
              <CompareRow
                label={MATCH_COPY.breakdown.schoolFit.label}
                values={selectedMatches.map((m) =>
                  Math.round(m.scoreBreakdown.schoolFit)
                )}
              />
              <CompareRow
                label={MATCH_COPY.breakdown.affordabilityFit.label}
                values={selectedMatches.map((m) =>
                  Math.round(m.scoreBreakdown.affordabilityFit)
                )}
              />
              {comparisonMetrics.map((metricName) => (
                <CompareRow
                  key={metricName}
                  label={metricDisplayName(metricName)}
                  values={selectedMatches.map((m) => {
                    const entry = normalizeMetricAthleticBreakdown(
                      m.athleticFitBreakdown
                    ).find((b) => b.metricName === metricName);
                    return entry ? Math.round(entry.score) : null;
                  })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CompareRow({
  label,
  values,
  emphasize,
}: {
  label: string;
  values: (number | null)[];
  emphasize?: boolean;
}) {
  return (
    <tr className="border-t border-slate-100">
      <td
        className={`p-2 text-slate-600 ${emphasize ? "font-semibold text-slate-800" : ""}`}
      >
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="p-2">
          {v == null ? (
            <span className="text-slate-300">—</span>
          ) : (
            <span
              className={`font-medium ${emphasize ? compatibilityTextClass(v) : "text-slate-700"}`}
            >
              {v}
            </span>
          )}
        </td>
      ))}
    </tr>
  );
}
