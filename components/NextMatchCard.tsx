"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { directionsUrl, formatDate, formatTime, useTeamSchedule } from "@/lib/team-schedule";

export function NextMatchCard() {
  const { events, status, checkedAt } = useTeamSchedule();
  const now = checkedAt?.getTime() ?? Date.now();
  const event = events.find((item) => item.status !== "cancelled" && Date.parse(item.ends_at || item.starts_at) > now);
  return (
    <div className="card overflow-hidden text-neutral-900">
      <div className="bg-black px-5 py-3 text-sm font-black uppercase tracking-wide text-white">Next practice or game</div>
      <div className="p-5 md:p-6" aria-live="polite">
        {event ? <>
          <div className="text-sm font-bold text-red-600">2026–27 Training Season · {event.status === "scheduled" ? "Scheduled" : event.status}</div>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{event.title}</h3>
          <dl className="mt-5 grid gap-3">
            <div><dt className="flex items-center gap-2 font-bold"><CalendarDays size={18} aria-hidden="true" />Date</dt><dd className="mt-1">{formatDate(event.starts_at)}</dd></div>
            <div><dt className="flex items-center gap-2 font-bold"><Clock3 size={18} aria-hidden="true" />Time</dt><dd className="mt-1">{formatTime(event.starts_at)}{event.ends_at ? ` – ${formatTime(event.ends_at)}` : " · End time to be confirmed"}</dd></div>
            <div><dt className="flex items-center gap-2 font-bold"><MapPin size={18} aria-hidden="true" />Venue</dt><dd className="mt-1">{event.venue_name || "Venue to be confirmed"}{event.venue_address ? <span className="block">{event.venue_address}</span> : <span className="block text-sm text-neutral-600">Confirm the address and entrance in your Spond invite before travelling.</span>}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-neutral-600">Arrival and kit: follow the coach&apos;s instructions in the event invite. Bring water and check the <Link href="/game-day" className="font-bold underline">equipment checklist</Link>.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="https://spond.com/client/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open Spond / RSVP</a>
            {event.venue_address ? <a href={directionsUrl(event.venue_address)} target="_blank" rel="noopener noreferrer" className="btn btn-light">Directions</a> : <Link href="/schedule#venues" className="btn btn-light">Venue guidance</Link>}
          </div>
          <p className="mt-4 text-sm text-neutral-600">Schedule checked {checkedAt ? formatTime(checkedAt.toISOString()) : "just now"}. Check your latest team message for last-minute changes.</p>
        </> : <p>{status || "No upcoming sessions are currently listed. Check Spond or contact the team manager."}</p>}
        {event && status ? <p className="notice mt-4" role="status">{status}</p> : null}
        <Link href="/schedule#current-week" className="mt-5 inline-flex min-h-11 items-center font-bold text-red-600 underline">View this week&apos;s schedule</Link>
      </div>
    </div>
  );
}
