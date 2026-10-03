import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap"
});

const siteUrl = "https://caledon-u9-girls-2026.netlify.app";
const socialImage = `${siteUrl}/assets/brand/caledon-u9-girls-2026-primary.png`;

const sportsTeamSchema = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Caledon SC U9 Girls 2026–27",
  alternateName: "Caledon U9 Girls 2026–27",
  sport: "Soccer",
  url: siteUrl,
  logo: socialImage,
  image: socialImage,
  description:
    "Official team hub for Caledon SC U9 Girls 2026–27 — schedules, team kit, parent resources and team information.",
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
    telephone: "+1-905-584-4033",
    email: "info@caledonsoccer.com"
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
  name: "Caledon SC U9 Girls 2026–27 Team Hub",
  url: siteUrl,
  inLanguage: "en-CA",
  publisher: {
    "@type": "Organization",
    name: "Caledon Soccer Club",
    url: "https://caledonsoccer.com",
    logo: socialImage
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Caledon U9 Girls Soccer | 2026–27 Team Hub",
    template: "%s | Caledon U9 Girls"
  },
  description:
    "Official Caledon SC U9 Girls 2026–27 team hub with training schedules, team kit, parent resources, sponsorship information and youth-safety guidance.",
  keywords: [
    "Caledon U9 Girls 2026–27 soccer",
    "Caledon SC youth soccer",
    "U9 girls soccer schedule Caledon",
    "Caledon soccer team hub",
    "youth soccer Caledon Ontario"
  ],
  authors: [{ name: "Caledon Soccer Club", url: "https://caledonsoccer.com" }],
  creator: "Caledon Soccer Club",
  publisher: "Caledon Soccer Club",
  applicationName: "Caledon U9 Girls",
  manifest: "/site.webmanifest",
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
    siteName: "Caledon U9 Girls",
    title: "Caledon U9 Girls Soccer | 2026–27 Team Hub",
    description:
      "Schedules, kit, parent resources and team information for the Caledon SC U9 Girls 2026–27 season.",
    images: [
      {
        url: "/assets/brand/caledon-u9-girls-2026-primary.png",
        width: 1200,
        height: 630,
        alt: "Caledon SC U9 Girls 2026–27 team crest and team hub branding"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Caledon U9 Girls Soccer | 2026–27 Team Hub",
    description: "Schedules, kit, parent resources and team information for the 2026–27 season.",
    images: ["/assets/brand/caledon-u9-girls-2026-primary.png"]
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/favicon-16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/assets/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {})
  },
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Caledon East, Ontario",
    "geo.position": "43.8576;-79.8699",
    ICBM: "43.8576, -79.8699",
    "msapplication-TileColor": "#E30613",
    "msapplication-config": "/browserconfig.xml"
  }
};

export const viewport: Viewport = {
  themeColor: "#E30613",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="mask-icon" href="/assets/brand/safari-pinned-tab.svg" color="#E30613" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className={montserrat.className}>{children}<Analytics /></body>
    </html>
  );
}
