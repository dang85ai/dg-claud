import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { Camera, ShieldCheck } from "lucide-react";

export default function MediaPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Media"
        title="Photos & Game Recaps"
        copy="Only manager-approved, consent-reviewed media can appear publicly."
      />
      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              Uploaded images are re-encoded and location metadata is removed before they enter moderation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="card grid aspect-[4/3] place-items-center bg-neutral-200">
                <Camera className="text-neutral-400" size={42} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
