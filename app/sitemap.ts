import type { MetadataRoute } from "next";

const baseUrl = "https://caledon-u9-girls-2026.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/schedule`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/kit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/roster`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/development`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/game-day`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/media`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/sponsors`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/parents`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/conduct`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/end-of-season`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/photo-safety`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];
}
