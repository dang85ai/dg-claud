import Link from "next/link";
import {
  BookOpenCheck,
  CircleHelp,
  ClipboardList,
  HeartHandshake,
  Trophy
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
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
    href: "/end-of-season",
    Icon: Trophy,
    title: "End of Season",
    text: "Season recap, recognition, banquet information and thank-you notes once the season wraps."
  }
];

export default function ParentsPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Parent Resources"
        title="Everything Around the Game"
        copy="Practical information for game day, player development, team expectations and the season journey."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resources.map(({ href, Icon, title, text }) => (
              <Link href={href} key={href} className="card p-6 transition hover:-translate-y-1 hover:border-red-500">
                <Icon className="text-red-600" size={28} />
                <h2 className="mt-4 text-2xl font-black uppercase">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
                <div className="mt-5 text-sm font-black uppercase text-red-600">Open resource →</div>
              </Link>
            ))}
          </div>

          <div className="notice mt-8">
            Operational dates, league rules, named contacts and formal club policies are published only after they are confirmed by the team or club.
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
