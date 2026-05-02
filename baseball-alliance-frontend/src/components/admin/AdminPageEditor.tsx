import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { SitePublic } from "../../lib/site";
import { CMS_BLOCK_TYPES } from "../../cms/blockRegistry";

type LocalBlock = {
  clientKey: string;
  blockType: string;
  props: Record<string, unknown>;
};

function SortableBlock({
  block,
  onChangeType,
  onChangeProps,
  onRemove,
}: {
  block: LocalBlock;
  onChangeType: (t: string) => void;
  onChangeProps: (p: Record<string, unknown>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.clientKey });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="cursor-grab rounded border border-slate-200 px-2 py-1 text-slate-500 text-xs font-bold"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>
        <select
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          value={block.blockType}
          onChange={(e) => onChangeType(e.target.value)}
        >
          {CMS_BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="ml-auto text-xs font-semibold text-red-600"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
      {block.blockType === "richText" && (
        <label className="block text-xs font-semibold text-slate-600">
          HTML
          <textarea
            className="mt-1 w-full min-h-[100px] rounded-lg border border-slate-300 px-2 py-1 text-sm font-mono"
            value={typeof block.props.html === "string" ? block.props.html : ""}
            onChange={(e) => onChangeProps({ ...block.props, html: e.target.value })}
          />
        </label>
      )}
      {block.blockType === "image" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            URL
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
              value={typeof block.props.url === "string" ? block.props.url : ""}
              onChange={(e) =>
                onChangeProps({ ...block.props, url: e.target.value })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Alt
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
              value={typeof block.props.alt === "string" ? block.props.alt : ""}
              onChange={(e) =>
                onChangeProps({ ...block.props, alt: e.target.value })
              }
            />
          </label>
        </div>
      )}
      {block.blockType === "heading" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Text
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
              value={typeof block.props.text === "string" ? block.props.text : ""}
              onChange={(e) =>
                onChangeProps({ ...block.props, text: e.target.value })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Level
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
              value={Number(block.props.level ?? 2)}
              onChange={(e) =>
                onChangeProps({
                  ...block.props,
                  level: Number(e.target.value),
                })
              }
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

const AdminPageEditor: React.FC = () => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam ?? "";
  const { user } = useAuth();
  const [site, setSite] = useState<SitePublic | null>(null);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<LocalBlock[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const load = useCallback(async () => {
    const s = await api.getSiteAdmin();
    setSite(s);
    const page = s.pages.find((p) => p.slug === slug);
    if (page) {
      setTitle(page.title ?? "");
      setPublished(page.published);
      setBlocks(
        [...page.blocks]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((b) => ({
            clientKey: b.id,
            blockType: b.blockType,
            props: (b.props ?? {}) as Record<string, unknown>,
          }))
      );
    } else {
      setTitle(slug.replace(/-/g, " "));
      setPublished(false);
      setBlocks([]);
    }
  }, [slug]);

  useEffect(() => {
    if (!user?.roles?.includes("ADMIN") || !slug) return;
    setErr(null);
    load().catch((e: unknown) =>
      setErr(e instanceof Error ? e.message : "Load failed")
    );
  }, [user, slug, load]);

  const clientKeys = useMemo(() => blocks.map((b) => b.clientKey), [blocks]);

  if (!user?.roles?.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }
  if (!slug) {
    return <Navigate to="/admin/pages" replace />;
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.clientKey === String(active.id));
    const newIndex = blocks.findIndex((b) => b.clientKey === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        clientKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        blockType: "richText",
        props: { html: "<p>New block</p>" },
      },
    ]);
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await api.putAdminCmsPage(slug, {
        title,
        published,
        blocks: blocks.map((b, i) => ({
          blockType: b.blockType,
          sortOrder: i,
          props: b.props,
        })),
      });
      setMsg("Saved.");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (err && !site) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-700">{err}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-[#163968]">
            Page: <span className="font-mono text-slate-800">{slug}</span>
          </h1>
          <Link to="/admin/pages" className="text-sm underline">
            All pages
          </Link>
        </div>
        {site && (
          <p className="text-xs text-slate-500">
            Public URL:{" "}
            <Link className="text-[#163968] underline" to={`/pages/${slug}`}>
              /pages/{slug}
            </Link>{" "}
            (only when published)
          </p>
        )}
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Title
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={clientKeys}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {blocks.map((b, idx) => (
                <SortableBlock
                  key={b.clientKey}
                  block={b}
                  onChangeType={(t) => {
                    const next = [...blocks];
                    next[idx] = { ...b, blockType: t, props: {} };
                    if (t === "richText")
                      next[idx].props = { html: "<p></p>" };
                    if (t === "image") next[idx].props = { url: "", alt: "" };
                    if (t === "heading")
                      next[idx].props = { text: "", level: 2 };
                    setBlocks(next);
                  }}
                  onChangeProps={(p) => {
                    const next = [...blocks];
                    next[idx] = { ...b, props: p };
                    setBlocks(next);
                  }}
                  onRemove={() =>
                    setBlocks((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={addBlock}
          className="text-sm font-semibold text-[#163968] underline"
        >
          Add block
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-full bg-[#163968] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          Save page
        </button>
      </div>
    </main>
  );
};

export default AdminPageEditor;
