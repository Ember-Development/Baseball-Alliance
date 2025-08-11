import React from "react";
import fieldImg from "../assets/field.png";
const ContactCTA: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-0 mt-16">
      <div
        className="relative overflow-hidden rounded-3xl border-2 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
        style={{
          backgroundImage: `url(${fieldImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* subtle darken for legibility */}
        <div className="absolute inset-0 bg-black/60" />

        {/* content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20">
          <h2 className="text-white font-extrabold tracking-wide leading-tight text-3xl sm:text-4xl md:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            Be a part of the Elite.
            <br className="hidden sm:block" />
            Join the Alliance.
          </h2>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-white font-semibold shadow-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 ring-offset-black/0"
            style={{
              background:
                "linear-gradient(90deg, rgba(28,74,136,1) 0%, rgba(207,36,47,1) 100%)",
            }}
          >
            Contact Us
          </a>
        </div>

        {/* inner highlight edge */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
      </div>
    </section>
  );
};

export default ContactCTA;
