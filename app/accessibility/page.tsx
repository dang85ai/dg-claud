import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export default function AccessibilityPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Policy"
        title="Accessibility"
        copy="The site is being built toward WCAG 2.1 AA with mobile and sideline use as first-class requirements."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="card p-7">
            <ul className="grid gap-4 text-neutral-700">
              <li>Keyboard navigation and visible focus indicators.</li>
              <li>Touch targets at least 44 pixels.</li>
              <li>Text resizing without breaking core layouts.</li>
              <li>Reduced-motion support.</li>
              <li>High contrast on primary actions and navigation.</li>
              <li>Descriptive alternatives for meaningful images.</li>
            </ul>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
