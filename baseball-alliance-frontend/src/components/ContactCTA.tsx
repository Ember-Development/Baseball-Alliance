import React from "react";
import fieldImg from "../assets/field.png";
import { useLiveSiteConfig } from "../context/SiteEditModeContext";
import EditableText from "./site-inline/EditableText";
import { EditableMediaOverlayBadge } from "./site-inline/EditableMedia";
import SectionSettings from "./site-inline/SectionSettings";
import { Field } from "./site-inline/siteEditorPrimitives";

const DEFAULT_LINES = [
  "A better future.",
  "Baseball Alliance.",
  "Elevate your game.",
];

const ContactCTA: React.FC = () => {
  const { site, isContentEditUI, setDraftSite } = useLiveSiteConfig();

  const cta = site?.contactCta;
  const lines = cta?.lines && cta.lines.length > 0 ? cta.lines : DEFAULT_LINES;
  const linesEditableValue = (cta?.lines ?? lines).join("\n");
  const buttonLabel = cta?.buttonLabel ?? "Contact Us";
  const mailto = cta?.mailto?.startsWith("mailto:")
    ? cta.mailto
    : cta?.mailto
      ? `mailto:${cta.mailto}`
      : "mailto:keith@baseballalliance.co";
  const bgUrl = cta?.imageUrl || fieldImg;

  const updateCta = (patch: Partial<NonNullable<typeof cta>>) =>
    setDraftSite((d) =>
      d ? { ...d, contactCta: { ...(d.contactCta ?? {}), ...patch } } : d
    );

  return (
    <section
      className={[
        "mx-auto max-w-7xl px-4 lg:px-0 mt-16",
        isContentEditUI ? "rounded-2xl ring-4 ring-amber-400/40 p-2" : "",
      ].join(" ")}
    >
      <div
        className="relative overflow-hidden rounded-3xl border-2 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
        style={{
          backgroundImage: `url(${typeof bgUrl === "string" ? bgUrl : fieldImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        {isContentEditUI && (
          <>
            <EditableMediaOverlayBadge
              kind="image"
              label="Replace background"
              positionCls="top-3 left-3"
              onChange={(url) => updateCta({ imageUrl: url })}
            />
            <SectionSettings label="Contact settings" positionCls="absolute top-3 right-3">
              <Field
                label="Mailto (email or mailto:…)"
                value={cta?.mailto ?? ""}
                onChange={(v) => updateCta({ mailto: v || undefined })}
                dark
              />
            </SectionSettings>
          </>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20">
          <h3 className="text-white font-extrabold tracking-wide leading-tight text-2xl sm:text-4xl md:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {isContentEditUI ? (
              <EditableText
                value={linesEditableValue}
                placeholder="One headline per line"
                multiline
                onChange={(v) =>
                  updateCta({
                    lines: v
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            ) : (
              lines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < lines.length - 1 ? <br /> : null}
                </React.Fragment>
              ))
            )}
          </h3>

          <a
            href={mailto}
            onClick={(e) => {
              if (isContentEditUI) e.preventDefault();
            }}
            className="mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-white font-semibold shadow-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 ring-offset-black/0"
            style={{
              background:
                "linear-gradient(90deg, rgba(28,74,136,1) 0%, rgba(207,36,47,1) 100%)",
            }}
          >
            <EditableText
              value={buttonLabel}
              placeholder="Button label"
              onChange={(v) => updateCta({ buttonLabel: v || undefined })}
            />
          </a>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
      </div>
    </section>
  );
};

export default ContactCTA;
