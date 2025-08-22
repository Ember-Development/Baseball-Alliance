import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import ba from "../assets/baicon.png";
import ballWatermark from "../assets/baseballheader.png";
import barcodeImg from "../assets/barcode.png";

const EventSection: React.FC = () => {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date("2025-09-21T10:00:00")
  );

  return (
    <div id="events" className="mt-16 mx-auto max-w-7xl scroll-mt-24">
      {/* Header + countdown */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#163968]">
          Upcoming Event
        </h2>

        <div className="text-center sm:text-right">
          <div className="text-red-500 font-bold tabular-nums text-base sm:text-xl tracking-widest">
            {String(days).padStart(2, "0")} : {String(hours).padStart(2, "0")} :{" "}
            {String(minutes).padStart(2, "0")} :{" "}
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold text-[#163968] mt-1">
            Days&nbsp;&nbsp;Hours&nbsp;&nbsp;Minutes&nbsp;&nbsp;Seconds
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div className="mt-5">
        <RealTicket hologramLogo={ba} />
      </div>

      {/* baseline divider */}
      <div className="mt-6 h-px bg-black/10" />

      {/* Additional Events as stubs */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StubTicket
          title="Doubleheader Games"
          date="Sept 14, 2025"
          time="10:00 AM – 5:00 PM"
          venue="Waco, TX · McLennan CC & Waco Midway HS"
          serial="DBH-0914-25-001"
        />
        <StubTicket
          title="Doubleheader Games"
          date="Oct 19, 2025"
          time="10:00 AM – 5:00 PM"
          venue="Waco, TX · McLennan CC & Waco Midway HS"
          serial="DBH-1019-25-002"
        />
        <StubTicket
          title="Doubleheader Games"
          date="Oct 26, 2025"
          time="10:00 AM – 5:00 PM"
          venue="Waco, TX · McLennan CC & Waco Midway HS"
          serial="DBH-1019-25-003"
        />
      </div>
    </div>
  );
};

function RealTicket({ hologramLogo }: { hologramLogo?: string }) {
  return (
    <div
      className={[
        "relative mx-auto max-w-6xl md:min-h-[220px] lg:min-h-[240px] mt-6",
        "rounded-[18px] border border-black/20 bg-[#f7f3ea]",
        "shadow-[0_12px_30px_rgba(0,0,0,0.22)] overflow-hidden",
        "will-change-transform transition-transform duration-300 hover:-rotate-[0.25deg]",
      ].join(" ")}
      aria-label="Event ticket"
    >
      {/* Paper grain + tint (hyper-real stock) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 10%, rgba(255,255,255,0.2), rgba(255,255,255,0)) , linear-gradient(0deg, rgba(80,60,20,0.05), rgba(255,255,255,0.05))",
          mixBlendMode: "multiply",
        }}
      />
      {/* Very subtle noise (SVG data URI) */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0 0 0 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.08'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Grid: body | perf | stub */}
      <div className="relative grid grid-cols-1 md:grid-cols-[1.2fr_auto_260px]">
        {/* LEFT: Content */}
        <div className="relative p-4 sm:p-6">
          {/* Watermark ball (emboss look) */}
          <img
            src={ballWatermark}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -left-6 -bottom-12 opacity-20 sm:opacity-25 w-48 sm:w-56 h-auto"
            style={{
              mixBlendMode: "multiply",
              filter: "contrast(1.05) brightness(1.02)",
            }}
            loading="lazy"
          />

          {/* Embossed panel */}
          <div className="relative h-full rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 px-4 py-4 sm:px-5 sm:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] flex flex-col gap-3">
            <h3 className="text-lg sm:text-2xl font-extrabold tracking-wide text-[#162a4e] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
              Baseball Alliance Showcase
            </h3>

            <p className="text-sm sm:text-base text-black/70 leading-snug">
              An elite evaluation event where players showcase speed, power, arm
              strength, fielding, and hitting in front of college coaches and
              pro scouts. Verified results are recorded and shared to help
              athletes earn opportunities at the next level.
            </p>

            <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[15px]">
              <Line label="When" value="Sept 21, 2025 · 10:00 AM" />
              <Line
                label="Where"
                value="McLennan Community College · Waco, TX"
              />
            </div>

            {/* Serial + microtext */}

            {/* Desktop register */}
            <div className="hidden md:flex mt-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-[#163968] text-white font-semibold py-2 px-4 shadow hover:brightness-110 active:brightness-95 transition"
              >
                Register Now
              </a>
            </div>
          </div>

          {/* Hologram sticker (shimmer) */}
          {/* Hologram / client seal */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4">
            <HoloSeal logo={hologramLogo} />
          </div>
        </div>

        {/* MIDDLE: Perforation rail + die‑cut notches */}
        <div className="hidden md:flex relative items-stretch justify-center">
          {/* perforation dots */}
          <div className="relative w-[18px] mx-1">
            <div
              className="absolute inset-y-3 left-1/2 -translate-x-1/2 w-[2px]"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0 4px, rgba(0,0,0,0) 4px 10px)",
              }}
            />
          </div>
        </div>

        {/* RIGHT: Stub with rotated barcode */}
        <div className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-4">
          {/* Mobile register */}
          <a
            href="/register"
            className="md:hidden w-full inline-flex items-center justify-center rounded-md bg-[#163968] text-white font-semibold py-2.5 px-4 shadow hover:brightness-110 active:brightness-95 transition mb-3"
          >
            Register Now
          </a>

          {/* Rotated barcode */}
          <div className="w-full flex flex-col items-center justify-center gap-2">
            <img
              src={barcodeImg}
              alt="Event Ticket Barcode"
              className="object-contain w-44 h-16 sm:w-56 sm:h-20 md:w-auto md:h-[190px] lg:h-[210px] md:rotate-90"
              loading="lazy"
            />
            <span className="font-mono text-[11px] tracking-wide text-black/70">
              SN: BASC-0921-2025-WACO
            </span>
          </div>

          {/* stub edge highlight */}
          <div className="pointer-events-none absolute z-10 inset-y-0 right-0 w-px bg-black/30" />
        </div>
      </div>

      {/* sheen for holo */}
      <style>{`
        @keyframes sheen {
          0% { transform: translateX(-120%) skewX(-12deg); opacity: .0; }
          30% { opacity: .45; }
          70% { opacity: .45; }
          100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function HoloSeal({ logo }: { logo?: string }) {
  return (
    <div className="relative h-10 w-10 rounded-[6px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-1 ring-white/50">
      {/* base holographic backing */}
      <div
        className="absolute inset-0"
        style={{
          background: logo
            ? "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))"
            : "conic-gradient(from 0deg, #6ff, #f6f, #ff6, #6ff)",
          filter: logo
            ? "saturate(1) brightness(1)"
            : "saturate(0.9) brightness(0.95)",
        }}
      />
      {/* client logo (if provided) */}
      {logo && (
        <img
          src={logo}
          alt="Security seal"
          className="absolute inset-0 m-auto h-6 w-6 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
        />
      )}
      {/* moving sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
          transform: "translateX(-120%) skewX(-12deg)",
          animation: "sheen 4s linear infinite",
        }}
      />
      {/* soft glass on top */}
      <div className="absolute inset-0 bg-white/12" />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-baseline gap-2 leading-tight">
      <span className="text-red-700 font-semibold uppercase text-[12px] tracking-[0.25em]">
        {label}
      </span>
      <span className="text-black/80">{value}</span>
    </p>
  );
}

/** Stub with torn left edge + perforation dots + mini barcode */
function StubTicket({
  title,
  date,
  time,
  venue,
  serial,
}: {
  title: string;
  date: string;
  time: string;
  venue: string;
  serial: string;
}) {
  return (
    <div
      className="relative w-full max-w-md rounded-lg shadow-[0_6px_20px_rgba(0,0,0,0.25)] overflow-hidden transform hover:-rotate-1 transition"
      style={{ background: "#f7f3ea", border: "2px solid #162a4e" }}
    >
      <div className="grid grid-cols-[50px_1fr_auto]">
        {/* Left admit strip */}
        <div className="bg-[#162a4e] flex items-center justify-center px-1">
          <span className="text-white text-[11px] font-bold tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">
            ADMIT ONE
          </span>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-[#d24e3b] uppercase">
            {title}
          </h3>
          <p className="text-[13px] text-black/80 mt-1">
            {date} · {time}
          </p>
          <p className="text-[12px] text-black/70">{venue}</p>
          <span className="font-mono text-[10px] text-black/50 mt-2">
            {serial}
          </span>
        </div>
      </div>
    </div>
  );
}

export default EventSection;
