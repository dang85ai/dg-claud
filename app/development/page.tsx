import Link from "next/link";
import {
  Footprints,
  Heart,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const framework = [
  ["Technical", "Dribbling, passing, shooting and first touch", "Short, fun ball-work sessions at home"],
  ["Confidence", "Trying new moves and asking for the ball", "Praise effort, courage and learning"],
  ["Teamwork", "Passing, communication and supporting teammates", "Cheer for the whole team"],
  ["Sportsmanship", "Respecting teammates, opponents and officials", "Model calm, positive behaviour"],
  ["Game Understanding", "Spacing, positions and simple decisions", "Watch games together and talk about choices"],
  ["Love of Soccer", "Fun, creativity and enjoyment", "Keep the experience positive and pressure-light"]
];

const practiceIdeas = [
  ["Dribbling", "Use cones or household markers and practise turns and changes of direction."],
  ["Passing", "Pass against a wall and focus on controlled first touch and accuracy."],
  ["Juggling", "Start with one bounce between touches and gradually build control."],
  ["1v1", "Play small-space games with a sibling or parent and practise shielding and turning."]
];

export default function DevelopmentPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="training"
        eyebrow="2026 Player Development"
        title="Fun First. Growth Always."
        copy="At U9, the emphasis is on fundamental skills, confidence, teamwork, sportsmanship, game understanding and building a lasting love of soccer."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { Icon: Sparkles, title: "Individual Growth", text: "Progress is measured against each player's own development, not public rankings." },
              { Icon: Users, title: "Team Environment", text: "Players learn to communicate, support teammates and solve game problems together." },
              { Icon: Heart, title: "Love of the Game", text: "Fun, confidence and a positive team experience stay at the centre of the program." }
            ].map(({ Icon, title, text }) => (
              <div key={title} className="card p-6">
                <Icon className="text-red-600" />
                <h2 className="mt-4 text-xl font-black uppercase">{title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 card overflow-hidden">
            <div className="bg-black p-6 text-white">
              <h2 className="text-3xl font-black uppercase">Skill Progression Framework</h2>
            </div>
            <div className="grid gap-px bg-neutral-200">
              {framework.map(([area, work, help]) => (
                <div key={area} className="grid gap-4 bg-white p-5 md:grid-cols-[180px_1fr_1fr]">
                  <div className="font-black uppercase text-red-600">{area}</div>
                  <div>
                    <div className="text-xs font-black uppercase text-neutral-400">What we work on</div>
                    <div className="mt-1 text-sm">{work}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-neutral-400">How parents can help</div>
                    <div className="mt-1 text-sm">{help}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="card p-6">
              <div className="flex items-center gap-3">
                <Footprints className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Home Practice Ideas</h2>
              </div>
              <Link href="/train-at-home" className="btn btn-primary mt-4">Explore Train at Home</Link>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {practiceIdeas.map(([title, text]) => (
                  <div key={title} className="rounded-2xl bg-neutral-50 p-4">
                    <div className="font-black uppercase">{title}</div>
                    <p className="mt-2 text-sm text-neutral-600">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="grid gap-4">
              <div className="card p-5">
                <MessageCircleHeart className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Parent Education</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Competition format and U9 rules can vary by league. Official 2026 rules will be linked here once the team&apos;s competition details are verified.
                </p>
              </div>
              <div className="card p-5">
                <ShieldCheck className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Recognition</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Team shout-outs should recognize effort, teamwork, sportsmanship and improvement — not create a public popularity or player-ranking system.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">Help your player build confidence</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">What progress can look like</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">A player might start the season looking down for every touch and later glance up before a pass. Another might become comfortable asking for the ball or trying a turn under pressure. Watch for changes in what your player is willing to try and what she can do with more confidence.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Learning different positions</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Moving between positions helps players see new choices. A player who tries a wider role can learn when to offer a passing option. A player who spends time closer to goal can practise helping a teammate when the team loses the ball. Ask your player what she noticed in a different role.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">How families can reinforce practice</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Pick one small thing to practise at home, such as stopping the ball on cue or sending a gentle pass through a gate. Let your player choose the drill and finish while it still feels fun. When you watch a session, praise a decision she made or a teammate she helped. Use Train at Home for a short plan with variations.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Questions to ask after a session</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Try “What was fun today?”, “What did you try for the first time?” or “Who helped you on the field?” Listen to her answer before offering advice. If she wants to practise something again, help her find a way to do it with the space and equipment you have.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/train-at-home" className="btn btn-light">Train at Home</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

