import { Fragment, useEffect, useMemo, useState } from "react";
import { ApiError, apiGet, apiPostJson } from "@/lib/apiClient";
import {
  formatFallbackFitEntry,
  normalizeProgramFiltersResponse,
  type MatchResponseV1,
  type MatchRowV1,
  type ProgramFiltersResponse,
  type ValidationDetails,
} from "@/types/collegeMatch";
import {
  buildMatchBody,
  metricsForPosition,
  countFilledMetrics,
  resolvePositionGroup,
  splitPositionMetrics,
  type MatchFormFields,
} from "./buildMatchBody";
import { MATCH_PRESETS } from "./matchPresets";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
  Ruler,
  Shield,
  SlidersHorizontal,
  Target,
  Wind,
  X,
  Zap,
} from "lucide-react";

/* ── visual helpers ────────────────────────────────────────────── */

function scoreBg(v: number) {
  if (v >= 80) return "bg-emerald-500";
  if (v >= 60) return "bg-blue-500";
  if (v >= 40) return "bg-amber-500";
  return "bg-slate-400";
}

function scoreText(v: number) {
  if (v >= 80) return "text-emerald-700";
  if (v >= 60) return "text-blue-700";
  if (v >= 40) return "text-amber-700";
  return "text-slate-600";
}

