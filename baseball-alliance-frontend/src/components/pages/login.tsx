import React, { useState } from "react";
import { api, setToken } from "../../lib/api";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      // optionally stash user too:
      localStorage.setItem("user", JSON.stringify(user));
      // navigate to dashboard:
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4 border border-black/10"
      >
        <h1 className="text-2xl font-extrabold text-[#163968]">Sign in</h1>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-[#163968]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:ring-2 focus:ring-[#163968]"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[#163968]">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:ring-2 focus:ring-[#163968]"
            placeholder="••••••••"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-11 rounded-lg font-semibold text-white ${
            loading ? "bg-[#163968]/60" : "bg-[#163968] hover:brightness-110"
          }`}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-black/60 text-center">
          Tip: use <span className="font-medium">admin@example.com</span> /{" "}
          <span className="font-medium">Password123!</span> (from seed)
        </p>
      </form>
    </div>
  );
}
