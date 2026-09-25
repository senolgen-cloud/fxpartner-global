"use client";

import { useMemo, useState } from "react";
import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import { requiredTierForPair } from "@/lib/signalAccess";
import { MIN_TRADES_FOR_RATE, SIGNAL_TZ } from "@/lib/signalPeriods";

// "What would $100 have become?" — the closed-signal history replayed on a
// starting balance the reader chooses.
//
// WHY PER-LOT AND NOT THE DOLLAR COLUMN. The board's realised P/L is what the
// tracked account actually made, at the lot size it actually used — and those
// range from 0.10 to 10 lots. Summing them onto a $100 balance would be
// claiming a $100 account could have opened a 10-lot position. So every trade
// is normalised to its per-lot result (profit ÷ volume) and re-multiplied by
// the lot size the reader picks. The same trap, in the other direction, is
// documented in PipsStats: scaling small-lot trades up to 1 lot once inflated
// a window by $5,518.
//
// WHAT IT DOES NOT MODEL, and says so on the page: commission, swap, slippage,
// and the margin a position ties up. It also assumes every signal was taken,
// at the signal's own entry and exit. It is a replay of a published record,
// not a promise — which is why the wipe-out case is computed and shown rather
// than hidden: at a lot size a small balance cannot carry, the honest answer
// is "this account would have been wiped out on <date>", and a reader who
// only ever sees the good number has been sold something.
//
// The free/all toggle is the other half of the honesty: GOLD and indices are
// Pro-tier, so a free reader's result is NOT the headline result. Showing
// both is both fairer and a better argument for the package than a single
// blended figure.

export type SimTrade = {
  closedAt: Date;
  pair: string;
  perLot: number;
};

const BALANCE_PRESETS = [100, 500, 1000, 5000];
const LOT_PRESETS = [0.01, 0.05, 0.1, 0.5];

