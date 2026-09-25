import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { tr, trf, trLocale } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";
import { breadcrumbSchema } from "@/lib/schema";
import { formatDayLabel, formatUsd, getRecentReportDays } from "@/lib/dailyReport";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Raporların dizini. Tek tek günler kendi adreslerinde duruyor; burası hem
// okurun geçmişe bakabildiği yer hem de arama motoru için o sayfalara giden
// iç bağlantı. Yalnızca işlem olan günler listeleniyor: işlemsiz bir güne
// bağlantı vermek, sayfası olmayan bir adrese göndermek olurdu.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  // Şablon ekini layout koyuyor; burada tekrar yazmak "| FXPARTNER | FXPARTNER" üretiyordu.
  const title = tr("Gün Sonu Raporları");
  const description = tr(
    "Takip edilen MT5 hesabında her gün kapanan işlemler, günlük kâr/zarar ve başarı oranı — gün gün, tek tek işlem listesiyle."
  );
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, "/gun-sonu"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/gun-sonu")])
      ),
    },
    openGraph: { title, description, url: `${SITE_URL}/gun-sonu`, type: "website" },
  };
}

export default async function DailyReportIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setServerLocale(locale);

  const days = await getRecentReportDays(30);
  const total = days.reduce((s, d) => s + d.total, 0);
  const green = days.filter((d) => d.total > 0).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Gün Sonu Raporları", url: `${SITE_URL}/gun-sonu` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-4xl px-6 py-14 md:py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Gün Sonu")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Gün Sonu Raporları")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Her gün TSİ 00:00'da o günün kaydı burada yayınlanır: kapanan her işlem, günün kâr/zararı ve başarı oranı. Kazanan gün de kaybeden gün de aynı yerde durur.")}
            </p>

            {days.length > 0 && (
              <div className="mt-8 grid grid-cols-3 divide-x divide-hairline rounded-xl border border-hairline">
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {tr("Yayınlanan gün")}
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold">{days.length}</div>
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {tr("Kârlı gün")}
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold">
                    {green}/{days.length}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {tr("Toplam")}
                  </div>
                  <div
                    dir="ltr"
                    className="mt-1 font-display text-lg font-semibold tabular-stat"
                    style={{ color: total >= 0 ? "#22c55e" : "#e5484d" }}
                  >
                    {formatUsd(total, 0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-12">
            {days.length === 0 ? (
              <p className="text-sm text-text-on-ink-muted">
                {tr("Henüz yayınlanmış gün sonu raporu yok.")}
              </p>
            ) : (
              <div className="divide-y divide-hairline border-t border-hairline">
                {days.map((d) => (
                  <Link
                    key={d.date}
                    href={`/gun-sonu/${d.date}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:text-signal"
                  >
                    <span className="text-[15px]">{formatDayLabel(d.date, trLocale())}</span>
                    <span className="flex items-center gap-4">
                      <span className="font-mono text-xs text-text-on-ink-muted">
                        {trf("{count} işlem", { count: d.count })}
                      </span>
                      <span
                        dir="ltr"
                        className="font-mono text-sm font-semibold tabular-stat"
                        style={{ color: d.total >= 0 ? "#22c55e" : "#e5484d" }}
                      >
                        {formatUsd(d.total, 0)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
