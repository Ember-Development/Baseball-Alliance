import React, { useState, useEffect, useMemo, useCallback } from "react";
import JohnImage from "../assets/leadership/John.png";
import BillImage from "../assets/leadership/Bill.png";
import KeithImage from "../assets/leadership/Keith.png";
import EddieCornblumImage from "../assets/leadership/Eddie Cornblum.png";
import { useLiveSiteConfig } from "../context/SiteEditModeContext";
import type {
  LeadershipPagePayload,
  LeadershipPersonPayload,
  LeadershipVideoPayload,
} from "../lib/site";
import { mergeLeadershipPage } from "../lib/membershipLeadershipPages";
import EditableText from "./site-inline/EditableText";
import { EditableMedia } from "./site-inline/EditableMedia";
import SectionSettings from "./site-inline/SectionSettings";
import { Field } from "./site-inline/siteEditorPrimitives";

const LEADER_IMG_FALLBACK: Record<string, string> = {
  "john-lindsley": JohnImage,
  "bill-bavasi": BillImage,
  "keith-jackson": KeithImage,
  "eddie-cornblum": EddieCornblumImage,
};

const VIDEO_POSTER_FALLBACK: Record<string, string> = {
  "john-lindsley-video": JohnImage,
  "eddie-cornblum-video": EddieCornblumImage,
};

function resolveLeaderPhoto(leader: LeadershipPersonPayload): string {
  return leader.imageUrl || LEADER_IMG_FALLBACK[leader.id] || "";
}

function resolveVideoPoster(video: LeadershipVideoPayload): string {
  return video.posterImageUrl || VIDEO_POSTER_FALLBACK[video.id] || "";
}

