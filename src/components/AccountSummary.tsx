"use client";

import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import {
  MIN_TRADES_FOR_RATE,
  SIGNALS_EPOCH,
  SIGNALS_START_BALANCE,
} from "@/lib/signalPeriods";

// What the tracked account actually did: where it stands, and how it got
// there over the day, the week and the month — with the opening deposit and
// the reset date said out loud underneath.
//
// PURE PRESENTATION, ON PURPOSE. It was lifted out of SignalsBoard because
// the home page wanted the same strip, and the two pages cannot get their
// numbers the same way: /signals adds up the rows it is already polling, so
// the figures move without a round trip, while the home page reads a
// server-side aggregate over the whole record rather than shipping a few
// hundred rows to add them in the browser. Taking the numbers as props is
// what lets one design serve both — the markup exists once, and neither
// page can drift into showing the balance differently from the other.
//
// The one thing it does compute is the one that is a constant rather than
// data: the balance is the opening deposit plus everything realised.
// Taking it as a prop instead would let a caller state a balance that does
// not follow from the record.

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";

export type PeriodTotals = {
  trades: number;
  wins: number;
  losses: number;
  profit: number;
};

/** A label in the small mono caps every box shares. */
function BoxLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
      {children}
    </div>
  );
}

/**
 * One period box.
 *
 * EVERY BOX KEEPS THE SAME THREE ROWS whether or not it has trades in it —
 * label, figure, detail. A day with nothing closed used to render only a
 * grey sentence where the other boxes had a 30px number, so the row's
 * baseline went ragged and the empty box read as broken rather than as
 * quiet. It now shows an em dash in the figure slot: the same shape, saying
 * nothing happened.
 *
 * It is still not "+$0.00" — that reads as having traded and come out level,
 * which is a different fact and usually a worse day than not trading.
 *
 * The win rate is shown only past MIN_TRADES_FOR_RATE. Same rule the rest of
 * the site applies: a rate over a thin sample is noise dressed as evidence,
 * and two winning trades in a day reading as "%100 isabet" is exactly what
 * everything else here avoids.
 */