function fitBadge(label: string) {
  const l = label.toLowerCase();
  if (l.includes("strong") || l.includes("excellent"))
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (l.includes("good")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (l.includes("fair") || l.includes("moderate"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

/* ── shared classes ────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#163968] focus:ring-1 focus:ring-[#163968]/30 outline-none transition";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

/* ── constants ─────────────────────────────────────────────────── */

const STEPS = ["Player Profile", "Athletic Metrics", "Preferences"];

const POSITIONS_HITTER = [
  "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "OF", "DH", "UTIL",
] as const;

const POSITIONS_PITCHER = [
  "RHP", "LHP", "RP", "CP",
] as const;

const TUITION_OPTIONS = ["low", "moderate", "high"] as const;

const WEIGHT_DESCRIPTIONS: Record<string, string> = {
  athleticFitW: "How closely your metrics match the program's recruiting range",
  locationFitW: "How well the school's location matches your geographic preferences",
  schoolFitW: "How well the school type, size, and culture align with what you want",
  affordabilityFitW: "How much tuition and financial accessibility matter to you",
};

function weightLabel(v: number): { text: string; color: string; badge: string } {
  if (v === 0)
    return {
      text: "Not a factor",
      color: "text-slate-600",
      badge: "bg-slate-200/90 border-slate-300/80",
    };
  if (v <= 0.2)
    return {
      text: "Slightly important",
      color: "text-slate-700",
      badge: "bg-slate-100 border-slate-200",
    };
  if (v <= 0.4)
    return {
      text: "Somewhat important",
      color: "text-blue-700",
      badge: "bg-blue-50 border-blue-200/90",
    };
  if (v <= 0.6)
    return {
      text: "Important",
      color: "text-blue-800",
      badge: "bg-blue-100/90 border-blue-300/80",
    };
  if (v <= 0.8)
    return {
      text: "Very important",
      color: "text-[#0f2d52]",
      badge: "bg-[#163968]/12 border-[#163968]/35",
    };
  return {
    text: "Top priority",
    color: "text-emerald-800",
    badge: "bg-emerald-100/90 border-emerald-300/80",
  };
}

/* ── chip multi-select ─────────────────────────────────────────── */

function ChipSelect({
  label,
  options,
  csv,
  onChange,
}: {
  label: string;
  options: string[];
  csv: string;
  onChange: (csv: string) => void;
}) {
  const selected = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function add(val: string) {
    if (!val || selected.includes(val)) return;
    onChange([...selected, val].join(", "));
  }

  function remove(val: string) {
    onChange(selected.filter((s) => s !== val).join(", "));
  }

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
                onClick={() => remove(s)}
                className="rounded-full p-0.5 hover:bg-[#163968]/20 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <select
        value=""
        onChange={(e) => add(e.target.value)}
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
const DEFAULT_MATCH_LIMIT = 30;
const MAX_MATCH_LIMIT = 200;
const initialForm: MatchFormFields = MATCH_PRESETS[0]!.apply();

/* ── sub-component: single match card ──────────────────────────── */

function MatchCard({ match, rank }: { match: MatchRowV1; rank: number }) {
  const [open, setOpen] = useState(false);
  const score = Math.round(match.overallScore);
  const bd = match.scoreBreakdown;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">#{rank}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${fitBadge(match.fitLabel)}`}
            >
              {match.fitLabel}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-800 truncate">
            {match.schoolName}
          </h4>
          <p className="text-sm text-slate-500 mt-0.5">
            {match.division} &middot; {match.conference} &middot; {match.state}
          </p>
          {match.conferenceTierLabel && (
            <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {match.conferenceTierLabel}
            </span>
          )}
        </div>
        <div className="text-center shrink-0">
          <div className={`text-2xl font-bold ${scoreText(score)}`}>
            {score}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
            Score
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {(
          [
            ["Athletic", bd.athleticFit],
            ["Location", bd.locationFit],
            ["School", bd.schoolFit],
            ["Cost", bd.affordabilityFit],
          ] as const
        ).map(([lbl, val]) => (
          <div key={lbl}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{lbl}</span>
              <span className="font-medium text-slate-700">
                {Math.round(val)}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreBg(val)}`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {match.reasons.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs font-medium text-[#163968] hover:underline"
          >
            {open
              ? "Hide details"
              : `View insights (${match.reasons.length})`}
          </button>
          {open && (
            <ul className="mt-2 text-xs text-slate-600 space-y-1 pl-4 list-disc">
              {match.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── main component ────────────────────────────────────────────── */

export function MatchFixturePanel() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<MatchFormFields>(initialForm);
  const [busy, setBusy] = useState(false);
  const [matchRes, setMatchRes] = useState<MatchResponseV1 | null>(null);
  const [valErr, setValErr] = useState<ValidationDetails | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [matchSearch, setMatchSearch] = useState("");
  const [filters, setFilters] = useState<ProgramFiltersResponse | null>(null);
  const [weightSlidersHelpOpen, setWeightSlidersHelpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await apiGet<Record<string, unknown>>("/api/programs/filters");
        if (!cancelled) setFilters(normalizeProgramFiltersResponse(raw));
      } catch {
        /* filters are optional enhancement — degrade gracefully */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const presets = useMemo(
    () => MATCH_PRESETS.filter((p) => p.id !== "invalid" && p.id !== "minimal"),
    [],
  );

  const filteredMatches = useMemo(() => {
    if (!matchRes?.matches.length) return [];
    const q = matchSearch.trim().toLowerCase();
    if (!q) return matchRes.matches;
    return matchRes.matches.filter((m) =>
      m.schoolName.toLowerCase().includes(q),
    );
  }, [matchRes?.matches, matchSearch]);

  function rankForMatch(m: MatchRowV1): number {
    if (!matchRes) return 0;
    const idx = matchRes.matches.findIndex((x) => x.id === m.id);
    return idx >= 0 ? idx + 1 : 0;
  }

  function patch<K extends keyof MatchFormFields>(
    key: K,
    value: MatchFormFields[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function runMatch(off = 0, limit = DEFAULT_MATCH_LIMIT) {
    setBusy(true);
    setErrMsg(null);
    setValErr(null);
    setMatchSearch("");
    const body = buildMatchBody(form);
    try {
      const data = await apiPostJson<MatchResponseV1>(
        `/api/match?limit=${limit}&offset=${off}`,
        body,
      );
      setMatchRes(data);
    } catch (raw: unknown) {
      if (raw instanceof ApiError) {
        if (raw.status === 400 && raw.body && typeof raw.body === "object") {
          const b = raw.body as {
            details?: ValidationDetails;
            error?: string;
          };
          if (b.details) setValErr(b.details);
          setErrMsg(b.error ?? raw.message);
        } else {
          setErrMsg(raw.message);
        }
      } else {
        setErrMsg(String(raw));
      }
    } finally {
      setBusy(false);
    }
  }

  /* ── render ──────────────────────────────────────────────────── */

  return (
    <div className="space-y-8">
      {/* quick-start presets */}
      {!matchRes && (
        <div className="flex flex-wrap gap-3">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setForm(p.apply())}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-[#163968]/40 hover:bg-[#163968]/5 transition"
            >
              {p.label.replace(/^Full /, "Sample ")}
            </button>
          ))}
        </div>
      )}

      {/* stepper indicators */}
      <div className="flex items-center">
        {STEPS.map((label, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div
                className={`h-px flex-1 mx-2 ${i <= step ? "bg-[#163968]" : "bg-slate-200"}`}
              />
            )}
            <button
              onClick={() => setStep(i)}
              className="flex items-center gap-2 group"
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < step
                    ? "bg-[#163968] text-white"
                    : i === step
                      ? "border-2 border-[#163968] text-[#163968] bg-[#163968]/5"
                      : "border-2 border-slate-300 text-slate-400 group-hover:border-slate-400"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span
                className={`hidden sm:inline text-sm font-medium transition-colors ${
                  i <= step
                    ? "text-[#163968]"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {label}
              </span>
            </button>
          </Fragment>
        ))}
      </div>

      {/* step content card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* ── step 0: player profile ── */}
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-800">
              Player Profile
            </h3>

            <div>
              <span className={labelCls}>Player Type</span>
              <div className="flex gap-2">
                {(["hitter", "pitcher"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => patch("playerType", t)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border-2 transition-all ${
                      form.playerType === t
                        ? "border-[#163968] bg-[#163968] text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary Position</label>
                <select
                  value={form.primaryPosition}
                  onChange={(e) => patch("primaryPosition", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select position</option>
                  {(form.playerType === "pitcher"
                    ? POSITIONS_PITCHER
                    : POSITIONS_HITTER
                  ).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Secondary Position</label>
                <select
                  value={form.secondaryPosition}
                  onChange={(e) => patch("secondaryPosition", e.target.value)}
                  className={inputCls}
                >
                  <option value="">None</option>
                  {[...POSITIONS_HITTER, ...POSITIONS_PITCHER]
                    .filter((p) => p !== form.primaryPosition)
                    .map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Graduation Year</label>
                <input
                  value={form.gradYear}
                  onChange={(e) => patch("gradYear", e.target.value)}
                  placeholder="e.g. 2026"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Handedness (Throw / Bat)</label>
                <select
                  value={form.handedness}
                  onChange={(e) => patch("handedness", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  <option value="R/R">R/R</option>
                  <option value="R/L">R/L</option>
                  <option value="L/L">L/L</option>
                  <option value="L/R">L/R</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>GPA</label>
                <input
                  value={form.gpa}
                  onChange={(e) => patch("gpa", e.target.value)}
                  placeholder="e.g. 3.5"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── step 1: athletic metrics ── */}
        {step === 1 && (() => {
          const posGroup = resolvePositionGroup(form.playerType, form.primaryPosition);
          const defs = metricsForPosition(form.playerType, form.primaryPosition);
          const split = splitPositionMetrics(defs);
          const positionMetrics = [
            ...split.pitching,
            ...split.hitting,
            ...split.athletic,
            ...split.positionDefense,
          ];
          const bodyMetrics = split.physical;
          const filled = countFilledMetrics(form, positionMetrics);
          const total = positionMetrics.length;
          const confidence = filled >= 3 ? "high" : filled >= 1 ? "medium" : "low";

          const confStyle = {
            high: "bg-emerald-100 text-emerald-800 border-emerald-200",
            medium: "bg-amber-100 text-amber-800 border-amber-200",
            low: "bg-slate-100 text-slate-600 border-slate-200",
          }[confidence];

          const confLabel = {
            high: "High confidence",
            medium: "Medium confidence",
            low: "Low confidence",
          }[confidence];

          const posLabel = {
            pitcher: "Pitching",
            catcher: "Catching",
            infield: "Infield",
            outfield: "Outfield",
            unknown: "General",
          }[posGroup];

          const metricSections = [
            {
              key: "pitching",
              title: "Pitching",
              blurb:
                "Velocity and command on the mound — most important for pitchers.",
              icon: <Wind className="h-5 w-5" strokeWidth={2} />,
              items: split.pitching,
            },
            {
              key: "hitting",
              title: "Hitting",
              blurb:
                "Offensive production — barrel speed and exit velocity at the plate.",
              icon: <Target className="h-5 w-5" strokeWidth={2} />,
              items: split.hitting,
            },
            {
              key: "athletic",
              title: "Athletic",
              blurb:
                "Speed and athleticism — how you move on the field (e.g. 60-yard).",
              icon: <Zap className="h-5 w-5" strokeWidth={2} />,
              items: split.athletic,
            },
            {
              key: "position",
              title: "Position & defense",
              blurb:
                "Tools for your spot — arm strength, pop time, and throws for your position.",
              icon: <Shield className="h-5 w-5" strokeWidth={2} />,
              items: split.positionDefense,
            },
          ];

          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Performance metrics
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {form.primaryPosition
                    ? `Sections below match your role (${form.primaryPosition} · ${posLabel}). All fields are optional — more data means better matches.`
                    : "Select a position in Step 1 to see pitching, hitting, athletic, and position-specific fields."}
                </p>
              </div>

              {/* confidence indicator */}
              <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${confStyle}`}>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">{confLabel}</span>
                </div>
                <span className="text-sm">
                  {filled} of {total} skill metrics filled
                </span>
                {filled < 3 && (
                  <span className="text-xs ml-auto opacity-80">
                    Add {3 - filled} more for high-confidence results
                  </span>
                )}
              </div>

              {/* grouped metrics */}
              <div className="space-y-5">
                {metricSections.map(
                  (sec) =>
                    sec.items.length > 0 && (
                      <section
                        key={sec.key}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3 border-b border-slate-200/80 pb-3 mb-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#163968] text-white shadow-sm">
                            {sec.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold uppercase tracking-wide text-[#163968]">
                              {sec.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {sec.blurb}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sec.items.map((d) => (
                            <div key={d.key}>
                              <label className={labelCls}>
                                {d.label}{" "}
                                <span className="font-normal text-slate-400">
                                  ({d.unit})
                                </span>
                              </label>
                              <input
                                value={form[d.key]}
                                onChange={(e) => patch(d.key, e.target.value)}
                                placeholder={d.placeholder}
                                className={inputCls}
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    ),
                )}
              </div>

              {/* physical profile — separate block */}
              {bodyMetrics.length > 0 && (
                <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start gap-3 border-b border-slate-100 pb-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm">
                      <Ruler className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                        Physical profile
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Height and weight — baseline size for context (not a &ldquo;skill&rdquo; metric).
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bodyMetrics.map((d) => (
                      <div key={d.key}>
                        <label className={labelCls}>
                          {d.label}{" "}
                          <span className="font-normal text-slate-400">
                            ({d.unit})
                          </span>
                        </label>
                        <input
                          value={form[d.key]}
                          onChange={(e) => patch(d.key, e.target.value)}
                          placeholder={d.placeholder}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!form.primaryPosition && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Go back to Step 1 and select a position to see the metrics
                    that matter most for your role.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── step 2: preferences ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Preferences
            </h3>

            {/* location */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ChipSelect
                  label="Preferred States"
                  options={filters?.state ?? []}
                  csv={form.preferredStatesCsv}
                  onChange={(v) => patch("preferredStatesCsv", v)}
                />
                <ChipSelect
                  label="Preferred Divisions"
                  options={filters?.division ?? []}
                  csv={form.preferredDivisionsCsv}
                  onChange={(v) => patch("preferredDivisionsCsv", v)}
                />
                <ChipSelect
                  label="Preferred Conferences"
                  options={filters?.conference ?? []}
                  csv={form.preferredConferencesCsv}
                  onChange={(v) => patch("preferredConferencesCsv", v)}
                />
              </div>
            </div>

            {/* school */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                School
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>School Type</label>
                  <select
                    value={form.schoolTypePreference}
                    onChange={(e) =>
                      patch("schoolTypePreference", e.target.value)
                    }
                    className={inputCls}
                  >
                    <option value="">No preference</option>
                    {(filters?.schoolType ?? []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>School Size</label>
                  <select
                    value={form.schoolSizePreference}
                    onChange={(e) =>
                      patch(
                        "schoolSizePreference",
                        e.target.value as MatchFormFields["schoolSizePreference"],
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
                    value={form.tuitionPreference}
                    onChange={(e) =>
                      patch("tuitionPreference", e.target.value)
                    }
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

            {/* priority weights */}
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
                          onClick={() =>
                            setWeightSlidersHelpOpen((open) => !open)
                          }
                          aria-expanded={weightSlidersHelpOpen}
                          aria-controls="weight-sliders-help"
                          title={
                            weightSlidersHelpOpen
                              ? "Hide how sliders work"
                              : "How these sliders work"
                          }
                          className="shrink-0 rounded-full p-1.5 text-[#163968] hover:bg-[#163968]/12 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163968]/40"
                        >
                          <Info className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                          <span className="sr-only">
                            {weightSlidersHelpOpen
                              ? "Hide explanation of how weight sliders work"
                              : "Show explanation of how weight sliders work"}
                          </span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                        These sliders control{" "}
                        <span className="font-semibold text-slate-800">
                          how we balance the four factors
                        </span>{" "}
                        when scoring and ranking schools—not minimum requirements,
                        but <span className="font-medium">relative importance</span>.
                        Tap the{" "}
                        <span className="inline-flex align-middle mx-0.5 text-[#163968]">
                          <Info className="h-3.5 w-3.5 inline" aria-hidden />
                        </span>{" "}
                        icon for details on 0–1 weights and the live badges.
                      </p>
                      {weightSlidersHelpOpen && (
                        <div
                          id="weight-sliders-help"
                          role="region"
                          aria-label="How weight sliders work"
                          className="mt-3 flex gap-2 rounded-xl bg-white/90 border border-slate-200/90 px-3 py-2.5 shadow-sm animate-in fade-in duration-150"
                        >
                          <Info
                            className="h-4 w-4 text-[#163968] shrink-0 mt-0.5"
                            aria-hidden
                          />
                          <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-none">
                            <li className="flex gap-2">
                              <span className="font-semibold text-slate-700 shrink-0">
                                0 → 1:
                              </span>
                              <span>
                                Left is &ldquo;don&rsquo;t use this much&rdquo;; right is
                                &ldquo;stress this heavily.&rdquo; Numbers are weights, not
                                percentages—they don&rsquo;t need to add to 100%.
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="font-semibold text-slate-700 shrink-0">
                                Together:
                              </span>
                              <span>
                                Raising one factor means the matcher will favor it more{" "}
                                <em>relative to the others</em>. Adjust until the mix feels
                                right for you.
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="font-semibold text-slate-700 shrink-0">
                                Live feedback:
                              </span>
                              <span>
                                The colored badge shows plain-English priority (e.g.
                                &ldquo;Important&rdquo;) and updates as you drag.
                              </span>
                            </li>
                          </ul>
                        </div>
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
                const val = Number(form[key]) || 0;
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
                        className={`inline-flex items-center justify-center min-w-[10.5rem] px-3 py-2 rounded-xl border text-base font-bold tracking-tight shadow-sm ${wl.color} ${wl.badge} transition-colors`}
                      >
                        {wl.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {WEIGHT_DESCRIPTIONS[key]}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={val}
                        onChange={(e) => patch(key, e.target.value)}
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
          </div>
        )}
      </div>

      {/* navigation + CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {step < 2 && (
            <button
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => void runMatch(0)}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-[#163968] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1e4a80] disabled:opacity-60 transition shadow-sm"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching&hellip;
              </>
            ) : (
              "Find Matches"
            )}
          </button>
        </div>
      </div>

      {/* errors */}
      {errMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{errMsg}</p>
            {valErr && valErr.fieldErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-700 list-disc pl-4 space-y-1">
                {valErr.fieldErrors.map((fe, i) => (
                  <li key={i}>
                    <span className="font-medium">{fe.path.join(".")}</span>:{" "}
                    {fe.messages.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* empty eval */}
      {matchRes && matchRes.totalEvaluated === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            No programs available to evaluate. The program database may not be
            set up yet.
          </p>
        </div>
      )}

      {/* no matches in range */}
      {matchRes &&
        matchRes.totalEvaluated > 0 &&
        matchRes.matches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              No matches found in this range. Try adjusting your profile or
              preferences.
            </p>
          </div>
        )}

      {/* results */}
      {matchRes && matchRes.matches.length > 0 && (
        <div className="space-y-6">
          {/* athlete profile summary (enriched response) */}
          {matchRes.athleteProfile && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">
                  Your Athlete Profile
                </h3>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    matchRes.athleteProfile.confidence === "high"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : matchRes.athleteProfile.confidence === "medium"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {matchRes.athleteProfile.confidence} confidence
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {matchRes.athleteProfile.resolvedLevel != null &&
                  String(matchRes.athleteProfile.resolvedLevel).trim() !== "" && (
                  <span className="rounded-lg bg-[#163968]/10 text-[#163968] px-2.5 py-1 font-semibold">
                    {matchRes.athleteProfile.resolvedLevel}
                  </span>
                )}
                {matchRes.athleteProfile.resolvedTier != null &&
                  !Number.isNaN(Number(matchRes.athleteProfile.resolvedTier)) && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1">
                    Tier {matchRes.athleteProfile.resolvedTier}
                  </span>
                )}
                {matchRes.athleteProfile.positionGroup != null &&
                  String(matchRes.athleteProfile.positionGroup).trim() !== "" && (
                  <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1">
                    {matchRes.athleteProfile.positionGroup}
                  </span>
                )}
                {matchRes.athleteProfile.flags?.leftHandedBoost && (
                  <span className="rounded-lg bg-blue-100 text-blue-700 px-2.5 py-1">LHP Boost</span>
                )}
                {matchRes.athleteProfile.flags?.twoWay && (
                  <span className="rounded-lg bg-purple-100 text-purple-700 px-2.5 py-1">Two-Way</span>
                )}
                {matchRes.athleteProfile.flags?.multiPosition && (
                  <span className="rounded-lg bg-teal-100 text-teal-700 px-2.5 py-1">Multi-Position</span>
                )}
                {matchRes.athleteProfile.flags?.academicTier && (
                  <span className="rounded-lg bg-amber-100 text-amber-700 px-2.5 py-1">
                    Academics: {matchRes.athleteProfile.flags.academicTier}
                  </span>
                )}
              </div>
              {(() => {
                const fallbackLabels = (
                  matchRes.athleteProfile.fallbackFits ?? []
                )
                  .map((f) => formatFallbackFitEntry(f))
                  .filter((s): s is string => s != null && s.length > 0);
                if (fallbackLabels.length === 0) return null;
                return (
                  <p className="text-xs text-slate-500">
                    Also fits: {fallbackLabels.join(", ")}
                  </p>
                );
              })()}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Your Matches
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Showing {matchRes.matches.length} of {matchRes.total} ranked
                  programs from {matchRes.totalEvaluated} evaluated.
                  {matchRes.total > MAX_MATCH_LIMIT &&
                    matchRes.matches.length >= MAX_MATCH_LIMIT && (
                    <span className="block mt-1 text-slate-600">
                      The API returns at most the top {MAX_MATCH_LIMIT} by fit
                      score; your full pool may be larger.
                    </span>
                  )}
                </p>
              </div>
              <label className="w-full sm:max-w-xs shrink-0">
                <span className="sr-only">Filter by school name</span>
                <input
                  type="search"
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                  placeholder="Search school name…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#163968]/50 focus:outline-none focus:ring-2 focus:ring-[#163968]/20"
                />
              </label>
            </div>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-slate-200 bg-slate-50/80">
              <p className="text-sm text-slate-600">
                {matchSearch.trim()
                  ? `No schools match “${matchSearch.trim()}”. Try a shorter search.`
                  : "No matches to display."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  rank={rankForMatch(m)}
                />
              ))}
            </div>
          )}

          {matchRes.matches.length <
            Math.min(matchRes.total, MAX_MATCH_LIMIT) && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void runMatch(
                    0,
                    Math.min(MAX_MATCH_LIMIT, matchRes.total),
                  )
                }
                className="rounded-xl border border-[#163968]/30 bg-[#163968]/5 px-5 py-2.5 text-sm font-semibold text-[#163968] hover:bg-[#163968]/10 disabled:opacity-50 transition"
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </span>
                ) : (
                  `Show all matches (${Math.min(MAX_MATCH_LIMIT, matchRes.total)} schools)`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
