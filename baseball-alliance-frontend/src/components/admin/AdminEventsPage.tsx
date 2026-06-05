import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { EventPublic, EventType } from "../../lib/event";
import EventCreateModal from "../ui/EventCreateModal";
import AdminPageShell from "./AdminPageShell";
import { formatCalendarDate } from "../../lib/calendarDate";

const EVENT_TYPES: EventType[] = ["TOURNAMENT", "COMBINE", "SHOWCASE"];

function formatDateRange(e: EventPublic): string {
  const start = formatCalendarDate(e.startDate);
  const end = formatCalendarDate(e.endDate);
  if (start === end) return start;
  return `${start} – ${end}`;
}

function formatLocation(e: EventPublic): string {
  if (e.venue) return `${e.venue}, ${e.city}, ${e.state}`;
  return `${e.city}, ${e.state}`;
}

const AdminEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"ALL" | EventType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "published" | "draft">(
    "ALL"
  );
  const [openCreate, setOpenCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventPublic | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const list = await api.listEventsAdmin();
      setEvents(list);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.roles?.includes("ADMIN")) return;
    void load();
  }, [user, load]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
      if (statusFilter === "published" && !e.isPublished) return false;
      if (statusFilter === "draft" && e.isPublished) return false;
      return true;
    });
  }, [events, typeFilter, statusFilter]);

  const closeModal = useCallback(() => {
    setOpenCreate(false);
    setEditingEvent(null);
  }, []);

  const handleSaved = useCallback(() => {
    void load();
  }, [load]);

  const togglePublish = async (event: EventPublic) => {
    setBusyId(event.id);
    setErr(null);
    try {
      if (event.isPublished) {
        await api.unpublishEvent(event.id);
      } else {
        await api.publishEvent(event.id);
      }
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (event: EventPublic) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This cannot be undone.`
    );
    if (!confirmed) return;
    setBusyId(event.id);
    setErr(null);
    try {
      await api.deleteEvent(event.id);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  if (!user?.roles?.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  const draftCount = events.filter((e) => !e.isPublished).length;
  const publishedCount = events.filter((e) => e.isPublished).length;

  return (
    <AdminPageShell>
      <EventCreateModal
        open={openCreate || editingEvent !== null}
        event={editingEvent}
        onClose={closeModal}
        onCreated={handleSaved}
        onUpdated={handleSaved}
        onDeleted={handleSaved}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#163968]">Events</h1>
            <p className="text-sm text-slate-600 mt-1">
              {publishedCount} published · {draftCount} draft
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-lg bg-[#163968] px-4 py-2 font-semibold text-white shadow hover:brightness-110"
            >
              New event
            </button>
            <Link to="/admin/site" className="text-slate-600 underline">
              Site CMS
            </Link>
            <Link to="/" className="text-slate-600 underline">
              View site
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-slate-700">
            Type
            <select
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "ALL" | EventType)
              }
            >
              <option value="ALL">All types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Status
            <select
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | "published" | "draft"
                )
              }
            >
              <option value="ALL">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        {err && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {err}
          </p>
        )}

        <section className="bg-white rounded-xl shadow ring-1 ring-slate-100 overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading events…</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              {events.length === 0
                ? "No events yet. Create one to get started."
                : "No events match the current filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => {
                    const isBusy = busyId === event.id;
                    return (
                      <tr
                        key={event.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3 font-semibold text-[#163968]">
                          {event.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {event.type}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {formatDateRange(event)}
                          {event.startTime ? (
                            <span className="block text-xs text-slate-500">
                              {event.startTime}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatLocation(event)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              event.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {event.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setEditingEvent(event)}
                              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-[#163968] hover:bg-slate-50 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void togglePublish(event)}
                              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {event.isPublished ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDelete(event)}
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
};

export default AdminEventsPage;
