import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { ShieldCheck, UserRound } from "lucide-react";

const placeholders = Array.from({ length: 12 }, (_, i) => i + 1);

export default function RosterPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="2026 Squad"
        title="Meet the Team"
        copy="Public player profiles use first names only. Photos and profile details appear only when guardian consent is active."
      />
      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              The team roster is intentionally empty in the development preview. Player data will not be added or made public until consent and roster information are ready.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        </div>
      </section>
    </PublicShell>
  );
}
