"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { currentWeekEvents, directionsUrl, formatDate, formatTime, } from "@/lib/team-schedule";
import { type TeamEvent } from "@/components/EventDetails";
import { trainingPlan } from "@/lib/training-plans";
export function WeekView({ events, all = false }: { events: TeamEvent[]; all?: boolean }) {
  const valid = events.filter(e => Number.isFinite(Date.parse(e.starts_at))).sort((a,b) => Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const selected = all ? valid.filter(e => Date.parse(e.ends_at ?? e.starts_at) >= Date.now()) : currentWeekEvents(valid, new Date());
  return <section id="this-week" className="card my-6 scroll-mt-40 p-6">
    <h2 className="text-3xl font-black uppercase">{all ? "Upcoming Schedule" : "This Week"}</h2>
    <p className="mt-2 text-sm text-neutral-600">{all ? "Upcoming team events" : "Monday–Sunday"} · Toronto time. Check Spond for RSVP and the latest updates.</p>
    <div className="mt-5 grid gap-4">{selected.length ? selected.map(event => {
      const cancelled = event.status === "cancelled";
      const plan = trainingPlan(event);
      return <article key={event.id} className={`rounded-2xl border p-5 ${cancelled ? "border-red-300 bg-red-50" : "border-neutral-200"}`}>
        <h3 className="text-xl font-black">{event.title.replace(/\s*\[Training: session-[1-4]\]/gi, "")}</h3>
        <p className="mt-2 text-sm">{formatDate(event.starts_at)} · {formatTime(event.starts_at)}{event.ends_at ? ` – ${formatTime(event.ends_at)}` : ""} · {event.venue_name ?? "Venue to be confirmed"}</p>
        {cancelled ? <p className="mt-3 font-bold text-red-700">Cancelled — no session</p> : <>
          {plan ? <div className="mt-4"><h4 className="font-bold">{plan.title}</h4><p className="mt-2 text-sm text-neutral-600">{plan.parentSummary}</p><div className="mt-3 flex flex-wrap gap-3"><Link className="font-bold text-red-600" href={`/portal/training#${plan.id}`}>What We’re Learning →</Link><Link className="font-bold text-red-600" href={`/portal/training#${plan.id}-home`}>5-Min Home Challenge →</Link></div></div> : ["training", "practice"].includes(event.event_type ?? "") ? <p className="mt-3 text-sm text-neutral-600">Training plan to be confirmed.</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">{event.venue_address ? <a className="font-bold text-red-600" href={directionsUrl(event.venue_address)} target="_blank" rel="noopener noreferrer">Directions ↗</a> : null}<a className="font-bold text-red-600" href="https://spond.com/client" target="_blank" rel="noopener noreferrer">RSVP / Report absence in Spond ↗</a></div>
        </>}
      </article>;
    }) : <p className="rounded-2xl bg-neutral-100 p-4">No {all ? "upcoming events" : "events this week"} are listed. Check Spond for updates.</p>}</div>
    {!all ? <Link href="/portal/schedule" className="btn btn-light mt-4">Full Schedule</Link> : null}
    <p className="mt-4 text-sm text-neutral-600">Bring a ball, water, shin guards and suitable footwear to training.</p>
  </section>;
}
export function PortalSchedule() {
  const router = useRouter();
  const [events, setEvents] = useState<TeamEvent[] | null>(null);
  const [status, setStatus] = useState("Loading schedule…");
  useEffect(() => { let alive = true; (async () => {
    try {
      const data = await authedFetch<{ events: TeamEvent[]; roles: string[] }>(endpoints.parentDashboard);
      if (!data.roles.some(role => ["parent_player", "photographer", "admin", "manager"].includes(role))) throw new Error("Team portal access is required.");
      if (data.roles.some(role => ["admin", "manager"].includes(role))) {
        const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
      }
      if (alive) setEvents(data.events);
    } catch (error) { const message = error instanceof Error ? error.message : "Unable to load schedule."; if (message === "Please sign in.") { router.replace("/login"); return; } if (alive) setStatus(message); }
  })(); return () => { alive = false; }; }, [router]);
  return <div className="min-h-screen bg-neutral-100"><PortalHeader title="Team Schedule"/><main id="portal-main" className="container py-8">{events ? <WeekView events={events} all/> : <div className="notice">{status}</div>}</main></div>;
}
