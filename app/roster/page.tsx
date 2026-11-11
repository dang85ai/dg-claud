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
  { name: "Gabriel Borges", role: "Technical Director" },
  { name: "Davinder Budwal", role: "Coach" },
  { name: "Karam Budwal", role: "Team Manager" },
  { name: "Melissa Catalano", role: "Team Manager" },
  { name: "Daniel Guerra", role: "Team Manager" },
  { name: "Natalie Guerra", role: "Team Manager" },
  { name: "Courtney Quinn", role: "Coach" },
  { name: "Giuseppe (Joe) Tomaselli", role: "Team Manager" }
];

const portraitColumns = ["0%", "33.3333%", "66.6667%", "100%"];

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
        eyebrow="2026–27 Team"
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

          <section id="team-staff" className="mb-10 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[.15em] text-red-600">2026–27 Indoor</div>
                <h2 className="mt-2 text-3xl font-black uppercase">Meet Our Team Staff</h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                  Coaches, technical leadership and team managers supporting our Caledon United U9 Girls.
                </p>
              </div>
              <div className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold uppercase text-neutral-600">
                8 Registered Staff
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {staff.map((member, index) => (
                <article key={member.name} className="card flex flex-col items-center overflow-hidden px-3 py-6 text-center sm:px-5">
                  <div
                    role="img"
                    aria-label={`Portrait of ${member.name}`}
                    className="h-24 w-24 shrink-0 rounded-full border-4 border-white bg-neutral-200 shadow-md sm:h-28 sm:w-28"
                    style={{
                      backgroundImage: "url('/assets/team/team-staff-2026-27.webp')",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "400% 200%",
                      backgroundPosition: `${portraitColumns[index % 4]} ${index < 4 ? "0%" : "100%"}`
                    }}
                  />
                  <h3 className="mt-4 text-base font-black uppercase leading-snug sm:text-lg">{member.name}</h3>
                  <p className="mt-2 rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                    {member.role}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Staff names and positions sourced from the official Caledon Soccer Club 2026–27 Indoor roster dated September 30, 2026.
            </p>
          </section>

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
                  <div><strong>Season:</strong> 2026–27 Indoor</div>
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
