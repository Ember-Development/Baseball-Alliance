import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api,
  type BamsAthleteRowSummary,
  type BamsEventResultsResponse,
  type BamsMembershipUsage,
  type BamsSyncedEventSummary,
} from "../../lib/api";
import type { MatchResponseV1 } from "../../types/collegeMatch";
import { normalizeMetricAssessment } from "../../types/collegeMatch";
import MatchResultsDisplay from "./MatchResultsDisplay";
import { ShowcaseStatsBlock } from "./AthleteProjectionCard";
import MatchPreferencesForm from "./MatchPreferencesForm";
import {
  parseShowcaseCsvRow,
  formatShowcaseStatEntries,
} from "../../lib/showcaseMetrics";
import { DEFAULT_MATCH_PREFERENCES } from "./matchPreferences";
import {
  matchPreferencesToApi,
  type MatchPreferences,
} from "./matchPreferences";
import { useAuth } from "../../context/AuthContext";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
  Play,
  RefreshCw,
  Users,
} from "lucide-react";

/** How many programs to pull per match run for the top-30 view + compare tools. */
const COMPARE_POOL_SIZE = 150;

function statusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200";
    case "SKIPPED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function BamsEventMatchPanel() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const [membershipUsage, setMembershipUsage] = useState<BamsMembershipUsage | null>(
    null
  );
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [syncedEvents, setSyncedEvents] = useState<BamsSyncedEventSummary[]>(
    []
  );
  const [memberPlaybookId, setMemberPlaybookId] = useState<string | null>(null);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [selectingUploadId, setSelectingUploadId] = useState<string | null>(
    null
  );
  const [results, setResults] = useState<BamsEventResultsResponse | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(
    null
  );
  const [matchBusy, setMatchBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<MatchPreferences>(
    DEFAULT_MATCH_PREFERENCES
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preferencesUpdated, setPreferencesUpdated] = useState(false);
  const lastMatchStatesRef = useRef<string | null>(null);
  const preferencesSectionRef = useRef<HTMLDivElement>(null);

  const loadResults = useCallback(
    async (
      id: string,
      eventName?: string | null,
      options?: { selectFirst?: boolean; athleteRowId?: string }
    ) => {
      const data = await api.getBamsEventResults(
        id,
        eventName ?? undefined
      );
      setResults(data);
      if (Array.isArray(data.warnings)) {
        setWarnings(data.warnings.filter((w): w is string => typeof w === "string"));
      }
      if (options?.athleteRowId) {
        setSelectedAthleteId(options.athleteRowId);
      } else if (options?.selectFirst && data.athletes.length > 0) {
        setSelectedAthleteId(data.athletes[0]!.id);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    void api
      .getBamsProfile()
      .then((profile) => {
        if (!cancelled) {
          setMembershipUsage({
            membership: profile.membership,
            membershipLabel: profile.membershipLabel,
            matchRunsUsed: profile.matchRunsUsed,
            matchRunsLimit: profile.matchRunsLimit,
            matchRunsRemaining: profile.matchRunsRemaining,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setMembershipUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (uploadId) return;
    let cancelled = false;
    setLoadingUploads(true);
    void api
      .listBamsMemberEventOptions()
      .then((res) => {
        if (!cancelled) {
          setSyncedEvents(res.syncedEvents);
          setMemberPlaybookId(res.playbookId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSyncedEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUploads(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  const canRunMatch =
    isAdmin || (membershipUsage?.matchRunsRemaining ?? 0) > 0;

  useEffect(() => {
    if (!uploadId) return;
    void loadResults(uploadId, selectedEvent).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load results")
    );
  }, [uploadId, selectedEvent, loadResults]);

  const athletes = results?.athletes ?? [];

  const selectedAthlete = useMemo(
    () => athletes.find((a) => a.id === selectedAthleteId) ?? null,
    [athletes, selectedAthleteId]
  );

  const matchRes = selectedAthlete?.matchResponse as
    | MatchResponseV1
    | undefined;

  const showcaseMetrics = useMemo(
    () =>
      selectedAthlete?.rawRow
        ? parseShowcaseCsvRow(selectedAthlete.rawRow)
        : null,
    [selectedAthlete?.rawRow]
  );

  const gradedMetricKeys = useMemo(
    () =>
      normalizeMetricAssessment(matchRes?.athleteProfile?.metricAssessment).map(
        (m) => m.metric
      ),
    [matchRes?.athleteProfile?.metricAssessment]
  );

  const showcaseStatEntries = useMemo(
    () =>
      showcaseMetrics
        ? formatShowcaseStatEntries(showcaseMetrics, {
            primaryPosition: selectedAthlete?.primaryPosition,
            gradedMetricKeys,
          })
        : [],
    [showcaseMetrics, selectedAthlete?.primaryPosition, gradedMetricKeys]
  );

  async function selectSyncedEvent(event: BamsSyncedEventSummary) {
    setSelectingUploadId(event.uploadId);
    setError(null);
    try {
      setUploadId(event.uploadId);
      setSelectedEvent(event.eventName);
      await loadResults(event.uploadId, event.eventName, {
        athleteRowId: event.athleteRowId,
      });
    } catch (err: unknown) {
      setUploadId(null);
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setSelectingUploadId(null);
    }
  }

  async function runMatch(targets?: BamsAthleteRowSummary[]) {
    if (!uploadId) return;
    setMatchBusy(true);
    setError(null);
    try {
      const prefsPayload = matchPreferencesToApi(preferences);
      const statesKey = JSON.stringify(prefsPayload.preferredStates ?? []);
      const prevStates = lastMatchStatesRef.current;
      setPreferencesUpdated(
        prevStates != null && prevStates !== statesKey && statesKey !== "[]"
      );
      lastMatchStatesRef.current = statesKey;

      await api.runBamsEventMatch(uploadId, {
        eventName: selectedEvent ?? undefined,
        athleteUuids: targets?.map((a) => a.athleteUuid),
        limit: COMPARE_POOL_SIZE,
        preferences: prefsPayload,
      });
      const profile = await api.getBamsProfile();
      setMembershipUsage({
        membership: profile.membership,
        membershipLabel: profile.membershipLabel,
        matchRunsUsed: profile.matchRunsUsed,
        matchRunsLimit: profile.matchRunsLimit,
        matchRunsRemaining: profile.matchRunsRemaining,
      });
      await loadResults(uploadId, selectedEvent);
      // Results changed — allow re-saving the fresh match.
      setSavedIds(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Match failed");
    } finally {
      setMatchBusy(false);
    }
  }

  async function saveCurrentMatch() {
    if (!selectedAthlete || !matchRes) return;
    setSaveError(null);
    setSavingId(selectedAthlete.id);
    try {
      await api.saveBamsMatch({
        uploadId: uploadId ?? undefined,
        athleteUuid: selectedAthlete.athleteUuid,
        athleteName: selectedAthlete.displayName,
        primaryPosition: selectedAthlete.primaryPosition,
        gradYear: selectedAthlete.gradYear ?? undefined,
        eventName: selectedAthlete.eventName ?? undefined,
        eventStartDate: selectedAthlete.eventStartDate ?? undefined,
        matchResponse: matchRes,
        preferences: matchPreferencesToApi(preferences),
      });
      setSavedIds((prev) => new Set(prev).add(selectedAthlete.id));
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Could not save match");
    } finally {
      setSavingId(null);
    }
  }

  function resetUpload() {
    setUploadId(null);
    setResults(null);
    setSelectedEvent(null);
    setSelectedAthleteId(null);
    setWarnings([]);
    setError(null);
    setPreferences({ ...DEFAULT_MATCH_PREFERENCES });
    setSavingId(null);
    setSavedIds(new Set());
    setSaveError(null);
    setPreferencesUpdated(false);
    lastMatchStatesRef.current = null;
  }

  if (!uploadId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#163968]">
            Choose event data
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Select event data synced to your Playbook profile to run college
            matching through BAMS.
          </p>
        </div>

        {loadingUploads ? (
          <p className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your events…
          </p>
        ) : syncedEvents.length > 0 ? (
          <section className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-2 bg-emerald-50/60">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Your event data
                </h3>
                {memberPlaybookId && (
                  <p className="text-xs text-slate-500">
                    Linked via Playbook ID {memberPlaybookId}
                  </p>
                )}
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {syncedEvents.map((event) => {
                const busy = selectingUploadId === event.uploadId;
                return (
                  <li key={event.athleteRowId}>
                    <button
                      type="button"
                      disabled={Boolean(selectingUploadId)}
                      onClick={() => void selectSyncedEvent(event)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-center gap-3 disabled:opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {event.displayName}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {event.eventName ?? event.fileName ?? "Event"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                          {event.primaryPosition && (
                            <span>{event.primaryPosition}</span>
                          )}
                          {event.gradYear && <span>· {event.gradYear}</span>}
                          {event.eventStartDate && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.eventStartDate}
                            </span>
                          )}
                          <span
                            className={`font-medium uppercase text-[10px] px-1.5 py-0.5 rounded border ${statusBadge(event.matchStatus)}`}
                          >
                            {event.matchStatus}
                          </span>
                        </p>
                      </div>
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#163968] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : memberPlaybookId ? (
          <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            No showcase event data is linked to Playbook ID{" "}
            <strong>{memberPlaybookId}</strong> yet. Ask your admin to import
            event data with your player ID.
          </p>
        ) : (
          <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            Your account has no Playbook ID on file, so synced event data
            cannot be matched automatically. Contact Baseball Alliance support
            to link your profile.
          </p>
        )}

        {error && syncedEvents.length === 0 && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#163968]">Your event data</h2>
          <p className="text-sm text-slate-600 mt-1">
            {results?.fileName ?? "Event data"} · {results?.rowCount ?? 0} athletes
          </p>
        </div>
        <button
          type="button"
          onClick={resetUpload}
          className="text-sm font-medium text-[#163968] hover:underline"
        >
          Choose different event
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {results && results.events.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {results.events.map((ev) => {
            const key = ev.eventName ?? "Event";
            const active = selectedEvent === ev.eventName;
            return (
              <button
                key={`${ev.eventName}-${ev.eventStartDate}`}
                type="button"
                onClick={() => {
                  setSelectedEvent(ev.eventName);
                  setSelectedAthleteId(null);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
                  active
                    ? "bg-[#163968] text-white border-[#163968]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#163968]/40"
                }`}
              >
                {key}
                {ev.eventStartDate && (
                  <span className="opacity-80 ml-1">· {ev.eventStartDate}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div ref={preferencesSectionRef} className="scroll-mt-24">
        <MatchPreferencesForm value={preferences} onChange={setPreferences} />
      </div>

      {membershipUsage && !isAdmin && (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            membershipUsage.matchRunsRemaining > 0
              ? "border-[#163968]/20 bg-[#163968]/5 text-slate-700"
              : "border-amber-200 bg-amber-50 text-amber-900",
          ].join(" ")}
        >
          <p>
            <span className="font-semibold text-[#163968]">
              {membershipUsage.membershipLabel === "bams-premium"
                ? "BAMS Premium"
                : "BAMS"}
            </span>
            {" · "}
            {membershipUsage.matchRunsRemaining} of {membershipUsage.matchRunsLimit}{" "}
            match run
            {membershipUsage.matchRunsLimit === 1 ? "" : "s"} remaining
          </p>
          {membershipUsage.matchRunsRemaining === 0 && (
            <p className="mt-1">
              You&apos;ve used all included match runs. You can still view saved
              matches on your profile.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={matchBusy || athletes.length === 0 || !canRunMatch}
          onClick={() => void runMatch()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#163968] text-white font-semibold px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {matchBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run match for {selectedEvent ? "this event" : "all athletes"}
        </button>
        <button
          type="button"
          disabled={matchBusy}
          onClick={() => uploadId && void loadResults(uploadId, selectedEvent)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Athletes ({athletes.length})
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white divide-y max-h-[420px] overflow-y-auto">
            {athletes.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAthleteId(a.id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-2 ${
                  selectedAthleteId === a.id ? "bg-[#163968]/5" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {a.displayName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.primaryPosition}
                    {a.gradYear ? ` · ${a.gradYear}` : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${statusBadge(a.matchStatus)}`}
                >
                  {a.matchStatus}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          {selectedAthlete ? (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {selectedAthlete.displayName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedAthlete.primaryPosition}
                      {selectedAthlete.gradYear &&
                        ` · Class of ${selectedAthlete.gradYear}`}
                    </p>
                  </div>
                  {selectedAthlete.athleteUrl && (
                    <a
                      href={selectedAthlete.athleteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#163968] hover:underline"
                    >
                      View on Baseball Alliance
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  {selectedAthlete.eventName && (
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedAthlete.eventName}
                      {selectedAthlete.eventStartDate &&
                        ` · ${selectedAthlete.eventStartDate}`}
                    </span>
                  )}
                  <span className="font-mono text-slate-400">
                    {selectedAthlete.athleteUuid}
                  </span>
                </div>

                {selectedAthlete.parseErrors.length > 0 && (
                  <ul className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 list-disc pl-5">
                    {selectedAthlete.parseErrors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                )}

                {selectedAthlete.matchError && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {selectedAthlete.matchError}
                  </p>
                )}

                {showcaseStatEntries.length > 0 ? (
                  <ShowcaseStatsBlock entries={showcaseStatEntries} />
                ) : (
                  <span className="text-xs text-slate-400">No metrics in row</span>
                )}

                {selectedAthlete.matchStatus === "PENDING" && (
                  <button
                    type="button"
                    disabled={matchBusy || !canRunMatch}
                    onClick={() => void runMatch([selectedAthlete])}
                    className="text-sm font-semibold text-[#163968] hover:underline"
                  >
                    Run match for this athlete
                  </button>
                )}
              </section>

              {saveError && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {saveError}
                </div>
              )}

              <MatchResultsDisplay
                matchRes={matchRes ?? null}
                preferences={preferences}
                preferencesUpdated={preferencesUpdated}
                showcaseMetrics={showcaseMetrics}
                primaryPosition={selectedAthlete.primaryPosition}
                showShowcaseHeader={false}
                onScrollToPreferences={() =>
                  preferencesSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                error={
                  selectedAthlete.matchStatus === "FAILED"
                    ? selectedAthlete.matchError
                    : null
                }
                onSave={
                  matchRes && selectedAthlete.matchStatus === "SUCCESS"
                    ? saveCurrentMatch
                    : undefined
                }
                saving={savingId === selectedAthlete.id}
                saved={savedIds.has(selectedAthlete.id)}
              />
            </>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">
              Select an athlete to view event data and matches.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
