import type { Metadata } from "next";
import Footer from "@/components/Footer";
import EconomicCalendarBoard from "@/components/EconomicCalendarBoard";
import { getWeekCalendar } from "@/lib/economicCalendar";

export const metadata: Metadata = {
  title: "Economic Calendar | FXPARTNER",
  description:
    "Canlı ekonomik takvim — CPI, NFP, faiz kararları ve diğer önemli makroekonomik veriler, açıklandığı anda gerçek rakamlarla.",
  alternates: { canonical: "/ekonomik-takvim" },
};

// Client-side polling (EconomicCalendarBoard) keeps this fresh after load;
// the initial render should still be a live fetch, not a build-time cache.
export const dynamic = "force-dynamic";

export default async function EconomicCalendarPage() {
  let events: Awaited<ReturnType<typeof getWeekCalendar>> = [];
  try {
    events = await getWeekCalendar();
  } catch {
    // Board renders its own empty state; polling will pick it up once the
    // feed is reachable again.
  }

  return (
    <>
      <main className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Economic Calendar</span>
            <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Bu Haftanın Piyasa Verileri
            </h1>
            <p className="mt-4 max-w-2xl text-text-on-ink-muted">
              Orta ve yüksek önemdeki makroekonomik veriler — açıklanma saatinde gerçek rakamlarla otomatik
              güncellenir. Bildirim aboneleri, veri açıklandığı anda gerçekleşen/beklenti/önceki değerleriyle
              anında bildirim alır.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <EconomicCalendarBoard initialEvents={events} />
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="font-mono text-xs leading-relaxed text-text-on-ink-muted">
              Veriler herkese açık ekonomik takvim kaynaklarından derlenir ve yalnızca bilgilendirme amaçlıdır,
              yatırım tavsiyesi değildir.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
