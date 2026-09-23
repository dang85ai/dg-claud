"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, RefreshCw, ShieldCheck, Upload } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

type ImportType = "members" | "attendance";
type Preview = {
  ok: boolean;
  mode: "preview";
  import_type: ImportType;
  filename: string;
  sheet: string;
  row_count: number;
  headers: string[];
  detected_mapping: Record<string, string | null>;
  sample_rows: Record<string, unknown>[];
  raw_file_retained: boolean;
  required_mapping: string[];
};

type CommitResult = {
  ok: boolean;
  mode: "commit";
  import_type: ImportType;
  summary: Record<string, number>;
  warnings?: string[];
  unmatched_players?: string[];
  unmatched_events?: string[];
  unrecognized_statuses?: string[];
  raw_file_retained: boolean;
  invitation_emails_sent?: boolean;
};

const MEMBER_FIELDS = [
  ["first_name", "First name"],
  ["last_name", "Last name"],
  ["full_name", "Full name"],
  ["guardian_name", "Guardian name"],
  ["guardian_email", "Guardian email"],
  ["jersey_number", "Jersey number"],
  ["position", "Position"],
  ["date_of_birth", "Date of birth"]
];

const ATTENDANCE_FIELDS = [
  ["member_name", "Player full name"],
  ["first_name", "First name"],
  ["last_name", "Last name"],
  ["event_name", "Event name"],
  ["event_date", "Event date"],
  ["status", "Attendance status"]
];

