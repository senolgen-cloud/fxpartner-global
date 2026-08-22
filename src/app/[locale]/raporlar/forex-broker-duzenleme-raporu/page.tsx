import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import {
  brokers,
  getBrokerScores,
  TIER1_REGULATORS,
  brokerCategories,
  categoryInfo,
} from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.raporlar.forex-broker-duzenleme-raporu.title"],
    description: t["page.raporlar.forex-broker-duzenleme-raporu.description"],
    alternates: {
      canonical: localePath(locale, "/raporlar/forex-broker-duzenleme-raporu"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/raporlar/forex-broker-duzenleme-raporu")])
      ),
    },
  };
}

// Every number on this page is computed at request time directly from
// src/data/brokers.ts (the same data that drives /brokers and /categories)
// — nothing here is a hand-typed statistic that can drift out of sync or
// go stale. That's the point: this is meant to be a citable, always-
// accurate primary source, not an editorial summary of one.
export default async function RegulationReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const total = brokers.length;

  const regulatorCounts = new Map<string, number>();
  for (const b of brokers) {
    for (const r of b.regulators) {
      regulatorCounts.set(r, (regulatorCounts.get(r) ?? 0) + 1);
    }
  }
  const regulatorRows = [...regulatorCounts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      tier1: TIER1_REGULATORS.has(name),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const tier1BrokerCount = brokers.filter((b) =>
    b.regulators.some((r) => TIER1_REGULATORS.has(r))
  ).length;
  const multiTier1Count = brokers.filter(
    (b) => b.regulators.filter((r) => TIER1_REGULATORS.has(r)).length >= 2
  ).length;
  const avgRegulatorsPerBroker =
    Math.round(
      (brokers.reduce((sum, b) => sum + b.regulators.length, 0) / total) * 10
    ) / 10;

  const categoryRows = brokerCategories.map((c) => ({
    name: c,
    slug: categoryInfo[c].slug,
    count: brokers.filter((b) => b.categories.includes(c)).length,
  }));

  const topByIndex = [...brokers]
    .map((b) => ({ broker: b, scores: getBrokerScores(b) }))
    .sort((a, b) => b.scores.composite - a.scores.composite)
    .slice(0, 10);

  const generatedOn = new Date().toISOString().slice(0, 10);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              {
                name: "Forex Broker Düzenleme Raporu",
                url: `${SITE_URL}/raporlar/forex-broker-duzenleme-raporu`,
              },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              FXPARTNER Veri Raporu
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Forex Broker Düzenleme Kapsamı Raporu")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {`FXPARTNER'ın ${total} broker'lık inceleme veri setinden, her sayfa yüklendiğinde yeniden hesaplanan düzenleyici lisans dağılımı ve kategori kırılımı.`}
            </p>
            <p className="tabular-stat mt-6 font-mono text-xs uppercase tracking-[0.15em] text-signal">
              Son hesaplama: {generatedOn}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-4xl px-6 py-16">
            <p className="text-[15px] leading-relaxed text-text-dark/90">
              {`Bu rapor, FXPARTNER'ın incelediği ${total} forex broker'ının düzenleyici lisans verilerinden otomatik olarak hesaplanır — hiçbir rakam elle girilmemiştir; tümü `}
              <Link href="/brokerlar" className="text-signal hover:text-signal-strong">
                {tr("broker karşılaştırma sayfasıyla")}
              </Link>
              {` aynı veri kümesinden, sayfa her açıldığında yeniden üretilir. Metodoloji, FXPARTNER Index'in dört ekseninden biri olan "Düzenleme" puanıyla aynıdır: FCA (İngiltere), ASIC (Avustralya), CySEC (Kıbrıs), DFSA (Dubai) ve İrlanda Merkez Bankası tier-1 otorite olarak sayılır.`}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-3xl font-semibold text-text-dark">
                  {tier1BrokerCount}/{total}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  broker en az bir tier-1 lisansa sahip
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-3xl font-semibold text-text-dark">
                  {multiTier1Count}/{total}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  broker 2 veya daha fazla tier-1 lisansa sahip
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-3xl font-semibold text-text-dark">
                  {avgRegulatorsPerBroker}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  {tr("broker başına ortalama lisans sayısı")}
                </p>
              </div>
            </div>

            <h2 className="mt-14 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Düzenleyiciye göre dağılım")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {tr("Bir broker birden fazla düzenleyici altında lisanslı olabileceği için toplam, incelenen broker sayısından fazla olabilir.")}
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline-light">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-paper text-xs uppercase tracking-[0.1em] text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Düzenleyici</th>
                    <th className="px-4 py-3 font-medium">Broker sayısı</th>
                    <th className="px-4 py-3 font-medium">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-light">
                  {regulatorRows.map((r) => (
                    <tr key={r.name}>
                      <td className="px-4 py-3 text-text-dark">{r.name}</td>
                      <td className="px-4 py-3 font-mono text-text-dark">{r.count}</td>
                      <td className="px-4 py-3">
                        {r.tier1 ? (
                          <span className="rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-medium text-signal">
                            Tier-1
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Offshore / diğer</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-14 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Kategoriye göre broker sayısı")}
            </h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline-light">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-paper text-xs uppercase tracking-[0.1em] text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Broker sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-light">
                  {categoryRows.map((c) => (
                    <tr key={c.slug}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/categories/${c.slug}`}
                          className="text-text-dark underline decoration-hairline underline-offset-4 hover:decoration-signal"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-dark">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-14 font-poppins text-2xl font-semibold text-text-dark">
              {tr("FXPARTNER Index'e göre en yüksek puanlı 10 broker")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {tr("Düzenleme, maliyet, platform ve çekim güvenilirliği eksenlerinin ortalamasından hesaplanan bileşik puana göre sıralanmıştır. Tam metodoloji için her broker'ın kendi inceleme sayfasındaki eksen kırılımına bakabilirsiniz.")}
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline-light">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-paper text-xs uppercase tracking-[0.1em] text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Broker</th>
                    <th className="px-4 py-3 font-medium">FXPARTNER Index</th>
                    <th className="px-4 py-3 font-medium">Tier-1 lisans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-light">
                  {topByIndex.map((row, i) => (
                    <tr key={row.broker.slug}>
                      <td className="px-4 py-3 font-mono text-text-muted">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/brokers/${row.broker.slug}`}
                          className="notranslate text-text-dark underline decoration-hairline underline-offset-4 hover:decoration-signal"
                        >
                          {row.broker.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-dark">
                        {row.scores.composite.toFixed(1)}/10
                      </td>
                      <td className="px-4 py-3 font-mono text-text-dark">
                        {row.broker.regulators.filter((r) => TIER1_REGULATORS.has(r)).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-10 rounded-2xl border border-hairline-light bg-paper p-5 text-sm leading-relaxed text-text-muted">
              {tr("Bu rapor FXPARTNER'ın kendi editoryal inceleme verisinden üretilir; bağımsız bir piyasa araştırması veya resmi düzenleyici istatistiği değildir. Herhangi bir broker hakkında karar vermeden önce güncel lisans durumunu ilgili düzenleyicinin resmi sitesinden teyit edin. Bu içerik yatırım tavsiyesi değildir.")}
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
