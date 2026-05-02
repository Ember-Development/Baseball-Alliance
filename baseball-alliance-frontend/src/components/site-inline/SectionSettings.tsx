import React, { useEffect, useRef, useState } from "react";
import { useLiveSiteConfig } from "../../context/SiteEditModeContext";

type Props = {
  label?: string;
  /** Tailwind position classes including `absolute` or `fixed`. Defaults to
   * absolute top-right. Pass `"fixed bottom-24 right-6"` for floating buttons. */
  positionCls?: string;
  children: React.ReactNode;
};

/**
 * Small floating gear button that opens a popover with non-visible config
 * fields (CTA href, mailto, etc.) Renders nothing in view mode.
 */
const SectionSettings: React.FC<Props> = ({
  label = "Section settings",
  positionCls = "top-3 right-3",
  children,
}) => {
  const { isContentEditUI } = useLiveSiteConfig();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!popoverRef.current) return;
      if (popoverRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!isContentEditUI) return null;

  const wrapperPos = positionCls ?? "absolute top-3 right-3";

  return (
    <div ref={popoverRef} className={`z-[60] ${wrapperPos}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={label}
        className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow-lg hover:bg-amber-300"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M19.14 12.94a7.49 7.49 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.46 7.46 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.5.43l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.7 8.49a.5.5 0 0 0 .12.65l2.03 1.58a7.49 7.49 0 0 0 0 1.88L2.82 14.18a.5.5 0 0 0-.12.65l1.92 3.32c.14.24.43.34.69.24l2.39-.96c.49.39 1.03.7 1.62.94l.36 2.54c.05.25.26.43.5.43h3.8c.24 0 .45-.18.5-.43l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.26.1.55 0 .69-.24l1.92-3.32a.5.5 0 0 0-.12-.65l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
        </svg>
        {label}
      </button>
      {open && (
        <div className="mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-amber-400/60 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionSettings;
