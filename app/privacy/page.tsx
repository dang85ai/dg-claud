import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Team Policy"
        title="Privacy & Youth Safety"
        copy="Public information is intentionally limited. Private team records require authenticated access."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="card p-7">
            <div className="grid gap-5 text-neutral-700">
              <p>Public player profiles use first names only and are controlled by guardian consent.</p>
              <p>Full names, family details, forms, payments, attendance and carpool information are private team records.</p>
              <p>Public player photography and public profile content require explicit consent. Revoking photo consent removes the public photo reference.</p>
              <p>No public home addresses are stored or displayed for carpool coordination. Area/neighbourhood labels are used instead.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
