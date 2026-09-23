import {
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Shirt,
  Users
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const checklist = [
  "Correct home or away jersey",
  "Black shorts and team socks",
  "Shin guards",
  "Cleats",
  "Water bottle",
  "Snack, if assigned",
  "Hair tied back, if needed",
  "No jewelry"
];

export default function GameDayPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Game Day"
        title="Ready Before Kickoff"
        copy="A simple checklist and parent guide for getting to the field prepared, on time and ready to support the team."
      />

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <section className="card p-6">
              <div className="text-sm font-black uppercase tracking-[.14em] text-red-600">Next Game</div>
              <h2 className="mt-2 text-3xl font-black uppercase">Game-day card</h2>
              <p className="mt-3 text-sm text-neutral-600">
                The next confirmed opponent, date, kickoff, arrival time, field, uniform and game type will populate here from the team schedule.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [Users, "Opponent", "To be confirmed"],
                  [Clock3, "Date & Time", "To be confirmed"],
                  [MapPin, "Location", "To be confirmed"],
                  [Shirt, "Uniform", "Home / Away to be confirmed"]
                ].map(([Icon, label, value]: any) => (
                  <div key={label} className="rounded-2xl bg-neutral-50 p-4">
                    <Icon className="text-red-600" size={19} />
                    <div className="mt-3 text-xs font-black uppercase text-neutral-500">{label}</div>
                    <div className="mt-1 font-black">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-black uppercase">Pre-game checklist</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl bg-neutral-50 p-3 text-sm font-bold">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-red-600" size={17} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="grid content-start gap-4">
            <div className="card p-5">
              <Clock3 className="text-red-600" />
              <h3 className="mt-3 font-black uppercase">Arrival</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Plan to arrive 30 minutes before kickoff unless the coach posts a different arrival time.
              </p>
            </div>
            <div className="card p-5">
              <ShieldCheck className="text-red-600" />
              <h3 className="mt-3 font-black uppercase">Sideline Etiquette</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Cheer positively, support all players, let coaches coach, and keep communication with officials respectful.
              </p>
            </div>
            <div className="card p-5">
              <Users className="text-red-600" />
              <h3 className="mt-3 font-black uppercase">After the Game</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Players may huddle with coaches after the final whistle. Please allow the team to finish that routine before collecting your player.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
