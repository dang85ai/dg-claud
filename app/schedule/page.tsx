import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { CalendarDays, CloudSun, MapPin } from "lucide-react";

export default function SchedulePage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Games · Practices · Events"
        title="Schedule & Events"
        copy="Designed for quick use from the sideline: date, arrival time, field, uniform, weather and parent duties."
      />
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-red-600" />
              <h2 className="text-2xl font-black uppercase">2026 Calendar</h2>
            </div>
            <p className="mt-4 text-neutral-600">
              No games or practices have been entered yet. The calendar will populate from the live team database.
            </p>
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
              <div className="text-sm font-black uppercase tracking-[.14em] text-neutral-500">Schedule coming soon</div>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="card p-5">
              <CloudSun className="text-red-600" />
              <h3 className="mt-3 font-black uppercase">Weather Alert</h3>
              <p className="mt-2 text-sm text-neutral-600">No active weather alerts.</p>
            </div>
            <div className="card p-5">
              <MapPin className="text-red-600" />
              <h3 className="mt-3 font-black uppercase">Game Day Duties</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Parent volunteer roles will be claimable after login.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
