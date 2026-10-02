import { PitchBackdrop } from "@/components/PitchBackdrop";

export function PublicPageHero({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="hero public-page-hero py-10 md:py-12">
      <PitchBackdrop />
      <div className="container">
        <div className="kicker">{eyebrow}</div>
        <h1 className="mt-4 max-w-5xl text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">{copy}</p>
      </div>
    </section>
  );
}

