import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FileSpreadsheet, FileUp, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, hasAuthToken, type PlaybookImportResult } from "../../lib/api";
import AdminPageShell from "./AdminPageShell";

const CSV_ACCEPT = ".csv,.CSV,text/csv,application/vnd.ms-excel";

function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || file.type.includes("csv") || file.type.includes("excel");
}

type UploadKind = "users" | "events";

export default function AdminUsersImportPage() {
  const { user, loading: authLoading } = useAuth();
  const userFileInputRef = useRef<HTMLInputElement>(null);
  const eventFileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [userFile, setUserFile] = useState<File | null>(null);
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<UploadKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFileHint, setUserFileHint] = useState<string | null>(null);
  const [eventFileHint, setEventFileHint] = useState<string | null>(null);
  const [result, setResult] = useState<PlaybookImportResult | null>(null);

  function selectFile(kind: UploadKind, next: File | null) {
    if (next && !isCsvFile(next)) {
      if (kind === "users") {
        setUserFile(null);
        setUserFileHint("Please choose a .csv file exported from Playbook.");
      } else {
        setEventFile(null);
        setEventFileHint("Please choose a .csv event export file.");
      }
      return;
    }

    if (kind === "users") {
      setUserFile(next);
      setUserFileHint(null);
    } else {
      setEventFile(next);
      setEventFileHint(null);
    }
    setError(null);
    setResult(null);
  }

  function clearFile(kind: UploadKind) {
    if (kind === "users") {
      setUserFile(null);
      setUserFileHint(null);
      if (userFileInputRef.current) userFileInputRef.current.value = "";
    } else {
      setEventFile(null);
      setEventFileHint(null);
      if (eventFileInputRef.current) eventFileInputRef.current.value = "";
    }
  }

  if (authLoading) {
    return (
      <AdminPageShell>
        <p className="max-w-2xl mx-auto text-sm text-slate-600">Loading…</p>
      </AdminPageShell>
    );
  }

  if (!user?.roles?.includes("ADMIN")) {
    return <Navigate to="/login" replace state={{ from: "/admin/users" }} />;
  }

  async function runImport() {
    if (!userFile) {
      setUserFileHint("Choose a Playbook CSV file before importing.");
      userFileInputRef.current?.focus();
      return;
    }
    if (!hasAuthToken()) {
      setError("Your session expired. Sign in again as an admin and retry.");
      return;
    }

    setLoading(true);
    setError(null);
    setUserFileHint(null);
    setEventFileHint(null);
    setResult(null);
    try {
      const csv = await userFile.text();
      const eventCsv = eventFile ? await eventFile.text() : undefined;
      const res = await api.importPlaybookUsers(csv, {
        eventCsv,
        eventFileName: eventFile?.name,
      });
      setResult(res);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  async function onImport(e: React.FormEvent) {
    e.preventDefault();
    await runImport();
  }

  function renderDropZone(
    kind: UploadKind,
    file: File | null,
    fileHint: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    title: string,
    subtitle: string
  ) {
    const isDragOver = dragOver === kind;

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={CSV_ACCEPT}
          className="sr-only"
          onChange={(e) => selectFile(kind, e.target.files?.[0] ?? null)}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(kind);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(kind);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOver((current) => (current === kind ? null : current));
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(null);
            selectFile(kind, e.dataTransfer.files?.[0] ?? null);
          }}
          className={[
            "rounded-2xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163968] focus-visible:ring-offset-2",
            fileHint
              ? "border-amber-400 bg-amber-50/60"
              : isDragOver
                ? "border-[#163968] bg-[#163968]/5"
                : file
                  ? "border-emerald-400 bg-emerald-50/40"
                  : "border-slate-300 bg-slate-50/80 hover:border-[#163968]/50 hover:bg-[#163968]/[0.03]",
          ].join(" ")}
        >
          {file ? (
            <div className="space-y-3">
              <FileSpreadsheet className="w-9 h-9 text-emerald-600 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB · ready to import
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#163968]/25 bg-white px-4 py-2 text-sm font-semibold text-[#163968] shadow-sm hover:bg-[#163968]/5"
                >
                  <Upload className="w-4 h-4" />
                  Choose a different file
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile(kind);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/80"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FileUp className="w-10 h-10 text-[#163968]/70 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[#163968]">{title}</p>
                <p className="text-sm text-slate-600">{subtitle}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#163968] px-5 py-2.5 text-sm font-semibold text-white shadow-sm pointer-events-none">
                <Upload className="w-4 h-4" />
                Browse files
              </span>
              <p className="text-xs text-slate-500">.csv files only</p>
            </div>
          )}
        </div>

        {fileHint && (
          <p className="text-sm text-amber-700" role="alert">
            {fileHint}
          </p>
        )}
      </>
    );
  }

  return (
    <AdminPageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#163968]">
            Import Playbook members
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Export users or participants from Playbook as CSV, then upload here.
            Optionally include a showcase event CSV so BAMS event data syncs to
            each member&apos;s profile by Playbook ID. Members sign in at{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">/bams</code> via
            magic link.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 space-y-4">
          <div>
            <p className="font-semibold text-[#163968]">1. User file (required)</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Email</strong> — &quot;Email&quot;, &quot;Account Email&quot;,
                &quot;E-mail&quot;, etc.
              </li>
              <li>
                <strong>Name</strong> — &quot;Full Name&quot;, or &quot;First Name&quot; +
                &quot;Last Name&quot;
              </li>
            </ul>
            <p className="text-slate-600 mt-2">
              Optional: Phone, DOB, Playbook ID,{" "}
              <strong>membership</strong> (<code className="text-xs bg-slate-100 px-1 rounded">bams</code>{" "}
              or{" "}
              <code className="text-xs bg-slate-100 px-1 rounded">bams-premium</code>
              ), grad year, positions, bats/throws, height, weight, school, city,
              state, zip.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#163968]">2. Event file (optional)</p>
            <p className="text-slate-600 mt-2">
              One row per event athlete. Required columns:{" "}
              <strong>Event ID</strong>, <strong>Event Name</strong> (include date in
              parentheses, e.g. Showcase (6/7/26)), <strong>ID</strong> (Playbook
              player id). Optional: first_name, last_name, and metric columns such as
              60-time, exit-velocity, fastball-velocity, etc. Grad year and primary
              position are taken from the user file when missing.
            </p>
          </div>
        </div>

        <form
          onSubmit={onImport}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-5"
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#163968]">Playbook user CSV</p>
            {renderDropZone(
              "users",
              userFile,
              userFileHint,
              userFileInputRef,
              "Upload Playbook CSV",
              "Drag and drop your user export here, or click to browse"
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#163968]">
              Showcase event CSV <span className="font-normal text-slate-500">(optional)</span>
            </p>
            {renderDropZone(
              "events",
              eventFile,
              eventFileHint,
              eventFileInputRef,
              "Upload event CSV",
              "Sync showcase metrics to imported members by Playbook ID"
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 space-y-2" role="alert">
              <p>{error}</p>
              {(error.includes("session") ||
                error.includes("401") ||
                error.includes("Authorization")) && (
                <Link
                  to="/login"
                  state={{ from: "/admin/users" }}
                  className="inline-block font-semibold text-[#163968] hover:underline"
                >
                  Sign in again
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#163968] text-white font-semibold px-5 py-2.5 text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importing…" : "Import members"}
          </button>
        </form>

        {result && (
          <div
            ref={resultRef}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-sm"
            aria-live="polite"
          >
            <p className="font-semibold text-[#163968]">Import complete</p>
            <p>
              <span className="font-semibold text-emerald-700">
                {result.created} created
              </span>
              {", "}
              <span className="font-semibold text-blue-700">
                {result.updated} updated
              </span>
              {result.skipped > 0 && (
                <>
                  {", "}
                  <span className="font-semibold text-amber-700">
                    {result.skipped} skipped
                  </span>
                </>
              )}
            </p>
            {result.eventImport && (
              <div className="rounded-lg bg-[#163968]/5 border border-[#163968]/15 px-3 py-2 text-slate-700 space-y-1">
                <p className="font-medium text-[#163968]">Event sync</p>
                <p>
                  {result.eventImport.eventRowCount} event row
                  {result.eventImport.eventRowCount === 1 ? "" : "s"} imported
                  {result.eventImport.linkedToMembers > 0 && (
                    <>
                      {" "}
                      · {result.eventImport.linkedToMembers} linked to Playbook
                      member
                      {result.eventImport.linkedToMembers === 1 ? "" : "s"}
                    </>
                  )}
                </p>
                {result.eventImport.unlinkedPlayerIds.length > 0 && (
                  <p className="text-amber-800">
                    Unlinked Playbook IDs (no matching user in import or database):{" "}
                    {result.eventImport.unlinkedPlayerIds.join(", ")}
                  </p>
                )}
                {(result.eventImport.parseErrors.length > 0 ||
                  result.eventImport.rowErrors.length > 0) && (
                  <div className="max-h-32 overflow-y-auto text-xs text-slate-600 space-y-1 pt-1">
                    {[...result.eventImport.parseErrors, ...result.eventImport.rowErrors].map(
                      (e, i) => (
                        <p key={`event-${e.row}-${i}`}>
                          Row {e.row}
                          {"playerId" in e && e.playerId ? ` (${e.playerId})` : ""}:{" "}
                          {e.message}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
            {((result.emailsSent ?? 0) > 0 || (result.emailsFailed ?? 0) > 0) && (
              <p className="text-slate-600">
                {(result.emailsSent ?? 0) > 0 && (
                  <span>
                    {result.emailsSent} BAMS sign-in email
                    {(result.emailsSent ?? 0) === 1 ? "" : "s"} sent.
                  </span>
                )}
                {(result.emailsFailed ?? 0) > 0 && (
                  <span
                    className={(result.emailsSent ?? 0) > 0 ? " block mt-1" : ""}
                  >
                    {result.emailsFailed} email
                    {(result.emailsFailed ?? 0) === 1 ? "" : "s"} could not be sent —
                    check Resend configuration and try &quot;Email me a sign-in
                    link&quot; at{" "}
                    <Link to="/bams/login" className="text-[#163968] underline">
                      /bams/login
                    </Link>
                    .
                  </span>
                )}
              </p>
            )}
            {(result.members?.length ?? 0) > 0 && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700">
                <p className="font-medium text-slate-800 mb-1">
                  Sign in at /bams with these emails:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.members!.map((m) => (
                    <li key={m.email}>
                      <span className="font-mono text-xs">{m.email}</span>
                      <span className="text-slate-500"> — {m.fullName}</span>
                      <span className="text-slate-400 text-xs">
                        {" "}
                        ({m.action})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.skipped > 0 && (result.members?.length ?? 0) === 0 && (
              <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No members were imported — see row errors below. Common cause:
                Playbook ID already linked to a different email from an earlier
                import. Re-import after the backend update, or remove the stale
                account first.
              </p>
            )}
            {result.updated > 0 && result.created === 0 && (
              <p className="text-slate-600">
                Updated rows already had accounts — their Playbook profile and
                BAMS access were refreshed. Re-importing the same file will
                always show as updated, not created.
              </p>
            )}
            {result.created === 0 &&
              result.updated === 0 &&
              result.skipped === 0 &&
              result.errors.length === 0 &&
              result.parseErrors.length === 0 && (
                <p className="text-slate-600">
                  No member rows were found in the CSV. Check that the file has a
                  header row plus at least one data row with Email and Name columns.
                </p>
              )}
            {(result.parseErrors.length > 0 || result.errors.length > 0) && (
              <div className="max-h-48 overflow-y-auto text-xs text-slate-600 space-y-1 rounded-lg border border-amber-200 bg-amber-50/50 p-2">
                {[...result.parseErrors, ...result.errors].map((e, i) => (
                  <p key={`${e.row}-${i}`}>
                    Row {e.row}
                    {e.email ? ` (${e.email})` : ""}: {e.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
