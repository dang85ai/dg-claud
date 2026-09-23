"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  ImageIcon,
  MessageSquareWarning,
  ShieldCheck,
  Shirt,
  Users
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type AdminData = {
  roles: string[];
  assurance_level: string;
  metrics: {
    active_players: number;
    guardians: number;
    pending_media: number;
    unpaid_kit_orders: number;
    partial_kit_orders: number;
    open_game_duties: number;
    pending_sisterhood_posts: number;
    active_sponsors: number;
  };
  upcoming_events: Array<{ id: string; title: string; opponent: string | null; starts_at: string; status: string }>;
  new_contact_submissions: Array<{ id: string; name: string; email: string; subject: string | null; created_at: string }>;
  pending_media_items: Array<{ id: string; media_type: string; caption: string | null; created_at: string }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [status, setStatus] = useState("Checking manager access…");

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data.currentLevel !== "aal2") {
        router.replace("/mfa");
        return;
      }

      try {
        const dashboard = await authedFetch<AdminData>(endpoints.adminDashboard);
        setData(dashboard);
        setStatus("");
      } catch (error) {
        const typed = error as Error & { mfa_required?: boolean };
        if (typed.mfa_required) {
          router.replace("/mfa");
          return;
        }
        setStatus(typed.message);
      }
    })();
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <PortalHeader title="Command Centre" isAdmin />
        <div className="container py-12"><div className="notice">{status}</div></div>
      </div>
    );
  }

  const metrics = [
    { label: "Players", value: data.metrics.active_players, Icon: Users },
    { label: "Pending Media", value: data.metrics.pending_media, Icon: ImageIcon },
    { label: "Kit Unpaid", value: data.metrics.unpaid_kit_orders, Icon: Shirt },
    { label: "Kit Partial", value: data.metrics.partial_kit_orders, Icon: CircleDollarSign },
    { label: "Open Duties", value: data.metrics.open_game_duties, Icon: ClipboardList },
    { label: "Sisterhood Review", value: data.metrics.pending_sisterhood_posts, Icon: MessageSquareWarning }
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Command Centre" isAdmin />
      <main className="container py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Caledon U9 Girls 2026</div>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">Manager Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-black uppercase text-white">
            <ShieldCheck size={16} /> AAL2 Verified
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map(({ label, value, Icon }) => (
            <div key={label} className="card p-5">
              <Icon className="text-red-600" size={22} />
              <div className="mt-4 stat-number">{value}</div>
              <div className="mt-2 text-xs font-black uppercase text-neutral-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Upcoming Events</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {data.upcoming_events.length ? data.upcoming_events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-xs font-black uppercase text-red-600">{event.status}</div>
                  <div className="mt-1 font-black">{event.title}{event.opponent ? ` · ${event.opponent}` : ""}</div>
                  <div className="mt-2 text-sm text-neutral-600">{new Date(event.starts_at).toLocaleString()}</div>
                </div>
              )) : <p className="text-sm text-neutral-600">No upcoming events.</p>}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-black uppercase">Needs Attention</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-neutral-100 p-4">
                <div className="text-sm font-black uppercase">New contact submissions</div>
                <div className="mt-1 text-3xl font-black">{data.new_contact_submissions.length}</div>
              </div>
              <div className="rounded-2xl bg-neutral-100 p-4">
                <div className="text-sm font-black uppercase">Pending media review</div>
                <div className="mt-1 text-3xl font-black">{data.pending_media_items.length}</div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="section-title !text-3xl">Management Modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Players", "Schedule", "Attendance", "Game Duties",
              "Forms", "Payments", "Kit Orders", "Media",
              "Sponsors", "Sisterhood", "Equipment", "Referees",
              "Announcements", "Reports", "Data Export", "Settings"
            ].map((item) => (
              <button key={item} className="card min-h-24 p-5 text-left text-lg font-black uppercase hover:border-red-500">
                {item}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