export default function SignalFollowSimulator({ trades }: { trades: SimTrade[] }) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();

  const [balance, setBalance] = useState(100);
  const [lot, setLot] = useState(0.01);
  const [freeOnly, setFreeOnly] = useState(false);

  const pool = useMemo(
    () => (freeOnly ? trades.filter((t) => requiredTierForPair(t.pair) === "free") : trades),
    [trades, freeOnly]
  );

  const sim = useMemo(() => {
    let equity = balance;
    let low = balance;
    let peak = balance;
    let maxDd = 0;
    let wins = 0;
    let wipedAt: Date | null = null;
    let taken = 0;

    for (const t of pool) {
      const pnl = t.perLot * lot;
      equity += pnl;
      taken += 1;
      if (pnl > 0) wins += 1;
      if (equity < low) low = equity;
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? (peak - equity) / peak : 0;
      if (dd > maxDd) maxDd = dd;
      // A margin account cannot go below zero on the site's brokers (negative
      // balance protection), and it cannot keep trading from zero either.
      if (equity <= 0) {
        equity = 0;
        wipedAt = t.closedAt;
        break;
      }
    }

    return {
      equity,
      low,
      maxDd,
      wins,
      taken,
      wipedAt,
      profit: equity - balance,
      pct: balance > 0 ? ((equity - balance) / balance) * 100 : 0,
    };
  }, [pool, balance, lot]);

  const first = pool[0]?.closedAt;
  const last = pool[pool.length - 1]?.closedAt;
  const money = (v: number) =>
    `$${v.toLocaleString(intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (d: Date) =>
    d.toLocaleDateString(intl, { day: "numeric", month: "long", year: "numeric", timeZone: SIGNAL_TZ });
  const pct = (v: number) =>
    `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString(intl, { maximumFractionDigits: 1 })}%`;

  const up = sim.profit >= 0 && !sim.wipedAt;
  const fieldClass =
    "h-11 w-full rounded-xl border border-hairline bg-ink px-3 text-[15px] font-medium text-text-on-ink outline-none transition-colors focus:border-signal";
  const chipClass = (on: boolean) =>
    `h-8 rounded-full px-3 font-mono text-[11px] transition-colors ${
      on ? "bg-signal text-on-signal" : "bg-ink text-text-on-ink-muted hover:text-text-on-ink"
    }`;

  if (trades.length === 0) return null;

  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
        {tr("Takip Etseydiniz")}
      </span>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-on-ink-muted">
        {tr("Yayınlanmış kapanmış sinyallerin hepsini sabit lotla alsaydınız bakiyeniz ne olurdu? Her işlemin sonucu kendi lotuna bölünüp sizin seçtiğiniz lotla yeniden çarpılıyor; komisyon, swap ve kayma hesaba katılmıyor.")}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[repeat(2,minmax(0,1fr))_auto]">
        <div>
          <label
            htmlFor="sim-balance"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted"
          >
            {tr("Başlangıç bakiyesi ($)")}
          </label>
          <input
            id="sim-balance"
            type="number"
            min={10}
            max={1000000}
            step={10}
            value={balance}
            onChange={(e) => setBalance(Math.max(10, Math.min(1_000_000, Number(e.target.value) || 0)))}
            className={`mt-1.5 ${fieldClass}`}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BALANCE_PRESETS.map((b) => (
              <button key={b} type="button" onClick={() => setBalance(b)} className={chipClass(balance === b)}>
                ${b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="sim-lot"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted"
          >
            {tr("İşlem başına lot")}
          </label>
          <input
            id="sim-lot"
            type="number"
            min={0.01}
            max={100}
            step={0.01}
            value={lot}
            onChange={(e) => setLot(Math.max(0.01, Math.min(100, Number(e.target.value) || 0.01)))}
            className={`mt-1.5 ${fieldClass}`}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LOT_PRESETS.map((l) => (
              <button key={l} type="button" onClick={() => setLot(l)} className={chipClass(lot === l)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="md:self-start">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            {tr("Hangi sinyaller")}
          </span>
          <div className="mt-1.5 flex h-11 items-center gap-1 rounded-xl border border-hairline p-1">
            <button
              type="button"
              onClick={() => setFreeOnly(false)}
              className={`h-9 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                !freeOnly ? "bg-signal text-on-signal" : "text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {tr("Tümü")}
            </button>
            <button
              type="button"
              onClick={() => setFreeOnly(true)}
              className={`h-9 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                freeOnly ? "bg-signal text-on-signal" : "text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {tr("Ücretsiz forex")}
            </button>
          </div>
        </div>
      </div>

      {sim.taken === 0 ? (
        <p className="mt-5 text-sm text-text-on-ink-muted">
          {tr("Bu seçimde kapanmış sinyal yok.")}
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
            <div className="bg-ink/60 px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Bugünkü bakiye")}
              </div>
              <div
                dir="ltr"
                className="mt-1 font-display text-2xl font-bold tabular-stat rtl:text-end"
                style={{ color: up ? "#22c55e" : "#e5484d" }}
              >
                {money(sim.equity)}
              </div>
            </div>
            <div className="bg-ink/60 px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Getiri")}
              </div>
              <div
                dir="ltr"
                className="mt-1 font-display text-xl font-semibold tabular-stat rtl:text-end"
                style={{ color: up ? "#22c55e" : "#e5484d" }}
              >
                {pct(sim.pct)}
              </div>
            </div>
            <div className="bg-ink/60 px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("En derin düşüş")}
              </div>
              <div dir="ltr" className="mt-1 font-display text-xl font-semibold tabular-stat text-gold rtl:text-end">
                −{sim.maxDd.toLocaleString(intl, { style: "percent", maximumFractionDigits: 1 })}
              </div>
            </div>
            <div className="bg-ink/60 px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("İşlem")}
              </div>
              <div className="mt-1 font-display text-xl font-semibold tabular-stat text-text-on-ink">
                {sim.taken}
                <span className="ms-2 font-mono text-[11px] text-text-on-ink-muted">
                  {Math.round((sim.wins / sim.taken) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Same bar the win rate has to clear (MIN_TRADES_FOR_RATE): the
              free-tier pool can be five trades, and five winners in a row
              produce a return figure that says nothing about the next five.
              The site refuses to publish a rate off a sample like that, so
              it should not publish a return off one silently either. */}
          {sim.taken < MIN_TRADES_FOR_RATE && (
            <p className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-text-on-ink">
              {trf(
                "Bu seçimde yalnızca {count} kapanmış işlem var. Bu kadar küçük bir örneklem bir sonuç değil, tesadüf de olabilir — {min} işlemin altındaki getiriyi ölçü olarak kullanmayın.",
                { count: sim.taken, min: MIN_TRADES_FOR_RATE }
              )}
            </p>
          )}

          {sim.wipedAt ? (
            // The number that matters more than the headline: at this lot size
            // the balance did not survive the record. Never suppressed.
            <p className="mt-3 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm leading-relaxed text-text-on-ink">
              {trf(
                "Bu lot büyüklüğünde hesap {date} tarihinde sıfırlanırdı — {taken}. işlemde. Daha küçük lot ya da daha yüksek başlangıç bakiyesi deneyin; bu, sinyallerin değil pozisyon büyüklüğünün sonucudur.",
                { date: date(sim.wipedAt), taken: sim.taken }
              )}
            </p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
              {trf(
                "{first} – {last} arasında yayınlanmış {count} kapanmış sinyal, işlem başına sabit {lot} lot. En düşük bakiye {low}. Komisyon, swap, kayma ve teminat gereksinimi hesaba katılmadı; her sinyalin yayınlandığı seviyeden alınıp kapandığı seviyede kapatıldığı varsayıldı. Geçmiş performans gelecekteki sonuçların garantisi değildir.",
                {
                  first: first ? date(first) : "",
                  last: last ? date(last) : "",
                  count: sim.taken,
                  lot: lot.toLocaleString(intl, { maximumFractionDigits: 2 }),
                  low: money(sim.low),
                }
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}
