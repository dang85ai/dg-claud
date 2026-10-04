import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
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

function torontoDateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function publicDate(event: TeamEvent) {
  if (event.date) return event.date;
  if (event.starts_at) return torontoDateKey(event.starts_at);
  return "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00Z`));
}

function todayToronto() {
  return torontoDateKey(new Date().toISOString());
}

function safeTitle(event: TeamEvent) {
  if (event.title) return event.title;
  if (event.event_type === "game") return "Game Day";
  if (event.event_type === "tournament") return "Tournament";
  if (event.event_type === "practice" || event.event_type === "training") return "Training Session";
  return "Team Event";
}

async function loadEvents(): Promise<TeamEvent[]> {
  try {
    const response = await fetch(scheduleUrl, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      cache: "no-store"
    });
    const payload = await response.json();
    if (!response.ok) return [];
    return Array.isArray(payload.events) ? payload.events : [];
  } catch {
    return [];
  }
}

export async function NextMatchCard() {
  const events = await loadEvents();
  const today = todayToronto();
  const nextEvent = [...events]
    .filter((event) => event.status !== "cancelled" && publicDate(event) >= today)
    .sort((a, b) => publicDate(a).localeCompare(publicDate(b)))[0];

  if (!nextEvent) {
    return (
      <div className="card overflow-hidden text-neutral-900">
        <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
          Next Session
        </div>
        <div className="p-6">
          <div className="text-sm font-black uppercase text-red-600">2026–27 Training Season</div>
          <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">Check Spond for the next session</h3>
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

  const date = publicDate(nextEvent);

  return (
    <div className="card overflow-hidden text-neutral-900">
      <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
        Next Session
      </div>
      <div className="p-6">
        <div className="text-sm font-black uppercase text-red-600">2026–27 Training Season</div>
        <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">{safeTitle(nextEvent)}</h3>
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
          <Link href="/schedule#current-week" className="btn btn-light">View Planning Dates</Link>
        </div>
      </div>
    </div>
  );
}