const Leadership: React.FC = () => {
  const { site, isContentEditUI, setDraftSite } = useLiveSiteConfig();
  const pageHeader = useMemo(
    () => site?.headers?.find((h) => h.pageKey === "leadership"),
    [site?.headers]
  );

  const L = useMemo(
    () => mergeLeadershipPage(site?.leadershipPage ?? null),
    [site?.leadershipPage]
  );

  const patchL = useCallback(
    (fn: (p: LeadershipPagePayload) => LeadershipPagePayload) => {
      setDraftSite((d) => {
        if (!d) return d;
        const cur = mergeLeadershipPage(d.leadershipPage ?? null);
        return { ...d, leadershipPage: fn(cur) };
      });
    },
    [setDraftSite]
  );

  const updatePageHeader = (
    patch: Partial<NonNullable<typeof pageHeader>>
  ) => {
    setDraftSite((d) => {
      if (!d) return d;
      const idx = d.headers.findIndex((h) => h.pageKey === "leadership");
      if (idx < 0) return d;
      const headers = [...d.headers];
      headers[idx] = { ...headers[idx], ...patch };
      return { ...d, headers };
    });
  };

  const patchLeader = useCallback(
    (
      list: "leadership" | "teamLeadership",
      index: number,
      patch: Partial<LeadershipPersonPayload>
    ) => {
      patchL((p) => {
        const arr = [...p[list]];
        arr[index] = { ...arr[index], ...patch };
        return { ...p, [list]: arr };
      });
    },
    [patchL]
  );

  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] =
    useState<LeadershipVideoPayload | null>(null);

  const toggleBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openVideoModal = (video: LeadershipVideoPayload) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVideoModalOpen) closeVideoModal();
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isVideoModalOpen]);

  useEffect(() => {
    if (isVideoModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVideoModalOpen]);

  const renderLeaderCard = (
    leader: LeadershipPersonPayload,
    list: "leadership" | "teamLeadership",
    index: number
  ) => {
    const isExpanded = expandedBios[leader.id];
    const bioLines = leader.fullBio.split("\n");
    const photoSrc = resolveLeaderPhoto(leader);

    return (
      <div
        key={leader.id}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/20 shadow-md hover:shadow-2xl border border-gray-200/60 transition-all duration-500"
      >
        {isContentEditUI && (
          <button
            type="button"
            onClick={() =>
              patchL((p) => ({
                ...p,
                [list]: p[list].filter((_, j) => j !== index),
              }))
            }
            className="absolute top-2 right-2 z-20 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-red-400"
          >
            Remove
          </button>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-red-500/0 group-hover:from-blue-600/5 group-hover:to-red-500/5 transition-all duration-700 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-6 p-6">
          <div className="relative shrink-0">
            {isContentEditUI ? (
              <EditableMedia
                kind="image"
                label="Replace photo"
                onChange={(url) => patchLeader(list, index, { imageUrl: url })}
                className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-500"
              >
                <img
                  src={photoSrc || "/placeholder-leader.jpg"}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23163968' width='128' height='128'/%3E%3C/svg%3E";
                  }}
                />
              </EditableMedia>
            ) : (
              <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-500">
                <img
                  src={photoSrc || "/placeholder-leader.jpg"}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23163968' width='128' height='128'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3E" +
                      leader.name.split(" ")[0] +
                      "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#163968] to-blue-500 rounded-full opacity-80" />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <EditableText
                  as="span"
                  className="text-xs font-bold text-[#163968]/60 uppercase tracking-widest"
                  value={leader.title}
                  placeholder="Role"
                  onChange={(v) => patchLeader(list, index, { title: v })}
                />
                <div className="h-px flex-1 bg-gradient-to-r from-[#163968]/20 to-transparent" />
              </div>
              <EditableText
                as="h3"
                className="text-2xl font-black text-[#163968] tracking-tight"
                value={leader.name}
                placeholder="Name"
                onChange={(v) => patchLeader(list, index, { name: v })}
              />
            </div>

            <EditableText
              as="p"
              className="text-sm text-gray-700 leading-relaxed mb-4"
              value={leader.shortBio}
              placeholder="Short bio"
              multiline
              onChange={(v) => patchLeader(list, index, { shortBio: v })}
            />

            {isContentEditUI && (
              <div className="mb-4 space-y-2">
                <Field
                  label="Optional embed / video URL (shown when bio expanded)"
                  value={leader.videoUrl ?? ""}
                  onChange={(v) =>
                    patchLeader(list, index, {
                      videoUrl: v || null,
                    })
                  }
                />
              </div>
            )}

            {isContentEditUI ? (
              <EditableText
                as="div"
                className="mb-4 rounded-xl bg-gradient-to-br from-blue-50/40 to-transparent p-4 border border-blue-100/50 text-sm text-gray-700 leading-relaxed min-h-[120px]"
                value={leader.fullBio}
                placeholder="Full bio (supports **bold** lines and • bullets)"
                multiline
                onChange={(v) => patchLeader(list, index, { fullBio: v })}
              />
            ) : (
              <>
                {isExpanded && (
                  <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50/40 to-transparent p-4 border border-blue-100/50 space-y-2.5">
                      {bioLines.map((line, idx) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p
                              key={idx}
                              className="font-bold text-[#163968] text-base mt-4 mb-2 flex items-center gap-2"
                            >
                              <span className="w-1 h-5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.trim().startsWith("•")) {
                          return (
                            <p
                              key={idx}
                              className="ml-4 flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="text-blue-500 text-lg leading-none mt-0.5">
                                •
                              </span>
                              <span>{line.replace("•", "").trim()}</span>
                            </p>
                          );
                        }
                        return line.trim() ? (
                          <p
                            key={idx}
                            className="text-sm text-gray-700 leading-relaxed"
                          >
                            {line}
                          </p>
                        ) : (
                          <div key={idx} className="h-1" />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {leader.videoUrl && isExpanded && !isContentEditUI && (
              <div className="mb-4">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <iframe
                    src={leader.videoUrl}
                    title={`${leader.name} Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {!isContentEditUI && (
              <button
                type="button"
                onClick={() => toggleBio(leader.id)}
                className="group/btn mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#163968] to-blue-600 hover:from-[#163968] hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 self-start"
              >
                {isExpanded ? "Show Less" : "Read Full Bio"}
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
                value={L.heroEyebrow ?? ""}
                placeholder="Eyebrow"
                fallback="About Baseball Alliance"
                onChange={(v) =>
                  patchL((p) => ({ ...p, heroEyebrow: v || null }))
                }
              />
            </div>
            <EditableText
              as="h1"
              className="text-6xl sm:text-7xl font-black text-[#163968] tracking-tighter mb-6"
              value={pageHeader?.title ?? ""}
              fallback="LEADERSHIP"
              placeholder="LEADERSHIP"
              onChange={(v) => updatePageHeader({ title: v })}
            />
            <EditableText
              as="p"
              className="text-2xl text-gray-600 max-w-3xl leading-relaxed font-light"
              value={pageHeader?.subtitle ?? ""}
              fallback="Meet the visionaries guiding the Baseball Alliance into the future."
              placeholder="Subtitle"
              multiline
              onChange={(v) => updatePageHeader({ subtitle: v || null })}
            />
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#163968] via-blue-500 to-red-500 rounded-full mt-8 shadow-lg shadow-blue-500/30" />
          </div>
        </header>

        <div className="mb-20 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-lg shadow-black/5 border border-white/60">
            <EditableText
              as="p"
              className="text-lg text-gray-700 leading-relaxed"
              value={L.introParagraph ?? ""}
              placeholder="Intro paragraph"
              multiline
              fallback="The Baseball Alliance is led by a group of seasoned executives..."
              onChange={(v) =>
                patchL((p) => ({ ...p, introParagraph: v || null }))
              }
            />
          </div>
        </div>

        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <EditableText
              as="h2"
              className="text-3xl font-black text-[#163968]"
              value={L.byTheNumbersTitle ?? ""}
              placeholder="Section title"
              fallback="By the Numbers"
              onChange={(v) =>
                patchL((p) => ({ ...p, byTheNumbersTitle: v || null }))
              }
            />
            <div className="h-px flex-1 bg-gradient-to-r from-[#163968]/20 to-transparent" />
            {isContentEditUI && (
              <button
                type="button"
                onClick={() =>
                  patchL((p) => ({
                    ...p,
                    stats: [
                      ...p.stats,
                      {
                        id: `stat-${Date.now()}`,
                        highlight: "New stat",
                        description: "Description",
                      },
                    ],
                  }))
                }
                className="shrink-0 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase text-slate-900"
              >
                + Stat
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {L.stats.map((stat, idx) => (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                {isContentEditUI && (
                  <button
                    type="button"
                    onClick={() =>
                      patchL((p) => ({
                        ...p,
                        stats: p.stats.filter((_, j) => j !== idx),
                      }))
                    }
                    className="absolute top-1 right-1 z-10 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                  >
                    ×
                  </button>
                )}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <EditableText
                    as="div"
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#163968] to-blue-600 mb-3"
                    value={stat.highlight}
                    placeholder="Highlight"
                    onChange={(v) =>
                      patchL((p) => {
                        const stats = [...p.stats];
                        stats[idx] = { ...stats[idx], highlight: v };
                        return { ...p, stats };
                      })
                    }
                  />
                  <EditableText
                    as="div"
                    className="text-sm text-gray-600 leading-snug font-medium"
                    value={stat.description}
                    placeholder="Description"
                    multiline
                    onChange={(v) =>
                      patchL((p) => {
                        const stats = [...p.stats];
                        stats[idx] = { ...stats[idx], description: v };
                        return { ...p, stats };
                      })
                    }
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        <section className="mb-20">
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full shrink-0" />
            <EditableText
              as="h2"
              className="text-4xl font-black text-[#163968] flex-1 min-w-[200px]"
              value={L.leadershipSectionTitle ?? ""}
              placeholder="Section title"
              fallback="Leadership"
              onChange={(v) =>
                patchL((p) => ({ ...p, leadershipSectionTitle: v || null }))
              }
            />
            {isContentEditUI && (
              <button
                type="button"
                onClick={() =>
                  patchL((p) => ({
                    ...p,
                    leadership: [
                      ...p.leadership,
                      {
                        id: `new-${Date.now()}`,
                        name: "New leader",
                        title: "Title",
                        shortBio: "",
                        fullBio: "",
                        imageUrl: null,
                        videoUrl: null,
                      },
                    ],
                  }))
                }
                className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase text-slate-900"
              >
                + Leader
              </button>
            )}
          </div>
          <div className="space-y-6">
            {L.leadership.map((leader, index) =>
              renderLeaderCard(leader, "leadership", index)
            )}
          </div>
        </section>

        <section className="mb-20">
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full shrink-0" />
            <EditableText
              as="h2"
              className="text-4xl font-black text-[#163968] flex-1 min-w-[200px]"
              value={L.teamLeadershipSectionTitle ?? ""}
              placeholder="Section title"
              fallback="Team Leadership & Operations"
              onChange={(v) =>
                patchL((p) => ({
                  ...p,
                  teamLeadershipSectionTitle: v || null,
                }))
              }
            />
            {isContentEditUI && (
              <button
                type="button"
                onClick={() =>
                  patchL((p) => ({
                    ...p,
                    teamLeadership: [
                      ...p.teamLeadership,
                      {
                        id: `new-${Date.now()}`,
                        name: "New leader",
                        title: "Title",
                        shortBio: "",
                        fullBio: "",
                        imageUrl: null,
                        videoUrl: null,
                      },
                    ],
                  }))
                }
                className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase text-slate-900"
              >
                + Team leader
              </button>
            )}
          </div>
          <div className="space-y-6">
            {L.teamLeadership.map((leader, index) =>
              renderLeaderCard(leader, "teamLeadership", index)
            )}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full shrink-0" />
            <EditableText
              as="h2"
              className="text-4xl font-black text-[#163968] flex-1"
              value={L.gallerySectionTitle ?? ""}
              placeholder="Section title"
              fallback="Gallery"
              onChange={(v) =>
                patchL((p) => ({ ...p, gallerySectionTitle: v || null }))
              }
            />
            {isContentEditUI && (
              <button
                type="button"
                onClick={() =>
                  patchL((p) => ({
                    ...p,
                    videos: [
                      ...p.videos,
                      {
                        id: `video-${Date.now()}`,
                        title: "New video",
                        name: "",
                        description: "",
                        videoUrl: "",
                        category: "Interview",
                        posterImageUrl: null,
                      },
                    ],
                  }))
                }
                className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase text-slate-900"
              >
                + Video
              </button>
            )}
          </div>

          <div className="space-y-6">
            {L.videos.map((video, index) => (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                onClick={() => !isContentEditUI && openVideoModal(video)}
                onKeyDown={(e) => {
                  if (!isContentEditUI && (e.key === "Enter" || e.key === " "))
                    openVideoModal(video);
                }}
                className={[
                  "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-white shadow-lg shadow-black/5 border border-white/60 transition-all duration-300",
                  isContentEditUI
                    ? "cursor-default ring-2 ring-amber-400/40"
                    : "hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer",
                ].join(" ")}
              >
                {isContentEditUI && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      patchL((p) => ({
                        ...p,
                        videos: p.videos.filter((_, j) => j !== index),
                      }));
                    }}
                    className="absolute top-2 right-2 z-20 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase text-white"
                  >
                    Remove video
                  </button>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-red-500/0 group-hover:from-blue-600/5 group-hover:to-red-500/5 transition-all duration-700 pointer-events-none" />

                <div className="relative p-6 md:flex md:items-center md:gap-6">
                  <div className="relative md:w-80 shrink-0 mb-4 md:mb-0">
                    {isContentEditUI ? (
                      <EditableMedia
                        kind="image"
                        label="Poster"
                        className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/80 bg-gradient-to-br from-gray-900 to-gray-800 aspect-video"
                        onChange={(url) =>
                          patchL((p) => {
                            const videos = [...p.videos];
                            videos[index] = {
                              ...videos[index],
                              posterImageUrl: url,
                            };
                            return { ...p, videos };
                          })
                        }
                      >
                        <div className="relative rounded-xl overflow-hidden aspect-video">
                          <img
                            src={resolveVideoPoster(video)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </EditableMedia>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/80 bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                        <video
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        >
                          <source
                            src={`${video.videoUrl}#t=2.5`}
                            type="video/mp4"
                          />
                          <source
                            src={`${video.videoUrl}#t=2.5`}
                            type="video/quicktime"
                          />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <svg
                              className="w-8 h-8 text-[#163968] ml-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-semibold">
                          Video
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {isContentEditUI && (
                      <Field
                        label="Video file URL"
                        value={video.videoUrl}
                        onChange={(v) =>
                          patchL((p) => {
                            const videos = [...p.videos];
                            videos[index] = { ...videos[index], videoUrl: v };
                            return { ...p, videos };
                          })
                        }
                      />
                    )}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {index === 0 && !isContentEditUI && (
                        <>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#163968] to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                            Featured
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                        </>
                      )}
                      <EditableText
                        as="span"
                        className="text-xs text-gray-500 font-medium"
                        value={video.category}
                        placeholder="Category"
                        onChange={(v) =>
                          patchL((p) => {
                            const videos = [...p.videos];
                            videos[index] = { ...videos[index], category: v };
                            return { ...p, videos };
                          })
                        }
                      />
                    </div>
                    <EditableText
                      as="h3"
                      className="text-2xl font-black text-[#163968] tracking-tight mb-2"
                      value={video.title}
                      placeholder="Video title"
                      onChange={(v) =>
                        patchL((p) => {
                          const videos = [...p.videos];
                          videos[index] = { ...videos[index], title: v };
                          return { ...p, videos };
                        })
                      }
                    />
                    <EditableText
                      as="p"
                      className="text-sm text-gray-600 leading-relaxed mb-4"
                      value={video.description}
                      placeholder="Description"
                      multiline
                      onChange={(v) =>
                        patchL((p) => {
                          const videos = [...p.videos];
                          videos[index] = {
                            ...videos[index],
                            description: v,
                          };
                          return { ...p, videos };
                        })
                      }
                    />
                    {!isContentEditUI && (
                      <div className="flex items-center gap-2 text-[#163968] text-sm font-semibold group-hover:gap-3 transition-all">
                        <span>Click to watch</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-3xl bg-gradient-to-br from-white via-blue-50/20 to-white p-12 text-center shadow-lg shadow-black/5 border border-white/60 border-dashed relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,57,104,0.03),transparent_70%)]" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#163968]/10 to-blue-500/10 mb-4">
                  <svg
                    className="w-8 h-8 text-[#163968]/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                {(isContentEditUI ||
                  (L.galleryPlaceholderTitle ?? "").trim().length > 0) && (
                  <EditableText
                    as="h3"
                    className="text-lg font-black text-[#163968]/80 mb-2 max-w-lg mx-auto"
                    value={L.galleryPlaceholderTitle ?? ""}
                    placeholder="Placeholder heading (optional)"
                    onChange={(v) =>
                      patchL((p) => ({
                        ...p,
                        galleryPlaceholderTitle: v || null,
                      }))
                    }
                  />
                )}
                <EditableText
                  as="p"
                  className="text-gray-500 text-base font-medium max-w-lg mx-auto"
                  value={L.galleryPlaceholderBody ?? ""}
                  placeholder="Placeholder message"
                  multiline
                  fallback="More leadership moments, team events, and interviews coming soon."
                  onChange={(v) =>
                    patchL((p) => ({
                      ...p,
                      galleryPlaceholderBody: v || null,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </section>

      {isVideoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeVideoModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-6xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 group"
              aria-label="Close video"
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-4 mt-12">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#163968] to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                  Video
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="text-xs text-white/80 font-medium">
                  {selectedVideo.category}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {selectedVideo.title}
              </h3>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <div className="aspect-video">
                <video
                  key={selectedVideo.id}
                  controls
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  <source
                    src={selectedVideo.videoUrl}
                    type="video/quicktime"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-white/70">
                Press ESC or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}

      {isContentEditUI && (
        <SectionSettings
          label="Leadership settings"
          positionCls="fixed bottom-24 right-6"
        >
          <Field
            label="Header image URL"
            value={pageHeader?.imageUrl ?? ""}
            onChange={(v) => updatePageHeader({ imageUrl: v || null })}
            dark
          />
        </SectionSettings>
      )}
    </main>
  );
};

export default Leadership;
