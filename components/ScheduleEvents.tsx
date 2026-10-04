"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";
import { SPOND_URL } from "@/lib/team-config";

type TeamEvent = {
  id: string;
  event_type?: string;
  title?: string;
  date?: string;
  starts_at?: string;
  status: string;
};

const scheduleUrl = `${SUPABASE_URL}/functions/v1/public-schedule`;

function torontoDayKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function eventDate(event: TeamEvent) {
  if (event.date) return event.date;
  if (event.starts_at) return torontoDayKey(event.starts_at);
  return "";
}

function monthKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "long"
  }).format(new Date(`${value}T12:00:00Z`));
}

function currentTorontoWeek() {
  const todayKey = torontoDayKey(new Date());
  const [year, month, day] = todayKey.split("-").map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  const weekday = today.getUTCDay();
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;

  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() + offsetToMonday);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  const key = (date: Date) =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

  return { start: key(start), end: key(end) };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00Z`));
}

function safeTitle(event: TeamEvent) {
  if (event.title) return event.title;
  if (event.event_type === "game") return "Game Day";
  if (event.event_type === "tournament") return "Tournament";
  if (event.event_type === "practice" || event.event_type === "training") return "Training Session";
  return "Team Event";
}

export function ScheduleEvents() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [status, setStatus] = useState("Loading planning dates…");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch(scheduleUrl, {
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
          cache: "no-store"
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Unable to load schedule.");

        if (mounted) {
          setEvents(
            [...(payload.events ?? [])]
              .filter((event: TeamEvent) => Boolean(eventDate(event)))
              .sort((a: TeamEvent, b: TeamEvent) => eventDate(a).localeCompare(eventDate(b)))
          );
          setStatus("");
        }
      } catch (error) {
        if (mounted) setStatus(error instanceof Error ? error.message : "Unable to load schedule.");
      }
    })();

    return () => { mounted = false; };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, TeamEvent[]>();
    for (const event of events) {
      const key = monthKey(eventDate(event));
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }
    return Array.from(map.entries());
  }, [events]);

  const currentWeekEvents = useMemo(() => {
    const { start, end } = currentTorontoWeek();
    return events.filter((event) => {
      const key = eventDate(event);
      return key >= start && key <= end;
    });
  }, [events]);

  const cancelled = events.filter((event) => event.status === "cancelled").length;

  function EventCard({ event }: { event: TeamEvent }) {
    const isCancelled = event.status === "cancelled";
    return (
      <article className={`rounded-2xl border p-5 ${isCancelled ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`min-w-0 break-words text-base font-black uppercase leading-tight sm:text-lg ${isCancelled ? "text-neutral-500" : ""}`}>
                {safeTitle(event)}
              </h4>
              {isCancelled ? (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-center text-xs font-black uppercase leading-tight text-white whitespace-normal">
                  <XCircle size={14} /> Cancelled — no session
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-red-600" />
                {formatDate(eventDate(event))}
              </span>
            </div>

            {!isCancelled ? (
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-neutral-700">
                <ShieldCheck size={16} className="text-red-600" />
                Exact time, venue and arrival details are in Spond.
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-red-700">Cancelled — no session.</p>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (status && !events.length) {
    return (
      <div id="current-week" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2 font-black uppercase text-neutral-800">
          <RefreshCw size={17} /> {status}
        </div>
        <a href={SPOND_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex font-black text-red-600">
          Open Spond →
        </a>
      </div>
    );
  }

  return (
    <div id="current-week" className="scroll-mt-28">
      <section id="this-week" className="scroll-mt-28 rounded-3xl border-2 border-red-200 bg-red-50 p-5 md:p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Current Week</div>
        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">This Week’s Team Dates</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Public planning dates only. Check Spond for exact start time, venue, entrance and arrival instructions.
        </p>

        <div className="mt-5 grid gap-3">
          {currentWeekEvents.length ? currentWeekEvents.map((event) => <EventCard key={event.id} event={event} />) : (
            <div className="rounded-2xl bg-white p-5 text-sm font-bold text-neutral-600">No team session is scheduled for the current week.</div>
          )}
        </div>
        <a href={SPOND_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">Open Spond / RSVP</a>
      </section>

      <div className="my-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-neutral-100 p-4"><div className="text-3xl font-black">{events.length}</div><div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Team Dates</div></div>
        <div className="rounded-2xl bg-neutral-100 p-4"><div className="text-3xl font-black">{events.length - cancelled}</div><div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Active</div></div>
        <div className="rounded-2xl bg-neutral-100 p-4"><div className="text-3xl font-black text-red-600">{cancelled}</div><div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Cancelled</div></div>
      </div>

      <div className="grid gap-8">
        {groups.map(([month, monthEvents]) => (
          <section key={month}>
            <h3 className="mb-3 text-xl font-black uppercase tracking-tight">{month}</h3>
            <div className="grid gap-3">{monthEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
          </section>
        ))}
      </div>
      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </div>
  );
}
