// src/components/MobileScroller.tsx
import type { Key } from "react";

type CarouselItem = {
  id: Key;
  href?: string;
  title?: string;
  subtitle?: string;
  image: string;
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
  cardPercent = 56, // smaller default (was 68)
  showDots = true,
}: Props) {
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

        {items.map((it) => (
          <article
            key={it.id}
            className="min-w-0 shrink-0 snap-center"
            style={{
              flex: `0 0 ${cardPercent}%`,
              maxWidth: `${cardPercent}%`,
            }}
          >
            <a className="block h-full" aria-label={it.title}>
              <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-black/5">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={it.image}
                    alt={it.title || ""}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                    style={{
                      imageRendering: "auto", // preserves smooth edges
                    }}
                  />
                </div>
                {(it.title || it.subtitle) && (
                  <div className="p-3">
                    {it.title && (
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {it.title}
                      </h3>
                    )}
                    {it.subtitle && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {it.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </a>
          </article>
        ))}
      </div>

      {showDots && (
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-black/20" />
          ))}
        </div>
      )}
    </div>
  );
}
