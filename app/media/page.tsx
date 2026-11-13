import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import {
  Camera,
  Film,
  Images,
  ShieldCheck,
  Upload
} from "lucide-react";

const albums = ["Games", "Practices", "Tournaments", "Team Events", "Community", "Season Highlights"];

export default function MediaPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero banner="media"
        eyebrow="Team Media"
        title="Photos & Game Recaps"
        copy="A consent-controlled gallery for approved team memories, organized by event throughout the season."
      />

      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              Only manager-approved, consent-reviewed media can appear publicly. Uploaded images are re-encoded and location metadata is removed before moderation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <div key={album} className="card overflow-hidden">
                <div className={"relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br " + (index % 3 === 0 ? "from-neutral-900 via-neutral-800 to-red-950" : index % 3 === 1 ? "from-red-950 via-neutral-900 to-neutral-800" : "from-neutral-800 via-neutral-900 to-red-900")}>
                  <div className="absolute inset-x-6 inset-y-5 rounded-lg border border-white/15" aria-hidden="true" />
                  <div className="relative grid justify-items-center gap-3 text-white/80">
                    <Camera size={39} strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-[.15em]">Awaiting Approved Photos</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Album</div>
                  <h2 className="mt-1 text-xl font-black uppercase">{album}</h2>
                  <p className="mt-2 text-sm text-neutral-500">Photos will appear here after upload, consent review and manager approval.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="card p-6">
              <Images className="text-red-600" />
              <h2 className="mt-4 text-xl font-black uppercase">Photo Consent</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Photos are published only when the required guardian consent is active. A guardian can request removal or change consent through the team process.
              </p>
            </div>

            <div className="card p-6">
              <Upload className="text-red-600" />
              <h2 className="mt-4 text-xl font-black uppercase">Submit Photos</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Authorized families can upload photos through the private Parent Portal. The photo coordinator or manager reviews them before any public use.
              </p>
            </div>

            <div className="card p-6">
              <Film className="text-red-600" />
              <h2 className="mt-4 text-xl font-black uppercase">Highlights & Slideshow</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Consent-safe video clips and a season-end slideshow can be added later using the same review process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
