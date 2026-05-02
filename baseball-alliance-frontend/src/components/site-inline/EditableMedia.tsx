import React, { useRef, useState } from "react";
import { useLiveSiteConfig } from "../../context/SiteEditModeContext";
import { uploadSiteMedia } from "../../lib/siteUpload";

type WrapperProps = {
  /** Called with the new public URL after upload. */
  onChange: (url: string) => void;
  kind?: "image" | "video";
  label?: string;
  /** Extra classes for the wrapper. */
  className?: string;
  /** When you want the overlay positioned relative to a parent already
   * marked relative, pass `noWrap` and render the overlay separately via
   * <EditableMediaOverlayBadge />. */
  children: React.ReactNode;
};

/**
 * Wraps an `<img>` (or any visual node) so that, in admin edit mode, hovering
 * shows a "Replace" button. Clicking opens the file picker; the file is
 * uploaded via the presigned-URL flow and `onChange(publicUrl)` is invoked.
 */
export const EditableMedia: React.FC<WrapperProps> = ({
  onChange,
  kind = "image",
  label,
  className,
  children,
}) => {
  const { isContentEditUI } = useLiveSiteConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isContentEditUI) return <>{children}</>;

  const buttonLabel =
    err ?? (busy ? "Uploading…" : label ?? `Replace ${kind}`);

  return (
    <div className={`relative group ${className ?? ""}`}>
      {children}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/0 group-hover:bg-black/45 focus-visible:bg-black/45 transition-colors outline-2 outline-dashed outline-amber-300/0 group-hover:outline-amber-300/80 outline-offset-[-4px] rounded-[inherit]"
      >
        <span
          className={`pointer-events-none rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition ${
            err
              ? "bg-red-500 text-white"
              : "bg-amber-400 text-slate-900"
          }`}
        >
          {buttonLabel}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={kind === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            const url = await uploadSiteMedia(f, kind);
            onChange(url);
          } catch (uploadErr: unknown) {
            setErr(
              uploadErr instanceof Error ? uploadErr.message : "Upload failed"
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
};

type BadgeProps = {
  onChange: (url: string) => void;
  kind?: "image" | "video";
  label?: string;
  /** Optional Tailwind absolute-position classes (e.g. "top-3 right-3").
   * When omitted, the badge renders inline without absolute positioning so it
   * can be stacked by a parent flex container. */
  positionCls?: string;
};

/**
 * Standalone "Replace" badge for full-bleed media (e.g. hero video) where you
 * cannot wrap the video in a relative div without breaking layout. When
 * `positionCls` is provided, wraps with `absolute`; otherwise renders inline.
 */
export const EditableMediaOverlayBadge: React.FC<BadgeProps> = ({
  onChange,
  kind = "image",
  label,
  positionCls,
}) => {
  const { isContentEditUI } = useLiveSiteConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isContentEditUI) return null;

  const buttonLabel =
    err ?? (busy ? "Uploading…" : label ?? `Replace ${kind}`);

  const button = (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow-lg transition ${
          err
            ? "bg-red-500 text-white"
            : "bg-amber-400 text-slate-900 hover:bg-amber-300"
        }`}
      >
        {buttonLabel}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={kind === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            const url = await uploadSiteMedia(f, kind);
            onChange(url);
          } catch (uploadErr: unknown) {
            setErr(
              uploadErr instanceof Error ? uploadErr.message : "Upload failed"
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );

  if (positionCls) {
    return <div className={`absolute z-[55] ${positionCls}`}>{button}</div>;
  }
  return <span className="inline-flex">{button}</span>;
};

export default EditableMedia;
