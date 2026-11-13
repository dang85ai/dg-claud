import { ApprovedPageBanner, type ApprovedBannerId } from "@/components/ApprovedPageBanner";

export function PublicPageHero({
  eyebrow, title, copy, banner
}: {
  eyebrow: string;
  title: string;
  copy: string;
  banner?: ApprovedBannerId;
}) {
  if (banner) {
    return (
      <>
        <ApprovedPageBanner banner={banner} heading={title} description={copy} asHeading />
        <div className="border-b border-neutral-200 bg-white">
          <div className="container py-4 md:py-5">
            <p className="max-w-4xl text-sm leading-6 text-neutral-700 md:text-base">{copy}</p>
          </div>
        </div>
      </>
    );
  }
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
