import Link from "next/link";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { PublicMediaGallery } from "@/components/PublicMediaGallery";

export default function MediaPage() {
  return (
    <PublicShell>
      <PublicPageHero banner="media"
        eyebrow="Team Albums"
        title="Team Media"
        usePageTitle
        copy="Public team albums contain consent-reviewed photos."
      />
      <section className="section">
        <div className="container">
          <PublicMediaGallery />
          <p className="mt-5 text-sm text-neutral-700">
            Families can submit photos through the <Link href="/portal/media" className="font-bold underline">Parent Portal</Link>.
            {" "}<Link href="/photo-safety" className="font-bold underline">Photo safety and consent</Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
