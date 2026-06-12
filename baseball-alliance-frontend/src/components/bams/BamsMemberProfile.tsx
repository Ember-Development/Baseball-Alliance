import { useEffect, useState } from "react";
import { api, type BamsProfileResponse } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import SavedMatchesPanel from "./SavedMatchesPanel";

function membershipLabel(label: BamsProfileResponse["membershipLabel"]): string {
  return label === "bams-premium" ? "BAMS Premium" : "BAMS";
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}

export default function BamsMemberProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<BamsProfileResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBamsProfile()
      .then(setData)
      .catch((e: unknown) =>
        setErr(e instanceof Error ? e.message : "Failed to load profile")
      );
  }, []);

  if (err) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {err}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  const p = data.profile;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#163968]">Your profile</h2>
        <p className="text-sm text-slate-600 mt-1">
          Signed in as {user?.fullName ?? data.user.fullName} ({data.user.email}
          )
        </p>
        <div className="mt-3 rounded-lg border border-[#163968]/15 bg-[#163968]/5 px-3 py-2 text-sm text-slate-700">
          <p>
            <span className="font-medium text-[#163968]">Membership:</span>{" "}
            {membershipLabel(data.membershipLabel)}
          </p>
          <p className="mt-1">
            <span className="font-medium text-[#163968]">BAMS match runs:</span>{" "}
            {data.matchRunsRemaining} of {data.matchRunsLimit} remaining
            {data.matchRunsUsed > 0 && (
              <span className="text-slate-500"> ({data.matchRunsUsed} used)</span>
            )}
          </p>
          {data.matchRunsRemaining === 0 && (
            <p className="mt-1 text-amber-800">
              You&apos;ve used all included match runs. Saved matches on this
              profile are still available.
            </p>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Grad year" value={p?.gradYear} />
          <Field label="Primary position" value={p?.primaryPosition} />
          <Field label="Secondary position" value={p?.secondaryPosition} />
          <Field label="Bats" value={p?.bats} />
          <Field label="Throws" value={p?.throws} />
          <Field label="Height" value={p?.height} />
          <Field label="Weight" value={p?.weight} />
          <Field label="School" value={p?.schoolName} />
          <Field label="School location" value={p?.schoolLocation} />
          <Field label="City" value={p?.city} />
          <Field label="State" value={p?.state} />
          <Field label="ZIP" value={p?.zip} />
        </dl>
        {!p && (
          <p className="mt-3 text-sm text-slate-500">
            No athletic details on file yet. Contact support if your Playbook
            export should have included them.
          </p>
        )}
      </section>

      <SavedMatchesPanel />
    </div>
  );
}