function PeriodBox({
  label,
  caption,
  totals,
}: {
  label: string;
  /** An optional second line on the label — the month names itself. */
  caption?: string;
  totals: PeriodTotals;
}) {
  const tr = useTr();
  const trf = useTrf();
  const empty = totals.trades === 0;
  const positive = totals.profit >= 0;
  const rate = totals.trades > 0 ? Math.round((totals.wins / totals.trades) * 100) : 0;

  return (
    <div className="rounded-2xl border border-hairline bg-ink-soft/25 px-5 py-4">
      <BoxLabel>
        <span>{label}</span>
        {caption && (
          <span className="font-mono text-[9px] normal-case tracking-[0.08em] text-text-on-ink-muted/70">
            {caption}
          </span>
        )}
      </BoxLabel>

      <div
        className="mt-2 font-display text-[1.75rem] font-bold leading-tight tabular-stat"
        style={{ color: empty ? undefined : positive ? TICK_UP : TICK_DOWN }}
      >
        {empty ? (
          <span className="text-text-on-ink-muted/50">—</span>
        ) : (
          <>
            {positive ? "+" : "−"}${Math.abs(totals.profit).toFixed(2)}
          </>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-text-on-ink-muted">
        {empty ? (
          <span>{tr("Kapanan işlem yok")}</span>
        ) : (
          <>
            <span>{trf("{count} işlem", { count: totals.trades })}</span>
            <span aria-hidden="true">·</span>
            <span>
              <span style={{ color: TICK_UP }}>{totals.wins}</span>
              <span> / </span>
              <span style={{ color: TICK_DOWN }}>{totals.losses}</span>
            </span>
            {totals.trades >= MIN_TRADES_FOR_RATE && (
              <>
                <span aria-hidden="true">·</span>
                <span>{trf("%{rate} isabet", { rate })}</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The balance, stated rather than implied.
 *
 * Every other figure here is a delta, and a delta says nothing without the
 * size of the account it was made on: the same +$24 is a good day on $1,000
 * and a rounding error on an account whose size was never given. So the
 * opening deposit sits beside the balance.
 *
 * It is also the only cumulative number in the row, which is why it gets the
 * wider cell and the brighter surface — the three beside it answer "how did
 * this week go", and this one answers "where does the account stand". Giving
 * all four the same weight made the reader work out which was which.
 *
 * THE PERCENTAGE IS DELIBERATELY GONE. It stood here as "+%364.15" —
 * arithmetically true, and the single most misreadable number on the site: a
 * return figure large enough that a reader takes it as what this account
 * does rather than as what one short stretch of it did, on a page whose
 * whole argument is that we do not oversell. The balance and the deposit say
 * the same thing without making the claim, and anyone who wants the ratio
 * has both numbers in front of them.
 *
 * The deposit line stays. That one is the disclosure rather than the boast,
 * and without it the balance means nothing at all.
 */
function BalanceBox({ realised }: { realised: number }) {
  const tr = useTr();
  const trf = useTrf();

  const balance = SIGNALS_START_BALANCE + realised;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-signal/25 bg-gradient-to-br from-ink-soft/80 to-ink-soft/20 px-5 py-4">
      {/* A single soft light behind the number this row is built around.
          Pointer-events off and aria-hidden: it is atmosphere, not content. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-signal/10 blur-3xl"
      />
      <div className="relative">
        <BoxLabel>
          <span>{tr("Bakiye")}</span>
        </BoxLabel>
        <div className="mt-2 font-display text-[2rem] font-bold leading-tight tabular-stat text-text-on-ink">
          ${balance.toFixed(2)}
        </div>
        <div className="mt-1.5 font-mono text-[11px] text-text-on-ink-muted">
          {trf("Başlangıç ${amount}", { amount: SIGNALS_START_BALANCE.toFixed(2) })}
        </div>
      </div>
    </div>
  );
}

export default function AccountSummary({
  realised,
  today,
  week,
  month,
  monthStart,
}: {
  realised: number;
  today: PeriodTotals;
  week: PeriodTotals;
  month: PeriodTotals;
  /** Midnight on the 1st, in SIGNAL_TZ — the month names itself from this. */
  monthStart: number;
}) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();

  const fmt = (value: number | Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intl, { ...opts, timeZone: "Europe/Istanbul" }).format(value);

  const startedOn = fmt(SIGNALS_EPOCH, { day: "numeric", month: "long", year: "numeric" });
  // "Eylül 2026", in the reader's own locale, derived from the boundary the
  // month column is actually counting from rather than typed anywhere.
  const monthName = fmt(monthStart, { month: "long", year: "numeric" });

  return (
    <div>
      {/* The balance is one-and-a-bit cells wide from lg up, the three
          windows share the rest. Below that the four wrap two-by-two, which
          keeps the balance top-left where it is read first; on a phone they
          stack in the order they are read: where we stand, then today, this
          week, this month. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:gap-4">
        <BalanceBox realised={realised} />
        <PeriodBox label={tr("Bugün")} totals={today} />
        <PeriodBox label={tr("Bu Hafta")} totals={week} />
        <PeriodBox label={tr("Bu Ay")} caption={monthName} totals={month} />
      </div>

      {/* Said out loud, and never in smaller type than this. A track record
          that quietly starts somewhere is the thing readers are right to
          distrust, and the balance above is unreadable without the date and
          the deposit it grew from. */}
      <p className="mx-auto mt-4 max-w-2xl text-center text-[11px] leading-relaxed text-text-on-ink-muted">
        {trf(
          "Bu kayıt {date} tarihinde ${amount} bakiyeyle başladı; öncesindeki işlemler bu tabloya dahil değildir.",
          { date: startedOn, amount: SIGNALS_START_BALANCE.toFixed(2) }
        )}
      </p>
    </div>
  );
}
