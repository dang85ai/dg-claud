import type { MetadataRoute } from "next";

const baseUrl = "https://caledon-u9-girls-2026.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/schedule`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/kit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/development`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/game-day`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/sponsors`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/parents`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/conduct`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/end-of-season`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/photo-safety`, changeFrequency: "yearly", priority: 0.3 }
  ];
}
