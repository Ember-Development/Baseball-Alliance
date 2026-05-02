import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { SitePublic } from "../../lib/site";

const AdminPagesIndex: React.FC = () => {
  const { user } = useAuth();
  const [site, setSite] = useState<SitePublic | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.roles?.includes("ADMIN")) return;
    api
      .getSiteAdmin()
      .then(setSite)
      .catch((e: unknown) =>
        setErr(e instanceof Error ? e.message : "Failed to load")
      );
  }, [user]);

  if (!user?.roles?.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  if (err) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-700">{err}</p>
      </main>
    );
  }

  if (!site) {
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#163968]">Page builder</h1>
          <Link to="/admin/site" className="text-sm font-semibold underline">
            Site CMS
          </Link>
        </div>
        <p className="text-sm text-slate-600">
          Edit published pages at <code className="text-xs">/pages/&lt;slug&gt;</code>.
        </p>
        <ul className="space-y-2">
          {site.pages.map((p) => (
            <li key={p.id}>
              <Link
                to={`/admin/pages/${encodeURIComponent(p.slug)}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-[#163968]/40 transition"
              >
                <span className="font-semibold">{p.slug}</span>
                <span className="text-xs text-slate-500">
                  {p.published ? "published" : "draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/admin/site"
          className="inline-block text-sm font-semibold text-[#163968] underline"
        >
          Open Site CMS
        </Link>
        <p className="text-xs text-slate-500">
          To add a page, open{" "}
          <code className="text-xs">/admin/pages/your-slug</code> (slug in the
          URL).
        </p>
      </div>
    </main>
  );
};

export default AdminPagesIndex;
