import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export default function AboutPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Caledon Soccer Club"
        title="Building Players Since 1973"
        copy="The 2026 U9 Girls program is built around development, confidence, teamwork, sportsmanship, game understanding and a love of soccer."
      />
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <div className="text-sm font-black uppercase text-red-600">Our 2026 Goals</div>
            <div className="mt-5 grid gap-3">
              {["Technical development", "Confidence", "Teamwork", "Sportsmanship", "Game understanding", "Love of soccer"].map((item) => (
                <div key={item} className="border-b border-neutral-200 pb-3 text-xl font-black uppercase">{item}</div>
              ))}
            </div>
          </div>
          <div className="card p-7">
            <div className="text-sm font-black uppercase text-red-600">Player Pathway</div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["U9", "Development", "Competitive", "Academy / OPDL", "College / University", "Senior Football"].map((item, i) => (
                <div key={item} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-black uppercase">
                  {i + 1}. {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-neutral-600">
              The purpose of the pathway is to show possibilities, not to pressure young players or rank them against one another.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
