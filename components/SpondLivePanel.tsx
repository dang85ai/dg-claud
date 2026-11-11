"use client";

import { useCallback, useEffect, useState } from "react";
import { authedFetch, endpoints } from "@/lib/api";

type Group = { id: string; name: string };
type PreviewEvent = { id: string; title: string; starts_at: string; venue: string; cancelled: boolean };
type SyncState = {
  enabled: boolean; group_name: string | null; last_attempt_at: string | null;
  last_success_at: string | null; last_error: string | null;
  last_summary: Record<string, number> | null;
};
type SpondResponse = {
  ok: boolean; configured?: boolean; connected?: boolean; read_only?: boolean;
  groups?: Group[]; events?: PreviewEvent[]; possibly_truncated?: boolean;
  sync?: SyncState; error?: string;
};

export function SpondLivePanel() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [events, setEvents] = useState<PreviewEvent[] | null>(null);
  const [sync, setSync] = useState<SyncState | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const call = useCallback((action: string, extra: Record<string, unknown> = {}) =>
    authedFetch<SpondResponse>(endpoints.spondApi, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra })
    }), []);

  const refresh = useCallback(async () => {
    const [connection, state] = await Promise.all([call("status"), call("sync_status")]);
    setConfigured(Boolean(connection.configured));
    if (state.sync) setSync(state.sync);
  }, [call]);

  useEffect(() => { void refresh().catch((error) => setStatus(error instanceof Error ? error.message : "Unable to read Spond status.")); }, [refresh]);

  async function perform(task: string, extra: Record<string, unknown> = {}) {
    if (task === "sync_now" && !window.confirm("Sync Spond events to the team calendar now? Review game versus practice classifications immediately afterwards.")) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await call(task, extra);
      if (task === "connect") {
        setGroups(response.groups || []);
        setSelectedGroup(response.groups?.[0]?.id || "");
        setEvents(null);
        setStatus(response.connected ? "Spond connection verified. Select the correct team group to preview." : "Connection test completed.");
      } else if (task === "preview") {
        setEvents(response.events || []);
        setTruncated(Boolean(response.possibly_truncated));
        setStatus("Read-only event preview loaded. This does not change the team calendar.");
      } else {
        await refresh();
        setStatus(task === "sync_now" ? "Spond sync request completed. Review your calendar for event types." : "Spond sync setting updated.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Spond request failed.");
    } finally { setBusy(false); }
  }

  return (
    <section className="card mt-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Direct Spond Connection</div>
          <h2 className="mt-2 text-2xl font-black uppercase">Live Spond · Manager Controls</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            Test the team connection, preview events without changing data, and manage the existing schedule sync. This uses a server-side connection and never exposes the Spond password to the browser.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold">{configured === null ? "Checking…" : configured ? "Credentials configured" : "Credentials not configured"}</span>
      </div>

      {status ? <div className="notice mt-5 text-sm" role="status">{status}</div> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn btn-primary" disabled={busy || !configured} onClick={() => void perform("connect")}>{busy ? "Working…" : "Test Spond Connection"}</button>
        <button className="btn btn-light" disabled={busy} onClick={() => void refresh().catch((error) => setStatus(error instanceof Error ? error.message : "Unable to refresh status."))}>Refresh Status</button>
      </div>
      {groups.length ? <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label><span className="field-label">Connected Spond group</span><select className="field" value={selectedGroup} onChange={(e) => { setSelectedGroup(e.target.value); setEvents(null); }}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select></label>
        <button className="btn btn-light" disabled={busy || !selectedGroup} onClick={() => void perform("preview", { group_id: selectedGroup })}>Preview Events</button>
      </div> : null}

      {sync ? <div className="mt-6 rounded-2xl border border-neutral-200 p-4">
        <h3 className="text-lg font-black uppercase">Automatic Schedule Sync</h3>
        <div className="mt-2 text-sm text-neutral-700">
          Group: <strong>{sync.group_name || "Not selected"}</strong> · Status: <strong>{sync.enabled ? "Enabled" : "Paused"}</strong>
        </div>
        {sync.last_success_at ? <p className="mt-1 text-xs text-neutral-600">Last successful sync: {new Date(sync.last_success_at).toLocaleString()}</p> : null}
        {sync.last_error ? <p role="alert" className="mt-2 text-sm text-red-700">Last sync error: {sync.last_error}</p> : null}
        {sync.last_summary ? <p className="mt-2 text-xs text-neutral-600">{Object.entries(sync.last_summary).map(([key, value]) => key.replace(/_/g, " ") + ": " + value).join(" · ")}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn btn-light" disabled={busy} onClick={() => void perform(sync.enabled ? "sync_pause" : "sync_resume")}>{sync.enabled ? "Pause Sync" : "Resume Sync"}</button>
          <button className="btn btn-primary" disabled={busy || !sync.enabled || !configured || !sync.group_name} onClick={() => void perform("sync_now")}>Run Sync Now</button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">Event categories are inferred from Spond titles. Verify games, practices and cancellations after synchronization. The import tool below remains available when direct synchronization is unsuitable.</p>
      </div> : null}

      {events ? <div className="mt-6">
        <h3 className="text-lg font-black uppercase">Read-only event preview ({events.length})</h3>
        {truncated ? <p role="alert" className="mt-2 text-sm text-red-700">The preview hit Spond's 100-event limit; it may be incomplete. Do not assume these are all scheduled events.</p> : null}
        <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-neutral-200">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-neutral-100"><tr><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
            <tbody>{events.map((item) => <tr className="border-t border-neutral-200" key={item.id}>
              <td className="p-3 font-semibold">{item.title}{item.venue ? <div className="text-xs font-normal text-neutral-500">{item.venue}</div> : null}</td>
              <td className="whitespace-nowrap p-3">{new Date(item.starts_at).toLocaleString()}</td>
              <td className="p-3">{item.cancelled ? "Cancelled" : "Scheduled"}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div> : null}
    </section>
  );
}
