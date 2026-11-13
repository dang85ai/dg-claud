"use client";

import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { eventDate, eventTypeLabel, loadPublicEvents, safeTitle, torontoDayKey, upcomingEvents, type TeamEvent } from "@/lib/public-schedule";
import { SPOND_URL } from "@/lib/team-config";

function monthKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "long"
  }).format(new Date(`${value}T12:00:00Z`));
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

export function ScheduleEvents() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [status, setStatus] = useState("Loading planning dates…");

  useEffect(() => {
    const controller = new AbortController();
    loadPublicEvents(controller.signal).then((events) => {
      if (controller.signal.aborted) return;
      setEvents(events);
      setStatus("");
    }).catch(() => {
      if (!controller.signal.aborted) setStatus("Unable to load planning dates.");
    });
    return () => controller.abort();
  }, []);

  const today = torontoDayKey(new Date());
  const nextSevenDays = upcomingEvents(events, today, 7);

  function groupByMonth(list: TeamEvent[]) {
    const months = new Map<string, TeamEvent[]>();
    for (const event of list) {
      const month = monthKey(eventDate(event));
      const monthEvents = months.get(month) ?? [];
      monthEvents.push(event);
      months.set(month, monthEvents);
    }
    return [...months];
  }

  const futureMonths = groupByMonth(upcomingEvents(events, today));
  const pastMonths = groupByMonth(events.filter((event) => eventDate(event) < today));
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
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-800">{eventTypeLabel(event)}</span>
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
              null
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
        <h3 className="text-2xl font-black uppercase tracking-tight">Next 7 Days</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Public planning dates only. Check Spond for exact start time, venue, entrance and arrival instructions.
        </p>

        <div className="mt-5 grid gap-3">
          {nextSevenDays.length ? nextSevenDays.map((event) => <EventCard key={event.id} event={event} />) : (
            <div className="rounded-2xl bg-white p-5 text-sm font-bold text-neutral-600">No team dates are scheduled in the next seven days. See the upcoming calendar below.</div>
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
        {futureMonths.map(([month, monthEvents]) => (
          <section key={month}>
            <h3 className="mb-3 text-xl font-black uppercase tracking-tight">{month}</h3>
            <div className="grid gap-3">{monthEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
          </section>
        ))}
      </div>
      {pastMonths.length ? (
        <details className="mt-8 rounded-2xl border border-neutral-200 p-4">
          <summary className="cursor-pointer font-black">Past team dates</summary>
          <div className="mt-4 grid gap-5">
        {pastMonths.map(([month, monthEvents]) => (
          <section key={month}>
            <h3 className="mb-3 text-xl font-black uppercase tracking-tight">{month}</h3>
            <div className="grid gap-3">{monthEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
          </section>
        ))}
          </div>
        </details>
      ) : null}
      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </div>
  );
}
