import type { MetadataRoute } from "next";
import { hreflangMap, locales, localePath, defaultLocale } from "@/lib/i18n";
import { brokers, brokerCategories, categoryInfo } from "@/data/brokers";
import { propFirms } from "@/data/propFirms";
import { blogPosts } from "@/data/blog";
import { cashbackPrograms } from "@/data/cashback";
import { marketAnalysisPosts } from "@/data/marketAnalysis";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    // Broker hub'ı: nişin en yüksek hacimli ticari kelimelerinin hedef sayfası
    // ("en iyi forex broker", "forex broker karşılaştırma"). Ana sayfadan sonra
    // en yüksek öncelik.
    { url: `${SITE_URL}/brokerlar`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/piyasa-analizi`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/haber-bulteni`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/teknik-analiz`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/raporlar/forex-broker-duzenleme-raporu`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/partners`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/copytrade`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/prop-firmalar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/prop-firmalar/indirim-kodlari`, changeFrequency: "weekly", priority: 0.75 },
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

  const propFirmRoutes: MetadataRoute.Sitemap = propFirms.map((f) => ({
    url: `${SITE_URL}/prop-firmalar/${f.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Yalnızca teyitli indirimi olan firmalar için sayfa üretiliyor (bkz.
  // indirim-kodu/page.tsx), sitemap de aynı filtreyi kullanmak zorunda —
  // aksi halde var olmayan sayfaları Google'a bildirmiş oluruz.
  const discountRoutes: MetadataRoute.Sitemap = propFirms
    .filter((f) => f.discount?.status === "live" && f.discount.code)
    .map((f) => ({
      url: `${SITE_URL}/prop-firmalar/${f.slug}/indirim-kodu`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
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

  const turkishRoutes = [
    ...staticRoutes,
    ...brokerRoutes,
    ...propFirmRoutes,
    ...discountRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...cashbackSetupRoutes,
    ...marketAnalysisRoutes,
    ...bulletinRoutes,
  ];

  // Every URL is listed once per locale, and each entry declares the whole
  // set through alternates.languages — that is the pairing that tells Google
  // /ua/brokerlar and /brokerlar are the same page in two languages rather
  // than two pages competing for the same query.
  return turkishRoutes.flatMap((route) => {
    const path = route.url.replace(SITE_URL, "") || "/";
    const languages = hreflangMap(path, SITE_URL);
    return locales.map((locale) => ({
      ...route,
      url: `${SITE_URL}${localePath(locale, path)}`,
      alternates: { languages },
      // A translated tree is newer and thinner than the Turkish original, so
      // it doesn't claim the same priority.
      priority: locale === defaultLocale ? route.priority : Math.max(0.1, (route.priority ?? 0.5) - 0.1),
    }));
  });
}
