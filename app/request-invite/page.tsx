"use client";

import { useState, type FormEvent } from "react";
import { PublicShell } from "@/components/PublicShell";
import { publicFetch } from "@/lib/api";
import { SUPABASE_URL } from "@/lib/supabase";

export default function RequestInvitePage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await publicFetch(SUPABASE_URL + "/functions/v1/parent-invite-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget)), action: "submit" })
      });
      setSubmitted(true);
      setMessage("Request received. A team manager will review it before an invitation can be emailed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit your request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <section className="section">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-black uppercase sm:text-4xl">Request a Parent Invite</h1>
          <p className="mt-4 text-neutral-700">Request access to the Caledon United FC 2018 Girls Parent Portal. A team manager will review your request. If approved, the invitation goes to the email address you enter here.</p>
          {!submitted && <form className="card mt-6 grid gap-4 p-6" onSubmit={submit}>
            <label><span className="field-label">Your full name</span><input className="field" name="parent_name" autoComplete="name" required maxLength={100} /></label>
            <label><span className="field-label">Your email address</span><input className="field" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            <label><span className="field-label">Player’s full name</span><input className="field" name="player_name" required maxLength={100} /></label>
            <div hidden><label>Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <button type="submit" disabled={busy} className="btn btn-primary justify-self-start">{busy ? "Submitting…" : "Request Invite"}</button>
          </form>}
          {message && <p role="status" className="notice mt-5">{message}</p>}
        </div>
      </section>
    </PublicShell>
  );
}

