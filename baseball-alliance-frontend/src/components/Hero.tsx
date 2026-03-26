import React, { useEffect, useState } from "react";

// New assets
import heroVideoDesktop from "../assets/BAv5.mp4";
import heroVideoMobile from "../assets/BAv5Vert.mp4";
// optional poster (same for both, or add mobile/desktop variants if you have them)
import heroPoster from "../assets/baseballheader.png";

const Hero: React.FC = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect system "Reduce Motion" setting
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) {
      setReduceMotion(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, []);

  return (
    <section className="relative h-screen w-screen overflow-hidden">
      {/* Desktop video (md and up) */}
      <video
        className="absolute inset-0 z-0 hidden md:block h-full w-full object-cover"
        src={heroVideoDesktop}
        poster={heroPoster}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Mobile video (below md) */}
      <video
        className="absolute inset-0 z-0 md:hidden h-full w-full object-cover"
        src={heroVideoMobile}
        poster={heroPoster}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Overlay (tint) */}
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* Foreground content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <p className="mb-4 text-sm uppercase tracking-widest">
          An invite-only network for the nation’s top youth talent
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
          Elevate Your Game
          <br />
          With Baseball Alliance
        </h1>
        <button className="mb-10 rounded-full bg-gradient-to-r from-blue-500 to-red-500 px-6 py-3 uppercase tracking-wide text-white transition hover:opacity-90">
          Learn More
        </button>
        <div className="animate-bounce">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
