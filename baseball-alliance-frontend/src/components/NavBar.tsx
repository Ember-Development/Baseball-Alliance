import React, { useState, useEffect, useRef } from "react";
import BA from "../assets/baseballalliancelogo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close avatar menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!avatarRef.current) return;
      if (!avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const links = [
    "Home",
    // "Members",
    "Events",
    // "Resources",
    // "Alumni",
    // "About Us",
  ];

  const initials = (fullName?: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase() || "U";
  };

  return (
    <nav
      className={[
        "fixed inset-x-0 top-0 z-50",
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Go to Home">
            <img
              src={BA}
              alt="Baseball Alliance"
              className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-6">
          {links.map((label) => (
            <li key={label}>
              <Link
                to={
                  label === "Home"
                    ? "/"
                    : `/${label.toLowerCase().replace(/\s+/g, "-")}`
                }
                className="group relative px-3 py-2 text-base font-semibold uppercase tracking-wide text-[#163968] hover:text-red-500 transition"
                aria-label={label}
              >
                {label}
                <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-px scale-x-0 origin-left bg-gradient-to-r from-red-400 via-rose-400 to-red-400 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            <Link
              to="/login"
              className="hidden lg:inline-flex px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide border border-[#163968] bg-white/5 hover:bg-white/10 text-[#163968] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition"
            >
              Login
            </Link>
          ) : (
            <div className="hidden lg:block relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#163968] text-white font-bold shadow hover:brightness-110 transition"
                title={user.fullName}
              >
                {initials(user.fullName)}
              </button>

              {/* Avatar menu */}
              {avatarOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-white/100 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                  <div className="px-3 py-2 text-xs text-black/60">
                    {user.fullName}
                  </div>
                  <button
                    role="menuitem"
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#163968] hover:bg-white/70 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

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
          <div className="rounded-2xl border border-white/10 bg-black/5 backdrop-blur-3xl p-2">
            {links.map((label) => (
              <Link
                key={label}
                to={
                  label === "Home"
                    ? "/"
                    : `/${label.toLowerCase().replace(/\s+/g, "-")}`
                }
                onClick={() => setOpen(false)}
                className="block w-full text-left px-3 py-3 rounded-xl text-sm font-bold uppercase tracking-wide text-[#163968] hover:text-red-500 hover:bg-white/10 transition"
              >
                {label}
              </Link>
            ))}
            {!user && (
              <div className="pt-2">
                <Link
                  to="/login"
                  className=" block w-full px-4 py-3 rounded-xl text-sm uppercase tracking-wide border border-white/20 bg-white/5 hover:bg-white/10 text-[#163968] font-semibold transition text-center"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile auth:
                - Hide Login entirely (per requirement)
                - If logged in, show Logout button */}
            {user && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="block w-full px-4 py-3 rounded-xl text-sm uppercase tracking-wide border border-white/20 bg-white/5 hover:bg-white/10 text-[#163968] font-semibold transition text-center"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
