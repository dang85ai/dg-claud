"use client";

import { FormEvent, useState } from "react";
import { endpoints, publicFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function ChildLinkRequest({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setBusy(true); setError("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user?.email) throw new Error("Please sign in again before sending your request.");
      const result = await publicFetch<{ ok: boolean }>(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("guardian_name") ?? "").trim(),
          email: data.user.email,
          subject: "Parent portal: link child",
          website: String(form.get("website") ?? ""),
          message: [
            "Please verify and link my child to my parent portal account.",
            "Account ID: " + data.user.id,
            "Child: " + String(form.get("child_name") ?? "").trim(),
            "Relationship: " + String(form.get("relationship") ?? ""),
            "Existing roster player: " + String(form.get("on_roster") ?? ""),
            "This request does not authorize publishing the child's information."
          ].join("\n")
        })
      });
      if (!result.ok) throw new Error("Your request could not be saved. Please try again.");
      setSent(true); element.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send your request. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <section className="card mt-6 p-6" id="my-children">
      <h2 className="text-2xl font-black uppercase">My Children</h2>
      <p className="mt-3 text-sm text-neutral-600">Missing a child? Send a request here. A manager will verify your family link before private forms and child-specific tools become available.</p>
      <p className="mt-3 break-all text-xs text-neutral-500">Your account ID: {accountId}</p>
      {sent ? <p className="notice mt-4" role="status">Request saved for manager review. Your child will appear after a manager approves and creates the link. No notification email is sent during development.</p> : null}
      <button type="button" className="btn btn-primary mt-4" onClick={() => { setOpen(!open); setSent(false); }} aria-expanded={open}>
        {open ? "Close Request Form" : "Add My Child"}
      </button>
      {open && !sent ? (
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div><label className="field-label" htmlFor="request_guardian">Your full name</label>
            <input className="field" id="request_guardian" name="guardian_name" required maxLength={120} disabled={busy} /></div>
          <div><label className="field-label" htmlFor="request_child">Child's full name</label>
            <input className="field" id="request_child" name="child_name" required maxLength={180} disabled={busy} /></div>
          <div><label className="field-label" htmlFor="request_relationship">Relationship</label>
            <select className="field" id="request_relationship" name="relationship" disabled={busy}><option value="parent">Parent</option><option value="guardian">Guardian</option></select></div>
          <div><label className="field-label" htmlFor="request_roster">Is your child already on the team roster?</label>
            <select className="field" id="request_roster" name="on_roster" disabled={busy}><option>Yes</option><option>No</option><option>Not sure</option></select></div>
          <div className="hidden" aria-hidden="true"><label htmlFor="request_website">Website</label><input id="request_website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <label className="flex items-start gap-3 text-sm md:col-span-2"><input type="checkbox" required disabled={busy} />I am this child's parent or legal guardian.</label>
          {error ? <p role="alert" className="notice md:col-span-2">{error}</p> : null}
          <button className="btn btn-primary justify-self-start" disabled={busy}>{busy ? "Sending…" : "Request Child Link"}</button>
        </form>
      ) : null}
    </section>
  );
}
