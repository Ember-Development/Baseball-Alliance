export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-white/40 via-transparent to-white/30 text-slate-100">
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-10 mt-[3rem]">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#163968] tracking-tight">
            Baseball Alliance Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Please read carefully before registering for events.
          </p>
        </header>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-5 sm:p-8 space-y-8">
          {/* Event Registration */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              Event Registration
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              Registration for any event organized or hosted by Baseball
              Alliance LLC (“BA”) is limited to a set number of teams. Once
              capacity is reached, additional teams may be placed on a waiting
              list and admitted only if space becomes available.
            </p>
          </section>

          {/* Deposit Requirement */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              Deposit Requirement
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              Once a team is notified of acceptance into an event, it must pay a{" "}
              <span className="font-semibold text-[#1E1E1E]">
                $250 non‑refundable deposit
              </span>{" "}
              within 10 business days. This deposit will be applied toward the
              event fee, as determined by BA.
            </p>
          </section>

          {/* Entry Requirements */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              Entry Requirements
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              To secure participation in any BA event, players/teams shall:
            </p>
            <ol className="mt-3 space-y-2 list-decimal list-inside text-[#1E1E1E]">
              <li>Pay the tournament fee in full.</li>
              <li>Complete all waivers for all players as required by BA.</li>
              <li>Submit a roster listing all participating individuals.</li>
              <li>
                Provide proof of team insurance naming BA as an additional
                insured.
              </li>
            </ol>
          </section>

          {/* Tournament Fee Deadlines */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              Tournament Fee Deadlines
            </h2>
            <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>
                <span className="font-medium">Summer Tournaments:</span> Full
                payment due May 1 of the event year.
              </li>
              <li>
                <span className="font-medium">Fall Tournaments:</span> Full
                payment due September 1 of the event year.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed text-[#1E1E1E]">
              Entry is not guaranteed until payment has been processed and
              accepted. BA accepts Visa, MasterCard, American Express, and
              Discover through its online registration system, or checks may be
              mailed to:
            </p>
            <address className="mt-4 not-italic rounded-lg text-[#1E1E1E] bg-white/5 ring-1 ring-white/10 p-4 leading-relaxed">
              <div>Baseball Alliance</div>
              <div>2100 Downing Lane, Ste A</div>
              <div>Leander, TX, 78641</div>
            </address>
          </section>

          {/* Refund Policy for Weather-Related Cancellations */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              Refund Policy for Weather‑Related Cancellations
            </h2>

            <h3 className="mt-3 text-lg font-semibold text-[#1E1E1E]">
              General Policy
            </h3>
            <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>
                Event start times may be delayed up to 1 hour due to weather.
              </li>
              <li>
                If conditions require, the Event Director may adjust this
                policy.
              </li>
              <li>
                Events in progress may be paused for up to 1 hour; beyond that,
                they may be postponed or canceled, with rescheduling attempted
                at BA’s discretion.
              </li>
            </ul>

            <h3 className="mt-5 text-lg text-[#163968] font-semibold">
              Cancellation Guidelines
            </h3>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              If an event cannot start or resume within 1 hour of its scheduled
              time, it will be canceled and rescheduling will be attempted.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-[#163968]">
              Refunds
            </h3>
            <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>
                <span className="font-medium">
                  Up to 4 weeks prior to event:
                </span>{" "}
                75% refund
              </li>
              <li>
                <span className="font-medium">
                  Less than 2 weeks prior to event:
                </span>{" "}
                10% refund
              </li>
            </ul>
            <p className="mt-3 leading-relaxed text-[#1E1E1E]">
              No refunds will be issued within 3 days of the event. BA will make
              efforts to reschedule events if possible.
            </p>
          </section>
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
