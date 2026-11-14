import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { CinematicIntro } from "./CinematicIntro";
import {
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Users
} from "lucide-react";
import { NextMatchCard } from "@/components/NextMatchCard";
import { PublicShell } from "@/components/PublicShell";
import { SectionHeader } from "@/components/SectionHeader";
import { PwaRegister } from "@/components/PwaRegister";
import { ApprovedPageBanner } from "@/components/ApprovedPageBanner";

export const metadata = buildPageMetadata({
  title: "Caledon United FC 2018 Girls | Team Hub",
  description: "Find the Caledon United FC 2018 Girls schedule, team kit, home soccer drills and parent resources for the 2026–27 season.",
  path: "/",
  absoluteTitle: true,
  previewImage: { url: "/assets/social/home.jpg", width: 1200, height: 630, alt: "Caledon United team artwork" }
});

export default function HomePage() {
  return (
    <PublicShell>
      <PwaRegister />
      <CinematicIntro />

      <ApprovedPageBanner banner="home" heading="Caledon United FC 2018 Girls — 2026–27 Team Hub" titleOverride="Caledon United FC 2018 Girls" subtitleOverride="2026–27 Team Hub" asHeading />
      <section className="home-dashboard border-b border-neutral-200 bg-white">
        <div className="container py-6">
          <div className="grid gap-5 lg:grid-cols-[.9fr_1.25fr]">
            <section aria-label="Next practice or game">
              <NextMatchCard />
            </section>
            <div className="grid content-start gap-3 sm:grid-cols-2">
              <Link href="/schedule" className="card flex min-h-20 items-center gap-3 p-4 hover:border-red-500">
                <CalendarDays className="shrink-0 text-red-600" size={20} />
                <span className="font-black">View Schedule</span>
              </Link>
              <Link href="/contact" className="card flex min-h-20 items-center gap-3 p-4 hover:border-red-500">
                <Mail className="shrink-0 text-red-600" size={20} />
                <span className="font-black">Contact Team Manager</span>
              </Link>
              <Link href="/login" className="card flex min-h-20 items-center gap-3 p-4 hover:border-red-500">
                <ShieldCheck className="shrink-0 text-red-600" size={20} />
                <span className="font-black">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-neutral-950 text-white">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-7">
          <div className="flex flex-wrap gap-3">
            <Link href="/request-invite" className="btn home-hero-secondary">
              Request a Parent Invite
            </Link>
            <Link href="/intro" className="btn home-hero-secondary">
              Replay Intro
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-2xl font-black uppercase">New to the team?</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/parents#start-here" className="btn btn-primary">New-family checklist</Link>
            <Link href="/schedule#venues" className="btn btn-light">Venue instructions</Link>
            <Link href="/parents#communications" className="btn btn-light">Communication guide</Link>
            <Link href="/parents#club-resources" className="btn btn-light">Club resources</Link>
          </div>
        </div>
      </section>

      <section className="section bg-black text-white">
        <div className="container">
          <SectionHeader
            eyebrow="2026 Focus" tone="dark"
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
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight">Contact Caledon United FC 2018 Girls</h2>
            <p className="mt-4 max-w-2xl text-neutral-600">
              Questions about the season, team kit, schedule or parent portal? Contact the team manager through the team contact page.
              The club office at 2 McKee Drive South is for club inquiries. For training, use the venue in your event invite.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">Contact Team Manager</Link>
              <a href="tel:+19055844033" className="btn btn-light">Club Office: 905-584-4033</a>
            </div>
          </div>
          <address className="card not-italic p-6">
            <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Club office · Not a training venue</div>
            <div className="mt-3 font-black">2 McKee Drive South</div>
            <div className="mt-1 text-sm text-neutral-600">Caledon East, ON L7C 1G8</div>
            <a href="tel:+19055844033" className="mt-4 block font-black hover:text-red-600">905-584-4033</a>
            <a href="mailto:info@caledonsoccer.com" className="mt-2 block text-sm font-bold hover:text-red-600">info@caledonsoccer.com</a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Caledon%20Soccer%20Club%2C%202%20McKee%20Drive%20South%2C%20Caledon%20East%2C%20ON%20L7C%201G8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm font-bold text-red-600"
            >
              Club office map
            </a>
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
