import {
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Users
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const playerExpectations = [
  "Arrive on time and ready to play",
  "Respect coaches, teammates, opponents and officials",
  "Give your best effort",
  "Encourage teammates",
  "Have fun and help create a positive team environment"
];

const parentExpectations = [
  "Cheer positively and avoid coaching from the sideline",
  "Respect officials and the coach's role",
  "Support all players, not only your own",
  "Keep communication respectful and constructive",
  "Communicate absences promptly",
  "Complete agreed team obligations and payments on time"
];

export default function ConductPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Standards"
        title="Code of Conduct"
        copy="A positive team culture starts with clear expectations for players, parents and team officials."
      />

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <Users className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Player Expectations</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {playerExpectations.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-neutral-50 p-3 text-sm font-bold">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Parent Expectations</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {parentExpectations.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-neutral-50 p-3 text-sm font-bold">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <MessageSquareText className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Resolving Concerns</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-xs font-black uppercase text-red-600">1. Cool Down</div>
                <p className="mt-2 text-sm text-neutral-600">For non-urgent game-day concerns, allow time for emotions to settle before starting the conversation.</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-xs font-black uppercase text-red-600">2. Team Level</div>
                <p className="mt-2 text-sm text-neutral-600">Speak respectfully with the coach or team manager and focus on the specific issue.</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <div className="text-xs font-black uppercase text-red-600">3. Club Process</div>
                <p className="mt-2 text-sm text-neutral-600">If unresolved, follow the verified Caledon Soccer Club escalation process once published.</p>
              </div>
            </div>
            <div className="notice mt-5">
              Formal disciplinary consequences are governed by club and league policy. This page does not replace those policies.
            </div>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
