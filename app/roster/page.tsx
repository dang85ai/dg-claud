import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { RosterProfiles } from "@/components/RosterProfiles";
import { ShieldCheck } from "lucide-react";

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
        copy="Meet our squad in their home and away kits, explore the formation, and get to know our registered coaching and team staff. Player details follow guardian-consent settings."
      />

      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              Player photos and profile details appear only when the appropriate guardian consent is active. Private portal access can show additional team information to authorized families.
            </p>
          </div>

          <RosterProfiles />

          <section id="team-staff" className="mb-10 mt-12 scroll-mt-24">
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
