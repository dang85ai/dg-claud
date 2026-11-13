"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

import { SUPABASE_URL } from "@/lib/supabase";
type InviteRequest = { id: string; parent_name: string; email: string; player_name: string; status: string };
type Guardian = { id: string; user_id: string | null; full_name: string };
type Player = { id: string; name: string; number: number | null; active: boolean; parents: { guardian_id: string; name: string; relationship: string | null }[] };
type Roster = { manager: boolean; players: Player[] };
type OnboardResponse = { existing?: boolean; message?: string; activation_url?: string };

export default function FamiliesPage() {
  const router = useRouter();
  const [roster, setRoster] = useState<Roster | null>(null);
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [status, setStatus] = useState("Checking manager access…");
  const [busy, setBusy] = useState(false);
  const [activation, setActivation] = useState("");

  const refresh = useCallback(async () => {
    const snapshot = await authedFetch<Roster>(endpoints.rosterApi + "?private=true");
    if (!snapshot.manager) throw new Error("Manager MFA access required.");
    const result = await supabase.from("guardians").select("id,user_id,full_name").order("full_name");
    if (result.error) throw result.error;
    const queue = await supabase.from("parent_invite_requests")
      .select("id,parent_name,email,player_name,status").in("status", ["pending", "failed", "sending"])
      .order("created_at").limit(100);
    if (queue.error) throw queue.error;
    setRequests(queue.data ?? []);
    setRoster(snapshot);
    setGuardians(result.data || []);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session.data.session) { router.replace("/login"); return; }
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
      try { await refresh(); if (mounted) setStatus(""); }
      catch (error) { if (mounted) setStatus(error instanceof Error ? error.message : "Family accounts unavailable."); }
    })();
    return () => { mounted = false; };
  }, [refresh, router]);

  async function link(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    const player_id = String(form.get("player_id") || "");
    const guardian_id = String(form.get("guardian_id") || "");
    const relationship = String(form.get("relationship") || "parent");
    if (!player_id || !guardian_id || !roster?.players.some((p) => p.id === player_id && p.active) || !guardians.some((g) => g.id === guardian_id && g.user_id)) {
      setStatus("Select an active player and a verified parent account."); return;
    }
    if (!window.confirm("Have you independently verified this guardian's relationship to the player?")) return;
    setBusy(true); setStatus("");
    try {
      const result = await supabase.from("player_guardians").upsert({ player_id, guardian_id, relationship, is_primary: false }, { onConflict: "player_id,guardian_id" });
      if (result.error) throw result.error;
      await refresh(); setStatus("Family access linked. The parent can now view their player.");
    } catch (err) { setStatus(err instanceof Error ? err.message : "Unable to link family."); }
    finally { setBusy(false); }
  }

  async function unlink(player_id: string, guardian_id: string) {
    if (!window.confirm("Remove this guardian's access to the player?")) return;
    setBusy(true); setStatus("");
    try {
      await authedFetch(endpoints.rosterApi, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link.remove", input: { player_id, guardian_id } }) });
      await refresh(); setStatus("Guardian link removed.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Unable to remove link."); }
    finally { setBusy(false); }
  }

  async function reviewRequest(request: InviteRequest, action: "approve" | "decline") {
    const prompt = action === "approve"
      ? "Have you verified this parent or guardian? Approving requests an invitation to " + request.email + "."
      : "Decline this request?";
    if (!window.confirm(prompt)) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await authedFetch<{ message: string }>(SUPABASE_URL + "/functions/v1/parent-invite-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, action })
      });
      setStatus(result.message);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to review request.");
    } finally {
      setBusy(false);
    }
  }

  async function activate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    setBusy(true); setStatus(""); setActivation("");
    try {
      const result = await authedFetch<OnboardResponse>(endpoints.parentOnboarding, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: String(form.get("full_name") || ""), email: String(form.get("email") || "") })
      });
      setStatus(result.message || "Parent activation prepared.");
      if (result.activation_url) setActivation(result.activation_url);
      await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to prepare parent activation."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Family Connections" isAdmin />
      <main id="portal-main" tabIndex={-1} className="container py-8">
        <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Private · Manager MFA</div>
        <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Family & Player Access</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-600">Connect existing guardian accounts to squad players. Verify relationships before linking any private player record. Requests submitted by parents can also be reviewed in <Link href="/admin/players" className="underline">Player Administration</Link>.</p>
        {status ? <div role="status" className="notice mt-5">{status}</div> : null}
        {roster ? <>
          <section className="card mt-8 p-6">
            <h2 className="text-xl font-black uppercase">Parent Invite Requests</h2>
            <p className="mt-2 text-sm text-neutral-700">Verify the parent and player before approving. Approving requests an email to the address shown. Link the verified guardian to the player separately.</p>
            <div className="mt-4 grid gap-3">
              {requests.length === 0 && <p className="text-sm text-neutral-600">No requests awaiting review.</p>}
              {requests.map(request => <article key={request.id} className="rounded-xl border border-neutral-200 p-4">
                <h3 className="font-bold">{request.parent_name}</h3>
                <p className="break-all text-sm">{request.email}</p>
                <p className="mt-1 text-sm">Player: {request.player_name}</p>
                <p className="mt-1 text-sm">Status: {request.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy || request.status === "sending"} className="btn btn-primary" onClick={() => void reviewRequest(request, "approve")}>{request.status === "failed" ? "Retry Invitation" : "Approve & Email Invite"}</button>
                  <button type="button" disabled={busy || request.status === "sending"} className="btn btn-light" onClick={() => void reviewRequest(request, "decline")}>Decline</button>
                </div>
              </article>)}
            </div>
          </section>
          <section className="card mt-8 p-6">
            <h2 className="text-xl font-black uppercase">Connect Existing Family</h2>
            <form onSubmit={link} className="mt-5 grid gap-4 md:grid-cols-3">
              <label><span className="field-label">Player</span><select className="field" name="player_id" required defaultValue=""><option value="">Choose player</option>{roster.players.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} {p.number !== null ? "#" + p.number : ""}</option>)}</select></label>
              <label><span className="field-label">Registered guardian</span><select className="field" name="guardian_id" required defaultValue=""><option value="">Choose guardian</option>{guardians.filter((g) => g.user_id).map((g) => <option key={g.id} value={g.id}>{g.full_name}</option>)}</select></label>
              <label><span className="field-label">Relationship</span><select className="field" name="relationship" defaultValue="parent"><option value="parent">Parent</option><option value="guardian">Guardian</option><option value="other">Other approved relation</option></select></label>
              <button className="btn btn-primary md:col-span-3 md:justify-self-start" disabled={busy}>Verify & Link Family</button>
            </form>
          </section>
          <section className="card mt-8 p-6">
            <h2 className="text-xl font-black uppercase">Existing Player–Guardian Links</h2>
            <div className="mt-4 grid gap-3">{roster.players.filter((p) => p.parents.length).map((p) => <div key={p.id} className="rounded-xl border border-neutral-200 p-4">
              <h3 className="font-black">{p.name}</h3>
              <div className="mt-2 grid gap-2">{p.parents.map((g) => <div key={g.guardian_id} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm">{g.name} · {g.relationship || "Guardian"}</span>
                <button disabled={busy} className="btn btn-light" onClick={() => void unlink(p.id, g.guardian_id)}>Remove Access</button>
              </div>)}</div>
            </div>)}</div>
          </section>
        </> : null}
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-black uppercase">Prepare Parent Activation</h2>
          <p className="mt-2 text-sm text-neutral-600">This prepares a single-use private activation link for a new parent account. It does not email the parent or link a child automatically.</p>
          <form onSubmit={activate} className="mt-4 grid gap-4 md:grid-cols-2">
            <label><span className="field-label">Parent name</span><input className="field" name="full_name" required maxLength={100} /></label>
            <label><span className="field-label">Parent email</span><input className="field" name="email" type="email" maxLength={254} required /></label>
            <button disabled={busy || !roster} className="btn btn-primary md:col-span-2 md:justify-self-start">Prepare Private Activation</button>
          </form>
          {activation ? <div className="mt-5 rounded-xl border border-red-300 p-4">
            <p className="text-sm font-semibold">Share privately with this parent only. Do not publish the activation link.</p>
            <input className="field mt-3" value={activation} readOnly onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="btn btn-light mt-3" onClick={() => void navigator.clipboard.writeText(activation)}>Copy Link</button>
          </div> : null}
        </section>
      </main>
    </div>
  );
}

