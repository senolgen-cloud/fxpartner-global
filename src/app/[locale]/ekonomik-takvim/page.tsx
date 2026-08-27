import type { Metadata } from "next";
import Footer from "@/components/Footer";
import EconomicCalendarBoard from "@/components/EconomicCalendarBoard";
import MyfxbookCalendarWidget from "@/components/MyfxbookCalendarWidget";
import { getWeekCalendar } from "@/lib/economicCalendar";
import { breadcrumbSchema } from "@/lib/schema";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
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
    title: t["page.ekonomik-takvim.title"],
    description: t["page.ekonomik-takvim.description"],
    alternates: {
      canonical: localePath(locale, "/ekonomik-takvim"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/ekonomik-takvim")])
      ),
    },
  };
}

// Client-side polling (EconomicCalendarBoard) keeps this fresh after load;
// the initial render should still be a live fetch, not a build-time cache.
export const dynamic = "force-dynamic";

export default async function EconomicCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  let events: Awaited<ReturnType<typeof getWeekCalendar>> = [];
  try {
    events = await getWeekCalendar();
  } catch {
    // Board renders its own empty state; polling will pick it up once the
    // feed is reachable again.
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Economic Calendar", url: `${SITE_URL}/ekonomik-takvim` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Economic Calendar</span>
            <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {tr("Bu Haftanın Piyasa Verileri")}
            </h1>
            <p className="mt-4 max-w-2xl text-text-on-ink-muted">
              {tr("Orta ve yüksek önemdeki makroekonomik veriler — açıklanma saatinde gerçek rakamlarla otomatik güncellenir. Bildirim aboneleri, yüksek önemli veriler açıklandığı anda gerçekleşen/beklenti/önceki değerleriyle anında bildirim alır.")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <EconomicCalendarBoard initialEvents={events} />
        </section>

        {/* Myfxbook's calendar sits below our own board rather than in place
            of it. Our board is the feed /api/cron/economic-calendar-alert
            reads: swap it out and the page would show one set of figures
            while the channel's alerts quoted another. This is the second
            opinion — consensus and revisions our feed does not carry — and
            it is labelled as coming from elsewhere. */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="font-display text-xl font-semibold text-text-on-ink">
              {tr("Genişletilmiş takvim")}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              {tr("Aynı haftanın ikinci bir kaynaktan görünümü — beklenti ve revizyon detaylarıyla. Yukarıdaki tablo bizim kendi verimizdir ve bildirimlerimiz onu esas alır.")}
            </p>
            <div className="mt-6">
              <MyfxbookCalendarWidget />
            </div>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="font-mono text-xs leading-relaxed text-text-on-ink-muted">
              {tr("Veriler herkese açık ekonomik takvim kaynaklarından derlenir ve yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
