import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, apiGet } from "@/lib/apiClient";
import {
  normalizeProgramFiltersResponse,
  type CollegeProgram,
  type ProgramFiltersResponse,
  type ProgramsListResponse,
} from "@/types/collegeMatch";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Building2,
  MapPin,
  AlertCircle,
  GraduationCap,
  DollarSign,
  Users,
  BookOpen,
  ExternalLink,
  Globe,
} from "lucide-react";

/* ── detail field component ───────────────────────────────────── */

function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ── filter key helpers ───────────────────────────────────────── */

const FILTER_KEYS = [
  "page",
  "limit",
  "search",
  "division",
  "conference",
  "state",
  "schoolType",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

/* ── pagination helper ────────────────────────────────────────── */

function pageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

/* ── shared classes ───────────────────────────────────────────── */

const selectCls =
  "rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2.5 text-sm text-slate-700 focus:border-[#163968] focus:ring-1 focus:ring-[#163968]/30 outline-none transition appearance-none";

/* ── main component ───────────────────────────────────────────── */

export function ProgramsExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProgramFiltersResponse | null>(null);
  const [list, setList] = useState<ProgramsListResponse | null>(null);
  const [detail, setDetail] = useState<CollegeProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* default page / limit */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if (!next.get("page")) {
      next.set("page", "1");
      changed = true;
    }
    if (!next.get("limit")) {
      next.set("limit", "12");
      changed = true;
    }
    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const divisionFilter = searchParams.get("division") ?? "";

  /* load filter options — conferences/states/school types narrow when division is set */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = divisionFilter
          ? `?division=${encodeURIComponent(divisionFilter)}`
          : "";
        const raw = await apiGet<Record<string, unknown>>(
          `/api/programs/filters${qs}`,
        );
        if (!cancelled)
          setFilters(normalizeProgramFiltersResponse(raw));
      } catch {
        if (!cancelled) setFilters(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [divisionFilter]);

  /* Drop conference from URL if it is not valid for the current division filter */
  useEffect(() => {
    if (!filters) return;
    const c = searchParams.get("conference") ?? "";
    if (c && filters.conference.length > 0 && !filters.conference.includes(c)) {
      const next = new URLSearchParams(searchParams);
      next.delete("conference");
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  /* load program list */
  const loadList = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const qs = searchParams.toString();
    try {
      const path = qs
        ? `/api/programs?${qs}`
        : "/api/programs?page=1&limit=12";
      const data = await apiGet<ProgramsListResponse>(path);
      setList(data);
    } catch (e) {
      setList(null);
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  /* param helpers */
  function field(key: FilterKey): string {
    return searchParams.get(key) ?? "";
  }

  function setField(key: FilterKey, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    /* Changing division invalidates conference options — clear selection */
    if (key === "division" && value.trim()) next.delete("conference");
    setSearchParams(next);
  }

  function goPage(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  }

  function openDetail(id: string) {
    const row = list?.data.find((p) => p.id === id);
    if (row) setDetail(row);
  }

  const emptyDb =
    list &&
    list.total === 0 &&
    !field("search") &&
    !field("division") &&
    !field("state");

  const noResults =
    list &&
    list.total === 0 &&
    (!!field("search") || !!field("division") || !!field("state"));

  /* ── render ─────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          value={field("search")}
          onChange={(e) => setField("search", e.target.value)}
          placeholder="Search schools, cities, conferences…"
          className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#163968] focus:ring-2 focus:ring-[#163968]/20 outline-none transition shadow-sm"
        />
      </div>

      {/* filter row */}
      <div className="flex flex-wrap gap-3">
        {([
          { key: "division" as FilterKey, label: "Division", opts: filters?.division },
          { key: "conference" as FilterKey, label: "Conference", opts: filters?.conference },
          { key: "state" as FilterKey, label: "State", opts: filters?.state },
          { key: "schoolType" as FilterKey, label: "School Type", opts: filters?.schoolType },
        ]).map(({ key, label, opts }) => {
          const active = !!field(key);
          return (
            <div key={key} className="relative">
              <select
                value={field(key)}
                onChange={(e) => setField(key, e.target.value)}
                className={`${selectCls} ${active ? "border-[#163968]/40 bg-[#163968]/5 text-[#163968] font-medium" : ""}`}
              >
                <option value="">All {label}s</option>
                {(opts ?? []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {active && (
                <button
                  onClick={() => setField(key, "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#163968]/10 transition"
                >
                  <X className="w-3.5 h-3.5 text-[#163968]" />
                </button>
              )}
            </div>
          );
        })}

        {(field("division") || field("conference") || field("state") || field("schoolType")) && (
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("division");
              next.delete("conference");
              next.delete("state");
              next.delete("schoolType");
              next.set("page", "1");
              setSearchParams(next);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* error */}
      {err && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{err}</p>
        </div>
      )}

      {/* loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#163968] animate-spin" />
          <span className="ml-2 text-sm text-slate-500">
            Loading programs&hellip;
          </span>
        </div>
      )}

      {/* empty database */}
      {emptyDb && !loading && (
        <div className="text-center py-16">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            No programs available yet. Check back soon.
          </p>
        </div>
      )}

      {/* no filter results */}
      {noResults && !loading && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            No programs match your filters. Try broadening your search.
          </p>
        </div>
      )}

      {/* program cards */}
      {list && list.data.length > 0 && !loading && (
        <>
          <p className="text-sm text-slate-500">
            Showing{" "}
            {(list.page - 1) * list.limit + 1}&ndash;
            {Math.min(list.page * list.limit, list.total)} of {list.total}{" "}
            programs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.data.map((p) => {
              const isHbcu = p.hbcuCommunityCollegeWomenOnly?.toLowerCase().includes("hbcu");
              return (
                <button
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#163968]/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-800 group-hover:text-[#163968] transition-colors truncate">
                      {p.schoolName}
                    </h4>
                    {isHbcu && (
                      <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        HBCU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    {p.division}
                    <span className="text-slate-300">&middot;</span>
                    {p.conference}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {p.city ? `${p.city}, ${p.state}` : p.state}
                    {p.region && (
                      <>
                        <span className="text-slate-300">&middot;</span>
                        {p.region}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {p.schoolType}
                    {p.enrollment && (
                      <>
                        <span className="text-slate-300">&middot;</span>
                        {p.enrollment.toLocaleString()} students
                      </>
                    )}
                  </div>
                  {p.averageGpa && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      Avg GPA {p.averageGpa}
                      {p.acceptanceRate && (
                        <>
                          <span className="text-slate-300">&middot;</span>
                          {Math.round(parseFloat(p.acceptanceRate) * 100)}% acceptance
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* pagination */}
          {list.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={list.page <= 1}
                onClick={() => goPage(list.page - 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers(list.page, list.totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-slate-400"
                    >
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goPage(p as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        p === list.page
                          ? "bg-[#163968] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                disabled={list.page >= list.totalPages}
                onClick={() => goPage(list.page + 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* detail modal */}
      {detail && (() => {
        const isHbcu = detail.hbcuCommunityCollegeWomenOnly?.toLowerCase().includes("hbcu");
        const hasSat = detail.satReadingLow != null || detail.satMathLow != null;
        const hasAct = detail.actCompositeLow != null;
        const hasFinancial = detail.tuitionInState || detail.tuitionOutOfState || detail.tuitionBand || detail.acceptanceRate;
        const links = [
          { label: "School Website", url: detail.schoolWebsite },
          { label: "Athletics", url: detail.athleticsUrl },
          { label: "Recruiting", url: detail.recruitingUrl },
          { label: "Roster", url: detail.rosterUrl },
          { label: "Admissions", url: detail.admissionsUrl },
          { label: "Camps", url: detail.campUrl },
          { label: "Majors", url: detail.majorsOfferedUrl },
        ].filter((l) => l.url);

        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setDetail(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="bg-[#163968] px-6 py-5 text-white shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{detail.schoolName}</h3>
                      {detail.nickname && (
                        <span className="text-sm text-white/60">({detail.nickname})</span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mt-1">
                      {detail.city ? `${detail.city}, ${detail.state}` : detail.state}
                      {detail.region && ` · ${detail.region}`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{detail.division}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{detail.conference}</span>
                      {isHbcu && (
                        <span className="text-xs bg-amber-400/90 text-amber-950 font-bold px-2 py-0.5 rounded">HBCU</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="p-1 rounded-lg hover:bg-white/10 transition shrink-0"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* scrollable body */}
              <div className="overflow-y-auto px-6 py-5 space-y-5">
                {/* school overview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    School Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField icon={<Building2 className="w-4 h-4" />} label="Type" value={detail.schoolType} />
                    <DetailField
                      icon={<Users className="w-4 h-4" />}
                      label="Enrollment"
                      value={detail.enrollment ? detail.enrollment.toLocaleString() : "—"}
                    />
                    <DetailField
                      icon={<MapPin className="w-4 h-4" />}
                      label="City Size"
                      value={detail.sizeOfCity ?? "—"}
                    />
                    {detail.religiousAffiliation && (
                      <DetailField
                        icon={<Building2 className="w-4 h-4" />}
                        label="Affiliation"
                        value={detail.religiousAffiliation}
                      />
                    )}
                    {detail.stadium && (
                      <DetailField icon={<Globe className="w-4 h-4" />} label="Stadium" value={detail.stadium} />
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* academics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Academics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      icon={<BookOpen className="w-4 h-4" />}
                      label="Average GPA"
                      value={detail.averageGpa ?? "—"}
                    />
                    <DetailField
                      icon={<BookOpen className="w-4 h-4" />}
                      label="Acceptance Rate"
                      value={
                        detail.acceptanceRate
                          ? `${Math.round(parseFloat(detail.acceptanceRate) * 100)}%`
                          : "—"
                      }
                    />
                    {hasSat && (
                      <>
                        <DetailField
                          icon={<BookOpen className="w-4 h-4" />}
                          label="SAT Reading"
                          value={
                            detail.satReadingLow != null && detail.satReadingHigh != null
                              ? `${detail.satReadingLow}–${detail.satReadingHigh}`
                              : "—"
                          }
                        />
                        <DetailField
                          icon={<BookOpen className="w-4 h-4" />}
                          label="SAT Math"
                          value={
                            detail.satMathLow != null && detail.satMathHigh != null
                              ? `${detail.satMathLow}–${detail.satMathHigh}`
                              : "—"
                          }
                        />
                      </>
                    )}
                    {hasAct && (
                      <DetailField
                        icon={<BookOpen className="w-4 h-4" />}
                        label="ACT Composite"
                        value={
                          detail.actCompositeLow != null && detail.actCompositeHigh != null
                            ? `${detail.actCompositeLow}–${detail.actCompositeHigh}`
                            : "—"
                        }
                      />
                    )}
                  </div>
                </div>

                {/* financial */}
                {hasFinancial && (
                  <>
                    <hr className="border-slate-100" />
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Financial
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {detail.tuitionInState && (
                          <DetailField
                            icon={<DollarSign className="w-4 h-4" />}
                            label="In-State Tuition"
                            value={`$${parseInt(detail.tuitionInState).toLocaleString()}`}
                          />
                        )}
                        {detail.tuitionOutOfState && (
                          <DetailField
                            icon={<DollarSign className="w-4 h-4" />}
                            label="Out-of-State Tuition"
                            value={`$${parseInt(detail.tuitionOutOfState).toLocaleString()}`}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* links */}
                {links.length > 0 && (
                  <>
                    <hr className="border-slate-100" />
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Links
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {links.map((l) => (
                          <a
                            key={l.label}
                            href={l.url!.startsWith("http") ? l.url! : `https://${l.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[#163968] font-medium bg-[#163968]/5 hover:bg-[#163968]/10 px-3 py-1.5 rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {l.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
