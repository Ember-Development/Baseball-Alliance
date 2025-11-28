// components/NavBar.tsx
import React, { useState, useEffect } from "react";
import BA from "../assets/ba-long-removebg-preview.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    "Home",
    "Events",
    "Player Profiles",
    "Leaderboard",
    "Leadership",
  ];
  const NAV_HEIGHT = 80;

  const leaderboardItems = [
    {
      label: "Baseball Alliance Showcase - El Paso - 11/22/25",
      href: "https://events.baseballalliance.co/public/events/baseball-alliance-showcase-el-paso-tx-el-paso-tx-11-22-2025/leaderboard",
    },
    {
      label: "Baseball Alliance Showcase - Waco - 9/21/25",
      href: "https://events.baseballalliance.co/events/baseball-alliance-showcase-waco-tx-09-21-2025/leaderboard",
    },
  ];

  const isHomePage = location.pathname === "/";

  const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleScroll = (id: string) => {
    if (id === "home") {
      if (isHomePage) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (isHomePage) {
      smoothScrollTo(id);
    } else {
      // Navigate to home with hash; a small helper like ScrollToHash can handle the offset scroll
      navigate(`/#${id}`);
    }
  };

  const handleNavClick = (label: string) => {
    if (label === "Player Profiles") {
      window.open(
        "https://events.baseballalliance.co/public/players",
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (label === "Leaderboard") {
      setDropdownOpen((v) => !v);
      return;
    }

    if (label === "Leadership") {
      // Client-side route change (no full reload)
      navigate("/leadership");
      return;
    }

    handleScroll(label.toLowerCase());
  };

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen && !open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen, open]);

  return (
    <nav
      className={[
        "fixed inset-x-0 top-0 z-90",
        "backdrop-blur-md backdrop-saturate-150",
        "transition-all duration-300",
        scrolled
          ? "bg-white/7 border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          : "bg-white/5 border-white/10",
        "border-b",
      ].join(" ")}
    >
      {/* gradient hairline accent */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Go to Home">
            <img
              src={BA}
              alt="Baseball Alliance"
              className="h-40 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer"
            />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <ul className="hidden lg:flex items-center xl:gap-6 lg:gap-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {links.map((label) => (
            <li key={label} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick(label);
                }}
                className={`group relative xl:px-3 xl:py-2 lg:px-2 lg:py-1.5 xl:text-base lg:text-sm font-semibold uppercase xl:tracking-wide lg:tracking-normal text-[#163968] hover:text-red-500 transition flex items-center gap-1 ${
                  label === "Leaderboard" && dropdownOpen ? "text-red-500" : ""
                }`}
                aria-label={label}
                aria-haspopup={label === "Leaderboard" ? "menu" : undefined}
                aria-expanded={
                  label === "Leaderboard" ? dropdownOpen : undefined
                }
              >
                {label}
                {label === "Leaderboard" && (
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
                <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-px scale-x-0 origin-left bg-gradient-to-r from-red-400 via-rose-400 to-red-400 transition-transform duration-300 group-hover:scale-x-100" />
              </button>

              {/* Leaderboard Dropdown */}
              {label === "Leaderboard" && (
                <div
                  className={[
                    "absolute top-full left-1/2 -translate-x-1/2 mt-2",
                    "xl:w-72 lg:w-56",
                    "transition-all duration-200 origin-top",
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none",
                  ].join(" ")}
                  role="menu"
                >
                  <div className="rounded-xl border border-white/10 bg-white/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] p-2">
                    {leaderboardItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-[#163968] hover:bg-white/60 hover:text-red-600 transition"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a
            href="mailto:keith@baseballalliance.co"
            className="hidden xl:inline-flex px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide border border-[#163968] bg-white/5 hover:bg_white/10 text-[#163968] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition"
          >
            Contact Us
          </a>

          {/* Mobile menu button */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#163968]/45 bg-white/5 hover:bg-white/10 transition"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              className={`h-5 w-5 text-[#163968] transition-transform ${
                open ? "rotate-90" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={[
          "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="rounded-2xl border border_white/10 bg-black/5 backdrop-blur-md p-2">
            {links.map((label) => (
              <div key={label} className="w-full">
                {label !== "Leaderboard" ? (
                  <button
                    onClick={() => {
                      if (label === "Player Profiles") {
                        window.open(
                          "https://events.baseballalliance.co/public/players",
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } else {
                        handleNavClick(label);
                        setOpen(false);
                      }
                    }}
                    className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide text-[#163968] hover:text-red-500 hover:bg-white/10 transition flex items-center justify-between"
                  >
                    {label}
                  </button>
                ) : (
                  <div className="px-1 py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen((v) => !v);
                      }}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide text-[#163968] hover:text-red-500 hover:bg-white/10 transition flex items-center justify_between"
                      aria-haspopup="menu"
                      aria-expanded={dropdownOpen}
                    >
                      {label}
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Mobile submenu */}
                    <div
                      className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                        dropdownOpen
                          ? "max-h-64 opacity-100"
                          : "max-h-0 opacity-0"
                      } z-50`}
                    >
                      <div className="mt-1 rounded-xl border border-white/10 bg-white/90 backdrop-blur p-1">
                        {leaderboardItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setDropdownOpen(false);
                              setOpen(false);
                            }}
                            className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-[#163968] hover:bg-white/60 hover:text-red-600 transition"
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2">
              <a
                href="mailto:keith@baseballalliance.co"
                className="block w-full px-4 py-3 rounded-xl text-sm uppercase tracking-wide border border-white/20 bg-white/5 hover:bg-white/10 text-[#163968] font-semibold transition text-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
