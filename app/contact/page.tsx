"use client";

import { FormEvent, useState } from "react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { endpoints, publicFetch } from "@/lib/api";

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
        copy="During development, submitted website inquiries are stored for review and no outbound email is sent."
      />
      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[1fr_380px]">
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

          <aside className="card h-fit p-6">
            <div className="text-sm font-black uppercase text-red-600">Team Contact</div>
            <div className="mt-4 text-lg font-black">girlsoccer@r5play.net</div>
            <div className="mt-2 text-lg font-black">1-(855) 592-6444</div>
            <p className="mt-5 text-sm text-neutral-600">
              Development notifications and form review remain internal until launch approval.
            </p>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
