"use client";
import { useState } from "react";
import { authedFetch, endpoints } from "@/lib/api";

type Group = { id: string; name: string };
type Event = { id: string; title: string; starts_at: string; venue: string; cancelled: boolean };
type Result = { ok: boolean; groups?: Group[]; events?: Event[]; warning?: string; checked_at: string };
export function SpondConnection() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [group, setGroup] = useState("");
  const [events, setEvents] = useState<Event[] | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");
  async function run(action: "connect" | "preview") {
    setBusy(true); setStatus(""); setWarning(""); setEvents(null);
    if (action === "connect") { setGroups([]); setGroup(""); }
    try {
      const result = await authedFetch<Result>(endpoints.spondApi, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(action === "preview" ? { group_id: group } : {}) })
      });
      if (action === "connect") {
        setGroups(result.groups || []);
        setStatus(result.groups?.length ? "Connection verified. Choose your team group to preview events." : "Connection verified. This account has no available groups.");
      } else {
        setEvents(result.events || []); setWarning(result.warning || "");
        setStatus(`Preview fetched ${new Date(result.checked_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })} · Toronto time. No records changed.`);
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : "Connection failed."); }
    finally { setBusy(false); }
  }
  return <section className="card mt-8 p-6" aria-labelledby="spond-api-title">
    <div className="text-xs font-bold uppercase tracking-widest text-red-600">Live Spond API · read-only</div>
    <h2 id="spond-api-title" className="mt-2 text-2xl font-bold">Connect your team</h2>
    <p className="mt-3 text-sm text-neutral-600">Test the connection, then choose a group to preview its events. This uses an unofficial Spond API; it may stop working if Spond changes it. No replies, messages or website records are changed.</p>
    <details className="mt-4 rounded-xl bg-neutral-100 p-4 text-sm"><summary className="cursor-pointer font-bold">Private connection setup</summary><p className="mt-3">The website owner adds SPOND_EMAIL and SPOND_PASSWORD under the Supabase project&apos;s Edge Function secrets. Enter credentials there privately, never in chat. Accounts requiring two-step verification aren&apos;t supported by this connector.</p></details>
    <button type="button" disabled={busy} onClick={() => run("connect")} className="btn btn-primary mt-5">{busy ? "Checking…" : "Test Spond connection"}</button>
    {groups.length ? <div className="mt-5 flex flex-wrap items-end gap-3"><div className="flex-1"><label htmlFor="spond-api-group" className="field-label">Your team group</label><select id="spond-api-group" className="field" value={group} onChange={e => { setGroup(e.target.value); setEvents(null); setStatus(""); setWarning(""); }} disabled={busy}><option value="">Choose a group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div><button type="button" className="btn btn-light" disabled={!group || busy} onClick={() => run("preview")}>Preview team events</button></div> : null}
    <p className="mt-4 text-sm" role="status" aria-live="polite">{status}</p>
    {warning ? <p role="alert" className="notice mt-3">{warning}</p> : null}
    {events !== null ? <div className="mt-4 grid gap-3">{events.length ? events.map(e => <article key={e.id} className="rounded-xl border p-4"><h3 className="font-bold">{e.title}{e.cancelled ? " · Cancelled" : ""}</h3><p className="mt-2 text-sm">{new Date(e.starts_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })} · Toronto time</p><p className="mt-1 text-sm text-neutral-600">{e.venue || "Venue to be confirmed"}</p></article>) : <p>No events returned for this group.</p>}</div> : null}
  </section>;
}