export default function SpondImportPage() {
  const router = useRouter();
  const [type, setType] = useState<ImportType>("members");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CommitResult | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data.currentLevel !== "aal2") {
        router.replace("/mfa");
      }
    })();
  }, [router]);

  const fields = type === "members" ? MEMBER_FIELDS : ATTENDANCE_FIELDS;

  const canCommit = useMemo(() => {
    if (!preview) return false;
    if (type === "members") {
      return Boolean(mapping.full_name || (mapping.first_name && mapping.last_name));
    }
    return Boolean(
      (mapping.member_name || (mapping.first_name && mapping.last_name)) &&
      mapping.event_name &&
      mapping.event_date &&
      mapping.status
    );
  }, [preview, mapping, type]);

  function resetForType(next: ImportType) {
    setType(next);
    setFile(null);
    setPreview(null);
    setMapping({});
    setResult(null);
    setStatus("");
  }

  async function callImporter(mode: "preview" | "commit") {
    if (!file) throw new Error("Choose a Spond export first.");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Please sign in.");

    const body = new FormData();
    body.append("file", file);
    body.append("import_type", type);
    body.append("mode", mode);
    if (mode === "commit") body.append("mapping", JSON.stringify(mapping));

    const response = await fetch(endpoints.spondImport, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`
      },
      body,
      cache: "no-store"
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Spond import failed.");
    return payload;
  }

  async function previewFile(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setResult(null);
    try {
      const data = await callImporter("preview") as Preview;
      setPreview(data);
      const detected: Record<string,string> = {};
      Object.entries(data.detected_mapping ?? {}).forEach(([k,v]) => {
        if (v) detected[k] = v;
      });
      setMapping(detected);
      setStatus(`Preview ready: ${data.row_count} rows found in ${data.sheet}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to preview file.");
    } finally {
      setBusy(false);
    }
  }

  async function commitImport() {
    if (!canCommit) {
      setStatus("Complete the required column mappings before importing.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const data = await callImporter("commit") as CommitResult;
      setResult(data);
      setStatus("Spond import completed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to import file.");
    } finally {
      setBusy(false);
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setPreview(null);
    setMapping({});
    setResult(null);
    setStatus("");
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Spond Import" isAdmin />
      <main className="container py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">
              Spond Integration
            </div>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">
              Import Team Data
            </h1>
            <p className="mt-3 max-w-3xl text-neutral-600">
              Review the Spond export before anything changes. Raw spreadsheets are parsed in memory and are not retained.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-black uppercase text-white">
            <ShieldCheck size={16} /> MFA Protected
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => resetForType("members")}
            className={`card p-5 text-left ${type === "members" ? "border-red-600 ring-2 ring-red-100" : ""}`}
          >
            <div className="text-xs font-black uppercase text-red-600">Roster</div>
            <div className="mt-2 text-xl font-black uppercase">Import Members</div>
            <p className="mt-2 text-sm text-neutral-600">
              Match or create players, enrich jersey/position details, and prepare parent invites where guardian email is provided.
            </p>
          </button>

          <button
            onClick={() => resetForType("attendance")}
            className={`card p-5 text-left ${type === "attendance" ? "border-red-600 ring-2 ring-red-100" : ""}`}
          >
            <div className="text-xs font-black uppercase text-red-600">RSVP / Attendance</div>
            <div className="mt-2 text-xl font-black uppercase">Import Attendance</div>
            <p className="mt-2 text-sm text-neutral-600">
              Match Spond rows to existing players and events. Existing non-unknown attendance is never overwritten automatically.
            </p>
          </button>
        </div>

        <form onSubmit={previewFile} className="card mt-6 p-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-red-600" />
            <h2 className="text-2xl font-black uppercase">
              {type === "members" ? "Member Export" : "Attendance Export"}
            </h2>
          </div>

          <div className="field-group mt-6">
            <label htmlFor="spond_file" className="field-label">Spond .xlsx or .csv file</label>
            <input
              id="spond_file"
              className="field"
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              required
              onChange={chooseFile}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={!file || busy}>
            <Upload size={18} />
            {busy ? "Reading…" : "Preview Import"}
          </button>

          <p className="mt-4 text-xs text-neutral-500">
            Maximum 5 MB and 1,000 rows per import. No invitation emails are sent by this development workflow.
          </p>
        </form>

        {status ? <div className="notice mt-6 text-sm">{status}</div> : null}

        {preview ? (
          <>
            <section className="card mt-6 p-6">
              <h2 className="text-2xl font-black uppercase">Column Mapping</h2>
              <p className="mt-2 text-sm text-neutral-600">
                We detected likely Spond columns. Review them before committing the import.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {fields.map(([fieldKey, label]) => (
                  <div className="field-group !mb-0" key={fieldKey}>
                    <label className="field-label" htmlFor={fieldKey}>{label}</label>
                    <select
                      id={fieldKey}
                      className="field"
                      value={mapping[fieldKey] ?? ""}
                      onChange={(e) => setMapping((current) => ({
                        ...current,
                        [fieldKey]: e.target.value
                      }))}
                    >
                      <option value="">Not mapped</option>
                      {preview.headers.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className="card mt-6 overflow-hidden">
              <div className="border-b border-neutral-200 p-6">
                <h2 className="text-2xl font-black uppercase">Preview</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Showing the first {Math.min(5, preview.sample_rows.length)} rows of {preview.row_count}.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-neutral-100">
                    <tr>
                      {preview.headers.map((header) => (
                        <th key={header} className="whitespace-nowrap px-4 py-3 font-black">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample_rows.map((row, index) => (
                      <tr key={index} className="border-t border-neutral-200">
                        {preview.headers.map((header) => (
                          <td key={header} className="max-w-[260px] whitespace-nowrap px-4 py-3 text-neutral-600">
                            {String(row[header] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 rounded-3xl bg-black p-6 text-white">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Review Before Commit</div>
                  <h2 className="mt-2 text-2xl font-black uppercase">Ready to Import?</h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/65">
                    {type === "members"
                      ? "Players are matched by normalized first + last name. Public profiles stay hidden. Guardian emails prepare private parent access but do not send mail."
                      : "Attendance imports only where player and event matches are clear. Existing confirmed attendance is preserved as a conflict rather than overwritten."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={commitImport}
                  disabled={!canCommit || busy}
                  className="btn btn-primary"
                >
                  <RefreshCw size={18} />
                  {busy ? "Importing…" : "Commit Import"}
                </button>
              </div>
            </section>
          </>
        ) : null}

        {result ? (
          <section className="card mt-6 p-6">
            <h2 className="text-2xl font-black uppercase">Import Result</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(result.summary).map(([label,value]) => (
                <div key={label} className="rounded-2xl bg-neutral-100 p-4">
                  <div className="text-3xl font-black">{value}</div>
                  <div className="mt-2 text-xs font-black uppercase text-neutral-500">
                    {label.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>

            {result.warnings?.length ? (
              <div className="mt-6">
                <h3 className="font-black uppercase">Warnings</h3>
                <ul className="mt-2 grid gap-1 text-sm text-neutral-600">
                  {result.warnings.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ) : null}

            {result.unmatched_players?.length ? (
              <div className="mt-6">
                <h3 className="font-black uppercase">Unmatched Players</h3>
                <p className="mt-2 text-sm text-neutral-600">{result.unmatched_players.join(", ")}</p>
              </div>
            ) : null}

            {result.unmatched_events?.length ? (
              <div className="mt-6">
                <h3 className="font-black uppercase">Unmatched Events</h3>
                <p className="mt-2 text-sm text-neutral-600">{result.unmatched_events.join(", ")}</p>
              </div>
            ) : null}

            {result.unrecognized_statuses?.length ? (
              <div className="mt-6">
                <h3 className="font-black uppercase">Unrecognized Attendance Values</h3>
                <p className="mt-2 text-sm text-neutral-600">{result.unrecognized_statuses.join(", ")}</p>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
