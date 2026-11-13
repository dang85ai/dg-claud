import { ApprovedPageBanner, type ApprovedBannerId } from "@/components/ApprovedPageBanner";
import { ShieldCheck } from "lucide-react";

export function PublicPageHero({
  eyebrow, title, copy, banner, variant = "standard", bannerTitle, bannerSubtitle
}: {
  eyebrow: string;
  title: string;
  copy: string;
  banner?: ApprovedBannerId;
  variant?: "standard" | "document";
  bannerTitle?: string;
  bannerSubtitle?: string;
}) {
  if (variant === "document") {
    return <header className="cufc-document-hero"><div className="container cufc-document-hero__inner">
      <div className="cufc-document-hero__icon" aria-hidden="true"><ShieldCheck size={28}/></div>
      <div className="min-w-0">
        <p className="cufc-document-hero__eyebrow">{eyebrow}</p>
        <h1 className="cufc-document-hero__title">{title}</h1>
        <p className="cufc-document-hero__copy">{copy}</p>
      </div>
    </div></header>;
  }
  if (banner) {
    return (
      <>
        <ApprovedPageBanner banner={banner} heading={title} description={copy} titleOverride={bannerTitle} subtitleOverride={bannerSubtitle} asHeading />
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
