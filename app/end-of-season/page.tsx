import {
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Trophy
} from "lucide-react";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export default function EndOfSeasonPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="2026 Season"
        title="End-of-Season Hub"
        copy="The place for the season recap, team celebration, thank-yous and banquet information once the 2026 season is complete."
      />

      <section className="section">
        <div className="container grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <Sparkles className="text-red-600" />
            <h2 className="mt-4 text-2xl font-black uppercase">Season Recap</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Highlights, memorable moments and team milestones will be added after the season. Public player statistics will only be used if the team decides they fit the U9 development approach.
            </p>
          </div>

          <div className="card p-6">
            <Trophy className="text-red-600" />
            <h2 className="mt-4 text-2xl font-black uppercase">Recognition</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Any end-of-season recognition will focus on development, effort, teamwork, sportsmanship and contribution to the team.
            </p>
          </div>

          <div className="card p-6">
            <HeartHandshake className="text-red-600" />
            <h2 className="mt-4 text-2xl font-black uppercase">Thank You</h2>
            <p className="mt-3 text-sm text-neutral-600">
              A season-end message will recognize players, families, coaches, volunteers and sponsors who helped make the year possible.
            </p>
          </div>

          <div className="card p-6">
            <CalendarDays className="text-red-600" />
            <h2 className="mt-4 text-2xl font-black uppercase">Banquet / Celebration</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Date, location and RSVP details will be published here once the event is confirmed.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
