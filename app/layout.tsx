import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap"
});

const siteUrl = "https://caledonunited2018girls.ca";
const crestLogo = `${siteUrl}/assets/brand/caledon-united-crest.webp?v=crest-20261111-v2`;
const socialImage = `${siteUrl}/assets/brand/caledon-united-social.png?v=crest-20261111-v2`;

const sportsTeamSchema = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Caledon United FC 2018 Girls 2026–27",
  alternateName: "Caledon U9 Girls 2026–27",
  sport: "Soccer",
  url: siteUrl,
  logo: crestLogo,
  image: socialImage,
  description:
    "Team hub for Caledon United FC 2018 Girls — schedules, team kit, parent resources and team information.",
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
  name: "Caledon United FC 2018 Girls Team Hub",
  url: siteUrl,
  inLanguage: "en-CA",
  publisher: {
    "@type": "Organization",
    name: "Caledon Soccer Club",
    url: "https://caledonsoccer.com",
    logo: crestLogo
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Caledon United FC 2018 Girls | 2026–27 Team Hub",
    template: "%s | Caledon United 2018 Girls"
  },
  description:
    "Caledon United FC 2018 Girls 2026–27 team hub with schedules, team kit, parent resources, sponsorship information and youth-safety guidance.",
  keywords: [
    "Caledon United FC 2018 Girls soccer",
    "Caledon U9 Girls 2026–27 soccer",
    "Caledon SC youth soccer",
    "U9 girls soccer schedule Caledon",
    "Caledon soccer team hub",
    "youth soccer Caledon Ontario"
  ],
  authors: [{ name: "Caledon Soccer Club", url: "https://caledonsoccer.com" }],
  creator: "Caledon Soccer Club",
  publisher: "Caledon Soccer Club",
  applicationName: "Caledon United 2018 Girls",
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
    siteName: "Caledon United FC 2018 Girls",
    title: "Caledon United FC 2018 Girls | 2026–27 Team Hub",
    description:
      "Schedules, kit, parent resources and team information for Caledon United FC 2018 Girls during the 2026–27 season.",
    images: [
      {
        url: "/assets/brand/caledon-united-social.png?v=crest-20261111-v2",
        width: 512,
        height: 512,
        alt: "Caledon United Football Club 1973 crest"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Caledon United FC 2018 Girls | 2026–27 Team Hub",
    description: "Schedules, kit, parent resources and team information for the 2026–27 season.",
    images: ["/assets/brand/caledon-united-social.png?v=crest-20261111-v2"]
  },
  icons: {
    icon: [
      { url: "/assets/brand/caledon-united-favicon-32.webp?v=crest-20261111-v2", sizes: "32x32", type: "image/webp" },
      { url: "/assets/brand/caledon-united-crest.webp?v=crest-20261111-v2", sizes: "256x256", type: "image/webp" },
      { url: "/favicon.ico?v=crest-20261111-v2", sizes: "any", type: "image/x-icon" }
    ],
    shortcut: "/assets/brand/caledon-united-favicon-32.webp?v=crest-20261111-v2",
    apple: [
      { url: "/assets/brand/caledon-united-apple-180.png?v=crest-20261111-v2", sizes: "180x180", type: "image/png" }
    ]
  },
  verification: {
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
        <meta name="google-site-verification" content="mfhGP1wK0UBe-efLRh0OcDKvrOXlQqYo5Pum1zSN6Q8" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className={montserrat.className}>{children}<Analytics /></body>
    </html>
  );
}
