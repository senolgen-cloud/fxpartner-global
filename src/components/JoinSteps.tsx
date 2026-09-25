import Link from "@/components/LocaleLink";
import { tr, trf } from "@/lib/chrome";
import { PACKAGE_TIER_INFO } from "@/data/packageTiers";

// "Üç adımda başla" — the membership flow, stated once in the order a
// visitor actually walks it. The pricing grid above says what each package
// contains; nothing on the page said what a person DOES, in what order, or
// what they get for free without paying anything at all.
//
// The three steps are the real flow, not a marketing arc:
//   1. /account/register — the free account. Written carefully: FX signals
//      are public with no account at all (lib/signalAccess.ts), so the step
//      claims only what an account actually adds — push alerts and cashback
//      account linking. FREE_TIER_INFO carries the same warning.
//   2. The checkout on this page. NOWPayments crypto is the only rail; there
//      is no card path to imply (Stripe does not operate in Turkey).
//   3. What arrives afterwards.
//
// Prices come from PACKAGE_TIER_INFO rather than being typed here, so a
// price change in one place cannot leave this section advertising the old
// number.

function Step({
  n,
  title,
  body,
  href,
  cta,
  last,
}: {
  n: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-5 pb-10 last:pb-0">
      {/* The connecting line runs behind the numbers, stopping at the last
          one so the list does not trail off into nothing. */}
      {!last && (
        <span
          aria-hidden="true"
          className="absolute start-[22px] top-12 bottom-2 w-px bg-gradient-to-b from-signal/60 to-signal/10"
        />
      )}
      <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-signal/60 bg-ink font-mono text-sm font-semibold text-signal shadow-[0_0_24px_-8px_var(--color-signal)]">
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="font-display text-lg font-semibold text-text-on-ink md:text-xl">{title}</h3>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text-on-ink-muted">{body}</p>
        {href && cta && (
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 border-b border-signal/40 pb-0.5 text-sm font-medium text-signal transition-colors hover:border-signal"
          >
            {cta} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </li>
  );
}

export default function JoinSteps() {
  const pro = PACKAGE_TIER_INFO.pro;
  const vip = PACKAGE_TIER_INFO.vip;

  return (
    <section className="border-y border-hairline bg-ink-soft/40">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
          {tr("Nasıl Başlanır")}
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-text-on-ink md:text-4xl">
          {tr("Üç adımda üyelik")}
        </h2>

        <ol className="mt-10">
          <Step
            n="01"
            title={tr("Ücretsiz hesabını aç")}
            body={tr("Forex sinyalleri (EURUSD, GBPUSD, USDJPY…) giriş, stop ve hedef seviyeleriyle birlikte herkese açık — üyelik gerekmez. Ücretsiz hesap, sinyal açıldığı anda anlık bildirim almanı ve cashback için işlem hesabını bağlamanı sağlar.")}
            href="/account/register"
            cta={tr("Ücretsiz hesap aç")}
          />
          <Step
            n="02"
            title={tr("Paketini seç, kripto ile öde")}
            body={trf(
              "Pro ({proPrice} $/ay) GOLD, gümüş ve endeks sinyallerini, günlük teknik analizi ve Telegram VIP kanalını açar. VIP ({vipPrice} $/ay) bunlara kripto ve enerji sinyalleri ile CopyTrade erişimini ekler. Ödeme kripto para ile alınır; kart ile ödeme seçeneği yoktur.",
              { proPrice: pro.price, vipPrice: vip.price }
            )}
            href="#paketler"
            cta={tr("Paketleri karşılaştır")}
          />
          <Step
            n="03"
            title={tr("Sinyaller gelmeye başlasın")}
            body={tr("Sinyal açıldığı anda bildirim düşer; seviyeleri sitedeki panodan ve Telegram VIP kanalından takip edersin. Kurulum için MT5 ve broker desteği verilir. Kapanan her işlem, sonucuyla birlikte herkese açık geçmişte kalır — kazanç da kayıp da.")}
            href="/signals"
            cta={tr("Canlı sinyalleri gör")}
          />
        </ol>
      </div>
    </section>
  );
}
