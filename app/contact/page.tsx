"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Mail
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { endpoints, publicFetch } from "@/lib/api";
import { TEAM_EMAIL, TEAM_EMAIL_HREF } from "@/lib/team-config";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const result = await publicFetch<{ message: string }>(endpoints.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setStatus(result.message);
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit the form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Get in Touch"
        title="Contact the Team"
        copy="Questions, suggestions or concerns can be sent through the team contact form or directly to the official team email."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <form className="card p-6 md:p-8" onSubmit={submit}>
              <div className="field-group">
                <label className="field-label" htmlFor="name">Name</label>
                <input className="field" id="name" name="name" required maxLength={120} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email</label>
                <input className="field" id="email" type="email" name="email" required maxLength={320} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="phone">Phone</label>
                <input className="field" id="phone" name="phone" maxLength={40} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="subject">Subject</label>
                <input className="field" id="subject" name="subject" maxLength={180} />
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="message">Message</label>
                <textarea className="field" id="message" name="message" required maxLength={5000} />
              </div>
              <button disabled={loading} className="btn btn-primary" type="submit">
                {loading ? "Submitting…" : "Submit Inquiry"}
              </button>
              {status ? <p className="notice mt-5 text-sm">{status}</p> : null}
            </form>

            <aside className="grid h-fit gap-4">
              <div className="card p-6">
                <div className="text-sm font-black uppercase text-red-600">Team Contact</div>
                <a href={TEAM_EMAIL_HREF} className="mt-4 flex items-center gap-3 font-black hover:text-red-600">
                  <Mail size={18} /> {TEAM_EMAIL}
                </a>
                <p className="mt-5 text-sm text-neutral-600">
                  Use this address for team questions, parent communication and sponsorship inquiries.
                </p>
              </div>

              <div className="card p-6">
                <Building2 className="text-red-600" />
                <h2 className="mt-3 text-xl font-black uppercase">Caledon Soccer Club Office</h2><p className="mt-2 text-sm text-neutral-600">Club inquiries only. Use the venue in your Spond invite for training.</p>
                <address className="mt-3 not-italic text-sm leading-6 text-neutral-700">
                  2 McKee Drive South<br />
                  Caledon East, ON L7C 1G8<br />
                  <a href="tel:+19055844033" className="font-bold hover:text-red-600">905-584-4033</a><br />
                  <a href="mailto:info@caledonsoccer.com" className="font-bold hover:text-red-600">info@caledonsoccer.com</a>
                </address>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Caledon%20Soccer%20Club%2C%202%20McKee%20Drive%20South%2C%20Caledon%20East%2C%20ON%20L7C%201G8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-black text-red-600"
                >
                  Club office map
                </a>
              </div>
            </aside>
          </div>

          <section className="mt-8 rounded-3xl bg-black p-7 text-white md:p-9">
            <h2 className="text-2xl font-black uppercase">One official team contact</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              For parent questions, team arrangements and sponsorship discussions, use the official team inbox. The team will direct club-specific enquiries to the appropriate contact.
            </p>
            <a href={TEAM_EMAIL_HREF} className="mt-5 inline-flex min-h-11 items-center gap-2 break-all text-base font-black text-white underline decoration-red-500 underline-offset-4">
              <Mail size={19} aria-hidden="true" /> {TEAM_EMAIL}
            </a>
          </section>

          <div className="notice mt-8 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} />
            <div className="text-sm">
              <strong>Emergency information:</strong> Use 911 for an emergency. Team-specific emergency or field-status contact information will only be published after it is verified.
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

