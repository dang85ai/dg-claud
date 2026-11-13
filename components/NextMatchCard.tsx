import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { eventDate, loadPublicEvents, safeTitle, torontoDayKey, upcomingEvents } from "@/lib/public-schedule";
import { SPOND_URL } from "@/lib/team-config";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00Z`));
}

export async function NextMatchCard() {
  const events = await loadPublicEvents().catch(() => []);
  const nextEvent = upcomingEvents(events, torontoDayKey(new Date()))
    .find((event) => event.status !== "cancelled");

  if (!nextEvent) {
    return (
      <div className="card overflow-hidden text-neutral-900">
        <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
          Next Session
        </div>
        <div className="p-6">
          <div className="text-sm font-black uppercase text-red-600">2026–27 Training Season</div>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">Check Spond for the next session</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Exact session times, venues, entrances and last-minute changes are kept in the team&apos;s private communication channel.
          </p>
          <a href={SPOND_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-black text-red-600">
            Open Spond →
          </a>
        </div>
      </div>
    );
  }

  const date = eventDate(nextEvent);

  return (
    <div className="card overflow-hidden text-neutral-900">
      <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
        Next Session
      </div>
      <div className="p-6">
        <div className="text-sm font-black uppercase text-red-600">2026–27 Training Season</div>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">{safeTitle(nextEvent)}</h2>
        <div className="mt-5 grid gap-3 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-red-600" />
            {formatDate(date)}
          </div>
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck size={18} className="text-red-600" />
            Exact time &amp; venue are in Spond
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-600">
          Check the latest invite before leaving for arrival instructions, venue details, footwear, kit and any schedule changes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={SPOND_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open Spond / RSVP</a>
          <Link href="/schedule#current-week" className="btn btn-light">View Next 7 Days</Link>
        </div>
      </div>
    </div>
  );
}

