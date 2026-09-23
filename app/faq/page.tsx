import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";

const faqs = [
  {
    q: "What if my player misses practice?",
    a: "Please update attendance in the Parent Portal and let the team know as early as possible so coaches can plan the session."
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
    a: "The official refund policy has not yet been published on this team site. The verified club policy will be linked here before launch."
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

export default function FaqPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="Parent FAQ"
        title="Quick Answers"
        copy="Common questions for families throughout the season. Confirmed club policies will replace any pending items before launch."
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
