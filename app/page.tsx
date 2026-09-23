import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Shirt,
  Users
} from "lucide-react";
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
              Caledon U9 Girls 2026
              <span>Soccer Team Hub</span>
            </h1>
            <p className="max-w-xl text-base text-white/70 md:text-lg">
              Welcome to the official team hub for the <strong className="text-white">Caledon SC U9 Girls 2026</strong> season.
              Everything parents need at the field — schedules, team kit, roster, parent information and player-development resources —
              in one mobile-friendly place for youth soccer in Caledon, Ontario.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/schedule" className="btn btn-primary">
                View This Week&apos;s Schedule <ChevronRight size={18} />
              </Link>
              <Link href="/login" className="btn border border-white/30 bg-white/10 text-white">
                Join the Parent Portal
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

      <section className="border-b border-neutral-200 bg-white">
        <div className="container py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/schedule" className="card flex min-h-16 items-center gap-3 p-4 hover:border-red-500">
              <CalendarDays className="shrink-0 text-red-600" size={20} />
              <span className="font-black">View Schedule</span>
            </Link>
            <Link href="/login" className="card flex min-h-16 items-center gap-3 p-4 hover:border-red-500">
              <ClipboardCheck className="shrink-0 text-red-600" size={20} />
              <span className="font-black">Report an Absence</span>
            </Link>
            <Link href="/contact" className="card flex min-h-16 items-center gap-3 p-4 hover:border-red-500">
              <Mail className="shrink-0 text-red-600" size={20} />
              <span className="font-black">Contact Team Manager</span>
            </Link>
            <Link href="/login" className="card flex min-h-16 items-center gap-3 p-4 hover:border-red-500">
              <ShieldCheck className="shrink-0 text-red-600" size={20} />
              <span className="font-black">Parent Portal</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-red-600 text-white">
        <div className="container flex flex-wrap items-center gap-4 py-4">
          <Bell size={20} className="shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-[.14em] text-white/70">Season Status</div>
            <div className="font-black">Official 2026 practice and game dates will appear here as soon as the team schedule is confirmed.</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <SectionHeader
              eyebrow="Caledon Soccer Team Hub"
              title="Everything parents need at the field"
              copy="Bookmark this Caledon U9 Girls 2026 team hub and check back often. The goal is fewer scattered messages, less uncertainty, and a clear mobile home for the team."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: CalendarDays, title: "Schedule", text: "Games, practices, arrival times, locations and weather alerts." },
                { icon: Shirt, title: "Team Kit", text: "Home, away, tracksuit, jacket, backpack, sizing and game-day kit guidance." },
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
          <section aria-labelledby="next-game-heading">
            <h2 id="next-game-heading" className="mb-4 text-2xl font-black uppercase tracking-tight">
              Next Game — Caledon U9 Girls 2026
            </h2>
            <NextMatchCard />
          </section>
        </div>
      </section>

      <section className="section bg-black text-white">
        <div className="container">
          <SectionHeader
            eyebrow="2026 Focus"
            title="2026 Focus: Better players. Better teammates."
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

      <section className="section bg-neutral-50">
        <div className="container grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="text-sm font-black uppercase tracking-[.16em] text-red-600">Caledon East · Ontario</div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight">Contact the Caledon U9 Girls 2026 Team</h2>
            <p className="mt-4 max-w-2xl text-neutral-600">
              Questions about the season, team kit, schedule or parent portal? Contact the team manager through the team contact page.
              Caledon Soccer Club&apos;s public office is at 2 McKee Drive South, Caledon East, Ontario.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">Contact Team Manager</Link>
              <a href="tel:+19055844033" className="btn btn-light">Club Office: 905-584-4033</a>
            </div>
          </div>
          <address className="card not-italic p-6">
            <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Caledon Soccer Club</div>
            <div className="mt-3 font-black">2 McKee Drive South</div>
            <div className="mt-1 text-sm text-neutral-600">Caledon East, ON L7C 1G8</div>
            <a href="tel:+19055844033" className="mt-4 block font-black hover:text-red-600">905-584-4033</a>
            <a href="https://caledonsoccer.com" target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-bold text-red-600">
              Visit Caledon Soccer Club →
            </a>
          </address>
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
