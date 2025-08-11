import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import ticketBg from "../assets/baseballldirt.jpg"; // dirt field bg for the ticket
import ballWatermark from "../assets/baseballheader.png"; // faint ball watermark (optional)
import barcodeImg from "../assets/barcode.png";

const EventSection: React.FC = () => {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date("2025-10-21T00:00:00")
  );

  return (
    <div className=" mt-16 mx-auto max-w-7xl">
      {/* Header + countdown (right-aligned like mock) */}
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#163968]">
          Upcoming Event
        </h2>

        <div className="text-right">
          <div className="text-red-400 font-bold tabular-nums text-lg sm:text-xl tracking-widest">
            {String(days).padStart(2, "0")} : {String(hours).padStart(2, "0")} :{" "}
            {String(minutes).padStart(2, "0")} :{" "}
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#163968] mt-1">
            Days&nbsp;&nbsp;Hours&nbsp;&nbsp;Minutes&nbsp;&nbsp;Seconds
          </div>
        </div>
      </div>

      {/* Ticket */}
      <div className="mt-5">
        <div
          className="relative mx-auto max-w-5xl min-h-[170px] mt-12 rounded-2xl border border-black/15 bg-white/8 shadow-[0_8px_24px_rgba(0,0,0,.25)] overflow-hidden"
          style={{
            // subtle glass panel with field background
            backgroundImage: `url(${ticketBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* soft inner shadow for depth */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.15)]" />

          {/* ticket body */}
          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_220px]">
            {/* LEFT: content panel w/ watermark + glass card */}
            <div className="relative p-4 sm:p-6">
              {/* faint baseball watermark */}
              <img
                src={ballWatermark}
                alt=""
                className="pointer-events-none select-none absolute -left-6 -bottom-8 opacity-15 w-56 h-auto blur-[0.2px]"
              />

              {/* inset frosted card */}
              <div className="relative h-full rounded-xl bg-white/20 backdrop-blur-md border border-white/25 px-4 py-4 shadow-[0_6px_20px_rgba(0,0,0,.25)] flex flex-col justify-between">
                <h3 className="text-2xl font-bold tracking-wide text-[#163968] drop-shadow-sm">
                  Texas Lonestar Showcase
                </h3>

                <div className="mt-3 flex flex-col items-end space-y-1 text-[20px]">
                  <p className="flex items-baseline gap-2">
                    <span className="text-red-500 font-semibold">When</span>
                    <span className="text-black/90">
                      | October 21st–23rd, 2025, Houston, TX
                    </span>
                  </p>
                  <p className="flex items-baseline gap-2">
                    <span className="text-red-500 font-semibold">Where</span>
                    <span className="text-black/90">
                      | The Diamonds at Daily Park
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* MIDDLE: perforation */}
            <div className="hidden md:flex items-stretch justify-center">
              <div className="relative w-[1px] bg-transparent mx-2">
                {/* dashed line */}
                <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-black/40" />
              </div>
            </div>

            {/* RIGHT: register + barcode */}
            <div className="relative flex flex-row items-center justify-center gap-2 pl-14 p-6">
              <a
                href="/register"
                className="text-[#163968] text-lg font-bold leading-tight tracking-wide hover:text-white transition"
                style={{ textAlign: "center" }}
              >
                Register
                <br />
                Here
              </a>

              {/* barcode (pure CSS) */}
              <img
                src={barcodeImg}
                alt="Event Ticket Barcode"
                className="w-80 sm:w-80 h-32 sm:h-32 object-contain rotate-90"
              />

              {/* stub edge highlight */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* baseline divider under section */}
      <div className="mt-6 h-px bg-white/10" />
    </div>
  );
};

export default EventSection;
