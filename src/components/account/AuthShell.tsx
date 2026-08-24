import { tr } from "@/lib/chrome";
import { trf } from "@/lib/chrome";
import { brokers } from "@/data/brokers";
import { getRecentSignalStats } from "@/lib/signalStats";
import { formatPercent } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";

// The split panel behind /account/login and /account/register.
//
// The reference we were pointed at (fxleaders.com/account/login) fills its
// left half with screenshots of its own product — a picture of a dashboard,
// arrows drawn on top, "COMING SOON" over one of them. It is a mockup, and a
// reader can tell.
//
// We have something a mockup cannot be: the numbers are real and already on
// the site. Closed trades and the hit rate come out of the same table
// /signals renders, over the same 30-day window, with breakeven closes
// excluded the same way. If the last month went badly, this panel says so.
// That is the whole argument for signing up, and inventing it would destroy
// the only thing that makes it worth reading.
//
// When there are too few closed trades to be meaningful, getRecentSignalStats
// returns null and the numbers are simply absent rather than padded out.

export default async function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const stats = await getRecentSignalStats("all", 30);
  const locale = getServerLocale();
  const trackedBrokers = brokers.length;

  return (
    <main className="relative flex-1 overflow-hidden bg-ink">
      <div
        className="pointer-events-none absolute -top-40 -left-32 h-[560px] w-[560px] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--signal) 22%, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-24 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--signal) 12%, transparent)" }}
      />

      <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-20">
        <div className="grid overflow-hidden rounded-[32px] border border-hairline-light/70 bg-ink-soft shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] lg:grid-cols-[0.92fr_1.08fr]">
          {/* Proof side. Second in the DOM on purpose: on a phone the form is
              what the reader came for, and the argument can wait below it. */}
          <div className="order-2 border-t border-hairline bg-gradient-to-b from-ink to-ink-soft p-8 lg:order-1 lg:border-t-0 lg:border-r lg:p-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
              {tr("Gerçek hesap, gerçek sonuç")}
            </span>

            {stats ? (
              <>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-bold tabular-stat text-text-on-ink">
                    {formatPercent(stats.winRate, locale)}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {tr("isabet")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                  {trf("Son {days} günde kapanan {trades} işlem üzerinden. Başabaş kapanışlar sayılmaz.", {
                    days: stats.windowDays,
                    trades: stats.trades,
                  })}
                </p>
              </>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-text-on-ink-muted">
                {tr("Sinyaller, takip edilen gerçek bir MT5 hesabından yayınlanır. Her işlemin sonucu kapandığında olduğu gibi görünür.")}
              </p>
            )}

            <ul className="mt-8 space-y-4 border-t border-hairline pt-8">
              {[
                tr("Her sinyal takip edilen gerçek bir MT5 hesabından — simülasyon değil, geriye dönük test değil."),
                trf("{count} broker aynı dört kriterle bağımsız olarak puanlanır; ticari ilişkimiz olanlar açıkça etiketlenir.", {
                  count: trackedBrokers,
                }),
                tr("Kaybeden işlemler de yayında kalır. Sonradan hiçbir sonuç kaldırılmaz."),
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-text-on-ink-muted">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                  {line}
                </li>
              ))}
            </ul>

            <p className="mt-8 font-mono text-[11px] leading-relaxed text-text-on-ink-muted/70">
              {tr("Kaldıraçlı işlemler yüksek risk taşır. Geçmiş sonuçlar gelecek sonuçları garanti etmez.")}
            </p>
          </div>

          {/* Form side */}
          <div className="order-1 p-8 sm:p-10 lg:order-2 lg:p-14">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-on-ink-muted">
              {eyebrow}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-text-on-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-text-on-ink-muted">{intro}</p>

            {children}

            <div className="mt-8 border-t border-hairline pt-6 text-center text-xs leading-relaxed text-text-on-ink-muted">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
