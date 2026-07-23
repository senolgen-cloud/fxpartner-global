import type { MetadataRoute } from "next";
import { brokers, brokerCategories, categoryInfo } from "@/data/brokers";
import { blogPosts } from "@/data/blog";
import { cashbackPrograms } from "@/data/cashback";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/cashback`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/campaigns`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blacklist`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/complaint`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
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

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const cashbackSetupRoutes: MetadataRoute.Sitemap = cashbackPrograms.map((p) => ({
    url: `${SITE_URL}/cashback/${p.brokerSlug}/setup`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...brokerRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...cashbackSetupRoutes,
  ];
}
