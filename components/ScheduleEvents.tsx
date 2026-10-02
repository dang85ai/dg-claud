"use client";

import { CalendarDays, Clock3, MapPin, XCircle } from "lucide-react";
import { currentWeekEvents, directionsUrl, formatDate, formatTime, TeamEvent, useTeamSchedule } from "@/lib/team-schedule";

function EventCard({ event }: { event: TeamEvent }) {
  const cancelled = event.status === "cancelled";
  return <article className={`rounded-2xl border p-5 ${cancelled ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"}`}>
    <h4 className={`text-lg font-black ${cancelled ? "line-through text-neutral-500" : ""}`}>{event.title}</h4>
    {cancelled ? <p className="mt-2 flex items-center gap-2 font-bold text-red-700"><XCircle size={18} aria-hidden="true" />Cancelled — no session</p> : null}
    <div className="mt-3 grid gap-2 text-neutral-700">
      <span className="flex items-center gap-2"><CalendarDays size={18} aria-hidden="true" />{formatDate(event.starts_at)}</span>
      {!cancelled ? <span className="flex items-center gap-2"><Clock3 size={18} aria-hidden="true" />{formatTime(event.starts_at)}{event.ends_at ? ` – ${formatTime(event.ends_at)}` : ""}</span> : null}
      {!cancelled ? <span className="flex items-center gap-2"><MapPin size={18} aria-hidden="true" />{event.venue_name || "Venue to be confirmed"}</span> : null}
    </div>
    {!cancelled && event.venue_address ? <><p className="mt-2 text-neutral-600">{event.venue_address}</p><a href={directionsUrl(event.venue_address)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-bold text-red-600 underline">Directions</a></> : null}
    {!cancelled && event.notes?.includes("Spond invite goes out 3 days in advance") ? <p className="mt-3 text-sm font-bold text-red-600">Spond invite goes out 3 days in advance</p> : null}
  </article>;
}

export function ScheduleEvents() {
  const { events, status, checkedAt } = useTeamSchedule();
  const week = checkedAt ? currentWeekEvents(events, checkedAt) : [];
  const cancelled = events.filter((event) => event.status === "cancelled").length;
  const groups = new Map<string, TeamEvent[]>();
  for (const event of events) {
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "long" }).format(new Date(event.starts_at));
    groups.set(month, [...(groups.get(month) ?? []), event]);
  }
  return <div>
    <section id="current-week" className="mb-8 scroll-mt-28 rounded-2xl bg-neutral-100 p-5" aria-live="polite">
      <h3 className="text-2xl font-black uppercase">This week</h3>
      <p className="mt-2 text-sm text-neutral-600">Monday–Sunday · Toronto local time</p>
      {status ? <p className="notice mt-4" role="status">{status}</p> : null}
      {checkedAt && !week.length ? <p className="mt-4">No sessions are listed for this week. The upcoming calendar is below.</p> : null}
      <div className="mt-4 grid gap-3">{week.map((event) => <EventCard key={event.id} event={event} />)}</div>
      {checkedAt ? <p className="mt-4 text-sm text-neutral-600">Schedule checked {formatTime(checkedAt.toISOString())}. Confirm last-minute changes in Spond.</p> : null}
    </section>
    <div className="mb-6 grid grid-cols-3 gap-3">{[[events.length, "Events"], [events.length - cancelled, "Active"], [cancelled, "Cancelled"]].map(([count, label]) => <div key={label} className="rounded-xl bg-neutral-100 p-3"><div className="text-3xl font-black">{count}</div><div className="mt-1 text-sm font-bold">{label}</div></div>)}</div>
    {!status && !events.length ? <p>No events are currently listed. Check Spond for team updates.</p> : null}
    <div className="grid gap-8">{Array.from(groups.entries()).map(([month, items]) => <section key={month}><h3 className="mb-3 text-xl font-black uppercase">{month}</h3><div className="grid gap-3">{items.map((event) => <EventCard key={event.id} event={event} />)}</div></section>)}</div>
  </div>;
}
