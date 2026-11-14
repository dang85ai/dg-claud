import type { Metadata } from "next";

const siteUrl = "https://caledonunited2018girls.ca";
const defaultImage = { url: "/assets/brand/caledon-united-social.png", width: 512, height: 512, alt: "Caledon United Football Club crest" };

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  absoluteTitle?: boolean;
  previewImage?: { url: string; width: number; height: number; alt: string };
};

export function buildPageMetadata({ title, description, path, index = true, absoluteTitle = false, previewImage }: PageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const fullTitle = absoluteTitle ? title : `${title} | Caledon United FC 2018 Girls`;

  const image = previewImage ?? defaultImage;
  const imageUrl = new URL(image.url, siteUrl).toString();
  return {
    title: absoluteTitle ? { absolute: title } : title,
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
          siteName: "Caledon United FC 2018 Girls",
          title: fullTitle,
          description,
          images: [{ ...image, url: imageUrl }]
        }
      : undefined,
    twitter: index
      ? {
          card: previewImage ? "summary_large_image" : "summary",
          title: fullTitle,
          description,
          images: [{ url: imageUrl, alt: image.alt }]
        }
      : undefined
  };
}
