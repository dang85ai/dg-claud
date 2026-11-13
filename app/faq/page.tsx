import type { Metadata } from "next";
import Link from "next/link";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { TEAM_EMAIL, TEAM_EMAIL_HREF } from "@/lib/team-config";

export const metadata: Metadata = {
  title: "Parent FAQ",
  description: "Helpful answers for Caledon United FC 2018 Girls families about Spond, games, training, kit requests, privacy and contacting the team.",
  alternates: { canonical: "/faq" }
};

const faqs = [
  {
    q: "Where can I find the latest team schedule?",
    a: "Check the public team schedule for planning. Your Spond invitation and manager messages are the source of truth for confirmed times, venues, cancellations and RSVP requests."
  },
  {
    q: "How do I confirm attendance or report an absence?",
    a: "Respond to your Spond event invitation when an RSVP is requested. Let the team manager know early about absences or late arrivals. Updates in other website tools should not be assumed to update Spond."
  },
  {
    q: "Where do training sessions and games take place?",
    a: "Venues can change during the indoor season. Follow the location and arrival instructions in your latest Spond invitation rather than relying on a saved address or an old event."
  },
  {
    q: "What should a player bring to training?",
    a: "Bring appropriate footwear, shin guards, water and the teamwear requested by your coach. Check the event message for indoor footwear, ball requirements or venue-specific rules."
  },
  {
    q: "How does the team approach player development?",
    a: "The 2018 Girls team focuses on ball skills, confidence, teamwork and game understanding. Players are encouraged to explore different roles; lineups and game formats follow the confirmed competition rules."
  },
  {
    q: "How do I request a jersey or other kit items?",
    a: "Browse the Team Kit page to see the designs, then use the separate Kit Request form to select items and sizes. The request is for team review only; it does not confirm an order or collect payment."
  },
  {
    q: "Who can see player names and photographs?",
    a: "Public player profiles and photographs depend on guardian consent. Authenticated family accounts may see additional information when authorized. Contact the team to ask about consent changes or removal."
  },
  {
    q: "Where can I find official club rules and policies?",
    a: "Use the official club resources linked from Parent Resources for registration and refund policies. Always confirm which rules apply to your competition and season."
  },
  {
    q: "Who should I contact with a team concern?",
    a: "Contact the team using the official email address. For urgent safety matters, follow the venue and club's emergency procedures. In an emergency, call 911."
  }
];

export default function FaqPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="parent-portal" usePageTitle
        eyebrow="Family Resources · 2026–27"
        title="Parent Questions, Answered"
        copy="Practical information for the Caledon United FC 2018 Girls season. Spond and official club communications remain the sources for confirmed operational details."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black p-5 text-white">
            <p className="text-sm leading-6 text-white/80">Need the latest time or venue? Check your Spond invitation before leaving.</p>
            <Link href="/schedule" className="btn btn-primary">Team Schedule</Link>
          </div>
          <div className="grid gap-3">
            {faqs.map(({q,a})=>(
              <details key={q} className="card group p-5">
                <summary className="cursor-pointer text-lg font-black leading-snug marker:text-red-600">{q}</summary>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/parents" className="card p-6 transition hover:border-red-500">
              <h2 className="text-lg font-black uppercase">Parent Resources</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Game-day preparation, player development, weather guidance and club information.</p>
            </Link>
            <Link href="/kit" className="card p-6 transition hover:border-red-500">
              <h2 className="text-lg font-black uppercase">Team Kit & Accessories</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Explore official uniform illustrations and the separate request form.</p>
            </Link>
          </div>
          <div className="notice mt-8 text-sm leading-7">
            Still need an answer? Email <a href={TEAM_EMAIL_HREF} className="font-black text-red-700 underline">{TEAM_EMAIL}</a>.
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
