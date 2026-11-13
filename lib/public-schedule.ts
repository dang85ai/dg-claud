import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export type TeamEvent = {
  id: string;
  event_type?: string;
  title?: string;
  date?: string;
  starts_at?: string;
  status: string;
};

const scheduleUrl = `${SUPABASE_URL}/functions/v1/public-schedule`;

export function torontoDayKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function eventDate(event: TeamEvent) {
  if (event.date) return event.date;
  if (event.starts_at) return torontoDayKey(event.starts_at);
  return "";
}

export function safeTitle(event: TeamEvent) {
  if (event.title) return event.title;
  if (event.event_type === "game") return "Game Day";
  if (event.event_type === "tournament") return "Tournament";
  if (event.event_type === "practice" || event.event_type === "training") return "Training Session";
  return "Team Event";
}

export function upcomingEvents(events: TeamEvent[], today: string, days?: number) {
  const end = new Date(today + "T00:00:00Z");
  if (days !== undefined) end.setUTCDate(end.getUTCDate() + days);
  const endKey = end.toISOString().slice(0, 10);
  return events.filter((event) => {
    const date = eventDate(event);
    return date >= today && (days === undefined || date < endKey);
  });
}

export function eventTypeLabel(event: TeamEvent) {
  switch (event.event_type) {
    case "game": return "Game";
    case "practice":
    case "training": return "Practice";
    case "tournament": return "Tournament";
    default: return "Team event";
  }
}

export async function loadPublicEvents(signal?: AbortSignal): Promise<TeamEvent[]> {
  const response = await fetch(scheduleUrl, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "no-store",
    signal
  });
  if (!response.ok) throw new Error("Unable to load planning dates.");
  const payload = await response.json();
  if (!Array.isArray(payload.events)) throw new Error("Unable to load planning dates.");
  return (payload.events as TeamEvent[])
    .filter((event) => Boolean(eventDate(event)))
    .sort((first, second) => eventDate(first).localeCompare(eventDate(second)));
}
