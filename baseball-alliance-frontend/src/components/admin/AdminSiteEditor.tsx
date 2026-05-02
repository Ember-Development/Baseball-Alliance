import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { EventPublic } from "../../lib/event";
import type { SitePublic, WhoWeAreSectionPayload } from "../../lib/site";
import { resolveWhoWeAreSectionsForSite } from "../../lib/whoWeAreSections";
import {
  Field,
  UrlField,
  SaveBar,
  ContactCtaForm,
  SITE_EDITOR_INPUT_CLS,
} from "../site-inline/siteEditorPrimitives";

const TABS = [
  "Hero",
  "Who we are",
  "Contact CTA",
  "Membership",
  "Featured event",
  "Headers",
] as const;

type Tab = (typeof TABS)[number];

const AdminSiteEditor: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Hero");
  const [site, setSite] = useState<SitePublic | null>(null);
  const [wwaSections, setWwaSections] = useState<WhoWeAreSectionPayload[]>(
    []
  );
  const [events, setEvents] = useState<EventPublic[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [s, ev] = await Promise.all([
        api.getSiteAdmin(),
        api.listEventsAdmin(),
      ]);
      setSite(s);
      setEvents(ev);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (site) setWwaSections(resolveWhoWeAreSectionsForSite(site));
  }, [site]);

  if (!user?.roles?.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  if (err && !site) {
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

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const next = await api.patchSite(patch);
      setSite(next);
      setMsg("Saved.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = SITE_EDITOR_INPUT_CLS;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#163968]">Site CMS</h1>
          <div className="flex gap-3 text-sm">
            {/* Page builder paused */}
            {/* <Link
              to="/admin/pages"
              className="font-semibold text-[#163968] underline"
            >
              Page builder
            </Link> */}
            <Link to="/" className="text-slate-600 underline">
              View site
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tab === t
                  ? "bg-[#163968] text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}

        {tab === "Hero" && (
          <section className="space-y-3 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            <Field
              label="Eyebrow"
              value={site.heroEyebrow ?? ""}
              onChange={(v) => setSite({ ...site, heroEyebrow: v || null })}
            />
            <Field
              label="Headline"
              value={site.heroHeadline ?? ""}
              onChange={(v) => setSite({ ...site, heroHeadline: v || null })}
            />
            <Field
              label="Subcopy"
              value={site.heroSubcopy ?? ""}
              onChange={(v) => setSite({ ...site, heroSubcopy: v || null })}
            />
            <Field
              label="CTA label"
              value={site.heroCtaLabel ?? ""}
              onChange={(v) => setSite({ ...site, heroCtaLabel: v || null })}
            />
            <Field
              label="CTA href"
              value={site.heroCtaHref ?? ""}
              onChange={(v) => setSite({ ...site, heroCtaHref: v || null })}
            />
            <UrlField
              label="Poster image URL"
              value={site.heroPosterUrl ?? ""}
              onChange={(v) => setSite({ ...site, heroPosterUrl: v || null })}
              inputCls={inputCls}
            />
            <UrlField
              label="Desktop video URL"
              value={site.heroVideoDesktopUrl ?? ""}
              onChange={(v) =>
                setSite({ ...site, heroVideoDesktopUrl: v || null })
              }
              inputCls={inputCls}
              kind="video"
            />
            <UrlField
              label="Mobile video URL"
              value={site.heroVideoMobileUrl ?? ""}
              onChange={(v) =>
                setSite({ ...site, heroVideoMobileUrl: v || null })
              }
              inputCls={inputCls}
              kind="video"
            />
            <SaveBar
              disabled={saving}
              onSave={() =>
                save({
                  heroEyebrow: site.heroEyebrow,
                  heroHeadline: site.heroHeadline,
                  heroSubcopy: site.heroSubcopy,
                  heroCtaLabel: site.heroCtaLabel,
                  heroCtaHref: site.heroCtaHref,
                  heroPosterUrl: site.heroPosterUrl,
                  heroVideoDesktopUrl: site.heroVideoDesktopUrl,
                  heroVideoMobileUrl: site.heroVideoMobileUrl,
                })
              }
            />
          </section>
        )}

        {tab === "Who we are" && (
          <section className="space-y-4 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-800">
              Intro text blocks
            </p>
            <p className="text-xs text-slate-500">
              <strong>Lead</strong> is the large bold intro; <strong>Body</strong>{" "}
              is supporting copy. Add as many sections as you need.
            </p>
            <div className="space-y-4">
              {wwaSections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="rounded-lg border border-slate-200 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      Style
                      <select
                        className="rounded border border-slate-300 px-2 py-1 text-sm font-normal"
                        value={sec.variant}
                        onChange={(e) => {
                          const v = e.target.value as WhoWeAreSectionPayload["variant"];
                          setWwaSections((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], variant: v };
                            return next;
                          });
                        }}
                      >
                        <option value="lead">Lead</option>
                        <option value="body">Body</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600"
                      onClick={() =>
                        setWwaSections((prev) =>
                          prev.filter((_, j) => j !== idx)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Text
                    <textarea
                      className={`${inputCls} mt-1 min-h-[88px]`}
                      value={sec.body}
                      onChange={(e) => {
                        const body = e.target.value;
                        setWwaSections((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], body };
                          return next;
                        });
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-[#163968] underline"
              onClick={() =>
                setWwaSections((prev) => [
                  ...prev,
                  {
                    id: `wwa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    variant: "body",
                    body: "",
                  },
                ])
              }
            >
              Add text section
            </button>
            <p className="text-xs text-slate-500">
              Cards: title, body, and image URL per row.
            </p>
            {site.whoWeAreImages.map((img, idx) => (
              <div
                key={img.id}
                className="rounded-lg border border-slate-200 p-4 space-y-2"
              >
                <div className="text-xs font-bold text-slate-500">
                  Card {idx + 1}
                </div>
                <Field
                  label="Title"
                  value={img.title ?? ""}
                  onChange={(v) => {
                    const whoWeAreImages = [...site.whoWeAreImages];
                    whoWeAreImages[idx] = { ...img, title: v || null };
                    setSite({ ...site, whoWeAreImages });
                  }}
                />
                <label className="block text-sm font-semibold text-slate-700">
                  Body
                  <textarea
                    className={`${inputCls} mt-1 min-h-[72px]`}
                    value={img.body ?? ""}
                    onChange={(e) => {
                      const whoWeAreImages = [...site.whoWeAreImages];
                      whoWeAreImages[idx] = {
                        ...img,
                        body: e.target.value || null,
                      };
                      setSite({ ...site, whoWeAreImages });
                    }}
                  />
                </label>
                <UrlField
                  label="Image URL"
                  value={img.url}
                  onChange={(v) => {
                    const whoWeAreImages = [...site.whoWeAreImages];
                    whoWeAreImages[idx] = { ...img, url: v };
                    setSite({ ...site, whoWeAreImages });
                  }}
                  inputCls={inputCls}
                />
                <Field
                  label="Alt"
                  value={img.alt ?? ""}
                  onChange={(v) => {
                    const whoWeAreImages = [...site.whoWeAreImages];
                    whoWeAreImages[idx] = { ...img, alt: v || null };
                    setSite({ ...site, whoWeAreImages });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-[#163968] underline"
              onClick={() =>
                setSite({
                  ...site,
                  whoWeAreImages: [
                    ...site.whoWeAreImages,
                    {
                      id: `new-${Date.now()}`,
                      url: "https://example.com/image.jpg",
                      alt: "",
                      title: "New card",
                      body: "",
                      order: site.whoWeAreImages.length,
                    },
                  ],
                })
              }
            >
              Add card
            </button>
            <SaveBar
              disabled={saving}
              onSave={() =>
                save({
                  whoWeAre: wwaSections.map((s) => s.body).join("\n\n"),
                  whoWeAreSections: wwaSections,
                  whoWeAreImages: site.whoWeAreImages.map((i, order) => ({
                    id: i.id.startsWith("new-") ? undefined : i.id,
                    url: i.url,
                    alt: i.alt,
                    title: i.title,
                    body: i.body,
                    order,
                  })),
                })
              }
            />
          </section>
        )}

        {tab === "Contact CTA" && (
          <section className="space-y-3 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            <ContactCtaForm
              site={site}
              setSite={setSite}
              onSave={() => save({ contactCta: site.contactCta ?? null })}
              saving={saving}
              inputCls={inputCls}
            />
          </section>
        )}

        {tab === "Membership" && (
          <section className="space-y-3 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            <UrlField
              label="Membership video URL"
              value={site.membershipVideoUrl ?? ""}
              onChange={(v) =>
                setSite({ ...site, membershipVideoUrl: v || null })
              }
              inputCls={inputCls}
              kind="video"
            />
            <Field
              label="Membership CTA URL"
              value={site.membershipCtaUrl ?? ""}
              onChange={(v) =>
                setSite({ ...site, membershipCtaUrl: v || null })
              }
            />
            <SaveBar
              disabled={saving}
              onSave={() =>
                save({
                  membershipVideoUrl: site.membershipVideoUrl,
                  membershipCtaUrl: site.membershipCtaUrl,
                })
              }
            />
          </section>
        )}

        {tab === "Featured event" && (
          <section className="space-y-3 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            <label className="block text-sm font-semibold text-slate-700">
              Featured event
              <select
                className={`${inputCls} mt-1`}
                value={site.featuredEventId ?? ""}
                onChange={(e) =>
                  setSite({
                    ...site,
                    featuredEventId: e.target.value || null,
                  })
                }
              >
                <option value="">— None —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.type}) {ev.isPublished ? "" : " [draft]"}
                  </option>
                ))}
              </select>
            </label>
            <SaveBar
              disabled={saving}
              onSave={() =>
                save({ featuredEventId: site.featuredEventId ?? null })
              }
            />
          </section>
        )}

        {tab === "Headers" && (
          <section className="space-y-4 bg-white rounded-xl p-6 shadow ring-1 ring-slate-100">
            {site.headers.map((h, idx) => (
              <div
                key={h.id}
                className="rounded-lg border border-slate-200 p-4 space-y-2"
              >
                <div className="text-xs font-mono text-slate-500">
                  pageKey: {h.pageKey}
                </div>
                <Field
                  label="Title"
                  value={h.title}
                  onChange={(v) => {
                    const headers = [...site.headers];
                    headers[idx] = { ...h, title: v };
                    setSite({ ...site, headers });
                  }}
                />
                <Field
                  label="Subtitle"
                  value={h.subtitle ?? ""}
                  onChange={(v) => {
                    const headers = [...site.headers];
                    headers[idx] = { ...h, subtitle: v || null };
                    setSite({ ...site, headers });
                  }}
                />
                <UrlField
                  label="Header image URL"
                  value={h.imageUrl ?? ""}
                  onChange={(v) => {
                    const headers = [...site.headers];
                    headers[idx] = { ...h, imageUrl: v || null };
                    setSite({ ...site, headers });
                  }}
                  inputCls={inputCls}
                />
              </div>
            ))}
            <SaveBar
              disabled={saving}
              onSave={() =>
                save({
                  headers: site.headers.map((h) => ({
                    id: h.id,
                    pageKey: h.pageKey,
                    title: h.title,
                    subtitle: h.subtitle,
                    imageUrl: h.imageUrl,
                  })),
                })
              }
            />
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminSiteEditor;
