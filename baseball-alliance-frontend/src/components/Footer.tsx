import React from "react";
import logo from "../assets/baseballalliance.png"; // swap to your BA logo

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-black/10 bg-[#ECEDE5]">
      <div className="mx-auto max-w-7xl px-4 lg:px-0 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-8">
          {/* Left: logo */}
          <div className="flex sm:justify-start justify-center">
            <a href="/" className="inline-flex items-center gap-3">
              <img
                src={logo}
                alt="Baseball Alliance"
                className="h-12 w-auto object-contain"
              />
              <span className="sr-only">Baseball Alliance</span>
            </a>
          </div>

          {/* Center: links */}
          <ul className="flex items-center justify-center gap-10 text-sm text-black/80">
            <li>
              <a
                href="/privacy"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Terms
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Support
              </a>
            </li>
          </ul>

          {/* Right: socials */}
          <div className="flex sm:justify-end justify-center gap-3">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 bg-white hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.75-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com"
              aria-label="X"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 bg-white hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="X"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M3 3h3.6l5.1 6.9L16.6 3H21l-7 9.3L21 21h-3.6l-5.4-7.3L7.4 21H3l7-9.3L3 3Z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 bg-white hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="YouTube"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M23 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-15A3.5 3.5 0 0 1 1 16.5v-9A3.5 3.5 0 0 1 4.5 4h15A3.5 3.5 0 0 1 23 7.5Zm-7.8 4.5-6-3.5v7l6-3.5Z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 bg-white hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="TikTok"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M14.5 3c1.1 1.8 2.7 2.9 4.8 3v3.2c-1.8 0-3.3-.5-4.8-1.6v6.6a6.1 6.1 0 1 1-2.4-4.9v3a3.1 3.1 0 1 0 1.5 2.7V3Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
