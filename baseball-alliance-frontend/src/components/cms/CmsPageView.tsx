import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { PublishedCmsPageResponse } from "../../lib/site";
import { renderCmsBlock } from "../../cms/blockRegistry";

const CmsPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PublishedCmsPageResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setErr(null);
    api
      .getPublishedCmsPage(slug)
      .then((p) => {
        if (!cancelled) setPage(p);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Failed to load page");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (err) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-red-700">{err}</p>
      </main>
    );
  }
  if (!page) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Loading…
      </main>
    );
  }

  const blocks = [...page.blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      {page.title && (
        <h1 className="text-4xl font-black text-[#163968] mb-8">{page.title}</h1>
      )}
      <div className="space-y-4">
        {blocks.map((b) => (
          <div key={b.id}>{renderCmsBlock(b.blockType, b.props)}</div>
        ))}
      </div>
    </main>
  );
};

export default CmsPageView;
