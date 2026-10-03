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
import { authedFetch, endpoints } from "@/lib/api";
import { sessions } from "@/lib/training-plans";
import { supabase } from "@/lib/supabase";

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
      try {
        const data = await authedFetch<{ roles: string[] }>(endpoints.parentDashboard);
        if (!data.roles.some(role => ["parent_player", "photographer", "admin", "manager"].includes(role))) { router.replace("/portal"); return; }
        if (data.roles.some(role => ["admin", "manager"].includes(role))) {
          const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
        }
        setReady(true);
      } catch { router.replace("/login"); }
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

  useEffect(() => {
    if (!ready || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [ready]);

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
      <PortalHeader title="Training & Development" />

      <main id="portal-main" className="container py-8">
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
                <article id={session.id} key={session.id} className="card scroll-mt-40 overflow-hidden">
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
                    <div id={`${session.id}-home`} className="mt-3 scroll-mt-40 rounded-2xl bg-red-50 p-4">
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
              id={`${session.id}-coach`} data-session-id={session.id}
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
