"use client";
import { useEffect, useState } from "react";
import { authedFetch, endpoints } from "@/lib/api";

type Group = { id: string; name: string };
type Event = { id: string; title: string; starts_at: string; venue: string; cancelled: boolean };
type Result = { ok: boolean; groups?: Group[]; events?: Event[]; warning?: string; checked_at: string };
export function SpondConnection() {
  const [sync, setSync] = useState<{enabled:boolean;group_name:string;last_success_at:string|null;last_error:string|null;last_summary:Record<string,number>|null}|null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  async function syncAction(action = "sync_status") {
    setSyncBusy(true); setSyncMessage("");
    try {
      const call = (value:string) => authedFetch<{sync:NonNullable<typeof sync>}>(endpoints.spondApi,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:value})});
      if(action !== "sync_status") await call(action);
      const result = await call("sync_status"); setSync(result.sync);
    } catch(error) { setSyncMessage(error instanceof Error ? error.message : "Unable to check sync status."); }
    finally { setSyncBusy(false); }
  }
  useEffect(() => { void syncAction(); }, []);
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
    <div className="rounded-xl border p-4 mb-6">
      <h3 className="text-xl font-bold">Daily schedule sync</h3>
      <p className="mt-2 text-sm">Once a day at 10:00 UTC (6 a.m. Toronto in summer, 5 a.m. in winter). New sessions stay private until a manager publishes them. Conflicting website edits are preserved.</p>
      {sync ? <><p className="mt-3 font-bold">{sync.enabled ? "Enabled" : "Paused"} · {sync.group_name}</p><p className="mt-2 text-sm">Last successful sync: {sync.last_success_at ? new Date(sync.last_success_at).toLocaleString("en-CA",{timeZone:"America/Toronto"}) + " · Toronto time" : "Not yet completed"}</p>{sync.last_summary ? <p className="mt-2 text-sm">Added {sync.last_summary.added} · Updated {sync.last_summary.updated} · Unchanged {sync.last_summary.unchanged} · Conflicts {sync.last_summary.conflicts}</p> : null}{sync.last_error ? <p role="alert" className="notice mt-2">{sync.last_error}</p> : null}<div className="mt-4 flex flex-wrap gap-3"><button type="button" className="btn btn-primary" disabled={syncBusy || !sync.enabled} onClick={() => syncAction("sync_now")}>Sync now</button><button type="button" className="btn btn-light" disabled={syncBusy} onClick={() => syncAction(sync.enabled ? "sync_pause" : "sync_resume")}>{sync.enabled ? "Pause auto sync" : "Resume auto sync"}</button></div></> : null}
      <p role="status" aria-live="polite" className="mt-2 text-sm">{syncBusy ? "Checking sync…" : syncMessage}</p>
    </div>
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
