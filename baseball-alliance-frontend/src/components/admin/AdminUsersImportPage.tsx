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

export default function AdminUsersImportPage() {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileHint, setFileHint] = useState<string | null>(null);
  const [result, setResult] = useState<PlaybookImportResult | null>(null);

  function selectFile(next: File | null) {
    if (next && !isCsvFile(next)) {
      setFile(null);
      setFileHint("Please choose a .csv file exported from Playbook.");
      return;
    }
    setFile(next);
    setFileHint(null);
    setError(null);
    setResult(null);
  }

  function clearFile() {
    setFile(null);
    setFileHint(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (!file) {
      setFileHint("Choose a Playbook CSV file before importing.");
      fileInputRef.current?.focus();
      return;
    }
    if (!hasAuthToken()) {
      setError("Your session expired. Sign in again as an admin and retry.");
      return;
    }

    setLoading(true);
    setError(null);
    setFileHint(null);
    setResult(null);
    try {
      const csv = await file.text();
      const res = await api.importPlaybookUsers(csv);
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

  return (
    <AdminPageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#163968]">
            Import Playbook members
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Export users or participants from Playbook as CSV, then upload here.
            Each row creates or updates a member account with BAMS access (magic-link
            sign-in at <code className="text-xs bg-slate-100 px-1 rounded">/bams</code>
            ).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-[#163968]">Required CSV columns</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Email</strong> — &quot;Email&quot;, &quot;Account Email&quot;,
              &quot;E-mail&quot;, etc.
            </li>
            <li>
              <strong>Name</strong> — &quot;Full Name&quot;, or &quot;First Name&quot; +
              &quot;Last Name&quot;
            </li>
          </ul>
          <p className="font-semibold text-[#163968] pt-2">Optional columns</p>
          <p className="text-slate-600">
            Phone, DOB, Playbook ID, grad year, positions, bats/throws, height,
            weight, school, city, state, zip — mapped automatically when headers match
            common Playbook export labels.
          </p>
        </div>

        <form
          onSubmit={onImport}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={CSV_ACCEPT}
            className="sr-only"
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOver(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              selectFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={[
              "rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163968] focus-visible:ring-offset-2",
              fileHint
                ? "border-amber-400 bg-amber-50/60"
                : dragOver
                  ? "border-[#163968] bg-[#163968]/5"
                  : file
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-300 bg-slate-50/80 hover:border-[#163968]/50 hover:bg-[#163968]/[0.03]",
            ].join(" ")}
          >
            {file ? (
              <div className="space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
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
                      fileInputRef.current?.click();
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
                      clearFile();
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/80"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileUp className="w-12 h-12 text-[#163968]/70 mx-auto" />
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#163968]">
                    Upload Playbook CSV
                  </p>
                  <p className="text-sm text-slate-600">
                    Drag and drop your file here, or click to browse
                  </p>
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
