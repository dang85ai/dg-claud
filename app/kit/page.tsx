import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { Backpack, CloudRain, Footprints, Shirt } from "lucide-react";

const kit = [
  { Icon: Shirt, name: "Home Match Outfit", note: "Final Adidas product code to be confirmed." },
  { Icon: Shirt, name: "Away Match Outfit", note: "Final Adidas product code to be confirmed." },
  { Icon: Footprints, name: "Team Tracksuit", note: "Youth teamwear sizing and customization." },
  { Icon: CloudRain, name: "Outdoor Jacket", note: "Cold and wet-weather team layer." },
  { Icon: Backpack, name: "Team Backpack", note: "Team identification and player use." }
];

export default function KitPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Teamwear"
        title="2026 Team Kit"
        copy="The planned package includes home and away match outfits, tracksuit, outdoor jacket and backpack."
      />
      <section className="section">
        <div className="container">
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Current Package Total</div>
              <div className="mt-2 text-5xl font-black">C$510</div>
            </div>
            <div className="card p-6">
              <div className="text-sm font-black uppercase text-red-600">Product Status</div>
              <div className="mt-2 text-2xl font-black uppercase">Final SKUs Pending</div>
              <p className="mt-2 text-sm text-neutral-600">
                Exact Adidas product numbers will only be posted after the approved 2026 selection is finalized.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kit.map(({ Icon, name, note }) => (
              <div key={name} className="card p-6">
                <Icon className="text-red-600" size={30} />
                <h2 className="mt-4 text-xl font-black uppercase">{name}</h2>
                <p className="mt-2 text-sm text-neutral-600">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
