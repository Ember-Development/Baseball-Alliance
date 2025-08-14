import { useState } from "react";

export default function Waiver() {
  const [showFull, setShowFull] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-white/40 via-transparent to-white/30 text-slate-100">
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-10 mt-[3rem]">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#163968]">
            {showFull
              ? "Baseball Alliance LLC – Formal Waiver"
              : "Baseball Alliance LLC – Quick Summary Waiver"}
          </h1>
          {!showFull && (
            <p className="mt-2 text-sm text-slate-400">
              (This is a plain‑language summary. The full legal waiver which you
              will sign shall apply.)
            </p>
          )}
        </header>

        {/* Card */}
        <div className="rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-black/30 p-5 sm:p-8 space-y-8">
          {showFull ? (
            <>
              {/* Intro */}
              <section>
                <p className="leading-relaxed text-[#1E1E1E] font-semibold">
                  Event Release, Waiver of Liability &amp; Indemnity Agreement
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  <span className="font-semibold">Media Consent Agreement</span>{" "}
                  — Please read carefully.
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  In consideration for, and as a condition of, my participation
                  in all tournaments, games, showcases, practices, and related
                  activities (“Events”) organized by Baseball Alliance LLC
                  (“BA”), I knowingly and voluntarily agree to the following:
                </p>
              </section>

              {/* 1. Release & Indemnification */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  1. Release &amp; Indemnification
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I release and agree to indemnify BA, along with its owners,
                  employees, volunteers, sponsors, advertisers, parent
                  companies, subsidiaries, affiliates, DBAs, agents, insurers,
                  facility owners, promoters, vendors, service providers, and
                  independent contractors (“Releasees”) from all responsibility
                  or liability for anything that occurs during the Event(s).
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  This release covers my participation in the Event(s), my use
                  of any related facilities and services, including pre‑event
                  practices and warm‑ups, and post‑event activities.
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  By signing, I acknowledge that I am assuming risk, agreeing
                  not to sue, and foregoing legal rights. This agreement applies
                  to all games, showcases, practices, and related activities,
                  whether specifically listed.
                </p>
              </section>

              {/* 2. Assumption of Risk */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  2. Assumption of Risk
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I understand that baseball and any related Event(s) involve(s)
                  inherent risks and dangers, including serious injury or death
                  and damage to property. These risks may result from my own
                  actions, the actions of others, the rules of play, or
                  facility/equipment conditions and may also include
                  unforeseeable risks. I knowingly and voluntarily accept all
                  such risks.
                </p>
              </section>

              {/* 3. Medical Consent */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  3. Medical Consent
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  If I require medical care during the Event(s), I consent to
                  treatment deemed reasonably necessary by on‑site personnel.
                </p>
              </section>

              {/* 4. Waiver of Claims */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  4. Waiver of Claims
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I waive, release, discharge, hold harmless, and promise not to
                  sue the Releasees for any claim arising from my participation,
                  including claims based on the Releasees’ own negligence. I
                  also agree to indemnify and reimburse the Releasees for any
                  related costs, including attorney fees.
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  This waiver covers any claim for injury, death, property
                  damage, reputational harm, or business loss, whether caused by
                  negligence or otherwise, except for intentional acts
                  specifically directed to harm me or my property.
                </p>
              </section>

              {/* 5. Representations */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  5. Representations
                </h2>
                <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
                  <li>
                    I am physically fit and competent to participate in the
                    Event(s).
                  </li>
                  <li>My equipment is safe and suitable.</li>
                  <li>I will follow all BA rules.</li>
                  <li>
                    I accept that BA’s interpretations of rules, penalties,
                    event timing, winners, and rankings are final and cannot be
                    challenged through litigation.
                  </li>
                  <li>
                    I will comply with any supplemental or amended rules posted
                    in Event(s) bulletins or on the BA website.
                  </li>
                </ul>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I understand that questioning the integrity of BA’s game,
                  showcase, or player metrics results can cause irreparable harm
                  to its reputation and may subject me to legal damages.
                </p>
              </section>

              {/* 6. Event Changes */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  6. Event Changes
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I understand that weather or other events outside of BA’s
                  control may cause delays, postponements, or cancellations. BA
                  may cancel or reschedule at its sole discretion.
                </p>
              </section>

              {/* 7. Media Release */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  7. Media Release
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I understand that the Event(s) may be photographed,
                  videotaped, or otherwise recorded. I grant BA full rights to
                  use my name, likeness, voice, and/or image in any form,
                  without further payment to me, for lawful purposes limited to
                  BA‑specific advertising and promotion. Beyond this limited use
                  by BA, I retain ownership of my name, likeness, voice, image
                  in any form and data captured by BA at Event(s) with respect
                  to any use beyond the limited advertising and promotion of BA
                  Event(s).
                </p>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  I waive all claims for invasion of privacy, right of
                  publicity, or defamation related to such use.
                </p>
              </section>

              {/* 8. Governing Law */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  8. Governing Law
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  This agreement is governed by the laws of the State of Texas.
                  It is the complete and final agreement between me and BA and
                  may be modified only in writing signed by all parties.
                </p>
              </section>
            </>
          ) : (
            <>
              {/* Summary */}
              <section>
                <p className="leading-relaxed text-[#1E1E1E]">
                  By signing up for any Baseball Alliance LLC (“BA”) tournament,
                  game, showcase, practice, or related activity (“Event(s)”),
                  you are agreeing to:
                </p>
              </section>

              {/* 1. Accept the Risks */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  1. You Accept the Risks
                </h2>
                <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
                  <li>
                    Baseball has real risks — including injury, property damage,
                    or even death.
                  </li>
                  <li>
                    Risks can come from you, other players, the field, the
                    equipment, or unexpected situations.
                  </li>
                  <li>
                    You understand and accept all these risks before
                    participating.
                  </li>
                </ul>
              </section>

              {/* 2. Release BA */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  2. You Release BA from Responsibility
                </h2>
                <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
                  <li>
                    You agree not to sue BA (or its staff, volunteers, sponsors,
                    facility owners, etc.) for injuries, damages, or losses
                    related to the Event.
                  </li>
                  <li>
                    This includes injuries or damages caused by accidents or
                    negligence.
                  </li>
                </ul>
              </section>

              {/* 3. Follow the Rules */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  3. You Promise to Follow the Rules
                </h2>
                <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
                  <li>You will follow all BA rules and event guidelines.</li>
                  <li>
                    BA’s decisions on rules, scoring, and results are final.
                  </li>
                  <li>
                    Questioning BA’s integrity about scores or player stats can
                    harm BA’s reputation and may result in legal consequences.
                  </li>
                </ul>
              </section>

              {/* 4. Medical Care */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  4. Medical Care
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  If you’re hurt or need medical help during the Event, BA can
                  arrange emergency treatment.
                </p>
              </section>

              {/* 5. Event Changes */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  5. Event Changes
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  BA can delay, reschedule, or cancel Events at its discretion
                  due to weather or other causes.
                </p>
              </section>

              {/* 6. Photos & Videos */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  6. Photos &amp; Videos
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  BA can use photos, videos, or recordings of you for BA
                  promotional use only without paying you. Beyond this, you will
                  retain ownership of all your Event(s) images and data.
                </p>
              </section>

              {/* 7. Texas Law */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
                  7. Texas Law
                </h2>
                <p className="mt-2 leading-relaxed text-[#1E1E1E]">
                  This agreement is governed by the laws of the State of Texas.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Summary footnote + Toggle Button */}
        {!showFull && (
          <div className="mt-8 rounded-xl bg-white/5 ring-1 ring-black/30 p-4 sm:p-5">
            <p className="text-sm text-[#1E1E1E]">
              This is a summary only. The full legal waiver will be provided for
              signature during registration.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowFull((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg bg-[#163968] text-white font-semibold py-2.5 px-4 shadow hover:brightness-110 active:brightness-95 transition"
          >
            {showFull ? "Back to summary" : "Click here for full waiver"}
          </button>
        </div>

        {/* Footer helper */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Baseball Alliance LLC. All rights
            reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
