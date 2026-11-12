"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ApprovedRosterPhoto, ParentRosterPhotoUploader, PendingRosterPhotoReview } from "@/components/RosterPhotoTools";

type ParentLink = { guardian_id: string; name: string; relationship: string | null };
type Player = {
  id: string; name: string; number: number | null; position: string | null;
  active: boolean; slot: string | null; show_on_field: boolean; public_visible: boolean;
  can_edit: boolean; name_consent: boolean; photo_consent: boolean;
  photo_id: string | null; parents: ParentLink[];
};
type RosterRequest = {
  id: string; kind: "link" | "name"; status: string; child_name: string;
  requested_by: string; player_id: string | null; requested_at: string;
  relationship: string | null; verification_info: string | null;
};
type PhotoRequest = { id: string; player_id: string; media_id: string; status: string };
type RosterData = {
  manager: boolean;
  players: Player[];
  requests: RosterRequest[];
  photo_requests: PhotoRequest[];
  formation: { name: string; show_names: boolean } | null;
};
type Mode = "management" | "parent" | "formation";
const formationSlots: Record<string, string[]> = {
  "1-1-2-1": ["GK", "CB", "LM", "RM", "ST"],
  "1-2-1-1": ["GK", "LB", "RB", "CM", "ST"],
  "1-2-2": ["GK", "LB", "RB", "LS", "RS"],
  "1-3-2-1": ["GK", "LB", "CB", "RB", "LM", "RM", "ST"],
  "1-2-3-1": ["GK", "LB", "RB", "LM", "CM", "RM", "ST"],
  "1-3-3-2": ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "LS", "RS"],
  "1-4-3-1": ["GK", "LB", "LCB", "RCB", "RB", "LM", "CM", "RM", "ST"]
};
const positions = ["", "GK", "DEF", "MID", "FWD", "LB", "CB", "RB", "LM", "CM", "RM", "ST", "LS", "RS", "LCB", "RCB"];

