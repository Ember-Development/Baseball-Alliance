import React from "react";
import logo from "../assets/baseballalliance.png";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-black/10">
      <div className="mx-auto max-w-7xl px-4 lg:px-0 py-10 space-y-6">
        {/* Top: logo, links, socials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-8">
          {/* Left: logo */}
          <div className="flex sm:justify-start justify-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={logo}
                alt="Baseball Alliance"
                className="h-12 w-auto object-contain"
              />
              <span className="sr-only">Baseball Alliance</span>
            </Link>
          </div>

          {/* Center: links */}
          <ul className="flex items-center justify-center gap-10 text-sm text-black/80">
            <li>
              <Link
                to="/waiver"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Waiver
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <a
                href="mailto:keith@baseballalliance.co"
                className="hover:text-black transition-colors underline-offset-4 hover:underline"
              >
                Support
              </a>
            </li>
          </ul>

          {/* Right: socials */}
          <div className="flex sm:justify-end justify-center gap-3">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center text-white rounded-md border border-black/15 bg-[#163968] hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="Instagram"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-white border-black/15 bg-[#163968] hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="Twitter"
            >
              <FaXTwitter size={20} />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-white border-black/15 bg-[#163968] hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="YouTube"
            >
              <FaYoutube size={20} />
            </a>
            <a
              href="https://tiktok.com"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-white border-black/15 bg-[#163968] hover:bg-black hover:text-white transition"
              target="_blank"
              rel="noreferrer"
              title="TikTok"
            >
              <FaTiktok size={20} />
            </a>
          </div>
        </div>

        {/* Bottom: contact info */}
        <div className="text-center text-sm text-black/70 space-y-1">
          <p>Baseball Alliance LLC</p>
          <p>2100 Downing Lane, Ste A, Leander, TX 78641</p>
          <p>Phone: (817) 320-4911</p>
          <p>Customer Service: keith@baseballalliance.co</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
