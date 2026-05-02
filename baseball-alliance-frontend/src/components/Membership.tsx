import React, { useRef, useState, useMemo, useCallback } from "react";
import { useLiveSiteConfig } from "../context/SiteEditModeContext";
import type { MembershipPagePayload } from "../lib/site";
import {
  mergeMembershipPage,
} from "../lib/membershipLeadershipPages";
import EditableText from "./site-inline/EditableText";
import { EditableMedia } from "./site-inline/EditableMedia";
import SectionSettings from "./site-inline/SectionSettings";
import { Field } from "./site-inline/siteEditorPrimitives";

const MEMBERSHIP_VIDEO_DEFAULT =
  "https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FBaseballAllianceWesbiteVideo22526.mp4?alt=media&token=dac0dd7f-db9a-4bdf-ad49-dcc7067f9c51";

function FeatureCardIcon() {
  return (
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );
}

const Membership: React.FC = () => {
  const { site, isContentEditUI, setDraftSite } = useLiveSiteConfig();
  const membershipHeaders = site?.headers;
  const header = useMemo(
    () => membershipHeaders?.find((h) => h.pageKey === "membership"),
    [membershipHeaders]
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

  const updateHeader = (
    patch: Partial<NonNullable<typeof header>>
  ) => {
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
        "min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white",
        isContentEditUI ? "ring-4 ring-inset ring-amber-400/40" : "",
      ].join(" ")}
    >
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-20 mt-24 relative scroll-mt-28">
          <div className="absolute -top-8 -left-4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#163968]" />
              <EditableText
                as="span"
                className="text-xs font-bold tracking-[0.2em] uppercase text-[#163968]/70"
                value={m.heroEyebrow ?? ""}
                placeholder="Eyebrow"
                fallback="Baseball Alliance"
                onChange={(v) => patchM((p) => ({ ...p, heroEyebrow: v || null }))}
              />
            </div>
            <EditableText
              as="h1"
              className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] tracking-tighter mb-6"
              value={header?.title ?? ""}
              placeholder="MEMBERSHIP"
              fallback="MEMBERSHIP"
              onChange={(v) => updateHeader({ title: v })}
            />
            <EditableText
              as="p"
              className="text-2xl text-gray-600 max-w-3xl leading-relaxed font-light mb-8"
              value={header?.subtitle ?? ""}
              placeholder="Subtitle paragraph"
              multiline
              fallback="Your membership unlocks verified performance data, elevated visibility, and access to education, college-matching tools, and exclusive experiences."
              onChange={(v) => updateHeader({ subtitle: v || null })}
            />
            <a
              href={membershipLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (isContentEditUI) e.preventDefault();
              }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#163968] to-blue-600 hover:from-[#163968] hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <EditableText
                value={m.heroCtaLabel ?? ""}
                placeholder="Button label"
                fallback="Join Membership"
                onChange={(v) =>
                  patchM((p) => ({ ...p, heroCtaLabel: v || null }))
                }
              />
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#163968] via-blue-500 to-red-500 rounded-full mt-8 shadow-lg shadow-blue-500/30" />
          </div>
        </header>

        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <EditableText
              as="h2"
              className="text-4xl font-black text-[#163968]"
              value={m.overviewSectionTitle ?? ""}
              placeholder="Section title"
              fallback="Membership Overview"
              onChange={(v) =>
                patchM((p) => ({ ...p, overviewSectionTitle: v || null }))
              }
            />
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white p-16 text-center shadow-lg shadow-black/5 border border-white/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,57,104,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

            <div className="relative">
              <EditableText
                as="h3"
                className="text-2xl font-bold text-[#163968] mb-4"
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
                className="aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden border-2 border-gray-300 shadow-xl bg-gradient-to-br from-[#163968]/90 via-blue-700/80 to-[#163968]/90"
              >
                <div className="aspect-video w-full h-full relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain absolute inset-0"
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
                      className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#163968] rounded-2xl"
                      aria-label="Play membership video"
                    >
                      <span className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200">
                        <svg
                          className="w-12 h-12 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
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
        </section>

        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <EditableText
              as="h2"
              className="text-4xl font-black text-[#163968]"
              value={m.whatsIncludedTitle ?? ""}
              placeholder="Section title"
              fallback="What's Included"
              onChange={(v) =>
                patchM((p) => ({ ...p, whatsIncludedTitle: v || null }))
              }
            />
          </div>

          <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <EditableText
                as="p"
                className="text-xl sm:text-2xl text-white font-semibold leading-relaxed text-center max-w-4xl mx-auto"
                value={m.introBlurb ?? ""}
                placeholder="Intro blurb"
                multiline
                fallback="Baseball Alliance Membership is designed to give players meaningful exposure and long-term support."
                onChange={(v) => patchM((p) => ({ ...p, introBlurb: v || null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {m.features.map((feat, idx) => (
              <div
                key={feat.id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {isContentEditUI && (
                  <button
                    type="button"
                    onClick={() =>
                      patchM((p) => ({
                        ...p,
                        features: p.features.filter((_, j) => j !== idx),
                      }))
                    }
                    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-red-400"
                  >
                    Remove
                  </button>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <FeatureCardIcon />
                  <EditableText
                    as="h3"
                    className="text-xl font-bold text-[#163968] mb-3"
                    value={feat.title}
                    placeholder="Card title"
                    onChange={(v) =>
                      patchM((p) => {
                        const features = [...p.features];
                        features[idx] = { ...features[idx], title: v };
                        return { ...p, features };
                      })
                    }
                  />
                  <EditableText
                    as="p"
                    className="text-gray-700 leading-relaxed text-sm"
                    value={feat.body}
                    placeholder="Card body"
                    multiline
                    onChange={(v) =>
                      patchM((p) => {
                        const features = [...p.features];
                        features[idx] = { ...features[idx], body: v };
                        return { ...p, features };
                      })
                    }
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
            {isContentEditUI && (
              <button
                type="button"
                onClick={() =>
                  patchM((p) => ({
                    ...p,
                    features: [
                      ...p.features,
                      {
                        id: `new-${Date.now()}`,
                        title: "New benefit",
                        body: "Describe what members receive.",
                      },
                    ],
                  }))
                }
                className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/30 text-amber-800 font-bold uppercase tracking-wide text-sm hover:bg-amber-50/60 transition"
              >
                + Add benefit card
              </button>
            )}
          </div>
        </section>

        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="relative">
              <EditableText
                as="h2"
                className="text-4xl font-black text-white mb-4"
                value={m.bottomCtaTitle ?? ""}
                placeholder="CTA headline"
                fallback="Ready to Elevate Your Game?"
                onChange={(v) =>
                  patchM((p) => ({ ...p, bottomCtaTitle: v || null }))
                }
              />
              <EditableText
                as="p"
                className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
                value={m.bottomCtaBody ?? ""}
                placeholder="CTA supporting copy"
                multiline
                fallback="Join Baseball Alliance Membership and unlock the tools, visibility, and community you need to reach the next level."
                onChange={(v) =>
                  patchM((p) => ({ ...p, bottomCtaBody: v || null }))
                }
              />
              <a
                href={membershipLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isContentEditUI) e.preventDefault();
                }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300 bg-white text-[#163968] shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105"
              >
                <EditableText
                  value={m.bottomCtaButtonLabel ?? ""}
                  placeholder="Button label"
                  fallback="Get Started Today"
                  onChange={(v) =>
                    patchM((p) => ({
                      ...p,
                      bottomCtaButtonLabel: v || null,
                    }))
                  }
                />
                <svg
                  className="w-6 h-6 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <div className="h-16" />
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
