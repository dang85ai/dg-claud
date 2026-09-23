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
    <section className="hero py-14 md:py-20">
      <div className="container">
        <div className="kicker">{eyebrow}</div>
        <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[.9] tracking-[-.05em] md:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">{copy}</p>
      </div>
    </section>
  );
}
