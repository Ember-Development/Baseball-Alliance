import { useCallback, useEffect, useState } from "react";
import {
  api,
  type SavedMatchDetail,
  type SavedMatchSummary,
} from "../../lib/api";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Loader2,
  Trash2,
} from "lucide-react";
import MatchResultsDisplay from "./MatchResultsDisplay";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SavedMatchesPanel() {
  const [items, setItems] = useState<SavedMatchSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SavedMatchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.listSavedBamsMatches();
      setItems(res.savedMatches);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load saved matches");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await api.getSavedBamsMatch(id);
      setDetail(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to open saved match");
    } finally {
      setDetailLoading(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await api.deleteSavedBamsMatch(id);
      setItems((prev) => prev?.filter((s) => s.id !== id) ?? null);
      if (detail?.id === id) setDetail(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete saved match");
    } finally {
      setDeletingId(null);
    }
  }

  if (detail) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setDetail(null)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163968] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to saved matches
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">
            {detail.athleteName}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {detail.primaryPosition}
            {detail.gradYear ? ` · Class of ${detail.gradYear}` : ""}
            {detail.eventName ? ` · ${detail.eventName}` : ""}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Saved {formatDate(detail.createdAt)}
          </p>
        </div>
        <MatchResultsDisplay matchRes={detail.matchResponse} />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-[#163968]" />
        <h2 className="text-lg font-bold text-[#163968]">Saved matches</h2>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {detailLoading && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading match…
        </p>
      )}

      {items == null && !error ? (
        <p className="mt-3 text-sm text-slate-500">Loading…</p>
      ) : items && items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No saved matches yet. Run a match under “Find Your Match” and use “Save
          to profile” to keep it here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {items?.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <button
                type="button"
                onClick={() => void openDetail(s.id)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="font-medium text-slate-800 truncate">
                  {s.label || s.athleteName}
                </p>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2">
                  {s.primaryPosition && <span>{s.primaryPosition}</span>}
                  {s.gradYear && <span>· {s.gradYear}</span>}
                  {s.eventName && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {s.eventName}
                    </span>
                  )}
                  <span>· {s.matchCount} matches</span>
                  <span>· {formatDate(s.createdAt)}</span>
                </p>
              </button>
              <button
                type="button"
                onClick={() => void remove(s.id)}
                disabled={deletingId === s.id}
                aria-label="Delete saved match"
                className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === s.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
