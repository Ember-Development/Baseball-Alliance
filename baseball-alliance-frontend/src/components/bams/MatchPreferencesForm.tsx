import { useEffect, useState } from "react";
import { Info, SlidersHorizontal, X } from "lucide-react";
import { api } from "../../lib/api";
import type { ProgramFiltersResponse } from "@/types/collegeMatch";
import {
  DEFAULT_MATCH_PREFERENCES,
  type MatchPreferences,
  SCHOOL_TYPE_OPTIONS,
  US_STATE_OPTIONS,
  WEIGHT_DESCRIPTIONS,
  weightLabel,
} from "./matchPreferences";

const TUITION_OPTIONS = ["low", "moderate", "high"] as const;

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#163968] focus:ring-1 focus:ring-[#163968]/30 outline-none transition";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

function ChipSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const available = options.filter((o) => !selected.includes(o));

  return (
    <div>
      <span className={labelCls}>{label}</span>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-lg bg-[#163968]/10 text-[#163968] pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {s}
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x !== s))}
                className="rounded-full p-0.5 hover:bg-[#163968]/20 transition"
                aria-label={`Remove ${s}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <select
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v && !selected.includes(v)) onChange([...selected, v]);
        }}
        className={inputCls}
        disabled={available.length === 0}
      >
        <option value="">
          {available.length === 0
            ? selected.length > 0
              ? "All selected"
              : "No options available"
            : `Add ${label.toLowerCase()}…`}
        </option>
        {available.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

type Props = {
  value: MatchPreferences;
  onChange: (next: MatchPreferences) => void;
};

export default function MatchPreferencesForm({ value, onChange }: Props) {
  const [filters, setFilters] = useState<ProgramFiltersResponse | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void api
      .getProgramFilters()
      .then((data) => {
        if (!cancelled) setFilters(data);
      })
      .catch(() => {
        /* optional enhancement */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function patch<K extends keyof MatchPreferences>(
    key: K,
    val: MatchPreferences[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-semibold text-[#163968]">
          Your preferences
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Showcase stats come from your event upload. Set what matters most for
          school fit before running match.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Location
        </h4>
        <ChipSelect
          label="Preferred States"
          options={
            filters?.state?.length
              ? filters.state
              : [...US_STATE_OPTIONS]
          }
          selected={value.preferredStates}
          onChange={(v) => patch("preferredStates", v)}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          School
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>School Type</label>
            <select
              value={value.schoolTypePreference}
              onChange={(e) => patch("schoolTypePreference", e.target.value)}
              className={inputCls}
            >
              <option value="">No preference</option>
              {(filters?.schoolType?.length
                ? filters.schoolType
                : [...SCHOOL_TYPE_OPTIONS]
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>School Size</label>
            <select
              value={value.schoolSizePreference}
              onChange={(e) =>
                patch(
                  "schoolSizePreference",
                  e.target.value as MatchPreferences["schoolSizePreference"]
                )
              }
              className={inputCls}
            >
              <option value="">No preference</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tuition</label>
            <select
              value={value.tuitionPreference}
              onChange={(e) => patch("tuitionPreference", e.target.value)}
              className={inputCls}
            >
              <option value="">No preference</option>
              {TUITION_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[#163968]/20 bg-gradient-to-br from-[#163968]/[0.06] to-slate-50/80 p-4 sm:p-5 shadow-sm">
          <div className="flex gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#163968] text-white shadow-md ring-2 ring-[#163968]/25 ring-offset-2 ring-offset-white"
              aria-hidden
            >
              <SlidersHorizontal className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight pr-1">
                    What matters most to you?
                  </h4>
                  <button
                    type="button"
                    onClick={() => setHelpOpen((o) => !o)}
                    aria-expanded={helpOpen}
                    className="shrink-0 rounded-full p-1.5 text-[#163968] hover:bg-[#163968]/12 transition"
                  >
                    <Info className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    <span className="sr-only">How these sliders work</span>
                  </button>
                </div>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  These sliders control how we balance athletic fit, location,
                  school, and cost when ranking programs — not minimum
                  requirements, but relative importance.
                </p>
                {helpOpen && (
                  <p className="mt-3 text-xs text-slate-600 rounded-xl bg-white/90 border border-slate-200 px-3 py-2.5">
                    0 means don&apos;t weight this factor much; 1 means stress
                    it heavily. Weights don&apos;t need to add to 100%.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {(
          [
            ["athleticFitW", "Athletic Fit"],
            ["locationFitW", "Location Fit"],
            ["schoolFitW", "School Fit"],
            ["affordabilityFitW", "Affordability"],
          ] as const
        ).map(([key, lbl]) => {
          const val = value[key];
          const wl = weightLabel(val);
          return (
            <div
              key={key}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-800">
                  {lbl}
                </span>
                <span
                  className={`inline-flex items-center justify-center min-w-[10.5rem] px-3 py-2 rounded-xl border text-base font-bold tracking-tight shadow-sm ${wl.color} ${wl.badge}`}
                >
                  {wl.text}
                </span>
              </div>
              <p className="text-xs text-slate-500">{WEIGHT_DESCRIPTIONS[key]}</p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={val}
                  onChange={(e) =>
                    patch(key, Number(e.target.value))
                  }
                  className="flex-1 accent-[#163968] h-2"
                />
                <span className="text-base font-mono font-semibold text-slate-700 w-12 text-right tabular-nums">
                  {val.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_MATCH_PREFERENCES })}
        className="text-xs font-medium text-slate-500 hover:text-[#163968] hover:underline"
      >
        Reset preferences to defaults
      </button>
    </div>
  );
}

