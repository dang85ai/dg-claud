"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type AdminDashboard = { roles: string[]; metrics: {
  active_players: number; guardians: number; pending_media: number; unpaid_kit_orders: number;
  open_game_duties: number; active_sponsors: number;
} };
const groups = [
  { id: "follow-up", title: "Requests and Follow-up", items: [
    { name: "Submissions and email delivery", href: "/admin/notifications", note: "Review contact inquiries, signed forms and notification failures" },
    { name: "Sponsorship inquiries", href: "/admin/sponsors", note: "Review inquiries and track follow-up or commitments" },
    { name: "Portal kit orders", href: "/admin/modules/orders", note: "Review items, sizes and payment status" },
    { name: "Public kit requests", href: "https://app.netlify.com/projects/caledon-u9-girls-2026/forms", note: "Review public requests in Netlify using your team account" },
    { name: "Schedule changes", href: "/admin/modules/schedule", note: "Review event status and manage website schedule records" },
    { name: "Attendance", href: "/admin/modules/attendance", note: "Review responses and record attendance" }
  ] },
  { id: "roster", title: "Team & Roster", items: [
    { name: "Players and private profiles", href: "/admin/players", note: "Add, edit, archive and review public consent" },
    { name: "Family links and activation", href: "/admin/families", note: "Approve family access and create parent activation" },
    { name: "Formation builder", href: "/admin/formation", note: "Arrange players and save the squad formation" },
    { name: "Accounts and invitations", href: "/admin/accounts", note: "Administrator-only user roles and access" }
  ] },
  { id: "attendance", title: "Schedule & Game-Day", items: [
    { name: "Create events", href: "/admin/manage#schedule", note: "Training sessions, games, venue and calendar details" },
    { name: "Spond connection & imports", href: "/admin/spond", note: "Live status, read-only preview and CSV/XLSX imports" },
    { name: "Team schedule", href: "/schedule", note: "Review event types and upcoming matches" },
    { name: "Team announcements", href: "/admin/manage#announcements", note: "Communicate with the team" }
  ] },
  { id: "forms", title: "Parent & Club Administration", items: [
    { name: "Consent and release forms", href: "/portal/tools", note: "Guardian submission flow; manager review remains in the protected dashboard" },
    { name: "Roster approvals", href: "/admin/players", note: "Pending guardian links, display names and profile photos" },
    { name: "Invitation requests", href: "/admin/manage#invites", note: "Existing team invitation tool" }
  ] },
  { id: "finance", title: "Finance, Sponsorship & Kit", items: [
    { name: "Sponsorship inventory", href: "/admin/sponsors", note: "Season offers, pricing, sold status and availability" },
    { name: "Uniform and equipment gallery", href: "/kit", note: "Approved visual reference without public prices" },
    { name: "Kit request form", href: "/order", note: "Private request workflow" }
  ] },
  { id: "media", title: "Media & Content", items: [
    { name: "Private family photo submissions", href: "/portal/tools", note: "Parents upload and consent to profile photos" },
    { name: "Profile-photo review", href: "/admin/players", note: "Consent checks and manager approval" },
    { name: "Announcements", href: "/admin/manage#announcements", note: "Publish team updates" }
  ] },
  { id: "duties", title: "Additional Team Modules", items: [
    { name: "Game duties", href: "/admin", note: "View open-duty totals; advanced editing not yet restored" },
    { name: "Equipment & referees", href: "/admin", note: "Module records exist; dedicated editing not yet restored" },
    { name: "Sisterhood recognition", href: "/portal/tools", note: "Parent submissions; manager moderation not yet restored" },
    { name: "Data export", href: "/admin/manage#export", note: "Export the team handover package" }
  ] }
];
export default function OperationsPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState("Checking manager access…");
  useEffect(() => { (async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) { router.replace("/login"); return; }
    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.error || aal.data.currentLevel !== "aal2") { router.replace("/mfa"); return; }
    try {
      const d = await authedFetch<AdminDashboard>(endpoints.adminDashboard);
      setData(d); setStatus("");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Unable to load management tools."); }
  })(); }, [router]);
  return <div className="min-h-screen bg-neutral-100">
    <PortalHeader title="Team Operations" isAdmin />
    <main id="portal-main" className="container py-8">
      <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Manager Command Centre</div>
      <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Team Operations</h1>
      <p className="mt-3 max-w-3xl text-sm text-neutral-600">Review incoming requests and open the tools you need to manage the team.</p>
      {status ? <div role="status" className="notice mt-5">{status}</div> : null}
      {data ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Active Players", data.metrics.active_players], ["Guardians", data.metrics.guardians],
          ["Pending Media", data.metrics.pending_media], ["Open Duties", data.metrics.open_game_duties],
          ["Unpaid Kit Orders", data.metrics.unpaid_kit_orders], ["Active Sponsors", data.metrics.active_sponsors]
        ].map(([name, value]) => <div key={name} className="card p-4"><div className="text-3xl font-black">{value}</div><div className="mt-2 text-xs font-black uppercase">{name}</div></div>)}
      </div> : null}
      {data ? groups.map((group) => <section key={group.id} id={group.id} className="mt-9 scroll-mt-8">
        <h2 className="text-2xl font-black uppercase">{group.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.items.map((item) => <Link key={item.name} href={item.href} className="card p-5 transition hover:border-red-500">
            <div className="font-black uppercase">{item.name}</div>
            <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
          </Link>)}
        </div>
      </section>) : null}
    </main>
  </div>;
}

