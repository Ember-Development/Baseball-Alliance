import { useEffect, useRef } from "react";
import { HelpCircle, X } from "lucide-react";
import ModalPortal, { BAMS_MODAL_Z } from "./ModalPortal";
import { MATCH_COPY } from "./matchResultsCopy";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Optional school-specific context shown at top. */
  schoolName?: string;
  matchFit?: string;
  fitLabel?: string;
};

export function MatchFitExplainerTrigger({
  onClick,
  label = MATCH_COPY.explainer.triggerGlobal,
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163968] hover:underline"
    >
      <HelpCircle className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function MatchFitExplainer({
  open,
  onClose,
  schoolName,
  matchFit,
  fitLabel,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 ${BAMS_MODAL_Z} flex items-end sm:items-center justify-center p-0 sm:p-4`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-fit-explainer-title"
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
            id="match-fit-explainer-title"
            className="text-lg font-bold text-slate-900"
          >
            {schoolName
              ? MATCH_COPY.explainer.triggerSchool
              : MATCH_COPY.explainer.triggerGlobal}
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
          {schoolName && matchFit && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{schoolName}</p>
                {fitLabel && (
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {fitLabel}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-center text-center px-2">
                <span className="text-xl font-bold text-slate-700 tabular-nums leading-none">
                  {matchFit}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-tight max-w-[4.5rem]">
                  {MATCH_COPY.school.matchFitLabel}
                </span>
              </div>
            </div>
          )}

          {MATCH_COPY.explainer.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                {section.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
