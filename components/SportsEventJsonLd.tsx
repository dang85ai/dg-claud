type SportsEventJsonLdProps = {
  name: string;
  startDate: string;
  locationName: string;
  streetAddress: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  opponent: string;
  homeAway: "home" | "away";
};

export function SportsEventJsonLd({
  name,
  startDate,
  locationName,
  streetAddress,
  addressLocality = "Caledon East",
  addressRegion = "ON",
  postalCode,
  opponent,
  homeAway
}: SportsEventJsonLdProps) {
  const caledon = { "@type": "SportsTeam", name: "Caledon SC U9 Girls 2026" };
  const other = { "@type": "SportsTeam", name: opponent };

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name,
    startDate,
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        streetAddress,
        addressLocality,
        addressRegion,
        ...(postalCode ? { postalCode } : {}),
        addressCountry: "CA"
      }
    },
    homeTeam: homeAway === "home" ? caledon : other,
    awayTeam: homeAway === "home" ? other : caledon
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
