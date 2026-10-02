import type { Metadata } from "next";

const siteUrl = "https://caledon-u9-girls-2026.netlify.app";
const socialImage = "/assets/brand/caledon-u9-girls-2026-primary.png";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

export function buildPageMetadata({ title, description, path, index = true }: PageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const fullTitle = `${title} | Caledon U9 Girls`;

  return {
    title,
    description,
    alternates: index ? { canonical: canonicalPath } : undefined,
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true }
        },
    openGraph: index
      ? {
          type: "website",
          locale: "en_CA",
          url: new URL(canonicalPath, siteUrl).toString(),
          siteName: "Caledon U9 Girls",
          title: fullTitle,
          description,
          images: [{ url: socialImage, width: 1200, height: 630, alt: "Caledon U9 Girls 2026–27 soccer team hub" }]
        }
      : undefined,
    twitter: index
      ? {
          card: "summary_large_image",
          title: fullTitle,
          description,
          images: [socialImage]
        }
      : undefined
  };
}
