"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { endpoints, publicFetch } from "@/lib/api";

const tiers = [
  ["community_supporter", "Community Supporter"],
  ["friend_of_team", "Friend of the Team"],
  ["team_supporter", "Team Supporter"],
  ["digital_sponsor", "Digital Sponsor"],
  ["team_sponsor", "Team Sponsor"],
  ["main_jersey_sponsor", "Main Jersey Sponsor"]
] as const;

export function SponsorshipInquiryForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const tier = String(form.get("tier") ?? "").trim();
    const business = String(form.get("business") ?? "").trim();
    const amount = String(form.get("amount") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const anonymous = form.get("anonymous") === "on";
    const tierLabel = tiers.find(([key]) => key === tier)?.[1] ?? "";

    try {
      await publicFetch<{ ok: boolean; message?: string }>(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          website: String(form.get("website") ?? ""),
          subject: `Sponsorship Inquiry — ${tierLabel || "General"}`,
          message: [
            business ? `Business / organization: ${business}` : "",
            tierLabel ? `Tier of interest: ${tierLabel}` : "",
            amount ? `Amount under consideration: C${amount}` : "",
            anonymous ? "Public recognition preference: Anonymous" : "",
            notes ? `Message: ${notes}` : "Please contact me about sponsorship opportunities."
          ].filter(Boolean).join("\n"),
          sponsorship: {
            business_name: business || null,
            tier_key: tier || null,
            amount_cad: amount || null,
            notes: notes || null,
            anonymous
          }
        })
      });

      setStatus("Thank you — your sponsorship interest has been received by the team.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit sponsorship interest.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_name">Your name</label>
          <input className="field" id="sponsor_name" name="name" required maxLength={120} />
        </div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_business">Business / organization</label>
          <input className="field" id="sponsor_business" name="business" maxLength={140} />
        </div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_email">Email</label>
          <input className="field" id="sponsor_email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_phone">Phone</label>
          <input className="field" id="sponsor_phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_tier">Sponsorship level</label>
          <select className="field" id="sponsor_tier" name="tier" defaultValue="">
            <option value="">I’d like help choosing</option>
            {tiers.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_amount">Amount under consideration (CAD)</label>
          <input className="field" id="sponsor_amount" name="amount" type="number" min="1" step="1" />
        </div>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold">
        <input type="checkbox" name="anonymous" />
        I prefer my sponsorship to remain anonymous in public recognition.
      </label>

      <div className="field-group !mb-0">
        <label className="field-label" htmlFor="sponsor_notes">Message</label>
        <textarea
          className="field"
          id="sponsor_notes"
          name="notes"
          maxLength={3000}
          placeholder="Tell us about your business, preferred recognition, or any questions."
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="btn btn-primary">
          <Send size={18} />
          {busy ? "Submitting…" : "Submit Sponsorship Interest"}
        </button>
        <p className="text-xs text-neutral-500">
          This development form records the inquiry for the team administrator. It does not process payment.
        </p>
      </div>

      {status ? (
        <div className="notice flex items-start gap-3 text-sm" role="status" aria-live="polite">
          <CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={18} />
          <span>{status}</span>
        </div>
      ) : null}
    </form>
  );
}
