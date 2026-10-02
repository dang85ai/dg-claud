import type { Metadata } from "next";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Parent FAQ | Caledon U9 Girls 2026",
  description: "Answers to common parent questions for the Caledon SC U9 Girls 2026 season.",
  alternates: { canonical: "/faq" }
};

const faqs = [
  { q: "Where do I RSVP and check changes?", a: "Respond in your Spond invite when attendance is requested. Check the latest invite and team messages before leaving. Portal attendance updates should not be assumed to update Spond. If details disagree, ask the team manager." },
  { q: "Where is training?", a: "Tuesday venue information is still to be confirmed. Wednesday sessions name St Cornelius Gym, but a verified street address has not been supplied. Confirm the address, entrance, parking and indoor footwear in your invite. The club office is not the training venue." },
  { q: "How does U9 soccer work?", a: "The team emphasizes development, confidence, teamwork and enjoyment. Match format, substitutions, goalkeeper rotation and the playing-time approach depend on the team’s confirmed program. Ask the coach for the rules that apply to this team; these details will be added once confirmed." },
  {
    q: "What if my player misses practice?",
    a: "Reply to the Spond invite when attendance is requested and let the team know early. Use available portal attendance tools as directed by the manager; a portal update should not be assumed to update Spond."
  },
  {
    q: "What if we're late to a game?",
    a: "Contact the team manager or coach through the team communication channel. When you arrive, follow the coach's direction for joining warm-up or play."
  },
  {
    q: "Can my player play other sports?",
    a: "The team supports clear communication around schedule conflicts. Share known conflicts early so coaches can plan."
  },
  {
    q: "What's the refund policy?",
    a: "The official club refund policy is linked under Parents → Official club resources. Policies differ by program; contact the club about competitive refunds and confirm which policy applies to your registration."
  },
  {
    q: "How is playing time decided?",
    a: "The U9 program is development-focused. The final team playing-time approach will follow the coach and club policy once confirmed."
  },
  {
    q: "What if there's a conflict with a coach or parent?",
    a: "Start with respectful direct communication or contact the team manager. If the issue cannot be resolved at team level, use the club's formal escalation process."
  },
  {
    q: "Are there tryouts?",
    a: "The 2026 placement and registration process will be published once the club's confirmed U9 process is available."
  },
  {
    q: "What if my player needs a break?",
    a: "Tell the coach. Player well-being comes before the result of a single practice or game."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
};

export default function FaqPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Parent FAQ"
        title="Quick Answers"
        copy="Answers for the 2026–27 training season. Team-specific rules and locations are marked pending where confirmation is needed."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <div className="grid gap-3">
            {faqs.map((item) => (
              <details key={item.q} className="card p-5">
                <summary className="cursor-pointer text-lg font-black">{item.q}</summary>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

