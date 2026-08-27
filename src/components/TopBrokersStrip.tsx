import Image from "next/image";
import Link from "@/components/LocaleLink";
import { brokers, getBrokerScores, type Broker } from "@/data/brokers";
import { getMonogram } from "@/lib/monogram";
import { tr, trf } from "@/lib/chrome";

// The top five by FXPARTNER Index score, as a card strip for the foot of a
// content page.
//
// WHAT IS ON THE CARD IS WHAT WE HAVE FOR ALL NINETEEN BROKERS. The layout
// this follows shows minimum deposit, commission and EUR/USD spread. We hold
// deposit for 19 of 19 but spread and commission only inside deepDive, which
// is filled in for 4 — so those two columns would be blank on the majority
// of any five we picked, and filling them from anywhere else would be
// publishing a cost figure we had not checked. Deposit, leverage and the
// Index score are the three every broker actually carries.
//
// The Index score is also the reason this is not just a copy of that layout:
// it is our own four-axis read, and it is what a reader gets here and
// nowhere else.

// Order is editorial only in that the axes and weights are ours — the
// ranking itself is derived, so this cannot drift from /brokerlar.
function topFive(): Broker[] {
  return [...brokers]
    .sort((a, b) => getBrokerScores(b).composite - getBrokerScores(a).composite)
    .slice(0, 5);
}

function BrokerMiniCard({ broker, rank }: { broker: Broker; rank: number }) {
  const score = getBrokerScores(broker).composite;

  return (
    <li className="flex w-[224px] shrink-0 snap-start flex-col rounded-2xl border border-hairline bg-ink-soft/40 p-4 md:w-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink p-2">
          {broker.logo ? (
            <Image src={broker.logo} alt="" fill sizes="48px" className="object-contain p-2" />
          ) : (
            <span
              className="font-display text-sm font-semibold text-text-on-ink"
              aria-hidden="true"
            >
              {getMonogram(broker.name)}
            </span>
          )}
        </div>
        {/* Rank, not a badge shouting "1". The order is already the order. */}
        <span className="font-mono text-[11px] tabular-stat text-text-on-ink-muted">
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-3 truncate font-poppins text-[15px] font-semibold text-text-on-ink">
        {broker.name}
      </h3>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-bold tabular-stat text-signal">
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
          {tr("Index")}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-[13px]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-text-on-ink-muted">{tr("Min. yatırım")}</dt>
          <dd className="font-mono tabular-stat text-text-on-ink">{broker.minDeposit}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-text-on-ink-muted">{tr("Kaldıraç")}</dt>
          <dd className="font-mono tabular-stat text-text-on-ink">{broker.maxLeverage}</dd>
        </div>
      </dl>

      {/* min-h-11 so the tap target clears 44px on a phone. */}
      <a
        href={broker.referralUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-signal px-4 text-sm font-semibold text-ink transition-colors hover:bg-signal-strong"
      >
        {tr("Canlı Hesap Aç")}
      </a>
      <Link
        href={`/brokers/${broker.slug}`}
        className="mt-2 text-center text-xs text-text-on-ink-muted underline-offset-4 transition-colors hover:text-text-on-ink hover:underline"
      >
        {tr("İnceleme")}
      </Link>
    </li>
  );
}

export default function TopBrokersStrip() {
  const five = topFive();

  return (
    <section className="rounded-2xl border border-hairline bg-ink p-5 text-text-on-ink md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {/* Not wrapped: this is the name of our scoring index, not copy.
              It was wrapped briefly and the translator returned "Індекс
              FXPARTNER" for Ukrainian — our own product name, half rendered
              into another language. The checker now knows it as a brand. */}
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
            FXPARTNER Index
          </span>
          <h2 className="mt-1.5 font-display text-xl font-semibold">
            {tr("En iyi 5 broker")}
          </h2>
        </div>
        <Link
          href="/brokerlar"
          className="text-sm text-text-on-ink-muted underline-offset-4 transition-colors hover:text-text-on-ink hover:underline"
        >
          {trf("{count} brokerin tamamı", { count: brokers.length })}
        </Link>
      </div>

      {/* Five cards do not fit across 375px and never will, so the phone
          scrolls them instead of stacking five full-width blocks that would
          push the end of the article a screen and a half further down.
          Snap points so a swipe lands on a card rather than between two. */}
      <ul className="-mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0">
        {five.map((broker, i) => (
          <BrokerMiniCard key={broker.slug} broker={broker} rank={i + 1} />
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-text-on-ink-muted">
        {tr("Sponsorlu bağlantılar. Sıralama, regülasyon, maliyet, platform ve para çekme eksenlerinden oluşan FXPARTNER Index puanına göredir; ortaklık geliri sıralamayı etkilemez.")}
      </p>
    </section>
  );
}
