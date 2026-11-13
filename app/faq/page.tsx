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
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">More common situations</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">I can sign in to the Parent Portal but can’t see the Spond event. What should I do?</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">The website account and Spond are separate. Open Spond with the account you normally use for the team and check for the latest invitation. If it is still missing, contact the manager privately with the event you expected to see and the account you used. Keep passwords and sign-in codes to yourself.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">I already replied in Spond. How do I change it?</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Open the current invitation and update your response there. If kickoff or practice is close, send the manager a brief private message too, since the coaches may already have planned for the original number of players. Include the event and whether you expect to be late or absent.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">I submitted a kit request and haven’t heard back. Should I send another?</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Contact the team and mention the date you submitted the form, the item and the size you requested. A second form may create a duplicate. Wait for the team to confirm availability and next steps before arranging payment.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">How do I ask the team to change photo consent or remove an image?</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Use the team’s private contact channel and describe where the image appears, such as the page or album. Explain what you want changed. A page link and a brief description can help the team find the image without forwarding it or posting a screenshot in a group chat.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Where should I start if I’m new?</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Start with Parent Resources for account access, team communications and the first-week checklist. Use the Game Day Guide when you are packing or planning arrival. The Train at Home page has a short session you can use whenever your player asks to practise.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/parents" className="btn btn-light">Parent resources</a>
            <a href="/game-day" className="btn btn-light">Game Day Guide</a>
            <a href="/train-at-home" className="btn btn-light">Train at Home</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

