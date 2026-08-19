import type { MetadataRoute } from "next";
import { brokers, brokerCategories, categoryInfo } from "@/data/brokers";
import { blogPosts } from "@/data/blog";
import { cashbackPrograms } from "@/data/cashback";
import { marketAnalysisPosts } from "@/data/marketAnalysis";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/piyasa-analizi`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/haber-bulteni`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/teknik-analiz`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/raporlar/forex-broker-duzenleme-raporu`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/partners`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/copytrade`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/cashback`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/campaigns`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/paketler`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/broker-lookup`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/pozisyon-hesaplayici`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/blacklist`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/complaint`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/instagram`, changeFrequency: "weekly", priority: 0.4 },
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

  // lastModified is set from each post's own real publishedAt/updatedAt
  // field only — never a fabricated or build-time date. Routes without a
  // genuine per-item date (brokers, categories, static pages) intentionally
  // omit lastModified rather than guessing one.
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const cashbackSetupRoutes: MetadataRoute.Sitemap = cashbackPrograms.map((p) => ({
    url: `${SITE_URL}/cashback/${p.brokerSlug}/setup`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const marketAnalysisRoutes: MetadataRoute.Sitemap = marketAnalysisPosts.map((p) => ({
    url: `${SITE_URL}/piyasa-analizi/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const bulletins = await db.query.newsBulletins.findMany();
  const bulletinRoutes: MetadataRoute.Sitemap = bulletins.map((b) => ({
    url: `${SITE_URL}/haber-bulteni/${b.slug}`,
    lastModified: new Date(b.publishedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...brokerRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...cashbackSetupRoutes,
    ...marketAnalysisRoutes,
    ...bulletinRoutes,
  ];
}
