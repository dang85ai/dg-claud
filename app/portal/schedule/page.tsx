"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Event = { id: string; title: string; opponent: string | null; starts_at: string; arrival_at: string | null; venue_name: string | null; venue_address: string | null; event_type?: string; status?: string };
type Dashboard = { roles: string[]; events: Event[]; team_links: { link_key: string; label: string; url: string }[] };
const teamTime = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Toronto"
});

export default function ParentSchedule() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [status, setStatus] = useState("Loading your team schedule…");
  useEffect(() => { (async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) { router.replace("/login"); return; }
    try {
      const result = await authedFetch<Dashboard>(endpoints.parentDashboard);
      setData(result); setStatus("");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Unable to load schedule."); }
  })(); }, [router]);
  const events = (data?.events || []).slice().sort((a,b) => Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const spondLink = data?.team_links.find((l) => l.link_key === "spond_group");
  return <div className="min-h-screen bg-neutral-100">
    <PortalHeader title="Family Schedule" />
    <main id="portal-main" tabIndex={-1} className="container py-8">
      <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Private Family Portal</div>
      <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Team Calendar</h1>
      <p className="mt-3 max-w-3xl text-sm text-neutral-600">Times are shown in Eastern Time. Check Spond for updates, missing details and RSVP changes.</p>
      {status ? <div role="status" className="notice mt-6">{status}</div> : null}
      {data ? <div className="mt-6 flex flex-wrap gap-3">
        {spondLink ? <a className="btn btn-primary" href={spondLink.url} target="_blank" rel="noopener noreferrer">Open Team Spond</a> : null}
        <Link className="btn btn-light" href="/schedule">Public Team Schedule</Link>
      </div> : null}
      {data ? <section className="mt-8 grid gap-4">{events.length ? events.map((event) =>
        <div key={event.id} className="card p-5">
          <div className="flex flex-wrap justify-between gap-2"><div>
            <div className="text-xs font-black uppercase text-red-600">{event.event_type?.replace(/_/g," ") || "Team Event"}{event.status === "cancelled" ? " · Cancelled" : ""}</div>
            <h2 className="mt-1 text-xl font-black uppercase">{event.title}{event.opponent ? " · " + event.opponent : ""}</h2>
          </div></div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="font-bold">Starts</dt><dd><time dateTime={event.starts_at}>{teamTime.format(new Date(event.starts_at))}</time></dd></div>
            <div><dt className="font-bold">Arrive by</dt><dd>{event.arrival_at ? <time dateTime={event.arrival_at}>{teamTime.format(new Date(event.arrival_at))}</time> : "Check Spond"}</dd></div>
            <div><dt className="font-bold">Venue</dt><dd>{event.venue_name || event.venue_address || "Check Spond"}{event.venue_name && event.venue_address && event.venue_address !== event.venue_name ? <span className="block">{event.venue_address}</span> : null}</dd></div>
          </dl>
        </div>) : <div className="notice">No upcoming events were returned to your account.</div>}</section> : null}
    </main>
  </div>;
}

