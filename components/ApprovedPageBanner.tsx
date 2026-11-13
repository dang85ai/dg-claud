import Image from "next/image";

export type ApprovedBannerId =
  | "home" | "parent-portal" | "roster" | "schedule" | "training" | "kit"
  | "sponsors" | "conduct" | "media" | "finance" | "about" | "contact";

const artwork: Record<ApprovedBannerId, { title: string; sub: string; compact?: boolean }> = {
  home: { title: "Caledon United FC", sub: "U9 Girls 2018" },
  "parent-portal": { title: "Parent Portal", sub: "Team · Information · Resources" },
  roster: { title: "Team Roster", sub: "Meet the Team" },
  schedule: { title: "Schedule", sub: "Practices · Games · Events" },
  training: { title: "Training & Development", sub: "Skills · Growth · Game IQ", compact: true },
  kit: { title: "Team Kit", sub: "Uniforms · Apparel · Accessories" },
  sponsors: { title: "Sponsors", sub: "Support Our Team" },
  conduct: { title: "Code of Conduct", sub: "Respect · Inclusion · Zero Bullying", compact: true },
  media: { title: "Media", sub: "Photos · Videos · Highlights" },
  finance: { title: "Team Budget & Accounts", sub: "Budget · Payments · Transparency", compact: true },
  about: { title: "Our Team", sub: "Coaches · Staff · Our Club" },
  contact: { title: "Contact", sub: "Get in Touch" }
};

/**
 * High-definition photo layers come from the newly approved artwork.
 * All titles, subtitles, borders and accents are live HTML/CSS instead of
 * low-resolution type baked into a scaled image. This keeps every banner
 * crisp and accessible at desktop, tablet and phone widths.
 */
export function ApprovedPageBanner({
  banner, heading, description, portal = false, asHeading = false, titleOverride, subtitleOverride, neutralBackground = false
}: {
  banner: ApprovedBannerId;
  heading?: string;
  description?: string;
  portal?: boolean;
  asHeading?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
  neutralBackground?: boolean;
}) {
  const item = artwork[banner];
  const backgroundImage = "url('/assets/banners/2026-27-hd/" + banner + ".webp')";
  const TitleTag = asHeading ? "h1" : "div";

  return (
    <section
      aria-label={item.title + " · 2026–27 season banner"}
      className={"approved-page-banner cufc-hd-banner" + (portal ? " approved-page-banner--portal" : "")}
    >
      <div className="cufc-hd-wrap">
        <div className={"cufc-hd-frame" + (neutralBackground ? " cufc-hd-frame--neutral" : "")}>
          {!neutralBackground ? <div className="cufc-hd-image" style={{ backgroundImage }} aria-hidden="true" /> : null}
          <div className="cufc-hd-shade" aria-hidden="true" />
          <div className="cufc-hd-left-stripes" aria-hidden="true" />
          <div className="cufc-hd-right-stripe" aria-hidden="true" />
          <div className="cufc-hd-content">
            <Image
              src="/assets/brand/caledon-united-crest.webp"
              alt=""
              width={116}
              height={116}
              unoptimized
              priority={banner === "home"}
              className="cufc-hd-crest"
            />
            <span className="cufc-hd-divider" aria-hidden="true" />
            <div className="cufc-hd-text">
              <TitleTag className={"cufc-hd-title" + (item.compact ? " cufc-hd-title--long" : "")}>
                {titleOverride || item.title}
              </TitleTag>
              <p className="cufc-hd-subtitle">{subtitleOverride || item.sub}</p>
            </div>
          </div>
        </div>
      </div>
      {description ? <p className="sr-only">{description}</p> : null}
      {!asHeading && heading ? <span className="sr-only">{heading}</span> : null}
    </section>
  );
}
