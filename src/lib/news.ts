import { XMLParser } from "fast-xml-parser";

export type NewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  source: string;
};

// FXStreet and Investing.com's own /brokers/ section make them direct
// competitors — excluded on purpose. These three run general financial
// news with no broker-comparison business of their own.
const FEEDS: { source: string; url: string }[] = [
  { source: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
  { source: "CNBC", url: "https://www.cnbc.com/id/15839069/device/rss/rss.html" },
  { source: "Investing.com", url: "https://www.investing.com/rss/news.rss" },
];

const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

async function fetchFeed(source: string, url: string): Promise<NewsItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FXPARTNERBot/1.0)" },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Feed fetch failed: ${source} (${res.status})`);
  const xml = await res.text();
  const data = parser.parse(xml);
  const rawItems = data?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items
    .filter((it: Record<string, unknown>) => it && it.title && it.link)
    .map((it: Record<string, unknown>) => ({
      title: stripHtml(String(it.title)),
      link: String(it.link).trim(),
      description: stripHtml(String(it.description ?? "")),
      pubDate: String(it.pubDate ?? ""),
      guid: String(it.guid ?? it.link),
      source,
    }));
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }
  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return items;
}
