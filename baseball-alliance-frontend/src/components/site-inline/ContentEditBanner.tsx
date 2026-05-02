import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSiteEditMode } from "../../context/SiteEditModeContext";

/**
 * Sticky top bar shown to admins in content-edit mode. Provides global
 * Save / Discard / Exit controls — all per-section editing is in-place.
 */
const ContentEditBanner: React.FC = () => {
  const { user } = useAuth();
  const {
    contentEditMode,
    setContentEditMode,
    saving,
    saveError,
    saveAll,
    discardChanges,
    dirty,
  } = useSiteEditMode();
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  if (!isAdmin || !contentEditMode) return null;

  return (
    <div
      className={[
        /* Nav is fixed h-20 z-90 — sit below it and stay above page content */
        "sticky top-20 z-[95]",
        "mt-20 border-b border-amber-400/60 bg-amber-50/95 text-amber-950 px-4 py-2 text-sm backdrop-blur",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold">Editing content</span>
          <span className="text-amber-900/80 hidden sm:inline">
            Click any text to edit — hover images to replace.
          </span>
          {dirty && (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Unsaved changes
            </span>
          )}
          {saving && (
            <span className="text-xs text-amber-900/80">Saving…</span>
          )}
          {saveError && (
            <span className="text-xs text-red-700">{saveError}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Page builder paused — restore Link to /admin/pages when expanding */}
          {/* <Link
            to="/admin/pages"
            className="text-xs font-semibold underline text-[#163968] hover:text-[#0f2746]"
          >
            Page builder
          </Link> */}

          {confirmingDiscard ? (
            <>
              <span className="text-xs text-amber-900">Discard changes?</span>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setConfirmingDiscard(false);
                  await discardChanges();
                }}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-500 disabled:opacity-50"
              >
                Yes, discard
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDiscard(false)}
                className="rounded-full border border-amber-800/30 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-950 hover:bg-amber-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={() => setConfirmingDiscard(true)}
                className="rounded-full border border-amber-800/30 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-950 hover:bg-amber-100 disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={saving}
                onMouseDown={() => {
                  // Commit any focused contentEditable before save handler runs.
                  const ae = document.activeElement as HTMLElement | null;
                  if (ae?.isContentEditable) ae.blur();
                }}
                onClick={() => {
                  // Run on next tick so the blur-driven setDraftSite has flushed.
                  setTimeout(() => void saveAll(), 0);
                }}
                className="rounded-full bg-[#163968] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#0f2746] disabled:opacity-50"
              >
                {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </button>
              <button
                type="button"
                onClick={() => setContentEditMode(false)}
                className="rounded-full border border-amber-800/30 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-950 hover:bg-amber-100"
              >
                Exit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditBanner;
