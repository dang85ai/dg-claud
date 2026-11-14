import { CalendarDays, RefreshCw, XCircle } from "lucide-react";
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

export async function ScheduleEvents() {
  const result = await loadPublicEvents(AbortSignal.timeout(5000)).catch(() => null);
  const events = result ?? [];

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

  function EventRow({ event }: { event: TeamEvent }) {
    const date = eventDate(event);
    return (
      <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2.5">
        <div className="min-w-0">
          <span className="break-words font-bold">{safeTitle(event)}</span>
          <span className="ml-2 text-xs text-neutral-600">{eventTypeLabel(event)}</span>
          {event.status === "cancelled" && (
            <span className="mt-1 flex items-center gap-1 text-xs font-bold text-red-800">
              <XCircle size={14} aria-hidden="true" /> Cancelled — no session
            </span>
          )}
        </div>
        <time dateTime={date} className="inline-flex items-center gap-2 text-sm text-neutral-700">
          <CalendarDays size={15} className="text-red-600" aria-hidden="true" />
          {formatDate(date)}
        </time>
      </li>
    );
  }

  if (result === null) {
    return (
      <div id="current-week" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2 font-black uppercase text-neutral-800">
          <RefreshCw size={17} aria-hidden="true" /> Unable to load planning dates.
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

        <ul className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {nextSevenDays.length ? nextSevenDays.map((event) => <EventRow key={event.id} event={event} />) : (
            <li className="p-3 text-sm text-neutral-700">No team dates are scheduled in the next seven days.</li>
          )}
        </ul>
        <a href={SPOND_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">Open Spond / RSVP</a>
      </section>

      <section className="mt-6" aria-labelledby="upcoming-months">
        <h3 id="upcoming-months" className="text-lg font-black uppercase">Upcoming months</h3>
        <p className="mt-1 text-sm text-neutral-600">{events.length} team dates · {cancelled} cancelled this season</p>
        <div className="mt-3 grid gap-2">
          {futureMonths.map(([month, monthEvents]) => (
            <details key={month} className="rounded-xl border border-neutral-200">
              <summary className="min-h-11 cursor-pointer px-4 py-3 font-bold">
                {month} <span className="ml-2 text-sm font-normal text-neutral-600">({monthEvents.length} dates)</span>
              </summary>
              <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
                {monthEvents.map((event) => <EventRow key={event.id} event={event} />)}
              </ul>
            </details>
          ))}
          {!futureMonths.length && <p className="text-sm text-neutral-600">No upcoming team dates are published.</p>}
        </div>
      </section>
      {pastMonths.length > 0 && (
        <details className="mt-4 rounded-xl border border-neutral-200 px-4">
          <summary className="min-h-11 cursor-pointer py-3 font-bold">Past team dates</summary>
          <div className="grid gap-4 pb-4">
            {pastMonths.map(([month, monthEvents]) => (
              <section key={month}>
                <h3 className="mb-2 font-bold">{month}</h3>
                <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                  {monthEvents.map((event) => <EventRow key={event.id} event={event} />)}
                </ul>
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
