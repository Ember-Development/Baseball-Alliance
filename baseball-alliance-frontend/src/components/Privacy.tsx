export default function Privacy() {
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-gradient-to-tr from-white/40 via-transparent to-white/30 text-slate-100">
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-10 mt-[3rem]">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#163968] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#1E1E1E]">Effective Date: {today}</p>
          <p className="mt-2 text-sm text-[#1E1E1E]">
            Baseball Alliance (“we,” “our,” “us”) respects your privacy. This
            Privacy Policy explains how we collect, use, and protect your
            information when you visit our website or register for our events.
          </p>
        </header>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-5 sm:p-8 space-y-8">
          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              1. Information We Collect
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We may collect the following types of information:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>
                <span className="font-medium">Personal Information:</span> Name,
                email address, phone number, mailing address, date of birth,
                emergency contact information, payment details (processed
                securely via our payment processor).
              </li>
              <li>
                <span className="font-medium">Player Information:</span> Height,
                weight, positions played, graduation year, school/team
                affiliation, athletic stats.
              </li>
              <li>
                <span className="font-medium">Technical Information:</span> IP
                address, browser type, operating system, pages visited, and
                cookies (to improve website functionality).
              </li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              2. How We Use Your Information
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We use your information to:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>Process registrations for events and showcases</li>
              <li>Communicate about event updates, schedules, and changes</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>
                Share player profiles with scouts, recruiters, and coaches (only
                if you consent)
              </li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 3. Sharing Your Information */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              3. Sharing Your Information
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We do not sell your personal information. We may share it with:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>
                Event partners and vendors (only as necessary to run the event)
              </li>
              <li>Scouts, recruiters, or teams (only with your consent)</li>
              <li>
                Service providers who help operate our website, payment
                processing, or communications
              </li>
              <li>Legal authorities if required by law</li>
            </ul>
          </section>

          {/* 4. Cookies & Tracking */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              4. Cookies & Tracking
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We use cookies to improve your browsing experience and analyze
              site traffic. You can disable cookies in your browser settings,
              but some features may not work properly.
            </p>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              5. Data Security
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We take reasonable measures to protect your personal information
              from unauthorized access, use, or disclosure.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              6. Your Rights
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              Depending on your location, you may have the right to:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent to data sharing at any time</li>
            </ul>
            <p className="mt-3 leading-relaxed text-[#1E1E1E]">
              To exercise these rights, contact us at:{" "}
              <span className="font-medium">[Insert Email Address]</span>.
            </p>
          </section>

          {/* 7. Third-Party Links */}
          <section>
            <h2 className="text-xl text-[#163968] sm:text-2xl font-semibold">
              7. Third-Party Links
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              Our site may contain links to other websites. We are not
              responsible for their privacy practices.
            </p>
          </section>

          {/* 8. Changes to This Policy */}
          <section>
            <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
              8. Changes to This Policy
            </h2>
            <p className="mt-2 leading-relaxed text-[#1E1E1E]">
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with the updated effective date.
            </p>
          </section>

          {/* 9. Contact Us */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
              9. Contact Us
            </h2>
            <address className="mt-3 not-italic rounded-lg text-[#1E1E1E] bg-white/5 ring-1 ring-white/10 p-4 leading-relaxed">
              <div>Baseball Alliance</div>
              <p>Phone: (817) 320-4911</p>
              <p>Customer Service: keith@baseballalliance.co</p>
            </address>
          </section>
        </div>

        {/* Footer */}
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
