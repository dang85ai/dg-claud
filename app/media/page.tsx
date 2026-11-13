import Link from "next/link";
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
              <article key={album} className="card media-album-card overflow-hidden">
                <div className="media-album-placeholder" aria-hidden="true" data-tone={index % 3}>
                  <div className="media-album-placeholder__lines"/>
                  <div className="media-album-placeholder__icon"><Camera size={34} strokeWidth={1.6}/></div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Team Album · 2026–27</div>
                  <h2 className="mt-1 text-xl font-black uppercase">{album}</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">Awaiting approved photos. New additions appear only after guardian consent and manager review.</p>
                  <span className="mt-4 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-600">No public photos yet</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <div><h2 className="text-lg font-black uppercase">Private Family Media</h2><p className="mt-1 text-sm text-neutral-600">Approved families can submit photographs for review through their protected portal.</p></div>
            <Link href="/portal/media" className="btn btn-primary">Open Family Gallery</Link>
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
