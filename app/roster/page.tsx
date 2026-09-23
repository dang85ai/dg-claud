import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import {
  ClipboardList,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";

const placeholders = Array.from({ length: 12 }, (_, i) => i + 1);

const staff = [
  ["Head Coach", "To be published", "Certification to be verified"],
  ["Assistant Coach", "To be published", "Certification to be verified"],
  ["Team Manager", "Team contact", "N/A"]
];

const volunteers = [
  "Team Manager",
  "Treasurer",
  "Social Coordinator",
  "Photo Coordinator",
  "Snack / Event Coordinator"
];

export default function RosterPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="2026 Squad"
        title="Meet the Team"
        copy="Public player profiles are consent-controlled. Until the roster and guardian permissions are confirmed, no player identity information is published."
      />

      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              Player photos and profile details appear only when the appropriate guardian consent is active. Private portal access can show additional team information to authorized families.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="flex items-center gap-3">
                <UsersRound className="text-red-600" />
                <h2 className="text-3xl font-black uppercase">Player Profiles</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Consented profiles can include first name, jersey number, optional position, a fun fact and an approved photo.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {placeholders.map((n) => (
                  <div className="card overflow-hidden" key={n}>
                    <div className="grid aspect-[4/5] place-items-center bg-neutral-200">
                      <UserRound size={48} className="text-neutral-400" aria-hidden="true" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-black uppercase tracking-[.12em] text-red-600">Player</div>
                      <div className="mt-1 text-xl font-black uppercase">Roster Spot</div>
                      <div className="mt-3 text-sm text-neutral-500"># — · Position —</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="grid content-start gap-4">
              <div className="card p-5">
                <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Team Snapshot</div>
                <div className="mt-4 grid gap-3 text-sm">
                  <div><strong>Age group:</strong> U9 Girls</div>
                  <div><strong>Season:</strong> 2026</div>
                  <div><strong>League:</strong> To be confirmed</div>
                  <div><strong>Division:</strong> To be confirmed</div>
                  <div><strong>Final roster count:</strong> To be confirmed</div>
                </div>
              </div>

              <div className="card p-5">
                <ClipboardList className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Privacy & Consent</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  To update or withdraw player-profile or photo consent, use the Parent Portal or contact the team manager.
                </p>
              </div>
            </aside>
          </div>

          <section className="mt-10 card overflow-hidden">
            <div className="bg-black p-5 text-white">
              <h2 className="text-2xl font-black uppercase">Coaching Staff</h2>
            </div>
            <div className="grid gap-px bg-neutral-200 md:grid-cols-3">
              {staff.map(([role, name, certification]) => (
                <div key={role} className="bg-white p-5">
                  <div className="text-xs font-black uppercase text-red-600">{role}</div>
                  <div className="mt-2 font-black">{name}</div>
                  <div className="mt-2 text-sm text-neutral-500">{certification}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 card p-6">
            <h2 className="text-2xl font-black uppercase">Parent Volunteer Roles</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Volunteer assignments and contact details will be visible to authorized team families once roles are confirmed.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {volunteers.map((role) => (
                <div key={role} className="rounded-2xl bg-neutral-50 p-4 text-sm font-black uppercase">
                  {role}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
