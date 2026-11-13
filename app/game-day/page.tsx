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
import { SPOND_URL } from "@/lib/team-config";

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
      <PublicPageHero banner="schedule" usePageTitle
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
                Open the latest Spond invitation for confirmed event details. Check these four things before leaving.
              </p>
              <a href={SPOND_URL} className="btn btn-primary mt-4">Open Spond</a>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [Users, "Event", "Check the latest invite"],
                  [Clock3, "Timing", "Check arrival and kickoff"],
                  [MapPin, "Venue", "Check the field and entrance"],
                  [Shirt, "Uniform", "Check home or away kit"]
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
      <section aria-labelledby="practical-guide-title" className="section border-t border-neutral-200">
        <div className="container max-w-4xl">
          <h2 id="practical-guide-title" className="text-3xl font-black uppercase tracking-tight">From the night before to pickup</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">The day before</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Open the latest Spond invitation and check four things together: the arrival time, venue entrance, playing surface and assigned kit. Arrival and kickoff are different times. If you are arranging a ride, send the driver the current invitation details privately so they use the correct entrance. Check the RSVP while you are there. If plans change, update your response in Spond and let the manager know if the change is late.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Pack for the surface</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">For indoor games, check the venue’s footwear instructions before packing. Some surfaces use clean indoor shoes and others use turf shoes. For outdoor games, follow the footwear guidance in the invitation and bring a layer for warm-up and time on the bench. Pack the assigned jersey, shorts, socks, shin guards and a labelled water bottle together. Ask the manager ahead of time if a kit item is missing so the team has time to help.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Before leaving home</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Check the event again before you get in the car, especially if the weather has changed. Look for an updated entrance, a field change or a cancellation. If you have a screenshot from earlier in the week, compare it with the live invitation. If you are running late, send a brief private message to the manager when it is safe to do so. Include the event and your estimated arrival.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">At the venue</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Use the entrance in the invitation and give yourself time to park, find the team and put on footwear and shin guards. Let the coach know your player has arrived before heading to the spectator area. If you are unsure which field to use, ask the manager privately. For a new venue, agree on a pickup point with your player and the adult collecting her.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">Support from the sideline</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Cheer effort and teamwork. A simple “great recovery” or “nice pass” gives players encouragement without competing with the coach’s instructions. Leave space along the sideline for players and officials. Check the team’s photo guidance before sharing pictures or videos, especially when other players are in the frame.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">After the final whistle</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Wait for the team huddle to finish before collecting your player. Check that she has her bottle, layers and bag. On the way home, try asking what she enjoyed or what she wants to try again. If you have a question about the game, follow up with the coach or manager privately after the session.</p>
            </article>
            <article className="card p-5 sm:p-6">
              <h3 className="text-lg font-black">If plans change at the last minute</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">For a late absence, update the RSVP and message the manager directly so the coaches can plan. If another adult will collect your player, share that change privately before the event ends. For weather or venue uncertainty, check the current invitation and wait for the team’s update. Keep exact event times, locations and pickup arrangements in the team’s private channels.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/schedule" className="btn btn-light">Team schedule</a>
            <a href="/photo-safety" className="btn btn-light">Photo and media safety</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

