// src/components/MobileScroller.tsx
import { useState, type Key } from "react";

type CarouselItem = {
  id: Key;
  image: string;
  title?: string;
  /** NEW: description shows on tap */
  description?: string;
  href?: string;
  subtitle?: string; // still supported if you use it elsewhere
};

type Props = {
  items: CarouselItem[];
  className?: string;
  /** width of each card as % of the viewport container */
  cardPercent?: number; // e.g. 56
  showDots?: boolean;
};

export default function MobileScroller({
  items,
  className = "",
  cardPercent = 56,
  showDots = true,
}: Props) {
  const [activeId, setActiveId] = useState<Key | null>(null);

  return (
    <div className={`relative w-full max-w-full overflow-hidden ${className}`}>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

      <div
        className="
          no-scrollbar flex gap-4 w-full
          py-2 px-2
          overflow-x-auto touch-pan-x
          snap-x snap-mandatory scroll-smooth
          [scrollbar-width:none] [-ms-overflow-style:none]
        "
        style={{
          WebkitOverflowScrolling: "touch",
          // centers the snap card
          scrollPaddingLeft: `calc((100% - ${cardPercent}%) / 2)`,
          scrollPaddingRight: `calc((100% - ${cardPercent}%) / 2)`,
        }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

        {items.map((it) => {
          const isOpen = activeId === it.id;
          return (
            <article
              key={it.id}
              className="min-w-0 shrink-0 snap-center"
              style={{
                flex: `0 0 ${cardPercent}%`,
                maxWidth: `${cardPercent}%`,
              }}
            >
              {/* Use a button for tap + a11y */}
              <button
                type="button"
                onClick={() =>
                  setActiveId((prev) => (prev === it.id ? null : it.id))
                }
                aria-expanded={isOpen}
                aria-label={
                  isOpen
                    ? `Hide details for ${it.title ?? "card"}`
                    : `Show details for ${it.title ?? "card"}`
                }
                className="block h-full w-full text-left"
              >
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-black/5">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={it.image}
                      alt={it.title || ""}
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      style={{ imageRendering: "auto" }}
                    />
                  </div>

                  {(it.title || it.description || it.subtitle) && (
                    <div className="relative">
                      {/* Title row – fades when open */}
                      {it.title && (
                        <h3
                          className={[
                            "p-3 text-sm font-semibold text-gray-900 transition-opacity duration-200",
                            isOpen ? "opacity-0" : "opacity-100",
                          ].join(" ")}
                        >
                          {it.title}
                        </h3>
                      )}

                      {/* Tap-reveal description panel */}
                      {(it.description || it.subtitle) && (
                        <div
                          className={[
                            "pointer-events-none absolute inset-x-2 bottom-2",
                            "rounded-xl px-3 py-3",
                            "bg-black/60 backdrop-blur-md ring-1 ring-white/15",
                            "text-white text-[0.925rem] leading-snug",
                            "shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
                            "transition-all duration-200",
                            isOpen
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2",
                          ].join(" ")}
                        >
                          <p className="[text-shadow:_0_1px_2px_rgba(0,0,0,0.55)]">
                            {it.description ?? it.subtitle}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </div>

      {showDots && (
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className={[
                "h-1.5 w-1.5 rounded-full bg-black/20",
                // you could highlight the nearest snap, but keeping simple here
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
