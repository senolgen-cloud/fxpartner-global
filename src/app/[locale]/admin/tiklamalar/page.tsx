import Footer from "@/components/Footer";
import { db } from "@/db";
import { outboundClicks } from "@/db/schema";
import { desc, gte, sql } from "drizzle-orm";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { brokers } from "@/data/brokers";
import { propFirms } from "@/data/propFirms";
import { INLINE_AD_COPY } from "@/lib/xm";
import { COPYTRADE_URL } from "@/data/copytrade";

export const dynamic = "force-dynamic";

// Hangi partner linki, hangi sayfadan, hangi kaynaktan gelen okurdan tık
// alıyor. Partner panelleri kaydı gösterir, sitede nereden başladığını
// göstermez; bu sayfa o boşluğu kapatıyor (docs/ekim-2026-yukselis-plani.md,
// Hamle 1).
//
// Etiketler veri dosyalarından türetiliyor, elle tutulan bir listeden değil:
// bir brokerın ya da prop firmanın kaydında geçen her http adresi o kaydın
// adıyla eşleşiyor. Yeni bir referans linki eklendiği gün burada da adıyla
// görünür.
function collectUrls(value: unknown, into: string[]) {
  if (typeof value === "string") {
    if (value.startsWith("http")) into.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, into);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectUrls(v, into);
  }
}

function normalize(href: string): string {
  try {
    const u = new URL(href);
    return `${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch {
    return href;
  }
}

function buildLabels(): Map<string, string> {
  const labels = new Map<string, string>();
  const add = (url: string, label: string) => {
    const key = normalize(url);
    if (!labels.has(key)) labels.set(key, label);
  };
  // Önce özel yerleşimler: aynı broker için makale içi link ayrı görünsün.
  for (const [slug, copy] of Object.entries(INLINE_AD_COPY)) add(copy.affiliateUrl, `${slug} · makale içi`);
  add(COPYTRADE_URL, "CopyTrade");
  for (const b of brokers) {
    const urls: string[] = [];
    collectUrls(b, urls);
    for (const u of urls) add(u, b.name);
  }
  for (const f of propFirms) {
    const urls: string[] = [];
    collectUrls(f, urls);
    for (const u of urls) add(u, `${f.name} (prop)`);
  }
  return labels;
}

const RANGES = { "7": 7, "30": 30 } as const;

export default async function AdminClicksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gun?: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);
  const { gun } = await searchParams;
  const days = RANGES[gun as keyof typeof RANGES] ?? 7;
  const since = sql`now() - (${days} * interval '1 day')`;
  const count = sql<number>`count(*)::int`;

  const [byHref, byPath, bySource, [total]] = await Promise.all([
    db
      .select({ href: outboundClicks.href, clicks: count })
      .from(outboundClicks)
      .where(gte(outboundClicks.createdAt, since))
      .groupBy(outboundClicks.href)
      .orderBy(desc(count))
      .limit(200),
    db
      .select({ path: outboundClicks.path, clicks: count })
      .from(outboundClicks)
      .where(gte(outboundClicks.createdAt, since))
      .groupBy(outboundClicks.path)
      .orderBy(desc(count))
      .limit(20),
    db
      .select({ source: sql<string>`coalesce(${outboundClicks.source}, 'bilinmiyor')`, clicks: count })
      .from(outboundClicks)
      .where(gte(outboundClicks.createdAt, since))
      .groupBy(sql`1`)
      .orderBy(desc(count))
      .limit(15),
    db.select({ clicks: count }).from(outboundClicks).where(gte(outboundClicks.createdAt, since)),
  ]);

  // Aynı partnere giden farklı linkler (kart, tablo, banner) tek satırda.
  const labels = buildLabels();
  const byPartner = new Map<string, number>();
  for (const row of byHref) {
    let label = labels.get(normalize(row.href));
    if (!label) {
      try {
        label = new URL(row.href).hostname;
      } catch {
        label = row.href;
      }
    }
    byPartner.set(label, (byPartner.get(label) ?? 0) + row.clicks);
  }
  const partners = [...byPartner.entries()].sort((a, b) => b[1] - a[1]);

  const table = (title: string, rows: [string, number][]) => (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-text-dark">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">Bu aralıkta kayıt yok.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <tbody>
            {rows.map(([label, clicks]) => (
              <tr key={label} className="border-b border-hairline-light">
                <td className="break-all py-2 pe-4 text-text-dark">{label}</td>
                <td className="py-2 text-end font-mono text-text-dark">{clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <>
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">Admin</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">Partner Link Tıklamaları</h1>
          <p className="mt-2 text-sm text-text-muted">
            Son {days} gün · toplam <strong className="text-text-dark">{total?.clicks ?? 0}</strong> tıklama.
            Kişisel veri tutulmuyor; kaynak yalnızca çerez onayı veren okurlarda görünür.
          </p>
          <p className="mt-3 flex gap-3 text-sm">
            <a href="?gun=7" className={days === 7 ? "font-semibold text-text-dark" : "text-text-muted underline"}>
              7 gün
            </a>
            <a href="?gun=30" className={days === 30 ? "font-semibold text-text-dark" : "text-text-muted underline"}>
              30 gün
            </a>
          </p>

          {table("Partner", partners)}
          {table("Tıklamanın geldiği sayfa", byPath.map((r) => [r.path, r.clicks]))}
          {table("Okurun ilk geldiği kaynak", bySource.map((r) => [r.source, r.clicks]))}
        </div>
      </main>
      <Footer />
    </>
  );
}
