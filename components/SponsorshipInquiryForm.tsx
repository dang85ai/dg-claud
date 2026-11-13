"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { endpoints, publicFetch } from "@/lib/api";
import { trackPublicConversion } from "@/lib/analytics-events";

export type SponsorOfferOption = {
  offer_key: string; name: string; pricing_mode: string;
  price_cad: number | null; availability: string;
};

const legacyTierForOffer: Record<string, string> = {
  community_supporter: "community_supporter",
  business_sponsor: "team_sponsor",
  home_main_logo: "main_jersey_sponsor",
  away_main_logo: "main_jersey_sponsor",
  home_sleeve_logo: "team_sponsor",
  away_sleeve_logo: "team_sponsor"
};

export function SponsorshipInquiryForm({ offers, seasonLabel, initialOffer = "" }: { offers: SponsorOfferOption[]; seasonLabel: string; initialOffer?: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(initialOffer);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    setBusy(true);
    setStatus("");
    const form = new FormData(target);
    const choice = offers.find((item) => item.offer_key === selected && item.availability === "available");
    if (selected && !choice) {
      setStatus("This package is no longer available. Please reload the page and choose another option.");
      setBusy(false);
      return;
    }
    const business = String(form.get("business") ?? "").trim();
    const amount = String(form.get("amount") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const anonymous = form.get("anonymous") === "on";
    const label = choice?.name || "General sponsorship";
    try {
      const result = await publicFetch<{ ok: boolean; reference?: string }>(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""), website: String(form.get("website") ?? ""),
          subject: "Sponsorship Inquiry — " + label + " · " + seasonLabel,
          message: [
            "Season: " + seasonLabel,
            "Package requested: " + label,
            business ? "Business / organization: " + business : "",
            amount ? "Amount under consideration: C$" + amount : "",
            anonymous ? "Public recognition preference: Anonymous" : "",
            notes ? "Message: " + notes : "Please contact me about sponsorship opportunities."
          ].filter(Boolean).join("\n"),
          sponsorship: {
            business_name: business || null,
            tier_key: choice ? legacyTierForOffer[choice.offer_key] || "team_sponsor" : null,
            amount_cad: amount || null,
            notes: ("Requested package: " + label + " (" + seasonLabel + "). " + notes).slice(0, 3000),
            anonymous
          }
        })
      });
      trackPublicConversion("team_sponsorship_inquiry_submitted");
      setStatus("Your sponsorship interest has been received. The team will follow up." + (result.reference ? ` Reference ${result.reference}.` : ""));
      target.reset();
      setSelected("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit sponsorship interest.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="field-group !mb-0"><label className="field-label" htmlFor="sponsor_name">Your name</label><input className="field" id="sponsor_name" name="name" required maxLength={120} /></div>
        <div className="field-group !mb-0"><label className="field-label" htmlFor="sponsor_business">Business / organization</label><input className="field" id="sponsor_business" name="business" maxLength={140} /></div>
        <div className="field-group !mb-0"><label className="field-label" htmlFor="sponsor_email">Email</label><input className="field" id="sponsor_email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field-group !mb-0"><label className="field-label" htmlFor="sponsor_phone">Phone</label><input className="field" id="sponsor_phone" name="phone" type="tel" maxLength={40} /></div>
        <div className="field-group !mb-0">
          <label className="field-label" htmlFor="sponsor_tier">Preferred sponsorship package</label>
          <select className="field" id="sponsor_tier" value={selected} onChange={(event) => setSelected(event.target.value)}>
            <option value="">I'd like help choosing</option>
            {offers.map((offer) => <option key={offer.offer_key} value={offer.offer_key}>{offer.name}</option>)}
          </select>
        </div>
        <div className="field-group !mb-0"><label className="field-label" htmlFor="sponsor_amount">Amount under consideration (CAD)</label><input className="field" id="sponsor_amount" name="amount" type="number" min="1" max="100000" step="1" /></div>
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold">
        <input type="checkbox" name="anonymous" /> I prefer to remain anonymous in public recognition.
      </label>
      <div className="field-group !mb-0">
        <label className="field-label" htmlFor="sponsor_notes">Message / preferred recognition</label>
        <textarea className="field" id="sponsor_notes" name="notes" maxLength={2500} placeholder="Tell us about your business or how you'd like to help." />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} className="btn btn-primary" type="submit"><Send size={18} />{busy ? "Submitting…" : "Submit Sponsorship Interest"}</button>
        <p className="text-xs text-neutral-500">This form records your interest; it does not process a payment or guarantee a jersey placement.</p>
      </div>
      {status ? <div role="status" aria-live="polite" className="notice flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={18} />{status}</div> : null}
    </form>
  );
}
