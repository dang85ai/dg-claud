import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { TEAM_EMAIL, TEAM_EMAIL_HREF } from "@/lib/team-config";
import { SponsorLogoBanner } from "@/components/SponsorLogoBanner";

export function Footer() {
  return (
    <footer className="mt-auto bg-black text-white">
      <SponsorLogoBanner />
      <div className="py-12">
      <div className="container grid gap-10 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/assets/brand/caledon-united-crest.webp?v=crest-20261111-v2" alt="Caledon United Football Club crest" width={80} height={80} unoptimized className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 object-contain" />
            <div className="text-xl font-black uppercase sm:text-2xl">Caledon United FC 2018 Girls</div>
          </div>
          <p className="mt-3 max-w-md text-sm text-white/65">
            A mobile-first team hub for the 2026–27 season, built around player safety,
            parent clarity and a strong team culture.
          </p>
          <Link href="/request-invite" className="btn btn-primary mt-8">Request Parent Invite</Link>
        </div>

        <div>
          <div className="font-black uppercase tracking-wide">Contact</div>
          <a href={TEAM_EMAIL_HREF} className="mt-3 block text-sm font-bold hover:text-red-400">{TEAM_EMAIL}</a>
          <a href="https://www.instagram.com/caledonunitedfc2018girls/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-red-400"><Instagram size={20} aria-hidden="true"/> @caledonunitedfc2018girls</a>
        </div>

        <div>
          <div className="font-black uppercase tracking-wide">Parent Resources</div>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/order">Team Kit Request</Link>
            <Link href="/game-day">Game Day</Link>
            <Link href="/development">Player Development</Link>
            <Link href="/train-at-home">Train at Home</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/conduct">Code of Conduct</Link>
            <Link href="/end-of-season">End of Season</Link>
          </div>
        </div>

        <div>
          <div className="font-black uppercase tracking-wide">Team Policies</div>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/privacy">Privacy & Youth Safety</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/photo-safety">Photo & Media Safety</Link>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}

