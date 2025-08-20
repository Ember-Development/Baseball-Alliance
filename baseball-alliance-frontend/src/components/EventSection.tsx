import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import ticketBg from "../assets/baseballldirt.jpg";
import ballWatermark from "../assets/baseballheader.png";
import barcodeImg from "../assets/barcode.png";

const EventSection: React.FC = () => {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date("2025-10-21T00:00:00")
  );

  return (
    <div className="mt-16 mx-auto max-w-7xl">
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
        <div
          className="relative mx-auto max-w-6xl md:min-h-[210px] lg:min-h-[230px] mt-6 rounded-2xl border border-black/15 bg-white/8 shadow-[0_8px_24px_rgba(0,0,0,.20)] overflow-hidden"
          style={{
            backgroundImage: `url(${ticketBg})`,

            backgroundSize: "cover",

            backgroundPosition: "center",
          }}
          aria-label="Event ticket"
        >
          {/* soft inner highlight */}

          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.15)]" />

          {/* Long, horizontal rail with a narrow stub on the right */}

          <div className="relative grid grid-cols-1 md:grid-cols-[1.15fr_auto_260px]">
            {/* LEFT: content + (desktop) register link */}

            <div className="relative p-4 sm:p-6">
              <img
                src={ballWatermark}
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute -left-8 -bottom-10 opacity-10 sm:opacity-15 w-48 sm:w-56 h-auto blur-[0.2px]"
                loading="lazy"
              />

              {/* frosted card */}

              <div className="relative h-full rounded-xl bg-white/30 backdrop-blur-md border border-white/25 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_6px_18px_rgba(0,0,0,.18)] flex flex-col gap-3">
                <h3 className="text-lg sm:text-2xl font-extrabold tracking-wide text-[#163968] drop-shadow-sm">
                  Baseball Alliance Showcase
                </h3>

                <p className="text-sm sm:text-base text-black/80 leading-snug">
                  An elite evaluation event where players showcase speed, power,
                  arm strength, fielding, and hitting in front of college
                  coaches and pro scouts. Verified results are recorded and
                  shared to help athletes earn opportunities at the next level.
                </p>

                <div className="mt-1 sm:mt-2 flex flex-col sm:items-end gap-1 text-sm sm:text-[20px]">
                  <p className="flex items-baseline gap-2 leading-tight">
                    <span className="text-red-600 font-semibold">When</span>

                    <span className="text-black/90">
                      | Sept 21, 2025 · 10AM · Waco, TX
                    </span>
                  </p>

                  <p className="flex items-baseline gap-2 leading-tight">
                    <span className="text-red-600 font-semibold">Where</span>

                    <span className="text-black/90">
                      | McLennan Community College
                    </span>
                  </p>
                </div>

                {/* Desktop-only register button on the LEFT */}

                <div className="hidden md:block mt-3">
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2 px-4 shadow hover:brightness-110 active:brightness-95 transition"
                  >
                    Register Now
                  </a>
                </div>
              </div>
            </div>

            {/* MIDDLE: perforation with ticket "notches" */}

            <div className="hidden md:flex relative items-stretch justify-center">
              {/* dashed line */}

              <div className="relative w-[1px] bg-transparent mx-2">
                <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-black/40" />
              </div>

              {/* top/bottom notches (cutout illusion) */}

              <div className="pointer-events-none z-20 absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 shadow-inner" />

              <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 shadow-inner" />
            </div>

            {/* RIGHT STUB: tall rotated barcode, centered */}

            <div className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-4">
              {/* Mobile register CTA (kept) */}

              <a
                href="/register"
                className="md:hidden w-full inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2.5 px-4 shadow hover:brightness-110 active:brightness-95 transition mb-3"
              >
                Register Now
              </a>

              {/* Centered, rotated barcode sized to the stub height */}

              <div className="w-full flex items-center justify-center">
                <img
                  src={barcodeImg}
                  alt="Event Ticket Barcode"
                  className="object-contain w-44 h-16 sm:w-56 sm:h-20 md:w-auto md:h-[180px] lg:h-[200px] md:rotate-90"
                  loading="lazy"
                />
              </div>

              {/* subtle stub edge highlight */}

              <div className="pointer-events-none absolute z-10 inset-y-0 right-0 w-px bg-black/40" />
            </div>
          </div>
        </div>
      </div>

      {/* baseline divider */}
      <div className="mt-6 h-px bg-black/10" />

      {/* Additional Events */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Event Card 1 */}
        <div className="rounded-xl border border-black/10 bg-white/50 backdrop-blur-md shadow-md p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#163968]">
              Double Header Games
            </h3>
          </div>
          <div className="mt-4 text-sm">
            <p className="font-semibold text-red-600">When</p>
            <p className="text-black/80">
              Sept 14th, 2025 · 10AM - 5PM · Waco, TX
            </p>
            <p className="mt-2 font-semibold text-red-600">Where</p>
            <p className="text-black/80">McLennan CC && Waco Midway HS</p>
          </div>
          {/* <a
            href="/register"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2 px-4 shadow hover:brightness-110 active:brightness-95 transition"
          >
            Register Now
          </a> */}
        </div>

        {/* Event Card 2 */}
        <div className="rounded-xl border border-black/10 bg-white/50 backdrop-blur-md shadow-md p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#163968]">
              Double Header Games
            </h3>
          </div>
          <div className="mt-4 text-sm">
            <p className="font-semibold text-red-600">When</p>
            <p className="text-black/80">
              October 19th, 2025 · 10AM - 5PM · Waco, TX
            </p>
            <p className="mt-2 font-semibold text-red-600">Where</p>
            <p className="text-black/80">McLennan CC && Waco Midway HS</p>
          </div>
          {/* <a
            href="/register"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2 px-4 shadow hover:brightness-110 active:brightness-95 transition"
          >
            Register Now
          </a> */}
        </div>
      </div>
    </div>
  );
};

export default EventSection;
