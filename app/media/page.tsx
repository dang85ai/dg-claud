import { PublicPageGuide } from "@/components/PublicPageGuide";
import { MediaLibrary } from "@/components/MediaLibrary";
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



export default function MediaPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Media"
        title="Our Season in Photos"
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

          <MediaLibrary />

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
                Signed-in families can create personal albums or contribute to shared albums. You can edit captions and remove your own uploads. Admins review photos and manage sharing, public visibility and organization.
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
    <PublicPageGuide page="/media" />
    </PublicShell>
  );
}
