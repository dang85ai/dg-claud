"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Car,
  ClipboardSignature,
  Heart,
  ShieldCheck
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
};

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
};

type Dashboard = {
  players: Player[];
  events: EventRow[];
};

type ActionResult = {
  ok: boolean;
  action: string;
  data: unknown;
};

export default function ParentToolsPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace("/login");
        return;
      }
      try {
        const data = await authedFetch<Dashboard>(endpoints.parentDashboard);
        setDashboard(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load portal tools.");
      }
    })();
  }, [router]);

  async function parentAction(action:string, input:Record<string, unknown>) {
    setBusy(action);
    setStatus("");
    try {
      await authedFetch<ActionResult>(endpoints.parentActions, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ action, input })
      });
      setStatus(`${action} completed successfully.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to complete action.");
      throw error;
    } finally {
      setBusy("");
    }
  }

  async function submitPhotoConsent(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await parentAction("form.submit", {
      form_key:"photo_consent",
      player_id:form.get("player_id"),
      signature_name:form.get("signature_name"),
      submitted_data:{
        public_profile_consent:form.get("public_profile_consent") === "on",
        birthday_display_consent:form.get("birthday_display_consent") === "on",
        public_photo_consent:form.get("public_photo_consent") === "on",
        private_team_photo_consent:form.get("private_team_photo_consent") === "on",
        social_media_consent:form.get("social_media_consent") === "on",
        video_consent:form.get("video_consent") === "on",
        notes:form.get("notes")
      }
    });
    event.currentTarget.reset();
  }

  async function submitMedicalRelease(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await parentAction("form.submit", {
      form_key:"medical_release",
      player_id:form.get("player_id"),
      signature_name:form.get("signature_name"),
      submitted_data:{
        emergency_contact_name:form.get("emergency_contact_name"),
        emergency_contact_phone:form.get("emergency_contact_phone"),
        medical_notes:form.get("medical_notes"),
        authorization:form.get("authorization") === "on"
      }
    });
    event.currentTarget.reset();
  }

  async function submitCarpool(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await parentAction("carpool.create", {
      kind:form.get("kind"),
      player_id:form.get("player_id"),
      event_id:form.get("event_id") || null,
      neighbourhood:form.get("neighbourhood"),
      seats:form.get("seats") ? Number(form.get("seats")) : null,
      note:form.get("note")
    });
    event.currentTarget.reset();
  }

  async function submitSisterhood(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await parentAction("sisterhood.create", {
      player_id:form.get("player_id") || null,
      category:form.get("category"),
      body:form.get("body")
    });
    event.currentTarget.reset();
  }

  async function uploadProfilePhoto(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setStatus("Select a photo first.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const body = new FormData();
    body.append("file", photo);
    body.append("purpose", "profile");
    body.append("player_id", String(form.get("player_id") ?? ""));
    body.append("caption", "Parent-submitted player profile photo");

    setBusy("photo");
    setStatus("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in.");

      const response = await fetch(endpoints.mediaUpload, {
        method:"POST",
        headers:{
          apikey:SUPABASE_PUBLISHABLE_KEY,
          Authorization:`Bearer ${token}`
        },
        body
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");

      setPhoto(null);
      event.currentTarget.reset();
      setStatus("Photo uploaded safely and sent for manager review.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setBusy("");
    }
  }

  const players = dashboard?.players ?? [];
  const events = dashboard?.events ?? [];

  const PlayerSelect = ({ name = "player_id" }: { name?: string }) => (
    <select className="field" name={name} required>
      <option value="">Select player</option>
      {players.map((player) => (
        <option value={player.id} key={player.id}>
          {player.first_name} {player.last_name}{player.jersey_number != null ? ` #${player.jersey_number}` : ""}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      <PortalHeader title="Parent Tools" />
      <main className="container py-8">
        <div>
          <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Family Self-Service</div>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">My Team Tools</h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Forms and family actions are restricted to your linked player records.
          </p>
        </div>

        {status ? <div className="notice mt-6 text-sm">{status}</div> : null}

        {!dashboard ? (
          <div className="card mt-8 p-6">Loading tools…</div>
        ) : players.length === 0 ? (
          <div className="notice mt-8">
            Your account is not linked to a player yet. A manager must complete the family/player link before these tools become available.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="card p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Photo & Media Consent</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Each public option is separate. Leaving a public option unchecked means it is not granted.
              </p>
              <form className="mt-6" onSubmit={submitPhotoConsent}>
                <div className="field-group">
                  <label className="field-label">Player</label>
                  <PlayerSelect />
                </div>
                <div className="grid gap-3">
                  {[
                    ["public_profile_consent","Allow public player profile"],
                    ["birthday_display_consent","Allow first-name birthday greeting"],
                    ["public_photo_consent","Allow public website photos"],
                    ["private_team_photo_consent","Allow photos inside the private team portal"],
                    ["social_media_consent","Allow approved social-media use"],
                    ["video_consent","Allow approved video use"]
                  ].map(([name,label]) => (
                    <label key={name} className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold">
                      <input type="checkbox" name={name} defaultChecked={name === "private_team_photo_consent"} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="field-group mt-5">
                  <label className="field-label" htmlFor="photo_notes">Notes</label>
                  <textarea className="field" id="photo_notes" name="notes" maxLength={1000} />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="photo_signature">Electronic signature name</label>
                  <input className="field" id="photo_signature" name="signature_name" required />
                </div>
                <button className="btn btn-primary" disabled={busy === "form.submit"}>
                  <ClipboardSignature size={18} /> Submit Consent
                </button>
              </form>
            </section>

            <section className="card p-6">
              <div className="flex items-center gap-3">
                <ClipboardSignature className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Medical Release</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                This development form captures the workflow only. Final club-approved wording should be confirmed before public launch.
              </p>
              <form className="mt-6" onSubmit={submitMedicalRelease}>
                <div className="field-group">
                  <label className="field-label">Player</label>
                  <PlayerSelect />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="emergency_name">Emergency contact</label>
                  <input className="field" id="emergency_name" name="emergency_contact_name" required />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="emergency_phone">Emergency phone</label>
                  <input className="field" id="emergency_phone" name="emergency_contact_phone" required />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="medical_notes">Medical notes</label>
                  <textarea className="field" id="medical_notes" name="medical_notes" />
                </div>
                <label className="mb-5 flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold">
                  <input type="checkbox" name="authorization" required />
                  I acknowledge the authorization presented by the team.
                </label>
                <div className="field-group">
                  <label className="field-label" htmlFor="medical_signature">Electronic signature name</label>
                  <input className="field" id="medical_signature" name="signature_name" required />
                </div>
                <button className="btn btn-primary" disabled={busy === "form.submit"}>
                  <ClipboardSignature size={18} /> Submit Release
                </button>
              </form>
            </section>

            <section className="card p-6">
              <div className="flex items-center gap-3">
                <Camera className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Player Profile Photo</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                The uploaded file is re-encoded, location metadata is removed, and the raw original is not retained. A manager must still approve it.
              </p>
              <form className="mt-6" onSubmit={uploadProfilePhoto}>
                <div className="field-group">
                  <label className="field-label">Player</label>
                  <PlayerSelect />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="profile_photo">Photo</label>
                  <input
                    className="field"
                    id="profile_photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={(event:ChangeEvent<HTMLInputElement>) => setPhoto(event.target.files?.[0] ?? null)}
                  />
                </div>
                <button className="btn btn-primary" disabled={busy === "photo"}>
                  <Camera size={18} /> {busy === "photo" ? "Processing…" : "Upload for Review"}
                </button>
              </form>
            </section>

            <section className="card p-6">
              <div className="flex items-center gap-3">
                <Car className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Carpool</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Use a neighbourhood or broad area only—do not enter a child's home address.
              </p>
              <form className="mt-6" onSubmit={submitCarpool}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="field-group">
                    <label className="field-label">Player</label>
                    <PlayerSelect />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="carpool_kind">Type</label>
                    <select className="field" id="carpool_kind" name="kind" defaultValue="request">
                      <option value="request">Need a ride</option>
                      <option value="offer">Can offer a ride</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="event_id">Event</label>
                    <select className="field" id="event_id" name="event_id">
                      <option value="">General / not event-specific</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} · {new Date(event.starts_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="neighbourhood">Neighbourhood / area</label>
                    <input className="field" id="neighbourhood" name="neighbourhood" required placeholder="Bolton North" />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="seats">Seats available</label>
                    <input className="field" id="seats" name="seats" type="number" min="1" max="8" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="carpool_note">Note</label>
                  <textarea className="field" id="carpool_note" name="note" maxLength={500} />
                </div>
                <button className="btn btn-primary" disabled={busy === "carpool.create"}>
                  <Car size={18} /> Post Carpool
                </button>
              </form>
            </section>

            <section className="card p-6 xl:col-span-2">
              <div className="flex items-center gap-3">
                <Heart className="text-red-600" />
                <h2 className="text-2xl font-black uppercase">Sisterhood Recognition</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Posts are private-team content and enter coach moderation before they are shown. There are no follower counts, DMs or popularity rankings.
              </p>
              <form className="mt-6 grid gap-4 md:grid-cols-[240px_240px_1fr_auto]" onSubmit={submitSisterhood}>
                <div>
                  <label className="field-label">Player</label>
                  <PlayerSelect />
                </div>
                <div>
                  <label className="field-label" htmlFor="category">Recognition</label>
                  <select className="field" id="category" name="category" defaultValue="great_teammate">
                    <option value="great_pass">Great Pass</option>
                    <option value="great_teammate">Great Teammate</option>
                    <option value="never_gave_up">Never Gave Up</option>
                    <option value="awesome_effort">Awesome Effort</option>
                    <option value="sportsmanship">Great Sportsmanship</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="sisterhood_body">Message</label>
                  <input className="field" id="sisterhood_body" name="body" required maxLength={600} />
                </div>
                <button className="btn btn-primary self-end" disabled={busy === "sisterhood.create"}>
                  <Heart size={18} /> Submit
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
