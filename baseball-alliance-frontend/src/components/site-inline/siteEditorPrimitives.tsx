import { useState } from "react";
import type { SitePublic } from "../../lib/site";
import { uploadSiteMedia } from "../../lib/siteUpload";

export const SITE_EDITOR_INPUT_CLS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900";

export function Field({
  label,
  value,
  onChange,
  dark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dark?: boolean;
}) {
  return (
    <label
      className={`block text-sm font-semibold ${dark ? "text-white/90" : "text-slate-700"}`}
    >
      {label}
      <input
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
          dark
            ? "border-white/20 bg-white/10 text-white placeholder:text-white/40"
            : "border-slate-300 text-slate-900"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function UrlField({
  label,
  value,
  onChange,
  inputCls,
  kind = "image",
  dark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputCls: string;
  kind?: "image" | "video";
  dark?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  return (
    <div>
      <label
        className={`block text-sm font-semibold ${dark ? "text-white/90" : "text-slate-700"}`}
      >
        {label}
        <input
          className={`${inputCls} mt-1 ${dark ? "border-white/20 bg-white/10 text-white" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <div className="mt-1 flex items-center gap-2">
        <label
          className={`text-xs font-semibold cursor-pointer ${dark ? "text-amber-200" : "text-[#163968]"}`}
        >
          {busy ? "Uploading…" : "Upload file"}
          <input
            type="file"
            accept={kind === "video" ? "video/*" : "image/*"}
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              setLocalErr(null);
              try {
                const url = await uploadSiteMedia(f, kind);
                onChange(url);
              } catch (err: unknown) {
                setLocalErr(
                  err instanceof Error ? err.message : "Upload failed"
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {localErr && (
          <span className="text-xs text-red-400">{localErr}</span>
        )}
      </div>
    </div>
  );
}

export function SaveBar({
  onSave,
  disabled,
  dark,
}: {
  onSave: () => void;
  disabled: boolean;
  dark?: boolean;
}) {
  return (
    <div className="pt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onSave}
        className={`rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wide disabled:opacity-50 ${
          dark
            ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
            : "bg-[#163968] text-white"
        }`}
      >
        Save section
      </button>
    </div>
  );
}

export function ContactCtaForm({
  site,
  setSite,
  onSave,
  saving,
  inputCls,
  dark,
}: {
  site: SitePublic;
  setSite: (s: SitePublic) => void;
  onSave: () => void;
  saving: boolean;
  inputCls: string;
  dark?: boolean;
}) {
  const c = site.contactCta ?? {};
  const linesStr = (c.lines ?? []).join("\n");
  return (
    <div className="space-y-3">
      <label
        className={`block text-sm font-semibold ${dark ? "text-white/90" : "text-slate-700"}`}
      >
        Lines (one per line)
        <textarea
          className={`${inputCls} mt-1 min-h-[100px] ${dark ? "border-white/20 bg-white/10 text-white" : ""}`}
          value={linesStr}
          onChange={(e) =>
            setSite({
              ...site,
              contactCta: {
                ...c,
                lines: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
      </label>
      <Field
        label="Button label"
        value={c.buttonLabel ?? ""}
        onChange={(v) =>
          setSite({
            ...site,
            contactCta: { ...c, buttonLabel: v || undefined },
          })
        }
        dark={dark}
      />
      <Field
        label="Mailto (email or mailto:…)"
        value={c.mailto ?? ""}
        onChange={(v) =>
          setSite({
            ...site,
            contactCta: { ...c, mailto: v || undefined },
          })
        }
        dark={dark}
      />
      <UrlField
        label="Background image URL"
        value={c.imageUrl ?? ""}
        onChange={(url) =>
          setSite({
            ...site,
            contactCta: { ...c, imageUrl: url || null },
          })
        }
        inputCls={inputCls}
        dark={dark}
      />
      <SaveBar disabled={saving} onSave={onSave} dark={dark} />
    </div>
  );
}
