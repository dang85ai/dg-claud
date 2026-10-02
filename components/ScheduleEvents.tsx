"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, Navigation, RefreshCw, XCircle } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";

type TeamEvent = {
  id: string;
  event_type: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  notes: string | null;
  status: string;
};

const scheduleUrl = `${SUPABASE_URL}/functions/v1/public-schedule`;

function monthKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "long"
  }).format(new Date(value));
}

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
    timeZone: "America/Toronto",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function directionsUrl(event: TeamEvent) {
  const query = event.venue_address || event.venue_name;
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
}

export function ScheduleEvents() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [status, setStatus] = useState("Loading training schedule…");

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
            [...(payload.events ?? [])].sort(
              (a: TeamEvent, b: TeamEvent) =>
                new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
            )
          );
          setStatus("");
        }
      } catch (error) {
        if (mounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load schedule.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, TeamEvent[]>();
    for (const event of events) {
      const key = monthKey(event.starts_at);
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }
    return Array.from(map.entries());
  }, [events]);

  const currentWeekEvents = useMemo(() => {
    const { start, end } = currentTorontoWeek();
    return events.filter((event) => {
      const key = torontoDayKey(event.starts_at);
      return key >= start && key <= end;
    });
  }, [events]);

  const cancelled = events.filter((event) => event.status === "cancelled").length;

  function EventCard({ event }: { event: TeamEvent }) {
    const isCancelled = event.status === "cancelled";
    const inviteNote = event.notes?.includes("Spond invite goes out 3 days in advance");
    const mapUrl = directionsUrl(event);

    return (
      <article
        className={`rounded-2xl border p-5 ${
          isCancelled ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`text-lg font-black uppercase ${isCancelled ? "text-neutral-500" : ""}`}>
                {event.title}
              </h4>
              {isCancelled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">
                  <XCircle size={14} /> Cancelled — no session
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-red-600" />
                {formatDate(event.starts_at)}
              </span>

              {!isCancelled ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={16} className="text-red-600" />
                  {formatTime(event.starts_at)}
                </span>
              ) : null}

              {event.venue_name ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  {event.venue_name}
                </span>
              ) : null}
            </div>

            {isCancelled ? (
              <p className="mt-3 text-sm font-bold text-red-700">Cancelled — no session.</p>
            ) : null}

            {inviteNote && !isCancelled ? (
              <div className="mt-3 text-xs font-black uppercase tracking-wide text-red-600">
                Spond invite goes out 3 days in advance
              </div>
            ) : null}

            {mapUrl && !isCancelled ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-700"
              >
                <Navigation size={16} /> Get venue directions
              </a>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  if (status && !events.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2 font-black uppercase text-neutral-800">
          <RefreshCw size={17} /> {status}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section id="this-week" className="scroll-mt-28 rounded-3xl border-2 border-red-200 bg-red-50 p-5 md:p-6">
        <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">Current Week</div>
        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">This Week’s Training</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Current Monday–Sunday schedule shown in Toronto local time.
        </p>

        <div className="mt-5 grid gap-3">
          {currentWeekEvents.length ? (
            currentWeekEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-2xl bg-white p-5 text-sm font-bold text-neutral-600">
              No training session is scheduled for the current week.
            </div>
          )}
        </div>
      </section>

      <div className="my-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-neutral-100 p-4">
          <div className="text-3xl font-black">{events.length}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Training Events</div>
        </div>
        <div className="rounded-2xl bg-neutral-100 p-4">
          <div className="text-3xl font-black">{events.length - cancelled}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Active</div>
        </div>
        <div className="rounded-2xl bg-neutral-100 p-4">
          <div className="text-3xl font-black text-red-600">{cancelled}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">Cancelled</div>
        </div>
      </div>

      <div className="grid gap-8">
        {groups.map(([month, monthEvents]) => (
          <section key={month}>
            <h3 className="mb-3 text-xl font-black uppercase tracking-tight">{month}</h3>
            <div className="grid gap-3">
              {monthEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </div>
  );
}
