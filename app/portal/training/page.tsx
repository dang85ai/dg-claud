"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleDot,
  Footprints,
  Goal,
  HeartHandshake,
  Lightbulb,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { supabase } from "@/lib/supabase";

type Session = {
  id: string;
  number: number;
  title: string;
  theme: string;
  parentSummary: string;
  skills: string[];
  askAtHome: string;
  homeChallenge: string;
  phases: Array<{
    time: string;
    title: string;
    setup?: string;
    how: string[];
    coaching?: string[];
    progressions?: string[];
  }>;
  reflection: string;
};

const sessions: Session[] = [
  {
    id: "session-1",
    number: 1,
    title: "Dribbling & Ball Mastery",
    theme: "I can keep the ball and change direction",
    parentSummary:
      "Players build confidence carrying the ball, changing speed and direction, and keeping control while looking up.",
    skills: ["Close control", "Both feet", "Turns", "Head up", "Confidence in 1v1 moments"],
    askAtHome: "What turn helped you keep the ball today?",
    homeChallenge:
      "Set out 3 household-safe markers. Dribble around them for 5 minutes using both feet and one change-of-direction move at each marker.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: [
          "Every player grabs a ball and dribbles freely as soon as they arrive.",
          "Coach greets each player by name and keeps the environment playful."
        ]
      },
      {
        time: "5–15",
        title: "Traffic Lights",
        setup: "20x20 grid · every player has a ball",
        how: [
          "Green = dribble fast",
          "Yellow = small controlled touches",
          "Red = stop with the sole",
          "Roundabout = 360° turn"
        ],
        coaching: ["Ball close", "Head up between touches", "Use both feet"]
      },
      {
        time: "15–30",
        title: "Sharks & Minnows",
        setup: "20x20 grid · minnows with balls · 2–3 sharks without",
        how: [
          "Minnows dribble from one side to the other while protecting the ball.",
          "Sharks try to poke balls out of the grid.",
          "A player who loses the ball becomes a shark so nobody is eliminated or standing."
        ],
        progressions: [
          "Shrink the space",
          "Require a turn before crossing",
          "Challenge players to escape using their weaker foot"
        ],
        coaching: ["Change speed after the turn", "Use body to protect the ball", "Look for open space"]
      },
      {
        time: "30–42",
        title: "Gates Dribbling",
        setup: "8–10 small cone gates scattered around the grid",
        how: [
          "Players score by dribbling through as many different gates as possible.",
          "Play three short rounds and challenge players to beat their own score."
        ],
        progressions: ["Turn after every gate", "Coach becomes a moving gate blocker"],
        coaching: ["Small touches near traffic", "Bigger touch into open space", "Head up to find the next gate"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "1 GK + 4 outfield · start in a simple 1-2-1 shape",
        how: [
          "Let the game flow with minimal stoppages.",
          "Rotate positions so players experience goalkeeper, defender, midfielder and striker roles."
        ],
        coaching: ["Praise brave dribbling", "Reward decisions, not only goals", "Keep stoppages brief"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What was one thing you did well today?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What was one thing you did well today?"
  },
  {
    id: "session-2",
    number: 2,
    title: "Passing, Receiving & Support",
    theme: "I can find a teammate and move to help them",
    parentSummary:
      "Players learn to pass with purpose, receive into space, move after the pass and become an option for teammates.",
    skills: ["Inside-foot pass", "First touch", "Pass and move", "Creating space", "Communication"],
    askAtHome: "What made a pass easier for your teammate to receive?",
    homeChallenge:
      "Pass against a wall or with a family member for 5 minutes. After every pass, take two quick steps to a new angle before receiving again.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Every player starts with a ball and explores touches while teammates arrive."]
      },
      {
        time: "5–15",
        title: "Copycat Passing",
        setup: "Pairs · one ball per pair · about 5 yards apart",
        how: [
          "One player passes and the partner receives and copies the pass back.",
          "Progress to receive-and-pass with two touches.",
          "One-touch is an optional challenge only when the pair is ready."
        ],
        coaching: ["Inside of the foot", "Plant foot beside the ball", "First touch prepares the next action"]
      },
      {
        time: "15–30",
        title: "End Zone Game",
        setup: "25x20 grid · two end zones · 4v4 where numbers allow",
        how: [
          "Teams score by passing to a teammate who receives in the end zone.",
          "Players cannot dribble into the end zone to score."
        ],
        progressions: ["Receiver must move into the end zone", "Add a touch limit only if the game is flowing"],
        coaching: ["Move after you pass", "Spread out", "Show where you want the ball"]
      },
      {
        time: "30–42",
        title: "3v3 with Targets",
        setup: "20x15 grid · target player on each end line",
        how: [
          "Teams keep the ball and score by finding their target.",
          "Target rotates into the game after a successful connection."
        ],
        coaching: ["Pass and move", "Create a new angle", "Use simple communication: ‘time’, ‘turn’, ‘man on’"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Rotate positions through the 1-2-1 shape",
        how: [
          "Play mostly uninterrupted.",
          "Celebrate assists, support runs and unselfish passes as much as goals."
        ],
        coaching: ["Can you help the player on the ball?", "Find width", "Move again after passing"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What made a good pass today?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What made a good pass today?"
  },
  {
    id: "session-3",
    number: 3,
    title: "Defending & Pressing",
    theme: "I can win the ball back and stay with my player",
    parentSummary:
      "Players learn to slow attackers down, stay balanced and work together to recover the ball without diving in.",
    skills: ["Defensive stance", "Jockeying", "Delay", "Pressure & cover", "Transition after winning it"],
    askAtHome: "How did you make it harder for an attacker to get past you?",
    homeChallenge:
      "Play a 3-minute mirror game with a family member: one person moves side to side while the defender stays balanced, low and in front.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Players arrive, take a ball and begin free dribbling immediately."]
      },
      {
        time: "5–15",
        title: "Body Shape Mirror",
        setup: "Pairs · start without a ball, then add one",
        how: [
          "Attacker moves side to side and the defender mirrors.",
          "Add a ball and let the attacker dribble slowly while the defender stays in front."
        ],
        coaching: ["Side-on stance", "Stay low", "Small quick steps", "Jockey—do not dive in"]
      },
      {
        time: "15–30",
        title: "1v1 to Goal",
        setup: "Two small goals about 15 yards apart",
        how: [
          "Attacker tries to score.",
          "Defender delays, wins the ball and can immediately attack the opposite goal.",
          "Rotate roles often so players get repeated attacking and defending reps."
        ],
        coaching: ["Slow the attacker", "Guide them one way", "Win it, then play forward"]
      },
      {
        time: "30–42",
        title: "4v4 Pressing Game",
        setup: "30x20 grid · two goals",
        how: [
          "When possession changes, the nearest defender applies pressure while teammates recover and cover.",
          "Award a bonus point for a clean regain in the attacking half."
        ],
        coaching: ["Nearest player pressures", "Second player covers", "Recover together", "Communicate"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Regular 5v5 with position rotation",
        how: [
          "Allow the game to flow.",
          "Use only 2–3 quick praise stoppages to highlight strong defending or teamwork."
        ],
        coaching: ["Notice effort to recover", "Praise patience", "Celebrate winning the ball together"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What does good defending look like?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What does good defending look like?"
  },
  {
    id: "session-4",
    number: 4,
    title: "Shooting & Finishing",
    theme: "I can be brave and shoot",
    parentSummary:
      "Players learn to set the ball, strike with confidence and recognize moments when shooting is the right choice.",
    skills: ["Plant foot", "Clean strike", "Follow-through", "Quick decision", "Rebounds"],
    askAtHome: "What helped you make good contact with the ball?",
    homeChallenge:
      "Use a safe target such as two cones or shoes. Take 10 controlled shots with each foot from a short distance and focus on accuracy before power.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Players arrive and dribble freely with a ball each."]
      },
      {
        time: "5–15",
        title: "Two-Channel Dribble & Shoot",
        setup: "Two active shooting channels · one ball per player · rotating goalkeepers",
        how: [
          "Players dribble through their channel and shoot, then immediately collect a ball and rejoin through open space.",
          "Both channels operate at the same time so there are no standing lines.",
          "Alternate the finishing foot when appropriate."
        ],
        coaching: ["Plant foot beside the ball", "Strike through the ball", "Follow through toward the target", "React to rebounds"]
      },
      {
        time: "15–30",
        title: "Numbers Game to Goal",
        setup: "Two teams · goals at each end · balls with coach",
        how: [
          "Coach calls 1, 2 or 3 and that many players from each team enter.",
          "The group competes for the ball and plays live to goal."
        ],
        coaching: ["Attack quickly", "Look up before shooting", "Follow rebounds", "Be brave"]
      },
      {
        time: "30–42",
        title: "Wide Play & Finishing",
        setup: "Two wide channels and a central finishing area",
        how: [
          "Wide player carries the ball into space and plays across goal.",
          "Teammates attack the central area and finish.",
          "Rotate roles frequently."
        ],
        coaching: ["Get your head up", "Play the ball into a teammate’s path", "Arrive ready to finish"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Regular 5v5 with position rotation",
        how: [
          "Encourage players to recognize shooting opportunities anywhere in the attacking half.",
          "Keep the game flowing and praise brave attempts, including misses."
        ],
        coaching: ["Can you see the goal?", "Set and strike", "Follow your shot"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What did you do before you shot?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What did you do before you shot?"
  }
];

const weeklyBlock = [
  ["1", "Dribbling & Ball Mastery", "Passing & Support"],
  ["2", "Defending & Pressing", "Shooting & Finishing"],
  ["3", "Dribbling & Turns", "Passing & Movement"],
  ["4", "1v1 Attacking", "1v1 Defending"],
  ["5", "Shooting Under Pressure", "Possession Games"],
  ["6", "Defending as a Team", "Attacking as a Team"],
  ["7", "Review + Fun Games", "Mini-Tournament"],
  ["8", "Celebration Session", "Parent-Player Game"]
];

export default function TrainingDevelopmentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [printTarget, setPrintTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  useEffect(() => {
    if (!printTarget) return;
    const onAfterPrint = () => setPrintTarget(null);
    window.addEventListener("afterprint", onAfterPrint);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [printTarget]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <PortalHeader title="Training & Development" />
        <div className="container py-12"><div className="notice">Loading training guide…</div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="no-print">
        <PortalHeader title="Training & Development" />
      </div>

      <main className="container py-8">
        <div className="no-print">
          <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-black uppercase text-neutral-600 hover:text-red-600">
            <ArrowLeft size={16} /> Back to Team Portal
          </Link>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Caledon U9 Girls · 2026–27</div>
              <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-6xl">Training & Development</h1>
              <p className="mt-4 max-w-3xl text-neutral-600">
                A simple parent view of what the girls are learning, plus printable one-page coaching cards for each 60-minute 5v5 session.
              </p>
            </div>
            <div className="rounded-3xl bg-black p-5 text-white">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-red-500">
                <ShieldCheck size={16} /> U9 Development First
              </div>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Fun, high ball-contact, small-sided decisions and position rotation come before results or fixed tactics.
              </p>
            </div>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["No laps", "Movement always includes a ball or game purpose.", Footprints],
              ["No lines", "Design activities so players are active, not waiting.", Users],
              ["No lectures", "Keep coaching interventions under two minutes.", Lightbulb],
              ["Rotate roles", "No permanent goalkeeper, defender or striker.", RotateCcw]
            ].map(([title, text, Icon]) => {
              const I = Icon as typeof Footprints;
              return (
                <div className="card p-5" key={String(title)}>
                  <I className="text-red-600" />
                  <h2 className="mt-3 text-lg font-black uppercase">{String(title)}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{String(text)}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-10">
            <div className="flex items-center gap-3">
              <HeartHandshake className="text-red-600" />
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Parent View</div>
                <h2 className="text-3xl font-black uppercase">What We’re Learning</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {sessions.map((session) => (
                <article key={session.id} className="card overflow-hidden">
                  <div className="bg-black p-5 text-white">
                    <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Session {session.number}</div>
                    <h3 className="mt-1 text-2xl font-black uppercase">{session.title}</h3>
                    <p className="mt-2 text-sm font-bold text-white/75">“{session.theme}”</p>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-6 text-neutral-700">{session.parentSummary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-black uppercase"><CircleDot size={16} className="text-red-600" /> Ask on the ride home</div>
                      <p className="mt-2 text-sm text-neutral-600">{session.askAtHome}</p>
                    </div>
                    <div className="mt-3 rounded-2xl bg-red-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-red-700"><Sparkles size={16} /> 5-minute home challenge</div>
                      <p className="mt-2 text-sm text-neutral-700">{session.homeChallenge}</p>
                    </div>
                    <button onClick={() => setPrintTarget(session.id)} className="btn btn-dark mt-5 w-full">
                      <Printer size={17} /> Print Coach Session Card
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <Goal className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Simple 5v5 Shape</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">Default starting shape: 1-2-1. It is a reference point, not a rigid tactical system.</p>
              <div className="mt-5 rounded-3xl bg-emerald-800 p-5 text-center font-black text-white">
                <div className="mx-auto w-20 rounded-full border-2 border-white/70 py-2">ST</div>
                <div className="mx-auto mt-4 w-20 rounded-full border-2 border-white/70 py-2">CM</div>
                <div className="mx-auto mt-4 flex max-w-xs justify-between gap-8">
                  <div className="w-20 rounded-full border-2 border-white/70 py-2">LB</div>
                  <div className="w-20 rounded-full border-2 border-white/70 py-2">RB</div>
                </div>
                <div className="mx-auto mt-4 w-20 rounded-full border-2 border-white/70 py-2">GK</div>
              </div>
              <p className="mt-4 text-sm font-bold text-neutral-700">
                Across the season, every player should experience every position—including goalkeeper.
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <BookOpenCheck className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">8-Week Training Block</h2>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="py-3 pr-3 font-black uppercase">Week</th>
                      <th className="py-3 pr-3 font-black uppercase">Session A</th>
                      <th className="py-3 font-black uppercase">Session B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyBlock.map(([week, a, b]) => (
                      <tr key={week} className="border-b border-neutral-200">
                        <td className="py-3 pr-3 font-black">{week}</td>
                        <td className="py-3 pr-3">{a}</td>
                        <td className="py-3">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-10 coach-print-stack">
          {sessions.map((session) => (
            <article
              key={session.id}
              data-session-id={session.id}
              className={`training-print-page ${printTarget === session.id ? "print-selected" : ""}`}
            >
              <div className="mb-4 flex items-start justify-between gap-4 border-b-4 border-red-600 pb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Caledon U9 Girls 2026 · Coach Session Card</div>
                  <h2 className="mt-1 text-3xl font-black uppercase">Session {session.number} — {session.title}</h2>
                  <p className="mt-1 text-sm font-bold text-neutral-600">Theme: “{session.theme}” · 60 minutes · 5v5</p>
                </div>
                <div className="rounded-2xl bg-black px-4 py-3 text-center text-white">
                  <div className="text-xs font-black uppercase text-red-500">Format</div>
                  <div className="text-xl font-black">1 GK + 4</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {session.phases.map((phase) => (
                  <section key={`${session.id}-${phase.time}-${phase.title}`} className="rounded-2xl border border-neutral-300 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-black uppercase">{phase.title}</h3>
                      <span className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">{phase.time} min</span>
                    </div>
                    {phase.setup ? <p className="mt-2 text-xs font-bold uppercase text-neutral-500">{phase.setup}</p> : null}
                    <ul className="mt-3 space-y-1 text-sm leading-5">
                      {phase.how.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                    {phase.coaching?.length ? (
                      <div className="mt-3 rounded-xl bg-neutral-100 p-3">
                        <div className="text-xs font-black uppercase text-neutral-500">Coach cues</div>
                        <p className="mt-1 text-sm font-bold">{phase.coaching.join(" · ")}</p>
                      </div>
                    ) : null}
                    {phase.progressions?.length ? (
                      <div className="mt-3 text-xs text-neutral-600"><strong>Progress:</strong> {phase.progressions.join(" · ")}</div>
                    ) : null}
                  </section>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-black p-4 text-white">
                  <div className="text-xs font-black uppercase text-red-500">Golden rules</div>
                  <p className="mt-2 text-sm font-bold">No laps · No lines · No lectures · Maximize ball touches</p>
                </div>
                <div className="rounded-2xl border border-neutral-300 p-4">
                  <div className="text-xs font-black uppercase text-neutral-500">Position rotation</div>
                  <p className="mt-2 text-sm font-bold">Rotate GK and outfield roles. Avoid early specialization.</p>
                </div>
                <div className="rounded-2xl border border-neutral-300 p-4">
                  <div className="text-xs font-black uppercase text-neutral-500">Team reflection</div>
                  <p className="mt-2 text-sm font-bold">“{session.reflection}”</p>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-300 pt-3 text-xs text-neutral-500">
                Praise effort, bravery, teamwork and good decisions. Demonstrate quickly, then let the players play.
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
