import Image from "next/image";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { RosterProfiles } from "@/components/RosterProfiles";
import { ShieldCheck, Users, HeartHandshake } from "lucide-react";

const staff = [
  { name: "Gabriel Borges", role: "Technical Director", photo: "/assets/team/staff/gabriel-borges.webp" },
  { name: "Davinder Budwal", role: "Coach", photo: "/assets/team/staff/davinder-budwal.webp" },
  { name: "Karam Budwal", role: "Team Manager", photo: "/assets/team/staff/karam-budwal.webp" },
  { name: "Melissa Catalano", role: "Team Manager", photo: "/assets/team/staff/melissa-catalano.webp" },
  { name: "Daniel Guerra", role: "Team Manager", photo: "/assets/team/staff/daniel-guerra.webp" },
  { name: "Natalie Guerra", role: "Team Manager", photo: "/assets/team/staff/natalie-guerra.webp" },
  { name: "Courtney Quinn", role: "Coach", photo: "/assets/team/staff/courtney-quinn.webp" },
  { name: "Giuseppe (Joe) Tomaselli", role: "Team Manager", photo: "/assets/team/staff/giuseppe-tomaselli.webp" }
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
      <PublicPageHero banner="roster"
        eyebrow="Caledon United FC · 2018 Girls"
        title="Meet the Team"
        copy="Get to know our 2026–27 squad and the people supporting them. Explore our red home and white away kit while respecting every family's photo and privacy choices."
      />

      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm leading-6 text-neutral-600">
            <ShieldCheck className="mt-0.5 shrink-0 text-red-700" size={20} aria-hidden="true" />
            <p>We celebrate our players while respecting their privacy. Player names and portraits appear only for the viewers authorized under the team's guardian-consent and account permissions.</p>
          </div>

          <RosterProfiles />

          <section id="team-staff" className="mt-14 scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-red-700">
                  <Users size={17} aria-hidden="true" /> Coaching & Leadership
                </div>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">The Team Behind the Team</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">Coaches, technical leadership and volunteers supporting our players throughout the 2026–27 season.</p>
              </div>
              <span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-neutral-700">8 Team Staff</span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {staff.map((member) => (
                <article key={member.name} className="group relative flex min-h-32 items-center gap-4 overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-lg">
                  <span className="absolute inset-y-0 left-0 w-[4px] bg-[#D71930]" aria-hidden="true" />
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm sm:h-24 sm:w-24">
                    <Image
                      src={member.photo}
                      alt={`Portrait of ${member.name}`}
                      fill
                      sizes="(min-width: 640px) 96px, 80px"
                      unoptimized
                      className="object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-red-700">{member.role}</p>
                    <h3 className="mt-2 break-words text-sm font-black uppercase leading-snug text-neutral-900 sm:text-base">{member.name}</h3>
                    <p className="mt-2 text-[11px] font-semibold text-neutral-500">2026–27 Staff</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-neutral-500">Staff names and roles are based on the Caledon Soccer Club indoor roster dated September 30, 2026.</p>
          </section>

          <section className="mt-12 rounded-[28px] border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700"><HeartHandshake size={25} aria-hidden="true" /></div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Family & Volunteer Support</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Behind every match and training session are families giving their time. These are the areas where our team benefits from support; assigned contacts remain available to authorized families.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {volunteers.map((role) => (
                <span key={role} className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-neutral-700">{role}</span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
