import type { ReactNode } from "react";
import { ApprovedPageBanner, type ApprovedBannerId } from "@/components/ApprovedPageBanner";

export function PublicPageHero({
  eyebrow, title, copy, banner, usePageTitle = false, action, secondaryAction
}: {
  eyebrow: string;
  title: string;
  copy: string;
  banner?: ApprovedBannerId;
  usePageTitle?: boolean;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  if (banner) {
    return (
      <>
        <ApprovedPageBanner banner={banner} heading={title} titleOverride={usePageTitle ? title : undefined} subtitleOverride={usePageTitle ? eyebrow : undefined} asHeading />
        <div className="border-b border-neutral-200 bg-white">
          <div className="container py-4 md:py-5">
            <p className="max-w-4xl text-sm leading-6 text-neutral-700 md:text-base">{copy}</p>
            {action ? <div className="mt-4 flex flex-wrap gap-3">{action}{secondaryAction}</div> : null}
          </div>
        </div>
      </>
    );
  }
  return (
    <section className="cufc-policy-hero" aria-labelledby="page-policy-heading">
      <div className="container cufc-policy-hero-content">
        <div className="kicker text-red-700">{eyebrow}</div>
        <h1 id="page-policy-heading" className="mt-3 max-w-4xl text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700 md:text-base">{copy}</p>
      </div>
    </section>
  );
}
