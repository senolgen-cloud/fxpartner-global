import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { tr, trf, trLocale } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";
import { breadcrumbSchema } from "@/lib/schema";
import { SIGNAL_TZ } from "@/lib/signalPeriods";
import {
  formatDayLabel,
  formatUsd,
  getDailyReport,
  getRecentReportDays,
  istanbulDayRange,
  lastCompletedDay,
  type DailyReport,
} from "@/lib/dailyReport";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Gün sonu raporu: o gün kapanan her işlem, tek bir adreste.
//
// Neden kendi sayfası: rapor Telegram'a bir link olarak gidiyor ve link
// açıldığında okurun gördüğü şey kanaldaki mesajın kaynağı olmalı — kanal
// mesajı özet, sayfa kayıt. Hafızadaki kural da bu: önce sitede yayınla,
// Telegram oraya bağlansın.
//
// Sayfa veritabanından okuyor, elle yazılan bir içerik dosyası yok: bir
// günün raporu o günün işlemleri neyse odur. Bu yüzden de gelecekteki bir
// tarih ya da hiç işlem olmayan bir gün 404 döner — boş bir rapor sayfası
// yayınlamak, o gün hiç işlem olmadığını değil, sayfanın bozuk olduğunu
// düşündürür.

async function load(dateParam: string): Promise<DailyReport | null> {
  const range = istanbulDayRange(dateParam);
  if (!range) return null;
  // Henüz bitmemiş bir gün raporlanmaz.
  if (dateParam > lastCompletedDay()) return null;
  const report = await getDailyReport(dateParam);
  if (!report || report.trades.length === 0) return null;
  return report;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, date } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const report = await load(date);
  if (!report) return {};

  const label = formatDayLabel(date, trLocale());
  const title = trf("{date} Gün Sonu Raporu — {total}", {
    date: label,
    total: formatUsd(report.total, 0),
  });
  const description = trf(
    "{count} işlem kapandı, {wins} kazanç / {losses} kayıp. Günün tamamı: her işlemin paritesi, yönü ve sonucu.",
    { count: report.trades.length, wins: report.wins, losses: report.losses }
  );

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, `/gun-sonu/${date}`),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, `/gun-sonu/${date}`)])
      ),
    },
    openGraph: { title, description, type: "article", url: `${SITE_URL}/gun-sonu/${date}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DailyReportPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale: rawLocale, date } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setServerLocale(locale);

  const report = await load(date);
  if (!report) notFound();

  const label = formatDayLabel(date, trLocale());
  const up = report.total >= 0;
  const winRate = Math.round((report.wins / report.trades.length) * 100);
  const recent = (await getRecentReportDays(8)).filter((d) => d.date !== date).slice(0, 5);

  const time = (d: Date) =>
    d.toLocaleTimeString(trLocale(), {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: SIGNAL_TZ,
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Gün Sonu Raporları", url: `${SITE_URL}/gun-sonu` },
              { name: label, url: `${SITE_URL}/gun-sonu/${date}` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-5xl px-6 py-14 md:py-16">
            <Link
              href="/gun-sonu"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted transition-colors hover:text-signal"
            >
              ← {tr("Gün Sonu Raporları")}
            </Link>

            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {trf("{date} — Gün Sonu Raporu", { date: label })}
            </h1>

            <div
              dir="ltr"
              className="mt-6 font-display text-5xl font-bold tabular-stat md:text-6xl"
              style={{ color: up ? "#22c55e" : "#e5484d" }}
            >
              {formatUsd(report.total)}
            </div>
            <p className="mt-2 text-sm text-text-on-ink-muted">
              {trf("Takip edilen MT5 hesabında gerçekleşen kâr/zarar — {count} kapanmış işlem.", {
                count: report.trades.length,
              })}
            </p>

            <div className="mt-8 grid grid-cols-2 divide-x divide-hairline rounded-xl border border-hairline sm:grid-cols-4">
              <div className="px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("İşlem")}
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{report.trades.length}</div>
              </div>
              <div className="px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  W / L
                </div>
                <div className="mt-1 font-display text-lg font-semibold">
                  <span style={{ color: "#22c55e" }}>{report.wins}</span>
                  <span className="text-text-on-ink-muted"> / </span>
                  <span style={{ color: "#e5484d" }}>{report.losses}</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("En İyi")}
                </div>
                <div dir="ltr" className="mt-1 font-display text-lg font-semibold" style={{ color: "#22c55e" }}>
                  {report.best ? formatUsd(report.best.profit, 0) : "—"}
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("En Kötü")}
                </div>
                <div dir="ltr" className="mt-1 font-display text-lg font-semibold" style={{ color: "#e5484d" }}>
                  {report.worst ? formatUsd(report.worst.profit, 0) : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="font-display text-xl font-semibold">{tr("Günün özeti")}</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-text-on-ink-muted">
              {/* Özet cümlesi rakamlardan türetiliyor; elle yazılmış bir yorum
                  değil. Kaybedilen gün de aynı cümle kalıbıyla anlatılıyor —
                  kazanan günü öven, kaybedeni suskun geçen bir rapor kayıt
                  değil reklam olurdu. */}
              {trf(
                "{date} günü {count} işlem kapandı: {wins} kazanç, {losses} kayıp (başarı oranı %{rate}). Günün sonucu {total}. En iyi işlem {bestPair} üzerinde {best}, en kötüsü {worstPair} üzerinde {worst}.",
                {
                  date: label,
                  count: report.trades.length,
                  wins: report.wins,
                  losses: report.losses,
                  rate: winRate,
                  total: formatUsd(report.total),
                  bestPair: report.best?.pair ?? "—",
                  best: report.best ? formatUsd(report.best.profit) : "—",
                  worstPair: report.worst?.pair ?? "—",
                  worst: report.worst ? formatUsd(report.worst.profit) : "—",
                }
              )}
            </p>

            {report.byPair.length > 1 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {report.byPair.map((p) => (
                  <span
                    key={p.pair}
                    className="rounded-full border border-hairline px-3 py-1.5 font-mono text-xs"
                    style={{ color: p.total >= 0 ? "#22c55e" : "#e5484d" }}
                  >
                    {p.pair} <span dir="ltr">{formatUsd(p.total, 0)}</span>
                    <span className="text-text-on-ink-muted"> · {p.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="font-display text-xl font-semibold">{tr("Kapanan işlemler")}</h2>
            <div className="mt-5 overflow-x-auto rounded-xl border border-hairline">
              <table className="w-full min-w-[640px] border-collapse text-start">
                <thead>
                  <tr className="border-b border-hairline bg-ink-soft font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    <th className="px-4 py-3 text-start font-normal">{tr("Kapanış")}</th>
                    <th className="px-4 py-3 text-start font-normal">{tr("Sembol")}</th>
                    <th className="px-4 py-3 text-start font-normal">{tr("Yön")}</th>
                    <th className="px-4 py-3 text-start font-normal">{tr("Lot")}</th>
                    <th className="px-4 py-3 text-end font-normal">{tr("Sonuç")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.trades
                    .slice()
                    .reverse()
                    .map((t, i) => (
                      <tr key={`${t.pair}-${t.closedAt.getTime()}-${i}`} className="border-b border-hairline last:border-b-0">
                        <td className="px-4 py-3 font-mono text-xs text-text-on-ink-muted">
                          {time(t.closedAt)}
                        </td>
                        <td className="px-4 py-3 font-display text-sm font-semibold">{t.pair}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: t.direction === "SELL" ? "#e5484d" : "#22c55e" }}>
                          {t.direction ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-text-on-ink-muted">
                          {t.volume ?? "—"}
                        </td>
                        <td
                          dir="ltr"
                          className="px-4 py-3 text-end font-mono text-sm font-semibold tabular-stat rtl:text-start"
                          style={{ color: t.profit >= 0 ? "#22c55e" : "#e5484d" }}
                        >
                          {formatUsd(t.profit)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-text-on-ink-muted">
              {tr("Saatler TSİ. Tutarlar, takip edilen hesabın o işlemde kullandığı lot büyüklüğüyle gerçekleşen kâr/zarardır; kendi lotunuzla sonuç farklı olur. Geçmiş performans gelecekteki sonuçların garantisi değildir.")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signals"
                className="inline-flex h-11 items-center rounded-xl bg-signal px-5 text-[13px] font-semibold text-on-signal transition-colors hover:bg-signal-strong"
              >
                {tr("Canlı sinyalleri gör")}
              </Link>
              <Link
                href="/paketler"
                className="inline-flex h-11 items-center rounded-xl border border-hairline px-5 text-[13px] font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                {tr("Paketleri karşılaştır")}
              </Link>
            </div>
          </div>
        </section>

        {recent.length > 0 && (
          <section>
            <div className="mx-auto max-w-5xl px-6 py-12">
              <h2 className="font-display text-xl font-semibold">{tr("Önceki günler")}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map((d) => (
                  <Link
                    key={d.date}
                    href={`/gun-sonu/${d.date}`}
                    className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 transition-colors hover:border-signal"
                  >
                    <span className="text-sm text-text-on-ink">{formatDayLabel(d.date, trLocale())}</span>
                    <span
                      dir="ltr"
                      className="font-mono text-sm font-semibold tabular-stat"
                      style={{ color: d.total >= 0 ? "#22c55e" : "#e5484d" }}
                    >
                      {formatUsd(d.total, 0)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
