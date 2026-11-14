import Link from "next/link";
import { ClubResources, CommunicationGuide, NewFamilyGuide, WeatherGuide } from "@/components/ParentInformation";
import {
  BookOpenCheck,
  CircleHelp,
  ClipboardList,
  HeartHandshake,
  Shirt,
  Mail,
  Trophy
} from "lucide-react";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const resources = [
  {
    href: "/game-day",
    Icon: ClipboardList,
    title: "Game Day",
    text: "Arrival guidance, pre-game checklist, sideline expectations and post-game routine."
  },
  {
    href: "/development",
    Icon: HeartHandshake,
    title: "Player Development",
    text: "Skill priorities, home-practice ideas and ways parents can support confidence and enjoyment."
  },
  {
    href: "/faq",
    Icon: CircleHelp,
    title: "Parent FAQ",
    text: "Quick answers for absences, late arrivals, conflicts, multi-sport schedules and other common questions."
  },
  {
    href: "/conduct",
    Icon: BookOpenCheck,
    title: "Code of Conduct",
    text: "Player and parent expectations focused on respect, sportsmanship and constructive communication."
  },
  {
    href: "/kit",
    Icon: Shirt,
    title: "Uniforms & Accessories",
    text: "Browse the home, away and goalkeeper kits, plus training apparel and accessories."
  },
  {
    href: "/order",
    Icon: Mail,
    title: "Teamwear Request",
    text: "Send the team a request for kit items and sizes. The request does not collect payment or place an order."
  },
  {
    href: "/end-of-season",
    Icon: Trophy,
    title: "End of Season",
    text: "A recap, appreciation and celebration hub will be updated when the season concludes."
  }
];

export default function ParentsPage() {
  return (
    <PublicShell>
      <PublicPageHero banner="parent-portal"
        eyebrow="2026–27 Season"
        title="Parent Resources"
        usePageTitle
        action={<Link href="/request-invite" className="btn btn-primary">Request a Parent Invite</Link>}
        secondaryAction={<Link href="/login" className="btn btn-light">Sign In</Link>}
        copy="Practical information for game day, player development, team expectations and the season journey."
      />

      <nav className="container flex flex-wrap gap-2 pt-5" aria-label="Jump to parent resources">
        <a href="#start-here" className="btn btn-light">Start here</a>
        <a href="#communications" className="btn btn-light">Spond &amp; communication</a>
        <a href="#game-day" className="btn btn-light">Game day</a>
        <a href="#teamwear" className="btn btn-light">Kit &amp; requests</a>
        <a href="#weather" className="btn btn-light">Weather</a>
        <a href="#club-resources" className="btn btn-light">Club policies &amp; resources</a>
      </nav>

      <section className="section">
        <div className="container">
          <div className="mb-8 grid gap-6 lg:grid-cols-2"><NewFamilyGuide /><CommunicationGuide /></div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resources.map(({ href, Icon, title, text }) => (
              <Link href={href} key={href} id={href === "/game-day" ? "game-day" : href === "/kit" ? "teamwear" : undefined} className="card scroll-mt-28 p-6 transition hover:-translate-y-1 hover:border-red-500">
                <Icon className="text-red-600" size={28} />
                <h2 className="mt-4 text-2xl font-black uppercase">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
                <div className="mt-5 text-sm font-black uppercase text-red-600">Open resource →</div>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6"><WeatherGuide /><ClubResources /></div>
          <div className="notice mt-8">
            Operational dates, league rules, named contacts and formal club policies are published only after they are confirmed by the team or club.
          </div>
        </div>
      </section>
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">First-week checklist</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Your first week with the team</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Start by finding your current Spond invitation and confirming that you can sign in to the Parent Portal. The two accounts serve different purposes. In Spond, check the next event and respond if asked. In the portal, check which player information and forms are available to your account. If your family link is missing, contact the manager privately for help.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Before your first session</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Use the event invitation to confirm arrival time, entrance, playing surface and footwear. Put a labelled bottle, shin guards and the requested teamwear together the night before. If you need a jersey or other item, check the Team Kit guide and send a request. Ask the manager what your player should wear in the meantime.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Forms, consent and pickup</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Review any requested forms in the private portal. Contact the team privately if you need to correct a family record, change photo consent or share a pickup arrangement. Keep health information, activation links and exact event details within the appropriate private channel.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Where to go when something changes</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Use Spond first for event changes, RSVP and last-minute updates. Use the Parent Portal for team forms and authorized player information. Contact the manager privately for access problems, a late absence or a kit question. For registration and refunds, start with the official club resources on this page.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/faq" className="btn btn-light">Parent FAQ</a>
            <a href="/game-day" className="btn btn-light">Game Day Guide</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}



