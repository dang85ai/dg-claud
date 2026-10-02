"use client";

import { useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";

export type TeamEvent = {
  id: string; event_type: string; title: string; starts_at: string; ends_at: string | null;
  venue_name: string | null; venue_address: string | null; notes: string | null; status: string;
};
export function useTeamSchedule() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [status, setStatus] = useState("Loading training schedule…");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/public-schedule`, {
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, cache: "no-store", signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) throw new Error("Schedule unavailable");
        if (!controller.signal.aborted) {
          setEvents((payload.events ?? []).filter((event: TeamEvent) => Number.isFinite(Date.parse(event.starts_at)))
            .sort((a: TeamEvent, b: TeamEvent) => Date.parse(a.starts_at) - Date.parse(b.starts_at)));
          setStatus(""); setCheckedAt(new Date());
        }
      } catch {
        if (!controller.signal.aborted) setStatus("Unable to refresh the schedule. Check your Spond invite or contact the team manager.");
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 60000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);
  return { events, status, checkedAt };
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
export function torontoDay(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (name: string) => parts.find((item) => item.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function currentWeekEvents(events: TeamEvent[], now: Date) {
  const date = new Date(`${torontoDay(now)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  const start = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 7);
  const end = date.toISOString().slice(0, 10);
  return events.filter((event) => { const day = torontoDay(new Date(event.starts_at)); return day >= start && day < end; });
}
export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
