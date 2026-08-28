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
function topByScore(count: number): Broker[] {
  return [...brokers]
    .sort((a, b) => getBrokerScores(b).composite - getBrokerScores(a).composite)
    .slice(0, count);
}

function BrokerMiniCard({ broker, rank }: { broker: Broker; rank: number }) {
  const score = getBrokerScores(broker).composite;

  return (
    // A ROW ON A PHONE, A COLUMN ABOVE IT.
    //
    // These scrolled horizontally at every width. On a desktop that is
    // right — five columns do not fit a 768px article. On a phone it hid
    // the thing it was showing: card two sat half off the screen and cards
    // three onward were behind a swipe most readers never make. Stacked,
    // every broker is simply there.
    //
    // Stacked does not mean the same tall card full width, which would be
    // 250px each and three of them a screen and a half. Laid out as a row —
    // mark, name and score, then the figures, then the action — a card is
    // about 150px and reads left to right like a table line.
    <li className="flex w-full shrink-0 snap-start flex-col rounded-2xl border border-hairline bg-ink-soft/40 p-3.5 sm:w-[228px] sm:p-4">
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink p-2 sm:h-12 sm:w-12">
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

        {/* Name and score share the row with the mark on a phone; above sm
            they drop under it as before. */}
        <div className="min-w-0 flex-1 sm:hidden">
          <h3 className="font-poppins text-[15px] font-semibold leading-snug text-text-on-ink">
            {broker.name}
          </h3>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold tabular-stat text-signal">
              {score.toFixed(1)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              {tr("Index")}
            </span>
          </div>
        </div>

        {/* Rank, not a badge shouting "1". The order is already the order. */}
        <span className="font-mono text-[11px] tabular-stat text-text-on-ink-muted">
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      {/* The column-layout name and score, hidden on the phone where they
          have already been shown beside the mark. Two lines rather than
          truncate: at the width this card gets above sm, truncate turned
          "MultiBank Group" into "MultiBank …" — a broker card that cannot
          say which broker it is. */}
      <h3 className="mt-3 hidden font-poppins text-[15px] font-semibold leading-snug text-text-on-ink sm:block">
        {broker.name}
      </h3>
      <div className="mt-1 hidden items-baseline gap-1.5 sm:flex">
        <span className="font-display text-2xl font-bold tabular-stat text-signal">
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
          {tr("Index")}
        </span>
      </div>

      {/* Label above value, not label-left/value-right. Side by side, "Min.
          yatırım" broke across two lines and left "$5" stranded on the first
          one. mt-auto pushes this down so the action sits on the same
          baseline across cards even when one name wraps. */}
      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-hairline pt-3 sm:mt-auto">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
            {tr("Min. yatırım")}
          </dt>
          <dd className="mt-0.5 font-mono text-[13px] tabular-stat text-text-on-ink">
            {broker.minDeposit}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
            {tr("Kaldıraç")}
          </dt>
          <dd className="mt-0.5 font-mono text-[13px] tabular-stat text-text-on-ink">
            {broker.maxLeverage}
          </dd>
        </div>
      </dl>

      {/* Side by side on a phone, where the row has width to spare and
          stacking them adds 40px to every card for nothing. */}
      <div className="mt-3 flex items-center gap-3 sm:mt-4 sm:block">
        <a
          href={broker.referralUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-signal px-3 text-[13px] font-semibold text-ink transition-colors hover:bg-signal-strong sm:w-full sm:flex-none"
        >
          {tr("Siteye Git")}
        </a>
        <Link
          href={`/brokers/${broker.slug}`}
          className="shrink-0 text-center text-xs text-text-on-ink-muted underline-offset-4 transition-colors hover:text-text-on-ink hover:underline sm:mt-2 sm:block sm:w-full"
        >
          {tr("İnceleme")}
        </Link>
      </div>
    </li>
  );
}

export default function TopBrokersStrip({ count = 5 }: { count?: number } = {}) {
  const shown = topByScore(count);

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
            {trf("En iyi {n} broker", { n: count })}
          </h2>
        </div>
        <Link
          href="/brokerlar"
          className="text-sm text-text-on-ink-muted underline-offset-4 transition-colors hover:text-text-on-ink hover:underline"
        >
          {trf("{count} brokerin tamamı", { count: brokers.length })}
        </Link>
      </div>

      {/* Scrolls at every width, and this is the correction of a real
          mistake. It used to become a five-column grid at md, which looked
          right in the abstract and was wrong in the article: the reading
          column is max-w-3xl, so five columns left each card about 140px.
          The names truncated to "MultiBank …", the deposit label broke away
          from its own figure, and the CTA wrapped to three lines inside a
          rounded-full — an ellipse, not a button. Five cards do not fit in
          768px any more than they fit in 375px. A strip that scrolls is
          honest at both, and snap points land a swipe on a card. */}
      <ul className="mt-5 flex flex-col gap-3 sm:-mx-5 sm:snap-x sm:snap-mandatory sm:flex-row sm:overflow-x-auto sm:px-5 sm:pb-2">
        {shown.map((broker, i) => (
          <BrokerMiniCard key={broker.slug} broker={broker} rank={i + 1} />
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-text-on-ink-muted">
        {tr("Sponsorlu bağlantılar. Sıralama, regülasyon, maliyet, platform ve para çekme eksenlerinden oluşan FXPARTNER Index puanına göredir; ortaklık geliri sıralamayı etkilemez.")}
      </p>
    </section>
  );
}
