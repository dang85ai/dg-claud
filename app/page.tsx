import Link from "next/link";
import { CalendarDays, ChevronRight, HeartHandshake, ShieldCheck, Shirt, Users } from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { NextMatchCard } from "@/components/NextMatchCard";
import { PublicShell } from "@/components/PublicShell";
import { SectionHeader } from "@/components/SectionHeader";
import { PwaRegister } from "@/components/PwaRegister";

export default function HomePage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PwaRegister />

      <section className="hero py-16 md:py-24">
        <div className="container grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="kicker">Caledon Soccer Club</div>
            <h1 className="display">
              U9 Girls
              <span>2026</span>
            </h1>
            <p className="max-w-xl text-base text-white/70 md:text-lg">
              One place for games, practices, team kit, parent information,
              player development, photos and the season ahead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/schedule" className="btn btn-primary">
                View Schedule <ChevronRight size={18} />
              </Link>
              <Link href="/login" className="btn border border-white/30 bg-white/10 text-white">
                Parent Portal
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/5 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-black">
                <div className="text-xs font-black uppercase tracking-[.12em] text-red-600">Season</div>
                <div className="mt-2 text-5xl font-black tracking-tight">2026</div>
              </div>
              <div className="rounded-2xl bg-red-600 p-5 text-white">
                <div className="text-xs font-black uppercase tracking-[.12em] text-white/75">Club Since</div>
                <div className="mt-2 text-5xl font-black tracking-tight">1973</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 text-white sm:col-span-2">
                <div className="text-xs font-black uppercase tracking-[.12em] text-white/60">Team Standard</div>
                <div className="mt-2 text-2xl font-black uppercase">Development · Confidence · Teamwork</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <SectionHeader
              eyebrow="Team Hub"
              title="Everything parents need at the field"
              copy="The goal is simple: fewer scattered messages, less uncertainty, and a clear mobile home for the team."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: CalendarDays, title: "Schedule", text: "Games, practices, arrival times, locations and weather alerts." },
                { icon: Shirt, title: "Team Kit", text: "Home, away, tracksuit, jacket and backpack information." },
                { icon: Users, title: "Roster", text: "Consent-controlled player profiles with first names only in public." },
                { icon: ShieldCheck, title: "Private Portal", text: "Forms, payments, carpool, attendance and parent-only information." }
              ].map(({ icon: Icon, title, text }) => (
                <div className="card p-5" key={title}>
                  <Icon className="text-red-600" size={25} aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-black uppercase">{title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <NextMatchCard />
        </div>
      </section>

      <section className="section bg-black text-white">
        <div className="container">
          <SectionHeader
            eyebrow="2026 Focus"
            title="Better players. Better teammates."
            copy="Development is measured against each player's own progress, not public rankings."
          />
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
            {["Technical Development", "Confidence", "Teamwork", "Sportsmanship", "Game Understanding", "Love of Soccer"].map((item) => (
              <div key={item} className="bg-black p-6">
                <div className="text-2xl font-black uppercase">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-5 md:grid-cols-3">
          <Link href="/sponsors" className="card p-6 transition hover:-translate-y-1">
            <HeartHandshake className="text-red-600" />
            <h3 className="mt-4 text-2xl font-black uppercase">Support Our Girls</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Sponsorship helps support training, kit, equipment, field rentals and tournaments.
            </p>
          </Link>
          <Link href="/about" className="card p-6 transition hover:-translate-y-1">
            <Users className="text-red-600" />
            <h3 className="mt-4 text-2xl font-black uppercase">Our Team</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Learn about the 2026 development goals, coaches and pathway.
            </p>
          </Link>
          <Link href="/privacy" className="card p-6 transition hover:-translate-y-1">
            <ShieldCheck className="text-red-600" />
            <h3 className="mt-4 text-2xl font-black uppercase">Youth Safety</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Public information is deliberately limited and consent-controlled.
            </p>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
