import React, { useState, useMemo, useCallback } from "react";
import BA1 from "../assets/ba-teams.jpg";
import BA2 from "../assets/ba-showcase.jpg";
import BA3 from "../assets/ba-education.png";
import CardCarousel from "./ui/carousel";
import { useLiveSiteConfig } from "../context/SiteEditModeContext";
import EditableText from "./site-inline/EditableText";
import { EditableMedia } from "./site-inline/EditableMedia";
import type { WhoWeAreSectionPayload } from "../lib/site";
import { resolveWhoWeAreSectionsForSite } from "../lib/whoWeAreSections";

type ImageCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  editable?: {
    onChangeTitle: (v: string) => void;
    onChangeDescription: (v: string) => void;
    onChangeImage: (url: string) => void;
    onRemove: () => void;
  };
};

const ImageCard: React.FC<ImageCardProps> = ({
  title,
  description,
  imageUrl,
  editable,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false); // for mobile tap

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setOpen(false);
      }}
      onClick={() => setOpen((s) => !s)} // tap toggles desc on touch
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
      className="relative overflow-hidden rounded-2xl group shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-transform duration-300 ease-out cursor-pointer"
    >
      {/* Glow border */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute -inset-px rounded-2xl animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ef4444_0%,#ffffff_25%,#ef4444_50%,#ffffff_75%,#ef4444_100%)] opacity-50" />
      </div>

      {/* Image */}
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
        {editable ? (
          <EditableMedia
            kind="image"
            label="Replace image"
            onChange={editable.onChangeImage}
            className="h-full w-full"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </EditableMedia>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>

      {/* Stronger gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      {/* Title (always at bottom before hover) */}
      <div className="absolute left-4 right-4 bottom-3 text-white">
        {editable ? (
          <EditableText
            as="h3"
            value={title}
            placeholder="Card title"
            className="font-semibold leading-snug drop-shadow-md"
            onChange={editable.onChangeTitle}
          />
        ) : (
          <h3
            className={[
              "font-semibold leading-snug drop-shadow-md",
              "transition-opacity duration-300",
              "group-hover:opacity-0 md:group-hover:opacity-0",
              open ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            {title}
          </h3>
        )}
      </div>

      {/* Description panel – glass, larger text, better contrast */}
      <div
        className={[
          "absolute left-3 right-3 bottom-3",
          "rounded-xl px-4 py-3",
          "bg-white/10 backdrop-blur-md ring-1 ring-white/15",
          "text-white text-[0.925rem] leading-snug",
          "shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
          "transition-all duration-300",
          editable
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0",
          !editable && open ? "opacity-100 translate-y-0" : "",
        ].join(" ")}
      >
        {editable ? (
          <EditableText
            as="p"
            value={description}
            placeholder="Card description"
            multiline
            className="[text-shadow:_0_1px_2px_rgba(0,0,0,0.55)]"
            onChange={editable.onChangeDescription}
          />
        ) : (
          <p className="[text-shadow:_0_1px_2px_rgba(0,0,0,0.55)]">
            {description}
          </p>
        )}
      </div>

      {editable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            editable.onRemove();
          }}
          className="absolute top-2 right-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg hover:bg-red-400"
        >
          Remove
        </button>
      )}
    </div>
  );
};

