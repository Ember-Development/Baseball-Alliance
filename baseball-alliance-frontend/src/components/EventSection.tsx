// src/components/EventSection.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import ticketBg from "../assets/baseballldirt.jpg";
import ballWatermark from "../assets/baseballheader.png";
import barcodeImg from "../assets/barcode.png";
import RegistrationModal from "./ui/RegistrationModal";
import { useAuth } from "../context/AuthContext";
import EventCreateModal from "./ui/EventCreateModal";
import { api } from "../lib/api";
import { AiOutlinePlus } from "react-icons/ai";
import type { EventPublic } from "src/lib/event";

// front-end flags
const ACCEPT_HOSTED_ENABLED =
  (import.meta.env.VITE_ACCEPT_HOSTED_ENABLED ?? "false").toString() === "true";
const COMBINE_PRICE_CENTS = Number(
  import.meta.env.VITE_COMBINE_PRICE_CENTS ?? 15000
);

// helper: merge startDate + "10:00 AM" -> Date
function buildStartDateTime(e: EventPublic): Date {
  const base = new Date(e.startDate);
  if (e.startTime) {
    // parse "10:00 AM" / "1:30 pm"
    const m = e.startTime.trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const mins = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      base.setHours(h, mins, 0, 0);
    }
  }
  return base;
}

const EventSection: React.FC = () => {
  const { user } = useAuth();
  const [latest, setLatest] = useState<EventPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [openReg, setOpenReg] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch most recently created published event (any type; or pass "COMBINE" if you prefer)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getLatestEvent() // or getLatestEvent("COMBINE")
      .then((e) => mounted && setLatest(e))
      .catch((e) => mounted && setError(e?.message ?? "Failed to load event"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // countdown target
  const targetDate = useMemo(
    () => (latest ? buildStartDateTime(latest) : new Date()),
    [latest]
  );

  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  async function handleRegistrationSubmit(form: any) {
    try {
      if (!user) {
        alert("Please log in to register.");
        return;
      }
      if (!latest) {
        alert("No event available yet.");
        return;
      }

      // create registration against the latest event
      const reg = await api.createCombineRegistration(latest.id, {
        ...form,
        agreeToWaiver: !!form.agreeToWaiver,
        privacyAck: !!form.privacyAck,
      });

      if (ACCEPT_HOSTED_ENABLED) {
        const { token, url } = await api.createAcceptHostedSession(
          reg.id,
          COMBINE_PRICE_CENTS
        );
        window.location.href = `${url}?token=${encodeURIComponent(token)}`;
        return;
      }

      alert(
        "Registration saved! Payments are not enabled yet—we’ll contact you with payment instructions."
      );
    } catch (e: any) {
      alert(e?.message ?? "Failed to start registration/payment.");
    }
  }

  // format “When” and “Where”
  const whenText = useMemo(() => {
    if (!latest) return "";
    const d = buildStartDateTime(latest);
    const date = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = latest.startTime ? ` · ${latest.startTime}` : "";
    return `| ${date}${time} · ${latest.city}, ${latest.state}`;
  }, [latest]);

  const whereText = useMemo(() => {
    if (!latest) return "";
    return latest.venue ? `| ${latest.venue}` : "| Venue TBA";
  }, [latest]);

  return (
    <div className="mt-16 mx-auto max-w-7xl">
      {/* Header + countdown */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#163968]">
            {loading ? "Loading…" : latest ? "Upcoming Event" : "No Events Yet"}
          </h2>

          {/* Admin-only: create button */}
          {user?.roles?.includes("ADMIN") && (
            <button
              onClick={() => setOpenCreate(true)}
              title="Create event"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-[#163968] text-[#163968] hover:bg-white/30 transition"
            >
              <AiOutlinePlus className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Countdown */}
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

      {/* Error state */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Ticket (hide if none) */}
      {latest && (
        <div className="mt-5">
          <div
            className="relative mx-auto max-w-5xl md:min-h-[170px] mt-6 rounded-2xl border border-black/15 bg-white/8 shadow-[0_8px_24px_rgba(0,0,0,.20)] overflow-hidden"
            style={{
              backgroundImage: `url(${ticketBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label="Event ticket"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.15)]" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_220px]">
              {/* LEFT */}
              <div className="relative p-4 sm:p-6">
                <img
                  src={ballWatermark}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute -left-8 -bottom-10 opacity-10 sm:opacity-15 w-48 sm:w-56 h-auto blur-[0.2px]"
                  loading="lazy"
                />
                <div className="relative h-full rounded-xl bg-white/30 backdrop-blur-md border border-white/25 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_6px_18px_rgba(0,0,0,.18)] flex flex-col gap-3">
                  <h3 className="text-lg sm:text-2xl font-extrabold tracking-wide text-[#163968] drop-shadow-sm">
                    {latest.title}
                  </h3>
                  <p className="text-sm sm:text-base text-black/80 leading-snug">
                    {/* Optional: type-aware blurb */}
                    {latest.type === "COMBINE"
                      ? "An elite evaluation event with verified measurables."
                      : latest.type === "SHOWCASE"
                      ? "Showcase your skills in front of college coaches and scouts."
                      : "Competitive tournament play for elite teams."}
                  </p>
                  <div className="mt-1 sm:mt-2 flex flex-col sm:items-end gap-1 text-sm sm:text-[20px]">
                    <p className="flex items-baseline gap-2 leading-tight">
                      <span className="text-red-600 font-semibold">When</span>
                      <span className="text-black/90">{whenText}</span>
                    </p>
                    <p className="flex items-baseline gap-2 leading-tight">
                      <span className="text-red-600 font-semibold">Where</span>
                      <span className="text-black/90">{whereText}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* MIDDLE: perforation */}
              <div className="hidden md:flex items-stretch justify-center">
                <div className="relative w-[1px] bg-transparent mx-2">
                  <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-black/40" />
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex flex-col md:flex-row items-center md:items-center justify-center gap-3 px-4 sm:px-6 py-4">
                <button
                  onClick={() => setOpenReg(true)}
                  className="md:hidden w-full inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2.5 px-4 shadow hover:brightness-110 active:brightness-95 transition"
                >
                  Register Now
                </button>
                <button
                  onClick={() => setOpenReg(true)}
                  className="hidden md:inline-block text-[#163968] items-center justify-center text-center ml-[2rem] text-lg font-bold leading-tight tracking-wide hover:text-white transition"
                >
                  Register
                  <br />
                  Here
                </button>
                <img
                  src={barcodeImg}
                  alt=" Event Ticket Barcode"
                  className="hidden md:flex w-40 h-16 sm:w-56 sm:h-20 md:w-80 md:h-32 object-contain md:rotate-90"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 h-px bg-black/10" />

      <RegistrationModal
        open={openReg}
        onClose={() => setOpenReg(false)}
        onSubmit={handleRegistrationSubmit}
      />

      <EventCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={async () => {
          // After creating an event, refresh latest
          try {
            const e = await api.getLatestEvent();
            setLatest(e);
          } catch {}
        }}
      />
    </div>
  );
};

export default EventSection;
