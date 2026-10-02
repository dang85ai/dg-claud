"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, RefreshCw, XCircle } from "lucide-react";
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

function dateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "long"
  }).format(new Date(value));
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
          setEvents(payload.events ?? []);
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
      const key = dateKey(event.starts_at);
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }
    return Array.from(map.entries());
  }, [events]);

  const cancelled = events.filter((event) => event.status === "cancelled").length;

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
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
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
              {monthEvents.map((event) => {
                const isCancelled = event.status === "cancelled";
                const inviteNote = event.notes?.includes("Spond invite goes out 3 days in advance");

                return (
                  <article
                    key={event.id}
                    className={`rounded-2xl border p-5 ${
                      isCancelled
                        ? "border-red-300 bg-red-50"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-lg font-black uppercase ${isCancelled ? "line-through text-neutral-500" : ""}`}>
                            {event.title}
                          </h4>
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">
                              <XCircle size={14} /> Cancelled
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} className="text-red-600" />
                            {formatDate(event.starts_at)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock3 size={16} className="text-red-600" />
                            {formatTime(event.starts_at)}
                          </span>
                          {event.venue_name ? (
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={16} className="text-red-600" />
                              {event.venue_name}
                            </span>
                          ) : null}
                        </div>

                        {inviteNote && !isCancelled ? (
                          <div className="mt-3 text-xs font-black uppercase tracking-wide text-red-600">
                            Spond invite goes out 3 days in advance
                          </div>
                        ) : null}

                        {isCancelled && event.notes ? (
                          <p className="mt-3 max-w-3xl text-xs text-neutral-500">
                            {event.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </div>
  );
}
