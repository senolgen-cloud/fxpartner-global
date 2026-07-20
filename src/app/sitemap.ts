import type { MetadataRoute } from "next";
import { brokers, brokerCategories, categoryInfo } from "@/data/brokers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blacklist`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/complaint`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const brokerRoutes: MetadataRoute.Sitemap = brokers.map((b) => ({
    url: `${SITE_URL}/brokers/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = brokerCategories.map((c) => ({
    url: `${SITE_URL}/categories/${categoryInfo[c].slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...brokerRoutes, ...categoryRoutes];
}
