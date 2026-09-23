"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Download,
  Megaphone,
  ShieldCheck,
  UserPlus,
  UsersRound
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

type ActionResult = {
  ok: boolean;
  action: string;
  data: unknown;
};

export default function AdminManagePage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

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
      }
    })();
  }, [router]);

  async function adminAction(action: string, input: Record<string, unknown>) {
    setBusy(action);
    setStatus("");
    try {
      await authedFetch<ActionResult>(endpoints.adminActions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input })
      });
      setStatus(`${action} completed successfully.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to complete action.");
    } finally {
      setBusy("");
    }
  }

  async function submitPlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await adminAction("player.create", {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      jersey_number: form.get("jersey_number") ? Number(form.get("jersey_number")) : null,
      position: form.get("position")
    });
    event.currentTarget.reset();
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await adminAction("event.create", {
      event_type: form.get("event_type"),
      title: form.get("title"),
      opponent: form.get("opponent"),
      starts_at: form.get("starts_at") ? new Date(String(form.get("starts_at"))).toISOString() : null,
      venue_name: form.get("venue_name"),
      venue_address: form.get("venue_address"),
      public_visible: form.get("public_visible") === "on"
    });
    event.currentTarget.reset();
  }

  async function submitAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await adminAction("announcement.create", {
      title: form.get("title"),
      body: form.get("body"),
      visibility: form.get("visibility"),
      pinned: form.get("pinned") === "on"
    });
    event.currentTarget.reset();
  }

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await adminAction("invite.create", {
      email: form.get("email"),
      full_name: form.get("full_name"),
      role: form.get("role")
    });
    event.currentTarget.reset();
  }

  async function downloadExport() {
    setBusy("export");
    setStatus("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in.");

      const response = await fetch(endpoints.handoverExport, {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Export failed." }));
        throw new Error(body.error || "Export failed.");
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "caledon-u9-girls-2026-handover.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      setStatus("Season handover export generated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create export.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Management Tools" isAdmin />
      <main className="container py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Operational Controls</div>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">Manage the Team</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-black uppercase text-white">
            <ShieldCheck size={16} /> MFA Required
          </div>
        </div>

        {status ? <div className="notice mt-6 text-sm">{status}</div> : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section id="players" className="card p-6">
            <div className="flex items-center gap-3">
              <UsersRound className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Add Player</h2>
            </div>
            <form className="mt-6" onSubmit={submitPlayer}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="first_name">First name</label>
                  <input className="field" id="first_name" name="first_name" required />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="last_name">Last name</label>
                  <input className="field" id="last_name" name="last_name" required />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="jersey_number">Jersey number</label>
                  <input className="field" id="jersey_number" name="jersey_number" type="number" min="0" max="99" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="position">Position</label>
                  <input className="field" id="position" name="position" />
                </div>
              </div>
              <button disabled={busy === "player.create"} className="btn btn-primary" type="submit">
                <UserPlus size={18} /> {busy === "player.create" ? "Adding…" : "Add Player"}
              </button>
            </form>
          </section>

          <section id="schedule" className="card p-6">
            <div className="flex items-center gap-3">
              <CalendarPlus className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Add Event</h2>
            </div>
            <form className="mt-6" onSubmit={submitEvent}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="event_type">Event type</label>
                  <select className="field" id="event_type" name="event_type" defaultValue="game">
                    <option value="game">Game</option>
                    <option value="practice">Practice</option>
                    <option value="team_event">Team event</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="starts_at">Start</label>
                  <input className="field" id="starts_at" name="starts_at" type="datetime-local" required />
                </div>
                <div className="field-group sm:col-span-2">
                  <label className="field-label" htmlFor="event_title">Title</label>
                  <input className="field" id="event_title" name="title" required placeholder="League Match" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="opponent">Opponent</label>
                  <input className="field" id="opponent" name="opponent" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="venue_name">Venue</label>
                  <input className="field" id="venue_name" name="venue_name" />
                </div>
                <div className="field-group sm:col-span-2">
                  <label className="field-label" htmlFor="venue_address">Venue address</label>
                  <input className="field" id="venue_address" name="venue_address" />
                </div>
              </div>
              <label className="mb-5 flex min-h-11 items-center gap-3 text-sm font-bold">
                <input type="checkbox" name="public_visible" defaultChecked />
                Show when site becomes public
              </label>
              <button disabled={busy === "event.create"} className="btn btn-primary" type="submit">
                <CalendarPlus size={18} /> {busy === "event.create" ? "Adding…" : "Add Event"}
              </button>
            </form>
          </section>

          <section id="announcements" className="card p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Post Announcement</h2>
            </div>
            <form className="mt-6" onSubmit={submitAnnouncement}>
              <div className="field-group">
                <label className="field-label" htmlFor="announcement_title">Title</label>
                <input className="field" id="announcement_title" name="title" required />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="announcement_body">Message</label>
                <textarea className="field" id="announcement_body" name="body" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="visibility">Visibility</label>
                  <select className="field" id="visibility" name="visibility" defaultValue="team">
                    <option value="team">Team only</option>
                    <option value="public">Public after launch</option>
                  </select>
                </div>
                <label className="flex min-h-12 items-center gap-3 text-sm font-bold">
                  <input type="checkbox" name="pinned" /> Pin announcement
                </label>
              </div>
              <button disabled={busy === "announcement.create"} className="btn btn-primary" type="submit">
                <Megaphone size={18} /> {busy === "announcement.create" ? "Posting…" : "Post Announcement"}
              </button>
            </form>
          </section>

          <section id="invites" className="card p-6">
            <div className="flex items-center gap-3">
              <UserPlus className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">Create Invite</h2>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              This creates an invite record only. No invitation email is sent by this development build.
            </p>
            <form className="mt-6" onSubmit={submitInvite}>
              <div className="field-group">
                <label className="field-label" htmlFor="invite_email">Email</label>
                <input className="field" id="invite_email" name="email" type="email" required />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="full_name">Name</label>
                <input className="field" id="full_name" name="full_name" />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="role">Role</label>
                <select className="field" id="role" name="role" defaultValue="parent_player">
                  <option value="parent_player">Parent / Player</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                  <option value="photographer">Official Photographer</option>
                  <option value="sponsor">Sponsor</option>
                </select>
              </div>
              <button disabled={busy === "invite.create"} className="btn btn-primary" type="submit">
                <UserPlus size={18} /> {busy === "invite.create" ? "Creating…" : "Create Invite"}
              </button>
            </form>
          </section>
        </div>

        <section id="export" className="mt-6 rounded-3xl bg-black p-7 text-white">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Season Handover</div>
              <h2 className="mt-2 text-3xl font-black uppercase">Export Team Data</h2>
              <p className="mt-3 max-w-2xl text-sm text-white/65">
                Downloads the operational team data without passwords, authentication sessions, API secrets or push-notification cryptographic keys.
              </p>
            </div>
            <button disabled={busy === "export"} onClick={downloadExport} className="btn btn-primary">
              <Download size={18} /> {busy === "export" ? "Preparing…" : "Download ZIP"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
