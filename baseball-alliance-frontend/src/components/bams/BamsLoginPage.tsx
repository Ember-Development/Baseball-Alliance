import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function BamsLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<
    "user_not_found" | "no_bams_access" | null
  >(null);
  const [devCheckedEmail, setDevCheckedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevLink(null);
    setDevNote(null);
    setDevCheckedEmail(null);
    try {
      const res = await api.requestMagicLink(email.trim());
      setSent(true);
      setMessage(res.message);
      if (res.devLink) setDevLink(res.devLink);
      if (res.devNote) setDevNote(res.devNote);
      if (res.devCheckedEmail) setDevCheckedEmail(res.devCheckedEmail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#163968]">BAMS Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the email you used on Playbook. We&apos;ll send a one-time sign-in
          link (no password required). Your email must be imported by an admin
          before you can sign in.
        </p>

        {sent ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {message}
            </p>
            {devNote && (
              <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {devNote === "user_not_found" ? (
                  <>
                    Dev: no account for{" "}
                    <strong>{devCheckedEmail ?? email.trim().toLowerCase()}</strong>.
                    Import that exact email via Playbook CSV at{" "}
                    <Link to="/admin/users" className="font-semibold underline">
                      /admin/users
                    </Link>
                    , then try again.
                  </>
                ) : (
                  <>
                    Dev: <strong>{devCheckedEmail ?? email.trim().toLowerCase()}</strong>{" "}
                    exists but has no BAMS access (needs MEMBER role). Re-import at{" "}
                    <Link to="/admin/users" className="font-semibold underline">
                      /admin/users
                    </Link>
                    .
                  </>
                )}
              </p>
            )}
            {devLink && (
              <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-semibold text-amber-900 mb-1">Dev sign-in link</p>
                <a
                  href={devLink}
                  className="text-[#163968] break-all underline"
                >
                  {devLink}
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setDevLink(null);
                setDevNote(null);
                setDevCheckedEmail(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-[#163968] hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#163968] focus:ring-1 focus:ring-[#163968]/30 outline-none"
                placeholder="you@example.com"
              />
            </label>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#163968] text-white font-semibold py-2.5 text-sm hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="text-[#163968] hover:underline">
            Back to Baseball Alliance
          </Link>
        </p>
      </div>
    </div>
  );
}
