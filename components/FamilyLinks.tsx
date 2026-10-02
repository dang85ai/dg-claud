"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Account = { id: string; full_name: string | null; display_name: string | null };
type Player = { id: string; first_name: string; last_name: string; jersey_number: number | null };
type Guardian = { id: string; user_id: string; full_name: string };
type RequestRow = { id: string; name: string; email: string; message: string; created_at: string };
type FamilyLink = { player_id: string; guardian_id: string; relationship: string | null };

export function FamilyLinks({ refreshKey = 0 }: { refreshKey?: number }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const user = await supabase.auth.getUser();
      if (user.error || !user.data.user) throw new Error("Please sign in again.");
      const [roles, aal] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.data.user.id),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      ]);
      if (roles.error) throw roles.error;
      if (!(roles.data ?? []).some((row) => ["admin", "manager"].includes(row.role))) {
        throw new Error("Manager access is required to link families.");
      }
      if (aal.error || aal.data.currentLevel !== "aal2") {
        throw new Error("Complete multi-factor authentication before linking families.");
      }
      const results = await Promise.all([
        supabase.from("profiles").select("id,full_name,display_name").order("full_name"),
        supabase.from("players").select("id,first_name,last_name,jersey_number").eq("active", true).order("first_name"),
        supabase.from("guardians").select("id,user_id,full_name"),
        supabase.from("player_guardians").select("player_id,guardian_id,relationship"),
        supabase.from("contact_submissions").select("id,name,email,message,created_at").eq("subject", "Parent portal: link child").order("created_at", { ascending: false }).limit(50)
      ]);
      for (const result of results) if (result.error) throw result.error;
      setAccounts(results[0].data as Account[] ?? []);
      setPlayers(results[1].data as Player[] ?? []);
      setGuardians(results[2].data as Guardian[] ?? []);
      setLinks(results[3].data as FamilyLink[] ?? []);
      setRequests(results[4].data as RequestRow[] ?? []);
    } catch (err) {
      setAccounts([]); setPlayers([]); setGuardians([]); setLinks([]); setRequests([]);
      setError(err instanceof Error ? err.message : "Unable to load family records. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const userId = String(form.get("user_id") ?? "");
    const playerId = String(form.get("player_id") ?? "");
    const name = String(form.get("guardian_name") ?? "").trim();
    const relationship = String(form.get("relationship") ?? "").trim();
    setError(""); setMessage(""); setBusy(true);
    try {
      if (!accounts.some((account) => account.id === userId) || !players.some((player) => player.id === playerId) || !name) {
        throw new Error("Choose an account and player, and enter the guardian's name.");
      }
      // Database policies enforce manager/admin access and AAL2 for every write.
      let guardian = guardians.find((row) => row.user_id === userId);
      if (!guardian) {
        const result = await supabase.from("guardians")
          .upsert({ user_id: userId, full_name: name }, { onConflict: "user_id", ignoreDuplicates: true });
        if (result.error) throw result.error;
        const lookup = await supabase.from("guardians").select("id,user_id,full_name").eq("user_id", userId).single();
        if (lookup.error) throw lookup.error;
        guardian = lookup.data as Guardian;
      }
      const existing = await supabase.from("player_guardians")
        .select("player_id").eq("player_id", playerId).eq("guardian_id", guardian.id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data) {
        setMessage("This child is already linked to that account.");
      } else {
        const result = await supabase.from("player_guardians")
          .upsert({ player_id: playerId, guardian_id: guardian.id, relationship: relationship || null, is_primary: false },
            { onConflict: "player_id,guardian_id", ignoreDuplicates: true });
        if (result.error) throw result.error;
        const verified = await supabase.from("player_guardians").select("player_id")
          .eq("player_id", playerId).eq("guardian_id", guardian.id).single();
        if (verified.error) throw verified.error;
        setMessage("Child linked. The parent can refresh their portal to see the player and use family tools.");
      }
      element.reset();
      await load();
    } catch (err) {
      const detail = err && typeof err === "object" && "message" in err ? String(err.message) : "Unable to save the family link.";
      setError(detail + " If the guardian profile was created, you can safely retry this link.");
    } finally { setBusy(false); }
  }

  return (
    <section id="families" className="card mt-6 p-6">
      <h2 className="text-2xl font-black uppercase">Link a Child to a Parent</h2>
      <p className="mt-3 text-sm text-neutral-600">
        Adding a player to the roster does not connect them to a family. Verify the guardian, then link the existing child to their existing account here.
        This enables private forms and family tools. Use the account ID shown in the parent's portal to distinguish accounts with the same name.
      </p>
      {message ? <p role="status" className="notice mt-4">{message}</p> : null}
      {error ? <p role="alert" className="notice mt-4">{error}</p> : null}
      <button type="button" className="btn mt-4 border border-neutral-300" disabled={loading || busy} onClick={() => void load()}>
        {loading ? "Loading families…" : "Refresh Accounts & Players"}
      </button>
      {!loading && !error ? (
        <>
          {!accounts.length || !players.length ? <p className="notice mt-4">A parent needs an activated account and a child needs a roster entry before you can create a family link.</p> : null}
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <div>
              <label htmlFor="family_account" className="field-label">Parent account</label>
              <select id="family_account" name="user_id" className="field" required disabled={busy}>
                <option value="">Select account</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>
                  {account.full_name || account.display_name || "Unnamed account"} · {account.id}
                </option>)}
              </select>
            </div>
            <div>
              <label htmlFor="family_player" className="field-label">Child on roster</label>
              <select id="family_player" name="player_id" className="field" required disabled={busy}>
                <option value="">Select child</option>
                {players.map((player) => <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name}{player.jersey_number !== null ? " #" + player.jersey_number : ""}
                </option>)}
              </select>
            </div>
            <div>
              <label htmlFor="guardian_name" className="field-label">Guardian full name</label>
              <input id="guardian_name" name="guardian_name" className="field" maxLength={140} required disabled={busy} />
            </div>
            <div>
              <label htmlFor="family_relationship" className="field-label">Relationship</label>
              <select id="family_relationship" name="relationship" className="field" required disabled={busy}>
                <option value="parent">Parent</option><option value="guardian">Guardian</option>
              </select>
            </div>
            <label className="flex items-start gap-3 text-sm md:col-span-2">
              <input type="checkbox" required disabled={busy} />
              I verified that this account belongs to this child's parent or guardian.
            </label>
            <button className="btn btn-primary justify-self-start" disabled={busy || !accounts.length || !players.length}>
              {busy ? "Linking…" : "Link Child to Parent"}
            </button>
          </form>
          <h3 className="mt-8 font-black uppercase">Child Link Requests</h3>
          <p className="mt-2 text-sm text-neutral-600">Verify each request before linking an account. Requests contain parent-provided details; they are not proof of guardianship. Check current family links below to identify completed requests.</p>
          {requests.length ? <div className="mt-3 grid gap-3">
            {requests.map((request) => <article key={request.id} className="rounded-xl border border-neutral-200 p-4">
              <h4 className="font-bold">{request.name}</h4>
              <p className="break-all text-sm">{request.email}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm">{request.message}</p>
              <p className="mt-2 text-xs text-neutral-500">{new Date(request.created_at).toLocaleString()}</p>
            </article>)}
          </div> : <p className="mt-3 text-sm text-neutral-600">No child link requests yet.</p>}
          <h3 className="mt-8 font-black uppercase">Current Family Links</h3>
          {links.length ? <ul className="mt-3 grid gap-2">
            {links.map((link) => {
              const player = players.find((row) => row.id === link.player_id);
              const guardian = guardians.find((row) => row.id === link.guardian_id);
              return <li className="rounded-xl bg-neutral-100 p-3 text-sm" key={link.player_id + link.guardian_id}>
                {player ? player.first_name + " " + player.last_name : "Inactive player"} → {guardian?.full_name ?? "Guardian"}
                {link.relationship ? " (" + link.relationship + ")" : ""}
              </li>;
            })}
          </ul> : <p className="mt-3 text-sm text-neutral-600">No family links yet.</p>}
        </>
      ) : null}
    </section>
  );
}