export function RosterWorkspace({ mode }: { mode: Mode }) {
  const router = useRouter();
  const managerPage = mode !== "parent";
  const [roster, setRoster] = useState<RosterData | null>(null);
  const [status, setStatus] = useState("Loading roster…");
  const [busy, setBusy] = useState(false);
  const [formName, setFormName] = useState("1-1-2-1");
  const [showNames, setShowNames] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [reviewTargets, setReviewTargets] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const result = await authedFetch<RosterData>(endpoints.rosterApi + "?private=true");
    if (managerPage && !result.manager) throw new Error("Manager access with MFA is required.");
    setRoster(result);
    setFormName(result.formation?.name || "1-1-2-1");
    setShowNames(result.formation?.show_names ?? true);
    setAssignments(Object.fromEntries(result.players.filter((p) => p.slot).map((p) => [p.slot as string, p.id])));
  }, [managerPage]);

  useEffect(() => {
    let active = true;
    (async () => {
      const session = await supabase.auth.getSession();
      if (!active) return;
      if (!session.data.session) { router.replace("/login"); return; }
      if (managerPage) {
        const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
      }
      try { await load(); if (active) setStatus(""); }
      catch (error) { if (active) setStatus(error instanceof Error ? error.message : "Roster unavailable."); }
    })();
    return () => { active = false; };
  }, [router, managerPage, load]);

  async function action(name: string, input: Record<string, unknown>) {
    setBusy(true);
    setStatus("");
    try {
      await authedFetch(endpoints.rosterApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, input })
      });
      await load();
      setStatus("Changes saved.");
    } catch (error) {
      const err = error as Error & { mfa_required?: boolean };
      if (err.mfa_required) { router.replace("/mfa"); return; }
      setStatus(err.message || "Unable to save changes.");
    } finally { setBusy(false); }
  }

  function addPlayer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (name) void action("player.create", { name });
    e.currentTarget.reset();
  }
  function updatePlayer(e: FormEvent<HTMLFormElement>, p: Player) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const numberValue = String(form.get("number") || "").trim();
    const input: Record<string, unknown> = {
      player_id: p.id, name: String(form.get("name") || "").trim(),
      number: numberValue === "" ? null : Number(numberValue),
      position: String(form.get("position") || "")
    };
    if (managerPage) {
      input.public_visible = form.get("public_visible") === "on";
      input.show_on_field = form.get("show_on_field") === "on";
    }
    void action("player.update", input);
  }

  const players = roster?.players || [];
  const pending = roster?.requests.filter((r) => r.status === "pending") || [];
  const slots = formationSlots[formName] || formationSlots["1-1-2-1"];

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title={mode === "parent" ? "My Players" : mode === "formation" ? "Team Formation" : "Player Administration"} isAdmin={managerPage} />
      <main className="container py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Private Team Workspace</div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">
              {mode === "parent" ? "My Players" : mode === "formation" ? "Formation Builder" : "Roster Management"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-neutral-600">
              {managerPage ? "Manage player details with manager MFA. Public visibility remains subject to guardian consent." :
                "Review your linked players and request changes securely. Player access is limited to approved guardians."}
            </p>
          </div>
          {managerPage && mode !== "formation" ? <Link href="/admin/formation" className="btn btn-light">Formation Builder</Link> : null}
        </div>

        {status ? <div role="status" className="notice mt-6 text-sm">{status}</div> : null}
        {!roster ? null : mode === "formation" ? (
          <section className="card mt-8 p-6">
            <h2 className="text-2xl font-black uppercase">Squad Shape</h2>
            <p className="mt-2 text-sm text-neutral-600">5v5 triangle/diamond: one goalkeeper, one central defender, left and right midfielders, and one striker. Players can appear in only one position. Saving replaces the current formation assignments.</p>
            <form className="mt-6" onSubmit={(e) => {
              e.preventDefault();
              const selected = Object.fromEntries(Object.entries(assignments).filter(([key, value]) => slots.includes(key) && value));
              if (new Set(Object.values(selected)).size !== Object.values(selected).length) {
                setStatus("The same player cannot occupy multiple positions."); return;
              }
              void action("formation.save", { name: formName, show_names: showNames, assignments: selected });
            }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-group"><span className="field-label">Formation</span>
                  <select className="field" value={formName} onChange={(e) => { setFormName(e.target.value); setAssignments({}); }}>
                    {Object.keys(formationSlots).map((name) => <option key={name} value={name}>{name === "1-1-2-1" ? "5v5 Diamond: GK · CB · LM · RM · ST" : `${name} (${formationSlots[name].length} players)`}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} /> Show player names</label>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => <label key={slot} className="rounded-2xl border border-neutral-200 p-4">
                  <span className="field-label">{({GK:"Goalkeeper",CB:"Central Defender",LM:"Left Midfielder",RM:"Right Midfielder",ST:"Striker"} as Record<string,string>)[slot] || slot} ({slot})</span>
                  <select className="field" value={assignments[slot] || ""} onChange={(e) => setAssignments((v) => ({ ...v, [slot]: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {players.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} {p.number !== null ? "#" + p.number : ""}</option>)}
                  </select>
                </label>)}
              </div>
              <button disabled={busy} className="btn btn-primary mt-6">{busy ? "Saving…" : "Save Formation"}</button>
            </form>
          </section>
        ) : (
          <>
            {managerPage ? (
              <section className="card mt-8 p-6">
                <h2 className="text-xl font-black uppercase">Add Player</h2>
                <form onSubmit={addPlayer} className="mt-4 flex flex-wrap gap-3">
                  <label className="min-w-56 flex-1"><span className="field-label">Player first name</span>
                    <input className="field" name="name" maxLength={100} required autoComplete="off" />
                  </label>
                  <button disabled={busy} className="btn btn-primary self-end">Add to Roster</button>
                </form>
                <p className="mt-3 text-xs text-neutral-500">New players start private. Set jersey number and position below after creation.</p>
              </section>
            ) : !players.length ? (
              <div className="notice mt-8">No player linked to this account. Submit a family link request below.</div>
            ) : null}

            <section className="mt-8">
              <h2 className="text-2xl font-black uppercase">{managerPage ? "Player Administration" : "Approved Player Records"}</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {players.map((p) => (
                  <section key={p.id} className="card p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-black uppercase">{p.name}</h3>
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold">{p.active ? "Active" : "Archived"}</span>
                    </div>
                    {p.can_edit ? <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => updatePlayer(e, p)}>
                      <label><span className="field-label">Display first name</span><input name="name" className="field" defaultValue={p.name} maxLength={100} required /></label>
                      <label><span className="field-label">Jersey number</span><input name="number" className="field" type="number" min="0" max="99" defaultValue={p.number ?? ""} /></label>
                      <label><span className="field-label">Preferred position</span><select className="field" name="position" defaultValue={p.position ?? ""}>
                        {positions.map((position) => <option key={position} value={position}>{position || "Not assigned"}</option>)}
                      </select></label>
                      <div className="grid content-center gap-2">
                        {managerPage ? <>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="public_visible" defaultChecked={p.public_visible} /> Publish consented profile</label>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="show_on_field" defaultChecked={p.show_on_field} /> Display on field</label>
                        </> : <div className="text-xs text-neutral-600">Profile edits may need manager review.</div>}
                      </div>
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                        <button className="btn btn-primary" disabled={busy || !p.active}>{busy ? "Saving…" : "Save Player"}</button>
                        {managerPage && p.active ? <button type="button" className="btn btn-light" disabled={busy} onClick={() => {
                          if (window.confirm("Archive this player? Their public profile and field placement will be removed.")) void action("player.archive", { player_id: p.id });
                        }}>Archive</button> : null}
                      </div>
                    </form> : <p className="text-sm text-neutral-600">Your account has read-only access to this player.</p>}
                    {p.photo_id ? <ApprovedRosterPhoto id={p.photo_id} name={p.name} /> : null}
                    {!managerPage && p.can_edit && p.active ? <ParentRosterPhotoUploader playerId={p.id} playerName={p.name} consent={p.photo_consent} onUploaded={() => void load()} /> : null}
                    {managerPage ? <div className="mt-4 border-t border-neutral-200 pt-4 text-xs text-neutral-600">
                      <div>Profile consent: {p.name_consent ? "Granted" : "Not granted"} · Photo consent: {p.photo_consent ? "Granted" : "Not granted"}</div>
                      <div className="mt-2">Family: {p.parents.length ? p.parents.map((parent) => parent.name).join(", ") : "Not linked"}</div>
                    </div> : null}
                  </section>
                ))}
              </div>
            </section>

            {managerPage ? <>
              <section className="card mt-8 p-6">
                <h2 className="text-2xl font-black uppercase">Family & Name Requests</h2>
                <p className="mt-2 text-sm text-neutral-600">Verify the child's identity and guardian relationship before approving a request. A requester cannot approve their own request.</p>
                {pending.length ? <div className="mt-5 grid gap-4">
                  {pending.map((request) => <div className="rounded-xl border border-neutral-200 p-4" key={request.id}>
                    <div className="font-black">{request.kind === "link" ? "Family Link" : "Display Name"} · {request.child_name}</div>
                    <div className="mt-1 text-xs text-neutral-500">Requested {new Date(request.requested_at).toLocaleString()} · {request.relationship || "Guardian"}</div>
                    {request.verification_info ? <p className="mt-2 text-sm text-neutral-600">Verification information: {request.verification_info}</p> : null}
                    {request.kind === "link" ? <select className="field mt-3" aria-label="Match to approved player" value={reviewTargets[request.id] || ""} onChange={(e) => setReviewTargets((v) => ({ ...v, [request.id]: e.target.value }))}>
                      <option value="">Select verified player</option>
                      {players.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} {p.number !== null ? "#" + p.number : ""}</option>)}
                    </select> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="btn btn-primary" disabled={busy || (request.kind === "link" && !reviewTargets[request.id])} onClick={() => {
                        if (window.confirm("Confirm the guardian has been independently verified?")) void action(request.kind + ".review", { request_id: request.id, status: "approved", ...(request.kind === "link" ? { player_id: reviewTargets[request.id] } : {}) });
                      }}>Approve</button>
                      <button className="btn btn-light" disabled={busy} onClick={() => void action(request.kind + ".review", { request_id: request.id, status: "rejected" })}>Reject</button>
                    </div>
                  </div>)}
                </div> : <p className="mt-4 text-sm text-neutral-600">No pending family or name requests.</p>}
              </section>
              <section className="card mt-6 p-6">
                <h2 className="text-2xl font-black uppercase">Profile Photos Awaiting Review</h2>
                {roster.photo_requests.length ? <div className="mt-4 grid gap-4">{roster.photo_requests.map((request) => {
                  const player = players.find((p) => p.id === request.player_id);
                  return <PendingRosterPhotoReview
                    key={request.id} request={request} playerName={player?.name || "Player"}
                    photoConsent={Boolean(player?.photo_consent)} disabled={busy}
                    onReview={(decision, confirmed) => {
                      if (decision === "rejected" && !window.confirm("Reject this roster portrait?")) return;
                      if (decision === "approved" && !window.confirm("Approve the reviewed and consent-verified roster portrait?")) return;
                      void action("photo.review", { request_id: request.id, status: decision, consent_reviewed: confirmed });
                    }} />;
                })}</div> : <p className="mt-4 text-sm text-neutral-600">No photos awaiting review.</p>}
              </section>
            </> : <section className="card mt-8 p-6">
              <h2 className="text-2xl font-black uppercase">Request a Family Link</h2>
              <p className="mt-2 text-sm text-neutral-600">If your child is missing, request a link. The manager will verify the relationship before access is granted.</p>
              <form className="mt-4 grid gap-4" onSubmit={(e) => {
                e.preventDefault(); const f = new FormData(e.currentTarget);
                void action("link.request", { child_name: String(f.get("child_name") || ""), relationship: String(f.get("relationship") || "parent"), verification_info: String(f.get("verification_info") || "") });
                e.currentTarget.reset();
              }}>
                <label><span className="field-label">Child's name</span><input className="field" name="child_name" maxLength={100} required /></label>
                <label><span className="field-label">Relationship</span><select name="relationship" className="field"><option value="parent">Parent</option><option value="guardian">Legal guardian</option></select></label>
                <label><span className="field-label">Verification details (private to management)</span><textarea name="verification_info" className="field" maxLength={1000} /></label>
                <button className="btn btn-primary" disabled={busy}>Submit Link Request</button>
              </form>
              {roster.requests.length ? <div className="mt-5 text-sm text-neutral-600">Your requests: {roster.requests.map((r) => r.child_name + " (" + r.status + ")").join(", ")}</div> : null}
            </section>}
          </>
        )}
      </main>
    </div>
  );
}