const WhoWeAre: React.FC = () => {
  const { site, isContentEditUI, setDraftSite } = useLiveSiteConfig();

  const updateImageAt = (
    idx: number,
    patch: Partial<NonNullable<typeof site>["whoWeAreImages"][number]>
  ) => {
    setDraftSite((d) => {
      if (!d) return d;
      const whoWeAreImages = [...d.whoWeAreImages];
      const current = whoWeAreImages[idx];
      if (!current) return d;
      whoWeAreImages[idx] = { ...current, ...patch };
      return { ...d, whoWeAreImages };
    });
  };

  const removeImageAt = (idx: number) => {
    setDraftSite((d) => {
      if (!d) return d;
      const whoWeAreImages = d.whoWeAreImages.filter((_, i) => i !== idx);
      return { ...d, whoWeAreImages };
    });
  };

  const addImage = () => {
    setDraftSite((d) =>
      d
        ? {
            ...d,
            whoWeAreImages: [
              ...d.whoWeAreImages,
              {
                id: `new-${Date.now()}`,
                url: "https://via.placeholder.com/800x500?text=New+card",
                alt: "",
                title: "New card",
                body: "",
                order: d.whoWeAreImages.length,
              },
            ],
          }
        : d
    );
  };

  type CardItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    srcIndex?: number;
  };

  const items: CardItem[] = useMemo(() => {
    const imgs = site?.whoWeAreImages ?? [];
    if (imgs.length > 0) {
      return [...imgs]
        .sort((a, b) => a.order - b.order)
        .map((img, i) => ({
          id: img.id || String(i),
          title: img.title || img.alt || `Card ${i + 1}`,
          description: img.body || "",
          imageUrl: img.url,
          srcIndex: site?.whoWeAreImages.findIndex((x) => x.id === img.id),
        }));
    }
    return [
      {
        id: "1",
        title: "Invite-Only Alliance Top Select Teams",
        description:
          "We facilitate a beneficial, thoughtful and candid understanding of the best information — and present solutions in that context for our members and supporters.",
        imageUrl: BA1,
      },
      {
        id: "2",
        title: "Elite Tournaments & Individual Showcases",
        description:
          "Continuously improving the landscape of clinics, tournaments and showcases is essential to our effectiveness, and we will always hold ourselves to the highest level of accountability.",
        imageUrl: BA2,
      },
      {
        id: "3",
        title: "Athlete Education Workshops & Guides",
        description:
          "Who provides instruction, what values guide decisions, when to practice, play and learn, where to compete and get seen, and how to navigate development, metrics, recruiting, pro avenues, transfer portal, NIL, media and representation — all matter.",
        imageUrl: BA3,
      },
    ];
  }, [site?.whoWeAreImages]);

  const sections = useMemo(
    () => (site ? resolveWhoWeAreSectionsForSite(site) : []),
    [site?.whoWeAre, site?.whoWeAreSections]
  );

  const patchSections = useCallback(
    (fn: (prev: WhoWeAreSectionPayload[]) => WhoWeAreSectionPayload[]) => {
      setDraftSite((d) => {
        if (!d) return d;
        const prev = resolveWhoWeAreSectionsForSite(d);
        return { ...d, whoWeAreSections: fn(prev) };
      });
    },
    [setDraftSite]
  );

  return (
    <section
      id="about us"
      className={[
        "relative mx-auto max-w-7xl px-4 lg:px-0 mt-16",
        isContentEditUI ? "rounded-2xl ring-4 ring-amber-400/40 p-2" : "",
        // subtle background flair behind the section
        "before:absolute before:inset-0 before:-z-10",
      ].join(" ")}
    >
      {/* Eyebrow + Heading */}
      <div className="mb-2">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#163968]/80">
          About Baseball Alliance
        </span>
        <h2 className="mt-2 text-3xl md:text-4xl text-[#163968] font-extrabold tracking-tight">
          Who We Are
        </h2>
      </div>

      {/* Accent divider */}
      <div className="h-[3px] w-24 bg-gradient-to-r from-[#163968] via-[#3b82f6] to-[#ef4444] rounded-full mb-6" />

      {/* Repeatable lead / body text sections */}
      <div className="md:pr-6 md:max-w-6xl space-y-5">
        {sections.map((sec, idx) => (
          <div key={sec.id} className="relative">
            {isContentEditUI && (
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800">
                  Style
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal normal-case text-slate-900"
                    value={sec.variant}
                    onChange={(e) =>
                      patchSections((prev) => {
                        const next = [...prev];
                        next[idx] = {
                          ...next[idx],
                          variant: e.target
                            .value as WhoWeAreSectionPayload["variant"],
                        };
                        return next;
                      })
                    }
                  >
                    <option value="lead">Lead (large / bold)</option>
                    <option value="body">Body</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="text-xs font-bold uppercase text-red-600 hover:text-red-500"
                  onClick={() =>
                    patchSections((prev) => prev.filter((_, j) => j !== idx))
                  }
                >
                  Remove section
                </button>
              </div>
            )}
            <EditableText
              as="p"
              className={
                sec.variant === "lead"
                  ? "text-[#1E1E1E] text-2xl md:text-[1.65rem] leading-snug font-bold"
                  : "text-[#1E1E1E]/90 text-lg md:text-xl leading-8"
              }
              value={sec.body}
              placeholder={
                sec.variant === "lead"
                  ? "Lead paragraph"
                  : "Supporting paragraph"
              }
              multiline
              onChange={(v) =>
                patchSections((prev) => {
                  const next = [...prev];
                  next[idx] = { ...next[idx], body: v };
                  return next;
                })
              }
            />
          </div>
        ))}
        {isContentEditUI && (
          <button
            type="button"
            onClick={() =>
              patchSections((prev) => [
                ...prev,
                {
                  id: `wwa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  variant: "body",
                  body: "",
                },
              ])
            }
            className="inline-flex items-center rounded-full border-2 border-dashed border-amber-400/80 bg-amber-50/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-900 hover:bg-amber-50/70 transition"
          >
            + Add text section
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div className="mt-10 grid items-start gap-8 md:grid-cols-[380px,1fr]">
        {/* Spacer column to keep the asymmetry feel */}
        <div className="hidden md:block" />

        <div>
          {/* Desktop 3-up */}
          <div className="hidden sm:grid grid-cols-3 gap-6">
            {items.map((item) => (
              <ImageCard
                key={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                editable={
                  isContentEditUI && typeof item.srcIndex === "number"
                    ? {
                        onChangeTitle: (v) =>
                          updateImageAt(item.srcIndex!, { title: v || null }),
                        onChangeDescription: (v) =>
                          updateImageAt(item.srcIndex!, { body: v || null }),
                        onChangeImage: (url) =>
                          updateImageAt(item.srcIndex!, { url }),
                        onRemove: () => removeImageAt(item.srcIndex!),
                      }
                    : undefined
                }
              />
            ))}
            {isContentEditUI && (
              <button
                type="button"
                onClick={addImage}
                className="aspect-[16/10] flex items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-50/30 text-amber-700 font-bold uppercase tracking-wide text-sm hover:bg-amber-50/60 transition"
              >
                + Add card
              </button>
            )}
          </div>

          {/* Mobile horizontal scroll (titles visible; tap reveals desc) */}
          <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            <CardCarousel
              items={items.map((i) => ({
                id: i.id,
                title: i.title,
                image: i.imageUrl,
                description: i.description,
              }))}
              cardPercent={82}
            />
            <p className="mt-3 text-xs text-gray-600">
              Tap a card to read more.
            </p>
          </div>
        </div>
      </div>

      {/* Value strip (lightweight, no new components) */}
      {/* <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Player‑First Pathways:</span>{" "}
            development, exposure, and decisions rooted in long‑term growth.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Credible Events:</span> clinics,
            tournaments, showcases — held to measurable standards.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Clarity & Education:</span> metrics,
            recruiting, NIL, transfer portal, pro avenues, and media.
          </p>
        </div>
      </div> */}

      {/* Concluding statement */}
      <div className="mt-10 rounded-2xl bg-[#163968]/5 p-6 ring-1 ring-[#163968]/10">
        <p className="text-[#1E1E1E] leading-7">
          <strong>The bottom line:</strong> We prioritize quality over
          one‑size‑fits‑all baseball. This is about kids’ journeys, not cattle.
          Our mandate is to make a difference for the better and respect the
          realities families, players and teams face year‑round, on and off the
          fields. Baseball Alliance is interested in one outcome:{" "}
          <em>Baseball Alliance. Creating Better Results.</em>
        </p>
      </div>

    </section>
  );
};

export default WhoWeAre;
