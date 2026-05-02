import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useSiteConfig } from "./SiteConfigContext";
import { api } from "../lib/api";
import type { SitePublic } from "../lib/site";
import {
  mergeLeadershipPage,
  mergeMembershipPage,
} from "../lib/membershipLeadershipPages";
import { resolveWhoWeAreSectionsForSite } from "../lib/whoWeAreSections";

const STORAGE_KEY = "ba_site_content_edit_mode";

type SiteEditModeValue = {
  contentEditMode: boolean;
  setContentEditMode: (v: boolean) => void;
  toggleContentEditMode: () => void;
  /** Populated while content edit mode is on (admin); same shape as public site */
  draftSite: SitePublic | null;
  setDraftSite: React.Dispatch<React.SetStateAction<SitePublic | null>>;
  savePatch: (patch: Record<string, unknown>) => Promise<void>;
  /** PATCH all editable fields from the current draft to the server. */
  saveAll: () => Promise<void>;
  /** Re-fetch admin draft from the server, dropping local edits. */
  discardChanges: () => Promise<void>;
  /** True when the local draft differs from the server snapshot. */
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
};

const SiteEditModeContext = createContext<SiteEditModeValue | null>(null);

export function SiteEditModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { refresh } = useSiteConfig();
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  const [contentEditMode, setContentEditModeState] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [draftSite, setDraftSite] = useState<SitePublic | null>(null);
  const [serverSnapshot, setServerSnapshot] = useState<SitePublic | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setContentEditMode = useCallback((v: boolean) => {
    setContentEditModeState(v);
    try {
      sessionStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleContentEditMode = useCallback(() => {
    setContentEditModeState((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!contentEditMode || !isAdmin) {
      setDraftSite(null);
      setServerSnapshot(null);
      return;
    }
    let cancelled = false;
    api
      .getSiteAdmin()
      .then((s) => {
        if (cancelled) return;
        setDraftSite(s);
        setServerSnapshot(s);
      })
      .catch(() => {
        if (cancelled) return;
        setDraftSite(null);
        setServerSnapshot(null);
      });
    return () => {
      cancelled = true;
    };
  }, [contentEditMode, isAdmin]);

  const savePatch = useCallback(
    async (patch: Record<string, unknown>) => {
      setSaving(true);
      setSaveError(null);
      try {
        await api.patchSite(patch);
        await refresh();
        const next = await api.getSiteAdmin();
        setDraftSite(next);
        setServerSnapshot(next);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const saveAll = useCallback(async () => {
    if (!draftSite) return;
    const wwaSecs = resolveWhoWeAreSectionsForSite(draftSite);
    const payload: Record<string, unknown> = {
      whoWeAre: wwaSecs.map((s) => s.body).join("\n\n"),
      whoWeAreSections: wwaSecs,
      featuredEventId: draftSite.featuredEventId,
      heroEyebrow: draftSite.heroEyebrow,
      heroHeadline: draftSite.heroHeadline,
      heroSubcopy: draftSite.heroSubcopy,
      heroCtaLabel: draftSite.heroCtaLabel,
      heroCtaHref: draftSite.heroCtaHref,
      heroPosterUrl: draftSite.heroPosterUrl,
      heroVideoDesktopUrl: draftSite.heroVideoDesktopUrl,
      heroVideoMobileUrl: draftSite.heroVideoMobileUrl,
      contactCta: draftSite.contactCta ?? null,
      membershipVideoUrl: draftSite.membershipVideoUrl,
      membershipCtaUrl: draftSite.membershipCtaUrl,
      membershipPage: mergeMembershipPage(draftSite.membershipPage),
      leadershipPage: mergeLeadershipPage(draftSite.leadershipPage),
      whoWeAreImages: draftSite.whoWeAreImages.map((img, idx) => ({
        id: img.id?.startsWith("new-") ? undefined : img.id,
        url: img.url,
        alt: img.alt ?? null,
        title: img.title ?? null,
        body: img.body ?? null,
        order: idx,
      })),
      headers: draftSite.headers.map((h) => ({
        id: h.id,
        pageKey: h.pageKey,
        title: h.title,
        subtitle: h.subtitle ?? null,
        imageUrl: h.imageUrl ?? null,
      })),
    };
    await savePatch(payload);
  }, [draftSite, savePatch]);

  const discardChanges = useCallback(async () => {
    setSaveError(null);
    const next = await api.getSiteAdmin();
    setDraftSite(next);
    setServerSnapshot(next);
  }, []);

  const dirty = useMemo(() => {
    if (!draftSite || !serverSnapshot) return false;
    try {
      return JSON.stringify(draftSite) !== JSON.stringify(serverSnapshot);
    } catch {
      return false;
    }
  }, [draftSite, serverSnapshot]);

  const value = useMemo(
    () => ({
      contentEditMode,
      setContentEditMode,
      toggleContentEditMode,
      draftSite,
      setDraftSite,
      savePatch,
      saveAll,
      discardChanges,
      dirty,
      saving,
      saveError,
    }),
    [
      contentEditMode,
      setContentEditMode,
      toggleContentEditMode,
      draftSite,
      setDraftSite,
      savePatch,
      saveAll,
      discardChanges,
      dirty,
      saving,
      saveError,
    ]
  );

  return (
    <SiteEditModeContext.Provider value={value}>
      {children}
    </SiteEditModeContext.Provider>
  );
}

export function useSiteEditMode(): SiteEditModeValue {
  const ctx = useContext(SiteEditModeContext);
  if (!ctx) {
    throw new Error("useSiteEditMode requires SiteEditModeProvider");
  }
  return ctx;
}

/** Merged site for display + flags for inline CMS (admins only). */
export function useLiveSiteConfig() {
  const { site } = useSiteConfig();
  const ctx = useSiteEditMode();
  const { user } = useAuth();
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const live =
    ctx.contentEditMode && isAdmin && ctx.draftSite ? ctx.draftSite : site;
  return {
    site: live,
    isContentEditUI: Boolean(ctx.contentEditMode && isAdmin),
    draftReady: Boolean(ctx.draftSite),
    setDraftSite: ctx.setDraftSite,
    savePatch: ctx.savePatch,
    saveAll: ctx.saveAll,
    discardChanges: ctx.discardChanges,
    dirty: ctx.dirty,
    saving: ctx.saving,
    saveError: ctx.saveError,
    contentEditMode: ctx.contentEditMode,
  };
}
