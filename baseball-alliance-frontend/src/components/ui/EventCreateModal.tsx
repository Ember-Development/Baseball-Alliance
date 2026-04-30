// src/components/EventCreateModal.tsx
import React, { useMemo, useState } from "react";
import { type CreateEventInput, type EventType } from "../../lib/event";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (e: any) => void;
};

const eventTypes: EventType[] = ["TOURNAMENT", "COMBINE", "SHOWCASE"];

export default function EventCreateModal({ open, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosenType, setChosenType] = useState<EventType | null>(null);

  const [form, setForm] = useState<Partial<CreateEventInput>>({
    title: "",
    city: "",
    state: "TX",
    venue: "",
    isPublished: false,
    startDate: "",
    endDate: "",
    startTime: "", // for COMBINE
  });

  const canSubmit = useMemo(() => {
    if (
      !form.title ||
      !form.city ||
      !form.state ||
      !form.startDate ||
      !form.endDate ||
      !chosenType
    )
      return false;
    if (chosenType === "COMBINE" && !form.startTime) return false;
    return true;
  }, [form, chosenType]);

  if (!open) return null;

  const closeAll = () => {
    setStep(1);
    setChosenType(null);
    setForm({
      title: "",
      city: "",
      state: "TX",
      venue: "",
      isPublished: false,
      startDate: "",
      endDate: "",
      startTime: "",
    });
    setError(null);
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosenType) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: CreateEventInput = {
        title: form.title!,
        type: chosenType,
        city: form.city!,
        state: form.state!,
        venue: form.venue || undefined,
        isPublished: !!form.isPublished,
        startDate: form.startDate!,
        endDate: form.endDate!,
        startTime: chosenType === "COMBINE" ? form.startTime! : undefined,
      };
      const created = await api.createEvent(payload);
      onCreated?.(created);
      closeAll();
    } catch (err: any) {
      setError(err.message ?? "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={closeAll} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-white/80 backdrop-blur-xl shadow-xl">
        <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#163968]">
            Create Event
          </h3>
          <button
            onClick={closeAll}
            aria-label="Close"
            className="h-9 w-9 rounded-full border border-black/10 text-[#163968] bg-white hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        {!isAdmin && (
          <div className="px-5 py-4 text-sm text-red-600">
            You don’t have permission to create events.
          </div>
        )}

        {isAdmin && (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {step === 1 && (
              <>
                <p className="text-sm text-black/70">
                  First, choose the type of event:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {eventTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setChosenType(t);
                        setStep(2);
                      }}
                      className={`rounded-xl border px-3 py-3 font-semibold ${
                        chosenType === t
                          ? "border-[#163968] bg-white"
                          : "border-black/15 bg-white/60 hover:bg-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-sm font-semibold text-[#163968]">
                    Title
                    <input
                      className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                      value={form.title ?? ""}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-semibold text-[#163968]">
                      Start Date
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                        value={form.startDate as string}
                        onChange={(e) =>
                          setForm((f: any) => ({
                            ...f,
                            startDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-[#163968]">
                      End Date
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                        value={form.endDate as string}
                        onChange={(e) =>
                          setForm((f: any) => ({
                            ...f,
                            endDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  {chosenType === "COMBINE" && (
                    <label className="text-sm font-semibold text-[#163968]">
                      Start Time (e.g., 10:00 AM)
                      <input
                        placeholder="10:00 AM"
                        className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                        value={form.startTime ?? ""}
                        onChange={(e) =>
                          setForm((f: any) => ({
                            ...f,
                            startTime: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-semibold text-[#163968]">
                      City
                      <input
                        className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                        value={form.city ?? ""}
                        onChange={(e) =>
                          setForm((f: any) => ({ ...f, city: e.target.value }))
                        }
                        required
                      />
                    </label>
                    <label className="text-sm font-semibold text-[#163968]">
                      State (2-letter)
                      <input
                        className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 uppercase"
                        maxLength={2}
                        value={form.state ?? ""}
                        onChange={(e) =>
                          setForm((f: any) => ({
                            ...f,
                            state: e.target.value.toUpperCase(),
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  <label className="text-sm font-semibold text-[#163968]">
                    Venue (optional)
                    <input
                      className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                      value={form.venue ?? ""}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, venue: e.target.value }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!form.isPublished}
                      onChange={(e) =>
                        setForm((f: any) => ({
                          ...f,
                          isPublished: e.target.checked,
                        }))
                      }
                    />
                    <span>Publish immediately</span>
                  </label>
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm underline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className={`px-4 py-2 rounded-lg font-semibold text-white ${
                      !canSubmit || submitting
                        ? "bg-[#163968]/60"
                        : "bg-[#163968] hover:brightness-110"
                    }`}
                  >
                    {submitting ? "Creating…" : "Create Event"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
