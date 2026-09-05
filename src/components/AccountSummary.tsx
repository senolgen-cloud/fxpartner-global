"use client";

import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import {
  MIN_TRADES_FOR_RATE,
  SIGNALS_EPOCH,
  SIGNALS_START_BALANCE,
} from "@/lib/signalPeriods";

// The three boxes that state what the tracked account actually did: the
// balance, today, and this week — with the opening deposit and the reset
// date said out loud underneath.
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

/**
 * One period box.
 *
 * The win rate is shown only on the week, and only past
 * MIN_TRADES_FOR_RATE. Same rule the rest of the site applies: a rate over a
 * thin sample is noise dressed as evidence, and two winning trades in a day
 * reading as "%100 isabet" is exactly what everything else here avoids. The
 * day still gets counts and a realised figure — those are facts, not rates.
 */
function PeriodBox({
  label,
  totals,
  showRate,
}: {
  label: string;
  totals: PeriodTotals;
  showRate: boolean;
}) {
  const tr = useTr();
  const trf = useTrf();
  const positive = totals.profit >= 0;
  const rate = totals.trades > 0 ? Math.round((totals.wins / totals.trades) * 100) : 0;

  return (
    <div className="rounded-xl border border-hairline px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
        {label}
      </div>

      {totals.trades === 0 ? (
        // A day with no trades on it is not "+$0.00" — that reads as having
        // traded and come out level. Not trading is a different thing and is
        // written as one.
        <p className="mt-2 text-sm text-text-on-ink-muted">{tr("Kapanan işlem yok")}</p>
      ) : (
        <>
          <div
            className="mt-2 font-display text-3xl font-bold tabular-stat"
            style={{ color: positive ? TICK_UP : TICK_DOWN }}
          >
            {positive ? "+" : "−"}${Math.abs(totals.profit).toFixed(2)}
          </div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-xs text-text-on-ink-muted">
            <span>{trf("{count} işlem", { count: totals.trades })}</span>
            <span aria-hidden="true">·</span>
            <span>
              <span style={{ color: TICK_UP }}>{totals.wins}</span>
              <span> / </span>
              <span style={{ color: TICK_DOWN }}>{totals.losses}</span>
            </span>
            {showRate && totals.trades >= MIN_TRADES_FOR_RATE && (
              <>
                <span aria-hidden="true">·</span>
                <span>{trf("%{rate} isabet", { rate })}</span>
              </>
            )}
          </div>
        </>
      )}
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
 * THE PERCENTAGE IS DELIBERATELY GONE. It stood here as "+%364.15" —
 * arithmetically true, and the single most misreadable number on the
 * site: a return figure large enough that a reader takes it as what this
 * account does rather than as what one short stretch of it did, on a page
 * whose whole argument is that we do not oversell. The balance and the
 * deposit say the same thing without making the claim, and anyone who
 * wants the ratio has both numbers in front of them.
 *
 * The deposit line stays. That one is the disclosure rather than the
 * boast, and without it the balance means nothing at all.
 */
function BalanceBox({ realised }: { realised: number }) {
  const tr = useTr();
  const trf = useTrf();

  const balance = SIGNALS_START_BALANCE + realised;

  return (
    <div className="rounded-xl border border-hairline bg-ink-soft/40 px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
        {tr("Bakiye")}
      </div>
      <div className="mt-2 font-display text-3xl font-bold tabular-stat">
        ${balance.toFixed(2)}
      </div>
      <div className="mt-1.5 font-mono text-xs text-text-on-ink-muted">
        {trf("Başlangıç ${amount}", { amount: SIGNALS_START_BALANCE.toFixed(2) })}
      </div>
    </div>
  );
}

export default function AccountSummary({
  realised,
  today,
  week,
}: {
  realised: number;
  today: PeriodTotals;
  week: PeriodTotals;
}) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();
  const startedOn = new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(SIGNALS_EPOCH);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceBox realised={realised} />
        <PeriodBox label={tr("Bugün")} totals={today} showRate={false} />
        <PeriodBox label={tr("Bu Hafta")} totals={week} showRate />
      </div>
      {/* Said out loud, and never in smaller type than this. A track record
          that quietly starts somewhere is the thing readers are right to
          distrust, and the balance above is unreadable without the date and
          the deposit it grew from. */}
      <p className="mt-3 text-center text-[11px] text-text-on-ink-muted">
        {trf(
          "Bu kayıt {date} tarihinde ${amount} bakiyeyle başladı; öncesindeki işlemler bu tabloya dahil değildir.",
          { date: startedOn, amount: SIGNALS_START_BALANCE.toFixed(2) }
        )}
      </p>
    </div>
  );
}
