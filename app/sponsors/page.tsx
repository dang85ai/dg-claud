import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { HeartHandshake } from "lucide-react";

export default function SponsorsPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Community Support"
        title="Support Our Girls"
        copy="Sponsor support stays with the group and helps fund training, kit, equipment, field rentals and tournaments."
      />
      <section className="section">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {["Training & Fields", "Kit & Equipment", "Tournaments & Season Costs"].map((item) => (
              <div className="card p-6" key={item}>
                <HeartHandshake className="text-red-600" />
                <h2 className="mt-4 text-xl font-black uppercase">{item}</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Sponsorship contributions are directed toward team development and season costs.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-black p-7 text-white md:p-10">
            <div className="text-sm font-black uppercase tracking-[.15em] text-red-500">Become a Sponsor</div>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">Every sponsor is recognized.</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Any amount can help. Sponsor details will be added once commitments are finalized.
            </p>
            <div className="mt-6 text-sm">
              <div>girlsoccer@r5play.net</div>
              <div className="mt-1">1-(855) 592-6444</div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
