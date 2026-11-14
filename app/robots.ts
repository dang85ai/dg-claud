import type { MetadataRoute } from "next";

const baseUrl = "https://caledonunited2018girls.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
