"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Camera,
  Car,
  ClipboardCheck,
  CreditCard,
  Heart,
  ExternalLink,
  Megaphone,
  ShieldCheck,
  Shirt,
  UserRound
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Dashboard = {
  user: { email: string | null };
  profile: { display_name?: string | null; full_name?: string | null } | null;
  roles: string[];
  players: Array<{
    id: string;
    first_name: string;
    last_name: string;
    jersey_number: number | null;
    position: string | null;
  }>;
  announcements: Array<{ id: string; title: string; body: string; published_at: string }>;
  events: Array<{ id: string; title: string; opponent: string | null; starts_at: string; venue_name: string | null }>;
  kit_orders: Array<{ id: string; total_cad: number; payment_status: string }>;
  form_submissions: Array<{ id: string; player_id: string; signed_at: string }>;
  carpool: unknown[];
  sisterhood: unknown[];
  team_links: Array<{
    link_key: string;
    label: string;
    url: string;
    description: string | null;
  }>;
};

export default function PortalPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [status, setStatus] = useState("Loading team portal…");

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }

      try {
        const dashboard = await authedFetch<Dashboard>(endpoints.parentDashboard);
        setData(dashboard);
        setStatus("");

        if (dashboard.roles.includes("admin") || dashboard.roles.includes("manager")) {
          const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (!aal.error && aal.data.currentLevel !== "aal2") {
            router.replace("/mfa");
          }
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load portal.");
      }
    })();
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <PortalHeader title="Team Portal" />
        <div className="container py-12"><div className="notice">{status}</div></div>
      </div>
    );
  }

  const nextEvent = data.events[0];
  const displayName = data.profile?.display_name || data.profile?.full_name || data.user.email || "Parent";
  const spondGroupLink = data.team_links?.find((link) => link.link_key === "spond_group");
  const spondWebLink = data.team_links?.find((link) => link.link_key === "spond_web");

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Team Portal" />
      <main className="container py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Welcome</div>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">{displayName}</h1>
          </div>
          <Link href="/portal/tools" className="btn btn-primary">
            Open Parent Tools
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card p-5">
            <CalendarDays className="text-red-600" />
            <div className="mt-4 text-xs font-black uppercase text-neutral-500">Next Event</div>
            <div className="mt-1 text-xl font-black uppercase">{nextEvent?.title ?? "Coming soon"}</div>
            {nextEvent ? <div className="mt-2 text-sm text-neutral-600">{new Date(nextEvent.starts_at).toLocaleString()}</div> : null}
          </div>

          <div className="card p-5">
            <UserRound className="text-red-600" />
            <div className="mt-4 text-xs font-black uppercase text-neutral-500">My Players</div>
            <div className="mt-1 text-3xl font-black">{data.players.length}</div>
          </div>

          <div className="card p-5">
            <Shirt className="text-red-600" />
            <div className="mt-4 text-xs font-black uppercase text-neutral-500">Kit Orders</div>
            <div className="mt-1 text-3xl font-black">{data.kit_orders.length}</div>
          </div>

          <div className="card p-5">
            <ClipboardCheck className="text-red-600" />
            <div className="mt-4 text-xs font-black uppercase text-neutral-500">Signed Forms</div>
            <div className="mt-1 text-3xl font-black">{data.form_submissions.length}</div>
          </div>
        </div>

        <Link
          href="/portal/training"
          className="mt-6 block overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-red-500"
        >
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <BookOpenCheck className="text-red-600" />
                <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">New Parent Resource</div>
              </div>
              <h2 className="mt-3 text-2xl font-black uppercase">Training & Development</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                See what the girls are learning, simple questions to ask after practice, 5-minute home challenges, and printable 60-minute coach session cards.
              </p>
            </div>
            <div className="flex items-center bg-black px-6 py-5 text-sm font-black uppercase text-white md:min-w-52 md:justify-center">
              Open Training Guide →
            </div>
          </div>
        </Link>

        {(spondGroupLink || spondWebLink) ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Spond links">
            {spondGroupLink ? (
              <a
                href={spondGroupLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-3xl bg-red-600 p-6 text-white transition hover:bg-red-700"
              >
                <div className="text-xs font-black uppercase tracking-[.16em] text-white/75">Team Group</div>
                <div className="mt-2 flex items-center gap-2 text-2xl font-black uppercase">
                  Join / Open Team in Spond <ExternalLink size={20} />
                </div>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                  Use this link to join the private Caledon U9 Girls group or open the group invite in Spond.
                </p>
              </a>
            ) : null}

            <a
              href={spondWebLink?.url ?? "https://spond.com/client"}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-3xl bg-black p-6 text-white transition hover:bg-neutral-800"
            >
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Already a Member?</div>
              <div className="mt-2 flex items-center gap-2 text-2xl font-black uppercase">
                Open Spond Web App <ExternalLink size={20} />
              </div>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Use the regular Spond web app if you are already signed in and already belong to the team group.
              </p>
            </a>
          </section>
        ) : null}

        {(data.roles.includes("admin") || data.roles.includes("manager")) ? (
          <div className="mt-6 rounded-3xl bg-black p-6 text-white">
            <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Manager Access</div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black uppercase">Command Centre available</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                  <ShieldCheck size={16} /> Protected by MFA
                </div>
              </div>
              <button onClick={() => router.push("/admin")} className="btn btn-primary">
                Open Command Centre
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Announcements</h2>
            </div>
            <div className="mt-5 grid gap-4">
              {data.announcements.length ? data.announcements.map((item) => (
                <article key={item.id} className="rounded-2xl border border-neutral-200 p-4">
                  <h3 className="font-black">{item.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
                </article>
              )) : (
                <p className="text-sm text-neutral-600">No team announcements yet.</p>
              )}
            </div>
          </section>

          <aside className="grid gap-4">
            {[
              { Icon: CreditCard, title: "Payments", text: "View team kit payment status." },
              { Icon: Car, title: "Carpool", text: "Offer or request rides by neighbourhood." },
              { Icon: Heart, title: "Sisterhood", text: "Coach-moderated teammate recognition." },
              { Icon: Camera, title: "Profile Photo", text: "Upload a consent-safe photo for manager review." }
            ].map(({ Icon, title, text }) => (
              <Link href="/portal/tools" className="card p-5 hover:border-red-500" key={title}>
                <Icon className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </Link>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
