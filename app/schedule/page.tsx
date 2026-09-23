import type { Metadata } from "next";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import {
  CalendarDays,
  CloudSun,
  Clock3,
  Download,
  MapPin,
  Trophy,
  Users
} from "lucide-react";

export const metadata: Metadata = {
  title: "Schedule & Events | Caledon U9 Girls 2026",
  description: "Games, practices, events, arrival guidance and field information for Caledon SC U9 Girls 2026.",
  alternates: { canonical: "/schedule" }
};

const calendarUrl = "https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/team-calendar";

export default function SchedulePage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Games · Practices · Events"
        title="Schedule & Events"
        copy="Designed for quick use from the sideline: date, arrival time, field, uniform, weather and parent duties."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { Icon: CalendarDays, title: "Practices", text: "Recurring practice dates, times, fields and duration will publish here." },
              { Icon: Trophy, title: "Games", text: "Opponent, home/away, kickoff, arrival time and field details will appear here." },
              { Icon: Users, title: "Team Events", text: "Photo day, fundraisers, socials and other team events will be included." },
              { Icon: MapPin, title: "Tournaments", text: "Tournament dates and venue information will be added when confirmed." }
            ].map(({ Icon, title, text }) => (
              <div className="card p-5" key={title}>
                <Icon className="text-red-600" />
                <h2 className="mt-3 text-lg font-black uppercase">{title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-red-600" />
                  <h2 className="text-2xl font-black uppercase">2026 Calendar</h2>
                </div>
                <a className="btn btn-primary" href={calendarUrl}>
                  <Download size={17} /> Add to Calendar
                </a>
              </div>
              <p className="mt-4 text-neutral-600">
                No official games or practices have been published yet. This area will populate from the live team schedule as events are confirmed.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                <div className="text-sm font-black uppercase tracking-[.14em] text-neutral-500">Official schedule coming soon</div>
                <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">
                  Use the calendar button now to subscribe to the team feed. Confirmed events will appear in the feed as they are published.
                </p>
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="card p-5">
                <Clock3 className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Arrival Time</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Plan to arrive 30 minutes before kickoff for warm-up unless the coach posts a different arrival time.
                </p>
              </div>
              <div className="card p-5">
                <CloudSun className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Weather Updates</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Weather or field-status changes will be posted here and through the team&apos;s private communication channel when confirmed.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Field Directory</h2>
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                Confirmed field names, addresses, map links, parking notes and washroom information will be added here. Sample addresses are not published as real team locations.
              </p>
              <div className="mt-5 rounded-2xl bg-neutral-50 p-5 text-sm font-bold text-neutral-500">
                No field locations published yet.
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-black uppercase">Rescheduling & Cancellations</h2>
              <div className="mt-4 grid gap-4 text-sm text-neutral-600">
                <p>
                  When an event changes, the website schedule and private team communication channel should be updated as soon as the change is confirmed.
                </p>
                <p>
                  If you will be late or absent, sign in to the Parent Portal and update your player&apos;s attendance so coaches can plan accordingly.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
