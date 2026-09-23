import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export default function PhotoSafetyPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Policy"
        title="Photo & Media Safety"
        copy="Every public image must pass processing, consent review and manager moderation."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="card p-7">
            <div className="grid gap-5 text-neutral-700">
              <p>Parent uploads are never published automatically.</p>
              <p>Images are re-encoded and location metadata is removed before moderation.</p>
              <p>The original raw upload is not retained by the media pipeline.</p>
              <p>Players without public-photo consent must be excluded, replaced or obscured in the public version.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
