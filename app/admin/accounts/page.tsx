"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Account = { id: string; email: string | null; name: string | null; roles: string[]; confirmed_at: string | null; mfa_enabled: boolean };
type Invitation = { id: string; email: string; name: string | null; role: string; status: string; expires_at: string };
type ListResponse = { users: Account[]; invites: Invitation[] };
type ActionResult = { message?: string; email_sent?: boolean; activation_url?: string };
const roles = [
  { id: "parent_player", label: "Parent / Player" },
  { id: "manager", label: "Manager" },
  { id: "admin", label: "Administrator" },
  { id: "photographer", label: "Photographer" },
  { id: "sponsor", label: "Sponsor" }
];

export default function TeamAccounts() {
  const router = useRouter();
  const [data, setData] = useState<ListResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Checking administrator access…");
  const [activation, setActivation] = useState("");

  const request = useCallback((action: string, input: Record<string, unknown> = {}) =>
    authedFetch<ActionResult & ListResponse>(endpoints.userManagement, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, input })
    }), []);

  const refresh = useCallback(async () => { const result = await request("list"); setData(result); }, [request]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session.session) { router.replace("/login"); return; }
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
      try { await refresh(); if (mounted) setStatus(""); }
      catch (e) { if (mounted) setStatus(e instanceof Error ? e.message : "Administrator access required."); }
    })();
    return () => { mounted = false; };
  }, [router, refresh]);

  async function perform(action: string, input: Record<string, unknown>) {
    setBusy(true); setStatus(""); setActivation("");
    try {
      const result = await request(action, input);
      setStatus(result.message || "Account changes saved.");
      if (result.activation_url) setActivation(result.activation_url);
      await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to update account."); }
    finally { setBusy(false); }
  }

  function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void perform("invite", {
      email: String(f.get("email") || ""), full_name: String(f.get("full_name") || ""),
      role: String(f.get("role") || "parent_player")
    });
    e.currentTarget.reset();
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Accounts & Invites" isAdmin />
      <main className="container py-8">
        <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Administrator Only · MFA Required</div>
        <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Team Account Management</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-600">Invite team members, review account activation and adjust access roles. Role changes are checked and audited by the server.</p>
        {status ? <div role="status" className="notice mt-5">{status}</div> : null}
        {activation ? <div className="card mt-5 border-red-200 p-5">
          <h2 className="font-black uppercase">Private activation link</h2>
          <p className="mt-2 text-sm text-neutral-600">Invitation email was not sent. Share this single-use link privately with the intended recipient only. Do not post it publicly.</p>
          <input className="field mt-3" readOnly value={activation} aria-label="Private activation link" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="btn btn-light mt-3" onClick={() => void navigator.clipboard.writeText(activation)}>Copy Private Link</button>
        </div> : null}
        {!data ? null : <>
          <section className="card mt-8 p-6">
            <h2 className="text-2xl font-black uppercase">Invite a Team Member</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={invite}>
              <label><span className="field-label">Full name</span><input name="full_name" className="field" maxLength={140} required /></label>
              <label><span className="field-label">Email address</span><input name="email" type="email" className="field" maxLength={254} required /></label>
              <label><span className="field-label">Role</span><select name="role" className="field" defaultValue="parent_player">{roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
              <button disabled={busy} className="btn btn-primary self-end">Send Invitation</button>
            </form>
          </section>

          <section className="card mt-8 overflow-hidden">
            <div className="p-6"><h2 className="text-2xl font-black uppercase">Registered Accounts ({data.users.length})</h2></div>
            <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-100"><tr><th className="p-3">Member</th><th className="p-3">Access</th><th className="p-3">Security</th><th className="p-3">Actions</th></tr></thead>
              <tbody>{data.users.map((account) => <tr key={account.id} className="border-t border-neutral-200">
                <td className="p-3"><div className="font-bold">{account.name || "Team member"}</div><div className="text-xs text-neutral-500">{account.email || "No email"}</div></td>
                <td className="p-3">{account.roles.join(", ") || "No role"}</td>
                <td className="p-3">{account.confirmed_at ? "Active" : "Awaiting activation"} · MFA {account.mfa_enabled ? "on" : "off"}</td>
                <td className="p-3"><div className="flex flex-wrap items-center gap-2">
                  <select aria-label={"Role for " + (account.name || account.email)} className="field !w-auto" defaultValue={account.roles[0] || "parent_player"} id={"role-" + account.id}>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                  <button disabled={busy} className="btn btn-light" onClick={() => {
                    const select = document.getElementById("role-" + account.id) as HTMLSelectElement | null;
                    const role = select?.value;
                    if (role && window.confirm("Change this member's role to " + role + "?")) void perform("role", { user_id: account.id, role });
                  }}>Change Role</button>
                  <button disabled={busy} className="btn btn-light" onClick={() => void perform("resend", { user_id: account.id })}>Resend Access</button>
                </div></td>
              </tr>)}</tbody>
            </table></div>
          </section>

          <section className="card mt-8 p-6">
            <h2 className="text-2xl font-black uppercase">Invitations ({data.invites.length})</h2>
            <div className="mt-4 grid gap-3">{data.invites.map((invite) => <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4">
              <div><div className="font-bold">{invite.name || invite.email}</div><div className="text-xs text-neutral-500">{invite.email} · {invite.role} · {invite.status}</div></div>
              {invite.status === "pending" ? <button disabled={busy} className="btn btn-light" onClick={() => { if (window.confirm("Cancel this invitation?")) void perform("cancel", { id: invite.id }); }}>Cancel Invite</button> : null}
            </div>)}</div>
          </section>
        </>}
      </main>
    </div>
  );
}
