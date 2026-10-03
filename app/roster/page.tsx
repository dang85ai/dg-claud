import { PublicPageGuide } from "@/components/PublicPageGuide";
import { teamSquad } from "@/lib/team-squad";
import { PlayerKitCard } from "@/components/PlayerKitCard";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import {
  ClipboardList,
  ShieldCheck,
  UsersRound
} from "lucide-react";

const players: [string, number | null][] = teamSquad.map(({ name, number }) => [name, number]);

const staff = [["Technical Director","Gabriel Borges"],["Coach","Davinder Budwal"],["Coach","Courtney Quinn"],["Team Manager","Karam Budwal"],["Team Manager","Melissa Catalano"],["Team Manager","Daniel Guerra"],["Team Manager","Natalie Guerra"],["Team Manager","Giuseppe (Joe) Tomaselli"]];

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
        eyebrow="2026–27 Indoor Squad"
        title="Meet the Team"
        copy="Meet our nine-player squad and the staff listed on the official 2026–27 U9 indoor pool roster. Public player cards show guardian-approved first names and confirmed jersey numbers."
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
                Hover over a player illustration to preview the white away kit. Move off to return to black home kit, or use Home / Away and tap controls. These are generic kit illustrations, not portraits of the players.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {players.map(([name, number]) => (
                  <PlayerKitCard key={name} name={name} number={number} />
                ))}
              </div>
            </section>

            <aside className="grid content-start gap-4">
              <div className="card p-5">
                <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Team Snapshot</div>
                <div className="mt-4 grid gap-3 text-sm">
                  <div><strong>Age group:</strong> U9 Girls</div>
                  <div><strong>Season:</strong> 2026–27 Indoor</div>
                  <div><strong>League:</strong> To be confirmed</div>
                  <div><strong>Division:</strong> To be confirmed</div>
                  <div><strong>Current squad:</strong> 9 players</div>
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

          <section id="coaching-staff" className="mt-10 card scroll-mt-28 overflow-hidden">
            <div className="bg-black p-5 text-white">
              <h2 className="text-2xl font-black uppercase">Coaches & Team Staff</h2>
            </div>
            <p className="bg-white px-5 py-4 text-sm text-neutral-600">Roles verified from the official CUFC F FUN TO Pool roster, printed September 30, 2026. Coach hierarchy and qualifications are not listed.</p>
            <div className="grid gap-px bg-neutral-200 md:grid-cols-3">
              {staff.map(([role, name]) => (
                <div key={name} className="bg-white p-5">
                  <div className="text-xs font-black uppercase text-red-600">{role}</div>
                  <div className="mt-2 font-black">{name}</div>
                  <div className="mt-2 text-sm text-neutral-500">Qualifications to be confirmed</div>
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
    <PublicPageGuide page="/roster" />
    </PublicShell>
  );
}
