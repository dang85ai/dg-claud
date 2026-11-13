import type { Metadata } from "next";
import { CommunicationGuide, VenueGuide, WeatherGuide } from "@/components/ParentInformation";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { ScheduleEvents } from "@/components/ScheduleEvents";
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
  title: "Schedule & Events",
  description: "Caledon United FC 2018 Girls 2026–27 team schedule with training dates, games, cancellations, venue guidance and links to Spond for current event details.",
  alternates: { canonical: "/schedule" }
};

const calendarUrl = "https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/team-calendar";

export default function SchedulePage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="schedule"
        eyebrow="Games · Practices · Events"
        title="Schedule & Events"
        copy="Public planning dates for the 2026–27 season. Exact start times, venues, entrances and arrival instructions stay in Spond and parent-only communication."
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { Icon: CalendarDays, title: "Practices", text: "October–May planning dates are listed below. Check Spond for exact time, venue and arrival details." },
              { Icon: Trophy, title: "Games", text: "Game dates can appear here. Exact opponent, kickoff, venue and arrival instructions are confirmed in Spond." },
              { Icon: Users, title: "Team Events", text: "Photo day, fundraisers, socials and other team events will be included." },
              { Icon: MapPin, title: "Tournaments", text: "Tournament planning dates can appear here. Exact venue and team logistics are confirmed in Spond." }
            ].map(({ Icon, title, text }) => (
              <div className="card p-5" key={title}>
                <Icon className="text-red-600" />
                <h2 className="mt-3 text-lg font-black uppercase">{title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="card min-w-0 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <CalendarDays className="text-red-600" />
                  <h2 className="text-xl font-black uppercase sm:text-2xl">2026–27 Training Calendar</h2>
                </div>
                <a className="btn btn-primary" href={calendarUrl}>
                  <Download size={17} /> Add Planning Dates
                </a>
              </div>
              <p className="mt-4 text-neutral-600">
                Planning dates are supplied from the team schedule for October 2026 through May 2027. Exact start times and locations are intentionally kept in Spond.
              </p>
              <div className="mt-6">
                <ScheduleEvents />
              </div>
            </div>

            <aside className="grid h-fit gap-4">
              <div className="card p-5">
                <Clock3 className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Arrival Time</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Plan to arrive 30 minutes before kickoff for warm-up unless the coach posts a different arrival time.
                  For training, follow the arrival instructions in your Spond invite.
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

<div className="mt-8 grid gap-6 lg:grid-cols-2"><VenueGuide /><CommunicationGuide /><WeatherGuide /><section className="card p-6"><h2 className="text-2xl font-black uppercase">Important dates & deadlines</h2><p className="mt-4 text-neutral-600">Confirmed team events will appear in the calendar. Registration, kit orders, forms, payments and photo-day deadlines have not yet been supplied for this training season. Check private team messages or ask the manager.</p><a href="https://caledonsoccer.com/about-us/key-dates/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-bold text-red-600 underline">Official club key dates</a><p className="mt-2 text-sm text-neutral-600">Club events can apply to other programs. Confirm team participation and season before adding them.</p></section></div>
        </div>
      </section>
      <section className="section border-t border-neutral-200" aria-labelledby="schedule-planning-title">
        <div className="container max-w-4xl">
          <h2 id="schedule-planning-title" className="text-3xl font-black uppercase tracking-tight">Plan your week with the team</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="card p-5">
              <h3 className="text-lg font-black">Read the calendar before making plans</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Start with the public calendar to see which dates to keep open. When a date works for your family, find the corresponding event in Spond and check whether an RSVP is requested. If you are coordinating with another caregiver, share the current invite details privately and agree on who will reply. Check again before booking travel around a tournament or other event.</p>
            </article>
            <article className="card p-5">
              <h3 className="text-lg font-black">Check which time to use</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">An invitation can list both an arrival time and a start time. Use the arrival time to plan parking, changing shoes and meeting the team. If the venue is unfamiliar, read the entrance and field instructions before leaving. For a double-header or tournament, check each event separately so one arrival time or entrance is not assumed to apply to the whole day.</p>
            </article>
            <article className="card p-5">
              <h3 className="text-lg font-black">When the schedule changes</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Reopen the invite if you see a weather notice, receive an update or are relying on an old screenshot. Check whether the event was moved or cancelled, and look for a replacement invitation if the date changed. If a ride is already arranged, send the revised instructions privately to the person driving.</p>
            </article>
            <article className="card p-5">
              <h3 className="text-lg font-black">If you cannot find the invite</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Check that you are using the Spond account linked to the team. If the event is still missing, tell the manager which planning date you expected and whether other team invitations are visible. Once the invite is available, use the <a href="/game-day" className="font-bold text-red-800 underline">Game Day Guide</a> to get ready.</p>
            </article>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

