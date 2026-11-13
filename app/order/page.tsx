"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { PublicPageHero } from "@/components/PublicPageHero";
import { endpoints, publicFetch } from "@/lib/api";
import { TEAM_EMAIL } from "@/lib/team-config";
import { trackPublicConversion } from "@/lib/analytics-events";

type ItemKey = "home" | "away" | "track" | "jacket" | "backpack";
type Selection = Record<ItemKey, boolean>;

const initial: Selection = { home: false, away: false, track: false, jacket: false, backpack: false };
const sizes = ["YXS", "YS", "YM", "YL", "YXL", "Not sure"];
const sockSizes = ["YS", "YM", "YL", "Not sure"];

function SizeField({ name, title, options = sizes, required = true }: { name: string; title: string; options?: string[]; required?: boolean }) {
  return (
    <label className="field-group !mb-0">
      <span className="field-label">{title}</span>
      <select name={name} className="field" required={required} defaultValue="">
        <option value="" disabled>Select a size</option>
        {options.map((size) => <option key={size} value={size}>{size}</option>)}
      </select>
    </label>
  );
}

export default function OrderPage() {
  const [selected, setSelected] = useState<Selection>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [received, setReceived] = useState(false);
  const [reference, setReference] = useState("");
  const [emailCopyHref, setEmailCopyHref] = useState("");

  const items: { key: ItemKey; label: string; description: string }[] = [
    { key: "home", label: "Home Match Kit", description: "Red jersey, black shorts and red socks" },
    { key: "away", label: "Away Match Kit", description: "White jersey, black shorts and white socks" },
    { key: "track", label: "Track Suit", description: "Black training jacket and pants" },
    { key: "jacket", label: "Outdoor Jacket", description: "Black cold-weather jacket" },
    { key: "backpack", label: "Team Backpack", description: "Black backpack with crest and optional initials" }
  ];

  function toggle(key: ItemKey, checked: boolean) {
    setSelected((old) => ({ ...old, [key]: checked }));
    setReceived(false);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setReceived(false);

    const chosen = items.filter((item) => selected[item.key]);
    if (!chosen.length) {
      setError("Select at least one kit or accessory before submitting.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const details = [
      "Season: 2026–27",
      "Player first name: " + get("player_first_name"),
      "Sample jersey name requested: " + (get("jersey_name") || "To confirm"),
      "Preferred number (not guaranteed): " + (get("jersey_number") || "To confirm"),
      "Requested items:",
      ...chosen.map((item) => {
        if (item.key === "home") return "- Home match kit: jersey " + get("home_jersey_size") + ", shorts " + get("home_shorts_size") + ", socks " + get("home_socks_size");
        if (item.key === "away") return "- Away match kit: jersey " + get("away_jersey_size") + ", shorts " + get("away_shorts_size") + ", socks " + get("away_socks_size");
        if (item.key === "track") return "- Track suit: jacket " + get("track_jacket_size") + ", pants " + get("track_pants_size");
        if (item.key === "jacket") return "- Outdoor jacket: " + get("outdoor_jacket_size");
        return "- Team backpack: initials " + (get("backpack_initials") || "To confirm");
      }),
      "Notes: " + (get("notes") || "None")
    ].join("\n");

    setBusy(true);
    try {
      const result = await publicFetch<{ reference?: string }>(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "kit_request",
          name: get("name"),
          email: get("email"),
          phone: get("phone"),
          message: details,
          website: get("bot-field"),
          acknowledged: data.has("request_ack")
        })
      });
      setReference(result.reference || "");

      const emailBody = [
        "Caledon United FC 2018 Girls — Kit Request",
        "Parent/guardian: " + get("name"),
        "Email: " + get("email"),
        "Phone: " + (get("phone") || "Not supplied"),
        "",
        details,
        "",
        "Please confirm availability, sizing and next steps."
      ].join("\n");
      setEmailCopyHref("mailto:" + TEAM_EMAIL + "?subject=" + encodeURIComponent("Kit Request — Caledon United 2018 Girls") + "&body=" + encodeURIComponent(emailBody));
      trackPublicConversion("team_kit_request_submitted");
      setReceived(true);
      setSelected({ ...initial });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <PublicPageHero banner="kit"
        eyebrow="Caledon United FC · 2018 Girls"
        title="Team Kit Request"
        usePageTitle
        copy="Tell us which uniform pieces and accessories you would like and the sizes you need. This is a request for team review — not a purchase or payment."
      />
      <section className="section">
        <div className="container max-w-5xl">
          <Link href="/kit" className="inline-flex items-center gap-2 text-sm font-black text-red-600 hover:underline"><ArrowLeft size={17} /> Back to the teamwear gallery</Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_285px]">
            <div>
              {received && (
                <div role="status" aria-live="polite" className="mb-6 rounded-2xl border border-green-300 bg-green-50 p-6 text-green-900">
                  <div className="flex items-center gap-3 font-black"><CheckCircle2 size={23} /> Your request has been recorded</div>
                  {reference && <p className="mt-3 break-all text-sm font-bold">Reference {reference}</p>}
                  <p className="mt-3 text-sm leading-6">Your selections were submitted to the team website. No payment has been taken and no purchase is confirmed.</p>
                  {emailCopyHref && (
                    <div className="mt-4">
                      <a href={emailCopyHref} className="btn btn-primary"><Mail size={18} /> Email a copy to the team</a>
                      <p className="mt-3 text-xs">This optional backup opens your email app. Press Send there to deliver a copy to {TEAM_EMAIL}.</p>
                    </div>
                  )}
                </div>
              )}
              <form name="team-kit-order" method="POST" onSubmit={submit} className="grid gap-7">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="kit-bot">Do not complete this field</label>
                  <input id="kit-bot" name="bot-field" tabIndex={-1} autoComplete="off" />
                </div>

                <fieldset className="card p-6 md:p-8">
                  <legend className="sr-only">Parent or guardian details</legend>
                  <h2 className="text-2xl font-black uppercase">1. Parent / Guardian</h2>
                  <p className="mt-2 text-sm text-neutral-600">Use an email address where the team can reach you.</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="field-group !mb-0"><span className="field-label">Your full name *</span><input className="field" name="name" required maxLength={120} autoComplete="name" /></label>
                    <label className="field-group !mb-0"><span className="field-label">Your email *</span><input className="field" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
                    <label className="field-group !mb-0"><span className="field-label">Phone (optional)</span><input className="field" name="phone" type="tel" maxLength={35} autoComplete="tel" /></label>
                    <label className="field-group !mb-0"><span className="field-label">Player first name *</span><input className="field" name="player_first_name" required maxLength={60} /></label>
                    <label className="field-group !mb-0"><span className="field-label">Jersey name / lettering (optional)</span><input className="field" name="jersey_name" maxLength={24} placeholder="e.g. SMITH" /></label>
                    <label className="field-group !mb-0"><span className="field-label">Preferred jersey number (optional)</span><input className="field" name="jersey_number" maxLength={3} inputMode="numeric" placeholder="e.g. 10" /></label>
                  </div>
                  <p className="mt-4 text-xs text-neutral-500">Use one form per player. A preferred name or number is not a guarantee of the final decoration.</p>
                </fieldset>

                <fieldset className="card p-6 md:p-8">
                  <legend className="sr-only">Requested items and sizes</legend>
                  <h2 className="text-2xl font-black uppercase">2. Select items and sizes</h2>
                  <p className="mt-2 text-sm text-neutral-600">Select one or more options, then enter sizes for those items. Choose "Not sure" if you need a fitting.</p>
                  <div className="mt-6 grid gap-4">
                    {items.map((item) => (
                      <div key={item.key} className={"overflow-hidden rounded-2xl border " + (selected[item.key] ? "border-red-500" : "border-neutral-200")}>
                        <label className="flex cursor-pointer items-start gap-4 p-4 sm:p-5">
                          <input type="checkbox" checked={selected[item.key]} onChange={(e) => toggle(item.key, e.target.checked)} className="mt-1 size-5 accent-red-600" />
                          <span>
                            <span className="block font-black uppercase">{item.label}</span>
                            <span className="mt-1 block text-sm text-neutral-600">{item.description}</span>
                          </span>
                        </label>
                        {selected[item.key] && (
                          <div className="grid gap-4 border-t border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2 sm:p-5">
                            {item.key === "home" && (<>
                              <SizeField name="home_jersey_size" title="Red home jersey size" />
                              <SizeField name="home_shorts_size" title="Black shorts size" />
                              <SizeField name="home_socks_size" title="Red socks size" options={sockSizes} />
                            </>)}
                            {item.key === "away" && (<>
                              <SizeField name="away_jersey_size" title="White away jersey size" />
                              <SizeField name="away_shorts_size" title="Black shorts size" />
                              <SizeField name="away_socks_size" title="White socks size" options={sockSizes} />
                            </>)}
                            {item.key === "track" && (<>
                              <SizeField name="track_jacket_size" title="Track jacket size" />
                              <SizeField name="track_pants_size" title="Track pants size" />
                            </>)}
                            {item.key === "jacket" && <SizeField name="outdoor_jacket_size" title="Outdoor jacket size" />}
                            {item.key === "backpack" && (
                              <label className="field-group !mb-0">
                                <span className="field-label">Backpack initials (optional)</span>
                                <input className="field" name="backpack_initials" maxLength={8} placeholder="e.g. JS" />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div className="card p-6 md:p-8">
                  <h2 className="text-2xl font-black uppercase">3. Final details</h2>
                  <label className="field-group mt-5 !mb-0"><span className="field-label">Notes / sizing questions (optional)</span><textarea className="field" name="notes" maxLength={1600} rows={4} placeholder="Let us know if a fitting or a specific item needs clarification." /></label>
                  <label className="mt-5 flex items-start gap-3 rounded-xl bg-neutral-50 p-4 text-sm leading-6">
                    <input type="checkbox" name="request_ack" required className="mt-1 size-5 shrink-0 accent-red-600" />
                    <span>I understand this submits a request for team review only. No purchase, payment, or player customization is confirmed.</span>
                  </label>
                  {error && <p role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
                  <button type="submit" disabled={busy} className="btn btn-primary mt-6"><Send size={18} /> {busy ? "Submitting request…" : "Submit request"}</button>
                  <p className="mt-4 text-xs leading-5 text-neutral-500">We only collect the details needed to coordinate your request. Contact the team if you need a record corrected or deleted.</p>
                </div>
              </form>
            </div>
            <aside className="grid h-fit gap-4">
              <div className="card p-6">
                <ShieldCheck className="text-red-600" size={27} />
                <h2 className="mt-3 text-lg font-black uppercase">How it works</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">Submit your requested items and sizes. The team reviews requirements, confirms supplier availability and follows up separately with ordering instructions.</p>
              </div>
              <div className="card p-6">
                <Mail className="text-red-600" size={25} />
                <h2 className="mt-3 text-lg font-black uppercase">Questions?</h2>
                <p className="mt-3 text-sm text-neutral-600">Official team email:</p>
                <a href={"mailto:" + TEAM_EMAIL} className="mt-2 block break-all text-sm font-black text-red-600">{TEAM_EMAIL}</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
