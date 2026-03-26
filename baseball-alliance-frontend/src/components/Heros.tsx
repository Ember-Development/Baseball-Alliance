import React, { useEffect, useState, useRef } from "react";
import heroVideoDesktop from "../assets/BA-Teaser-v4.mov";
import heroVideoMobile from "../assets/BAVert.mp4";
import heroPoster from "../assets/baseballheader.png";

const NAV_HEIGHT = 80; // matches your h-20 navbar

const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [startVideo, setStartVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atTop, setAtTop] = useState(true); // <-- NEW
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // screen breakpoint
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // lazy-start video for faster first paint
  useEffect(() => {
    const id = setTimeout(() => setStartVideo(true), 50);
    return () => clearTimeout(id);
  }, []);

  // scroll progress + top detection (ONE listener)
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 1;
      const y = window.scrollY;
      setProgress(Math.min(1, Math.max(0, y / h)));
      setAtTop(y < 8); // <-- toggle near top
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // keyboard shortcut: Space / ArrowDown to go to #events
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if ([" ", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        scrollToId("events");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // parallax tilt
  const handleMove = (clientX: number, clientY: number) => {
    const w = window.innerWidth,
      h = window.innerHeight;
    const x = (clientX / w - 0.5) * 6;
    const y = (clientY / h - 0.5) * -6;
    setTilt({ x, y });
  };
  const onMouseMove: React.MouseEventHandler = (e) =>
    handleMove(e.clientX, e.clientY);
  const onTouchMove: React.TouchEventHandler = (e) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const hour = new Date().getHours();
  const isDay = hour >= 7 && hour < 18;
  const dayOverlay =
    "bg-[radial-gradient(80%_120%_at_50%_110%,rgba(255,220,150,0.15),transparent)]";
  const nightOverlay =
    "bg-[radial-gradient(80%_120%_at_50%_110%,rgba(50,80,255,0.15),transparent)]";

  return (
    <section
      ref={heroRef}
      className="relative w-screen h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Media layer */}
      {reduceMotion || !startVideo ? (
        <img
          src={heroPoster}
          alt=""
          className="absolute inset-0 z-20 w-full h-full object-cover"
        />
      ) : (
        <video
          src={isMobile ? heroVideoMobile : heroVideoDesktop}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disableRemotePlayback
          className={`absolute inset-0 z-20 w-full h-full object-cover ${
            isMobile ? "object-[center_30%]" : ""
          }`}
        />
      )}

      {/* Global tint */}
      <div className="absolute inset-0 z-30 bg-black/20 pointer-events-none" />
      {/* Time-of-day color grade */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none ${
          isDay ? dayOverlay : nightOverlay
        }`}
      />

      {/* Bottom scrim */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 z-35 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0))",
        }}
      />

      {/* Center overlay (parallax hook point) */}
      <div className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none">
        <div
          style={{
            transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
          className="transition-transform duration-150 will-change-transform pointer-events-auto"
        >
          {/* place logo/heading/cta here */}
        </div>
      </div>

      {/* Scroll progress rail */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-40 bg-white/20">
        <div
          className="h-full bg-white/80 transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Scroll-down indicator — fades out/in smoothly */}
      <button
        onClick={() => scrollToId("events")}
        aria-label="Scroll to events"
        aria-hidden={!atTop}
        className={[
          "group absolute left-1/2 bottom-6 -translate-x-1/2 z-40 flex flex-col items-center gap-2",
          "text-white/90 transition-opacity duration-500 ease-out",
          atTop
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none translate-y-1",
        ].join(" ")}
      >
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold opacity-90 group-hover:opacity-100">
          Scroll Down
        </span>
        <div className="relative rounded-full border border-white/30 bg-white/20 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.45)] p-3">
          <div className="flex flex-col items-center justify-center h-7 w-7">
            <Chevron style={{ animationDelay: "0ms" }} />
            <div className="-mt-1">
              <Chevron style={{ animationDelay: "200ms" }} />
            </div>
            <div className="-mt-1">
              <Chevron style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        </div>
      </button>

      {/* keyframes */}
      <style>{`
        @keyframes drip {
          0%   { transform: translateY(-4px); opacity: 0; }
          20%  { opacity: 1; }
          60%  { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .drip { animation: none !important; }
          .transition-opacity { transition: none !important; }
        }
      `}</style>
    </section>
  );
};

function Chevron({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 drip"
      style={{ animation: "drip 1.6s infinite", ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default Hero;
