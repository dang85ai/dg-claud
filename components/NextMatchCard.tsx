"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Navigation, RefreshCw } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";

type TeamEvent = {
  id: string;
  title: string;
  starts_at: string;
  venue_name: string | null;
  venue_address: string | null;
  status: string;
};

const scheduleUrl = `${SUPABASE_URL}/functions/v1/public-schedule`;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function NextMatchCard() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [status, setStatus] = useState("Loading next session…");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch(scheduleUrl, {
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
          cache: "no-store"
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Unable to load the next session.");

        if (mounted) {
          setEvents(payload.events ?? []);
          setStatus("");
        }
      } catch (error) {
        if (mounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load the next session.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const nextEvent = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((event) => event.status !== "cancelled" && new Date(event.starts_at).getTime() >= now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
  }, [events]);

  if (status && !events.length) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
          Next Session
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-neutral-700">
            <RefreshCw size={17} /> {status}
          </div>
          <Link href="/schedule#this-week" className="mt-5 inline-flex text-sm font-black text-red-600">
            View this week’s schedule →
          </Link>
        </div>
      </div>
    );
  }

  if (!nextEvent) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
          Next Session
        </div>
        <div className="p-6">
          <div className="text-sm font-black uppercase text-red-600">No upcoming session posted</div>
          <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">2026–27 Training Season</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Check the current-week schedule for the latest training status.
          </p>
          <Link href="/schedule#this-week" className="mt-5 inline-flex text-sm font-black text-red-600">
            View this week’s schedule →
          </Link>
        </div>
      </div>
    );
  }

  const mapQuery = nextEvent.venue_address || nextEvent.venue_name;
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  return (
    <div className="card overflow-hidden">
      <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
        Next Session
      </div>
      <div className="p-6">
        <div className="text-sm font-black uppercase text-red-600">2026–27 Training Season</div>
        <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">{nextEvent.title}</h3>
        <div className="mt-5 grid gap-3 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-red-600" />
            {formatDate(nextEvent.starts_at)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-red-600" />
            {formatTime(nextEvent.starts_at)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-red-600" />
            {nextEvent.venue_name || "Training location to be confirmed"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Navigation size={17} /> Directions
            </a>
          ) : null}
          <Link href="/schedule#this-week" className="btn btn-light">
            View This Week
          </Link>
        </div>
      </div>
    </div>
  );
}
