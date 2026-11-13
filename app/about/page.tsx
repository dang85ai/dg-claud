import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Shirt, Sparkles, Users } from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const pillars = [
  { title: "Confidence on the Ball", detail: "Regular touches, first touch, dribbling, passing and finishing are the starting points for technical growth." },
  { title: "Understanding the Game", detail: "Small-sided play helps players explore space, support teammates and make decisions without lengthy instructions." },
  { title: "A Positive Team Culture", detail: "Players are encouraged to try, make mistakes, show respect and celebrate the efforts of the whole team." },
  { title: "Learning Every Position", detail: "Position rotation builds a broader understanding of soccer and gives each player different development opportunities." }
];

export default function AboutPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="about"
        eyebrow="Caledon United FC · 2018 Girls"
        title="Our Team"
        copy="A 2026–27 girls soccer team in Caledon, Ontario, focused on developing skills, confidence, teamwork and a love for the game."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <div className="card p-7 md:p-10">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[.16em] text-red-700"><Sparkles size={19} aria-hidden="true" /> What we believe</div>
              <h2 className="mt-4 text-3xl font-black uppercase tracking-tight md:text-4xl">Development first. Team always.</h2>
              <p className="mt-5 text-base leading-8 text-neutral-700">The Caledon United FC 2018 Girls team brings together young players for the 2026–27 season. Our focus is not on early rankings or fixed positions, but on helping girls become more comfortable with the ball, more confident in their decisions and more supportive of one another.</p>
              <p className="mt-4 text-sm leading-7 text-neutral-600">Families can use this website to find the public team schedule, understand the team's kit and access practical resources. Spond remains the source for the latest invitations, attendance requests and confirmed event logistics.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/schedule" className="btn btn-primary">View Team Schedule <ArrowRight size={17} aria-hidden="true" /></Link>
                <Link href="/development" className="btn btn-light">Development Resources</Link>
              </div>
            </div>
            <aside className="grid gap-4">
              <div className="rounded-3xl bg-black p-7 text-white">
                <Users className="text-red-400" size={31} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black uppercase">The 2018 Girls</h2>
                <p className="mt-3 text-sm leading-7 text-white/75">A team identity built around the 2018 birth-year group, with the 2026–27 season as its current chapter.</p>
              </div>
              <div className="card p-7">
                <ShieldCheck className="text-red-700" size={30} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black uppercase">Players come first</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600">Photos and player details are subject to guardian consent. Private team information stays in the authorized parent and management portals.</p>
                <Link href="/privacy" className="mt-4 inline-block text-sm font-black text-red-700 underline">Privacy and player safety</Link>
              </div>
            </aside>
          </div>

          <section className="mt-10">
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[.16em] text-red-700"><HeartHandshake size={19} aria-hidden="true" /> Our approach</div>
            <h2 className="mt-3 text-3xl font-black uppercase">Four development priorities</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {pillars.map((pillar, index) => (
                <article key={pillar.title} className="card p-6 md:p-7">
                  <div className="text-sm font-black tabular-nums text-red-700">0{index + 1}</div>
                  <h3 className="mt-3 text-xl font-black uppercase">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{pillar.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Link href="/roster" className="group card flex items-center gap-4 p-6 transition hover:border-red-500">
              <Users className="shrink-0 text-red-700" size={29} aria-hidden="true" />
              <div><h3 className="text-lg font-black uppercase">Meet the Team</h3><p className="mt-2 text-sm text-neutral-600">Players, coaches and staff, within consent and privacy settings.</p></div>
              <ArrowRight className="ml-auto shrink-0 text-red-700 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/kit" className="group card flex items-center gap-4 p-6 transition hover:border-red-500">
              <Shirt className="shrink-0 text-red-700" size={29} aria-hidden="true" />
              <div><h3 className="text-lg font-black uppercase">Our Teamwear</h3><p className="mt-2 text-sm text-neutral-600">View the approved home and away kit illustrations and accessories.</p></div>
              <ArrowRight className="ml-auto shrink-0 text-red-700 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">How the team works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">The team and the club</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Caledon United FC 2018 Girls is the team featured on this site. Use the team hub for season information, teamwear, parent resources and ways to support the squad. Use the official Caledon Soccer Club resources for club matters such as registration, refunds and applicable policies.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">What families can expect here</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Use the public schedule for planning, the Parent Resources page for getting started, and Spond for confirmed event details and attendance. The private portal holds forms and information for authorized families. For questions about a specific player or family record, use a private contact channel.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">How the adults support the team</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Coaches help players learn the game and build confidence. Managers help families find information, follow up on team logistics and navigate the season. Families can support the team by keeping event responses current and encouraging players from the sideline. See the team roster page for staff roles.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Ways to get involved</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Explore the Sponsorship page if a local business wants to support the squad. Families interested in helping at events can ask the manager where help is needed. If you are new to the team, Parent Resources has the first steps for getting connected.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/parents" className="btn btn-light">Parent resources</a>
            <a href="/sponsors" className="btn btn-light">Sponsorship opportunities</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

