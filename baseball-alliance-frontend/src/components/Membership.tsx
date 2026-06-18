import React, { useRef, useState, useMemo, useCallback } from "react";
import { useLiveSiteConfig } from "../context/SiteEditModeContext";
import type { MembershipPagePayload } from "../lib/site";
import { mergeMembershipPage } from "../lib/membershipLeadershipPages";
import EditableText from "./site-inline/EditableText";
import { EditableMedia } from "./site-inline/EditableMedia";
import SectionSettings from "./site-inline/SectionSettings";
import { Field } from "./site-inline/siteEditorPrimitives";

const MEMBERSHIP_VIDEO_DEFAULT =
  "https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FBaseballAllianceWesbiteVideo22526.mp4?alt=media&token=dac0dd7f-db9a-4bdf-ad49-dcc7067f9c51";

function MembershipCtaLink({
  href,
  label,
  onLabelChange,
  variant = "primary",
  isContentEditUI,
}: {
  href: string;
  label: string;
  onLabelChange: (v: string) => void;
  variant?: "primary" | "light";
  isContentEditUI: boolean;
}) {
  const base =
    variant === "primary"
      ? "bg-[#163968] text-white hover:bg-[#1e4a85] shadow-md hover:shadow-lg"
      : "bg-white text-[#163968] hover:bg-blue-50 shadow-md hover:shadow-lg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (isContentEditUI) e.preventDefault();
      }}
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${base}`}
    >
      <EditableText
        value={label}
        placeholder="Button label"
        fallback="Join Membership"
        onChange={onLabelChange}
      />
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </a>
  );
}

const Membership: React.FC = () => {
  const { site, isContentEditUI, setDraftSite } = useLiveSiteConfig();
  const header = useMemo(
    () => site?.headers?.find((h) => h.pageKey === "membership"),
    [site?.headers]
  );

  const m = useMemo(
    () => mergeMembershipPage(site?.membershipPage ?? null),
    [site?.membershipPage]
  );

  const patchM = useCallback(
    (fn: (p: MembershipPagePayload) => MembershipPagePayload) => {
      setDraftSite((d) => {
        if (!d) return d;
        const cur = mergeMembershipPage(d.membershipPage ?? null);
        return { ...d, membershipPage: fn(cur) };
      });
    },
    [setDraftSite]
  );

  const updateHeader = (patch: Partial<NonNullable<typeof header>>) => {
    setDraftSite((d) => {
      if (!d) return d;
      const idx = d.headers.findIndex((h) => h.pageKey === "membership");
      if (idx < 0) return d;
      const headers = [...d.headers];
      headers[idx] = { ...headers[idx], ...patch };
      return { ...d, headers };
    });
  };

  const membershipLink =
    site?.membershipCtaUrl ?? "https://events.baseballalliance.co/memberships";
  const videoSrc = site?.membershipVideoUrl ?? MEMBERSHIP_VIDEO_DEFAULT;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handlePlay = () => {
    setShowPlaceholder(false);
    videoRef.current?.play();
  };

  return (
    <main
      className={[
        "min-h-screen bg-white",
        isContentEditUI ? "ring-4 ring-inset ring-amber-400/40" : "",
      ].join(" ")}
    >
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <header className="scroll-mt-28">
              <EditableText
                as="span"
                className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#163968]/60"
                value={m.heroEyebrow ?? ""}
                placeholder="Eyebrow"
                fallback="Baseball Alliance"
                onChange={(v) => patchM((p) => ({ ...p, heroEyebrow: v || null }))}
              />
              <EditableText
                as="h1"
                className="mb-5 text-5xl font-black tracking-tight text-[#163968] sm:text-6xl lg:text-[4.25rem] lg:leading-[1.05]"
                value={header?.title ?? ""}
                placeholder="MEMBERSHIP"
                fallback="MEMBERSHIP"
                onChange={(v) => updateHeader({ title: v })}
              />
              <EditableText
                as="p"
                className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl"
                value={header?.subtitle ?? ""}
                placeholder="Subtitle paragraph"
                multiline
                fallback="Your membership unlocks verified performance data, elevated visibility, and access to education, the BAMS college-matching tool and exclusive experiences."
                onChange={(v) => updateHeader({ subtitle: v || null })}
              />
              <MembershipCtaLink
                href={membershipLink}
                label={m.heroCtaLabel ?? ""}
                onLabelChange={(v) =>
                  patchM((p) => ({ ...p, heroCtaLabel: v || null }))
                }
                isContentEditUI={isContentEditUI}
              />
            </header>

            <div className="lg:justify-self-end lg:w-full lg:max-w-xl">
              <EditableText
                as="p"
                className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                value={m.videoSectionTitle ?? ""}
                placeholder="Video title"
                fallback="Membership Information Video"
                onChange={(v) =>
                  patchM((p) => ({ ...p, videoSectionTitle: v || null }))
                }
              />
              <EditableMedia
                kind="video"
                label="Replace video"
                onChange={(url) =>
                  setDraftSite((d) =>
                    d ? { ...d, membershipVideoUrl: url } : d
                  )
                }
                className="overflow-hidden rounded-2xl border border-slate-200 bg-[#163968] shadow-[0_20px_50px_rgba(22,57,104,0.18)]"
              >
                <div className="relative aspect-video w-full">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    src={videoSrc}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  {showPlaceholder && (
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#163968]"
                      aria-label="Play membership video"
                    >
                      <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/45">
                        <svg
                          className="ml-1 h-10 w-10"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="sr-only">Play video</span>
                    </button>
                  )}
                </div>
              </EditableMedia>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#163968] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200/80">
                Included with membership
              </p>
              <EditableText
                as="h2"
                className="text-3xl font-black leading-tight sm:text-4xl"
                value={m.bamsSectionTitle ?? ""}
                placeholder="Section title"
                fallback="Baseball Alliance Matching System (BAMS)"
                onChange={(v) =>
                  patchM((p) => ({ ...p, bamsSectionTitle: v || null }))
                }
              />
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/10 lg:pl-16">
              <EditableText
                as="p"
                className="text-base leading-8 text-blue-50/95 sm:text-lg sm:leading-8"
                value={m.bamsSectionBody ?? ""}
                placeholder="BAMS description"
                multiline
                fallback="BAMS transforms verified performance metrics into actionable recruiting insights. By comparing your data against college recruiting benchmarks and collegiate programs, BAMS identifies schools that align with your athletic and academic profile. Through college fit analysis, benchmark comparisons, and personalized recruiting insights, athletes and families gain a clearer understanding of where they stand today, where they can improve, and what opportunities may be available as they progress through their recruiting journey."
                onChange={(v) =>
                  patchM((p) => ({ ...p, bamsSectionBody: v || null }))
                }
              />
              <div className="mt-10">
                <MembershipCtaLink
                  href={membershipLink}
                  label={m.heroCtaLabel ?? ""}
                  onLabelChange={(v) =>
                    patchM((p) => ({ ...p, heroCtaLabel: v || null }))
                  }
                  variant="light"
                  isContentEditUI={isContentEditUI}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {isContentEditUI && (
        <SectionSettings
          label="Membership settings"
          positionCls="fixed bottom-24 right-6"
        >
          <Field
            label="Membership CTA URL"
            value={site?.membershipCtaUrl ?? ""}
            onChange={(v) =>
              setDraftSite((d) =>
                d ? { ...d, membershipCtaUrl: v || null } : d
              )
            }
            dark
          />
          <Field
            label="Header image URL"
            value={header?.imageUrl ?? ""}
            onChange={(v) => updateHeader({ imageUrl: v || null })}
            dark
          />
        </SectionSettings>
      )}
    </main>
  );
};

export default Membership;
