import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://caledon-u9-girls-2026.netlify.app";

const sportsTeamSchema = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Caledon SC U9 Girls 2026",
  alternateName: "Caledon U9 Girls 2026",
  sport: "Soccer",
  url: siteUrl,
  logo: `${siteUrl}/assets/brand/caledon-u9-girls-2026-icon-192.png`,
  image: `${siteUrl}/kit/home-team-kit.webp`,
  description:
    "Official team hub for Caledon SC U9 Girls 2026 — schedules, team kit, roster, parent information and player-development resources.",
  memberOf: {
    "@type": "SportsOrganization",
    name: "Caledon Soccer Club",
    foundingDate: "1973",
    url: "https://caledonsoccer.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2 McKee Drive South",
      addressLocality: "Caledon East",
      addressRegion: "ON",
      postalCode: "L7C 1G8",
      addressCountry: "CA"
    },
    telephone: "+1-905-584-4033"
  },
  location: {
    "@type": "Place",
    name: "Caledon East Soccer Complex",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6311 Old Church Road",
      addressLocality: "Caledon East",
      addressRegion: "ON",
      addressCountry: "CA"
    }
  },
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 9
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Caledon SC U9 Girls 2026 Team Hub",
  url: siteUrl,
  inLanguage: "en-CA",
  publisher: {
    "@type": "Organization",
    name: "Caledon Soccer Club",
    url: "https://caledonsoccer.com"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Caledon Soccer Club",
      item: "https://caledonsoccer.com"
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "U9 Girls 2026",
      item: siteUrl
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Caledon U9 Girls 2026 Soccer Team Hub | Caledon SC",
    template: "%s | Caledon U9 Girls 2026"
  },
  description:
    "Official team hub for Caledon SC U9 Girls 2026. Find schedules, team kit, roster, parent information and player-development resources.",
  keywords: [
    "Caledon U9 Girls 2026 soccer",
    "Caledon SC youth soccer",
    "U9 girls soccer schedule Caledon",
    "Caledon soccer team hub",
    "youth soccer Caledon Ontario"
  ],
  authors: [{ name: "Caledon Soccer Club", url: "https://caledonsoccer.com" }],
  creator: "Caledon Soccer Club",
  publisher: "Caledon Soccer Club",
  applicationName: "Caledon U9 Girls 2026",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    siteName: "Caledon SC U9 Girls 2026",
    title: "Caledon U9 Girls 2026 Soccer Team Hub | Caledon SC",
    description:
      "Schedules, team kit, roster and parent information for the Caledon SC U9 Girls 2026 season.",
    images: [
      {
        url: "/kit/home-team-kit.webp",
        width: 1122,
        height: 1402,
        alt: "Caledon SC U9 Girls 2026 home match kit and team branding"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Caledon U9 Girls 2026 Soccer Team Hub",
    description: "Schedules, team kit, roster and parent information for the 2026 season.",
    images: ["/kit/home-team-kit.webp"]
  },
  icons: {
    icon: [
      { url: "/assets/brand/caledon-u9-girls-2026-icon.svg", type: "image/svg+xml" },
      { url: "/assets/brand/caledon-u9-girls-2026-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/caledon-u9-girls-2026-icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/assets/brand/caledon-u9-girls-2026-icon-180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Caledon East, Ontario",
    "geo.position": "43.8576;-79.8699",
    ICBM: "43.8576, -79.8699"
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
