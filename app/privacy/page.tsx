import Link from "next/link";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { TEAM_EMAIL, TEAM_EMAIL_HREF } from "@/lib/team-config";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PublicPageHero
        eyebrow="Team Policy"
        title="Privacy & Youth Safety"
        copy="How the Caledon United FC 2018 Girls website handles team information and protects young players."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="card p-7 md:p-9">
            <div className="grid gap-7 text-sm leading-7 text-neutral-700">
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Who to contact</h2>
                <p className="mt-3">The Caledon United FC 2018 Girls team administrators coordinate this team website. For questions about information on the site, corrections, consent changes, or a removal request, contact <a className="font-bold text-red-700 underline" href={TEAM_EMAIL_HREF}>{TEAM_EMAIL}</a>.</p>
                <p className="mt-2">This team website is separate from the club&apos;s official registration and privacy processes. For club-wide records and policies, contact the club directly.</p>
              </section>
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Information used by the team</h2>
                <p className="mt-3">Team features may use parent and guardian contact details, limited player information, attendance and scheduling details, teamwear requests, and optional personalization details. Order requests ask for a player&apos;s first name, requested items and sizes, and a parent&apos;s contact information.</p>
                <p className="mt-2">Please do not include medical details, payment information, home addresses or other sensitive information in general contact or kit-request forms.</p>
              </section>
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Public information and photographs</h2>
                <p className="mt-3">Public player profiles are limited by guardian consent. Player names and photographs are published only when the relevant consent settings permit them. Team staff and public sponsorship information may appear on public pages.</p>
                <p className="mt-2">Private family information, attendance, forms and other restricted tools belong in authenticated sections. <strong>Search-engine noindex settings do not replace access controls.</strong></p>
                <p className="mt-2">For image consent and removal procedures, see the <Link href="/photo-safety" className="font-bold text-red-700 underline">Photo & Media Safety</Link> page.</p>
              </section>
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Connected services</h2>
                <p className="mt-3">The website is hosted on Netlify, uses Supabase for certain team-data and account features, and uses Netlify Forms for kit requests. The team also links to Spond for invitations, RSVPs and event updates. Each service may process information according to its own privacy and retention practices.</p>
                <p className="mt-2">A submission or message may generate team email notifications. The team&apos;s website forms are not intended for payments or sensitive medical records.</p>
                <p className="mt-2">Optional Google Analytics measurement is not active unless configured by the team. If enabled, only public page paths and generic successful-request events are intended for analytics; player names, form contents, private portals and account identifiers must not be sent. The team should review applicable consent and privacy requirements before enabling measurement.</p>
              </section>
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Access, corrections and retention</h2>
                <p className="mt-3">Parents and guardians can ask the team administrators to review, correct, restrict or remove information associated with their family. Requests involving another organization or service may require contacting that provider directly.</p>
                <p className="mt-2">Retention periods vary with the type of record, team processes and the service involved; a single retention schedule has not been published for every system. Contact the team for details about a particular record, including how to request its removal.</p>
              </section>
              <section>
                <h2 className="text-xl font-black uppercase text-neutral-900">Safety questions</h2>
                <p className="mt-3">For privacy or youth-safety concerns, contact <a href={TEAM_EMAIL_HREF} className="font-bold text-red-700 underline">{TEAM_EMAIL}</a> or use the <Link href="/contact" className="font-bold text-red-700 underline">team contact page</Link>. Please avoid sharing identifying details about children in publicly visible messages.</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

