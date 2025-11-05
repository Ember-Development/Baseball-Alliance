import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import ba from "../assets/baicon.png";
import ballWatermark from "../assets/baseballheader.png";
import barcodeImg from "../assets/barcode.png";

type ShowcaseEvent = {
  title: string;
  description: string;
  date: string;
  dateForCountdown: Date;
  time: string;
  venue: string;
  serial: string;
  registerUrl: string;
};

const EventSection: React.FC = () => {
  const SEE_ALL_EVENTS_URL = "https://events.baseballalliance.co/";

  // Array of showcase events - add more as needed
  const showcases: ShowcaseEvent[] = [
    {
      title: "Baseball Alliance EPCC Showcase: El Paso Community College",
      description:
        "An elite evaluation event where players showcase speed, power, arm strength, fielding, and hitting in front of college coaches and pro scouts. Verified results are recorded and shared to help athletes earn opportunities at the next level.",
      date: "November 22-23, 2025",
      dateForCountdown: new Date("2025-11-22T09:00:00"),
      time: "9:00 AM",
      venue: "El Paso Community College · El Paso, TX",
      serial: "BASC-0921-2025-TX",
      registerUrl: "https://events.baseballalliance.co/",
    },
    {
      title: "Baseball Alliance MCC Showcase",
      description:
        "An elite evaluation event where players showcase speed, power, arm strength, fielding, and hitting in front of college coaches and pro scouts. Verified results are recorded and shared to help athletes earn opportunities at the next level.",
      date: "December 20, 2025",
      dateForCountdown: new Date("2025-12-20T09:00:00"),
      time: "9:00 AM",
      venue: "Mcclennan CC · Waco, TX",
      serial: "BASC-1220-2025-TX",
      registerUrl:
        "https://events.baseballalliance.co/events/baseball-alliance-showcase-el-paso-tx-el-paso-tx-11-22-2025",
    },
    // Add more showcases here as needed
  ];

  // Use the first showcase for the countdown
  const upcomingShowcase = showcases[0];
  const { days, hours, minutes, seconds } = useCountdown(
    upcomingShowcase.dateForCountdown
  );

  // Stub events array - empty for now, add events as needed
  const stubEvents: Array<{
    title: string;
    date: string;
    time: string;
    venue: string;
    serial: string;
    href: string;
  }> = [];

  return (
    <div id="events" className="mt-16 mx-auto max-w-7xl scroll-mt-24">
      {/* Header + countdown */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#163968]">
            {showcases.length > 1 ? "Upcoming Events" : "Upcoming Event"}
          </h2>

          <a
            href={SEE_ALL_EVENTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] sm:text-sm font-semibold text-[#163968] hover:underline"
            aria-label="See all events (opens in a new tab)"
          >
            See all events
            <svg width="14" height="14" viewBox="0 0 24 24" className="-mr-0.5">
              <path
                fill="currentColor"
                d="M14 3h7v7h-2V6.41l-9.3 9.3-1.4-1.42 9.29-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"
              />
            </svg>
          </a>
        </div>

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

      {/* Featured Showcase */}
      <div className="mt-5">
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Event
          </span>
        </div>
        <RealTicket
          hologramLogo={ba}
          title={upcomingShowcase.title}
          description={upcomingShowcase.description}
          date={upcomingShowcase.date}
          time={upcomingShowcase.time}
          venue={upcomingShowcase.venue}
          serial={upcomingShowcase.serial}
          registerUrl={upcomingShowcase.registerUrl}
        />
      </div>

      {/* Additional Showcases - Modern Grid */}
      {showcases.length > 1 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-[#163968]">
              More Upcoming Showcases
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#163968]/20 to-transparent" />
          </div>

          {/* Grid of additional showcases */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {showcases.slice(1).map((showcase) => (
              <div
                key={showcase.serial}
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <RealTicket
                  hologramLogo={ba}
                  title={showcase.title}
                  description={showcase.description}
                  date={showcase.date}
                  time={showcase.time}
                  venue={showcase.venue}
                  serial={showcase.serial}
                  registerUrl={showcase.registerUrl}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Events as stubs - only renders if stubEvents has items */}
      {stubEvents.length > 0 && (
        <>
          <div className="mt-6 h-px bg-black/10" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {stubEvents.map((e) => (
              <StubTicket
                key={e.serial}
                title={e.title}
                date={e.date}
                time={e.time}
                venue={e.venue}
                serial={e.serial}
                href={e.href}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function RealTicket({
  hologramLogo,
  title,
  description,
  date,
  time,
  venue,
  serial,
  registerUrl,
}: {
  hologramLogo?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  serial: string;
  registerUrl: string;
}) {
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
              {title}
            </h3>

            <p className="text-sm sm:text-base text-black/70 leading-snug">
              {description}
            </p>

            <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[15px]">
              <Line label="When" value={`${date} · ${time}`} />
              <Line label="Where" value={venue} />
            </div>

            {/* Serial + microtext */}

            {/* Desktop register */}
            <div className="hidden md:flex mt-3">
              <a
                href={registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-[#163968] text-white font-semibold py-2 px-4 shadow hover:brightness-110 active:brightness-95 transition"
                aria-label="Register now (opens in a new tab)"
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
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden w-full inline-flex items-center justify-center rounded-md bg-[#163968] text-white font-semibold py-2.5 px-4 shadow hover:brightness-110 active:brightness-95 transition mb-3"
            aria-label="Register now (opens in a new tab)"
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
              SN: {serial}
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
  href,
}: {
  title: string;
  date: string;
  time: string;
  venue: string;
  serial: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} on ${date} at ${time}. Opens in a new tab.`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#163968] rounded-lg"
    >
      <div
        className="relative w-full max-w-md rounded-lg shadow-[0_6px_20px_rgba(0,0,0,0.25)] overflow-hidden transform transition group-hover:-rotate-1"
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
    </a>
  );
}

export default EventSection;
