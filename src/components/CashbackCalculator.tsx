"use client";

import { useState } from "react";
import { useIntlLocale, useTr, useTrf } from "@/components/useTr";

// The rebate calculator on /cashback.
//
// It answers the one question the rate list cannot: "what does that rate come
// to for someone who trades like me?" A rate per lot is an abstraction until
// it is multiplied by a month of trading, and a reader who cannot do that
// multiplication in their head reads "5 $ per lot" as small.
//
// Three deliberate choices about honesty, because this is a number a visitor
// may plan around:
//
//   1. The rate is an INPUT, not a promise. The page's own rate rows carry
//      "tahmini" badges where the rate is unconfirmed (src/data/cashback.ts),
//      so a calculator that silently hardcoded one would be publishing a
//      commitment the site is careful not to make. The presets are the
//      shapes our own XM article uses (2/3/5 $) and are labelled examples.
//   2. Trading days are fixed at 21 and said out loud, rather than hidden in
//      the arithmetic or exposed as a fourth input nobody wants to set.
//   3. The pip line reframes the result as what it actually is — a cost
//      reduction, not profit. "Nakit iadesi kâr değildir; maliyet
//      geri dönüşüdür" is the line the XM cashback post ends on, and a
//      calculator that prints a big yearly figure without it is selling
//      something the article spends a section walking back.
//
// Client component: it is a form with live output, and the whole /cashback
// page around it stays a server component.

const TRADING_DAYS = 21;
// 1 standard lot ≈ $10 per pip on a USD-quoted major. Only used for the
// "what this means per pip" line, never for the money figures.
const USD_PER_PIP_PER_LOT = 10;

const RATE_PRESETS = [2, 3, 5];
const LOT_PRESETS = [0.01, 0.1, 0.5, 1];
// Typical all-in cost of one standard lot — 1.0 pip on a USD-quoted major.
// Only the starting value of an input the reader can change.
const DEFAULT_COST_PER_LOT = 10;

export default function CashbackCalculator({
  // A broker page passes the shape ITS rate is quoted in (see
  // CashbackProgram.calcMode): a dollar amount per lot, or a share of what
  // the trade already costs. /cashback covers every program at once and so
  // opens on the per-lot form.
  mode = "perLot",
  initialRate,
}: {
  mode?: "perLot" | "percent";
  initialRate?: number;
} = {}) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();

  const [ratePerLot, setRatePerLot] = useState(mode === "perLot" ? (initialRate ?? 3) : 3);
  const [percent, setPercent] = useState(mode === "percent" ? (initialRate ?? 30) : 30);
  const [costPerLot, setCostPerLot] = useState(DEFAULT_COST_PER_LOT);
  const [lotSize, setLotSize] = useState(0.1);
  const [tradesPerDay, setTradesPerDay] = useState(5);

  // Both modes end up as dollars per lot; only the way there differs.
  const effectiveRate = mode === "percent" ? (costPerLot * percent) / 100 : ratePerLot;

  const monthlyLots = lotSize * tradesPerDay * TRADING_DAYS;
  const monthly = monthlyLots * effectiveRate;
  const yearly = monthly * 12;
  const pipsPerLot = effectiveRate / USD_PER_PIP_PER_LOT;

  const money = (v: number) =>
    `$${v.toLocaleString(intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const lots = (v: number) =>
    v.toLocaleString(intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fieldClass =
    "h-11 w-full rounded-xl border border-hairline-light bg-paper-high px-3 text-[15px] font-medium text-text-dark outline-none transition-colors focus:border-signal";
  const chipClass = (on: boolean) =>
    `h-8 rounded-full px-3 font-mono text-[11px] transition-colors ${
      on
        ? "bg-ink text-text-on-ink"
        : "bg-hairline-light/70 text-text-muted hover:bg-hairline-light"
    }`;

  return (
    <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6 md:p-8">
      <h3 className="font-poppins text-lg font-semibold text-text-dark">
        {tr("İade Hesaplayıcı")}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {tr("Kendi işlem temponuzu girin, iadenin ayda ve yılda ne ettiğini görün. Oran hesap türüne, enstrümana ve aylık hacminize göre değişir; buradaki rakamlar örnek hesaptır, taahhüt değildir.")}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {mode === "percent" ? (
          <div>
            <label
              htmlFor="cb-percent"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted"
            >
              {tr("İade oranı (%)")}
            </label>
            <input
              id="cb-percent"
              type="number"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => setPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className={`mt-1.5 ${fieldClass}`}
            />
            <label
              htmlFor="cb-cost"
              className="mt-3 block font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted"
            >
              {tr("Lot başına maliyet ($)")}
            </label>
            <input
              id="cb-cost"
              type="number"
              min={0}
              max={200}
              step={0.5}
              value={costPerLot}
              onChange={(e) => setCostPerLot(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
              className={`mt-1.5 ${fieldClass}`}
            />
            <p className="mt-2 font-mono text-[11px] text-text-muted">
              {trf("≈ lot başına {rate} iade", { rate: money(effectiveRate) })}
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="cb-rate"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted"
            >
              {tr("Lot başına iade ($)")}
            </label>
            <input
              id="cb-rate"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={ratePerLot}
              onChange={(e) => setRatePerLot(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
              className={`mt-1.5 ${fieldClass}`}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RATE_PRESETS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRatePerLot(r)}
                  className={chipClass(ratePerLot === r)}
                >
                  ${r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="cb-lot"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted"
          >
            {tr("Ortalama lot büyüklüğü")}
          </label>
          <input
            id="cb-lot"
            type="number"
            min={0.01}
            max={100}
            step={0.01}
            value={lotSize}
            onChange={(e) => setLotSize(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            className={`mt-1.5 ${fieldClass}`}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LOT_PRESETS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLotSize(l)}
                className={chipClass(lotSize === l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="cb-trades"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted"
          >
            {tr("Günlük işlem sayısı")}
          </label>
          <input
            id="cb-trades"
            type="number"
            min={0}
            max={200}
            step={1}
            value={tradesPerDay}
            onChange={(e) =>
              setTradesPerDay(Math.max(0, Math.min(200, Math.round(Number(e.target.value) || 0))))
            }
            className={`mt-1.5 ${fieldClass}`}
          />
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={Math.min(40, tradesPerDay)}
            onChange={(e) => setTradesPerDay(Number(e.target.value))}
            aria-label={tr("Günlük işlem sayısı")}
            className="mt-3 w-full accent-signal"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-hairline-light bg-hairline-light sm:grid-cols-3">
        <div className="bg-paper-high px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
            {tr("Aylık hacim")}
          </div>
          <div className="mt-1 font-poppins text-xl font-semibold text-text-dark">
            {trf("{lots} lot", { lots: lots(monthlyLots) })}
          </div>
        </div>
        <div className="bg-paper-high px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
            {tr("Aylık iade")}
          </div>
          <div dir="ltr" className="mt-1 font-poppins text-xl font-semibold text-tick-up rtl:text-end">
            {money(monthly)}
          </div>
        </div>
        <div className="bg-paper-high px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
            {tr("Yıllık iade")}
          </div>
          <div dir="ltr" className="mt-1 font-poppins text-2xl font-bold text-tick-up rtl:text-end">
            {money(yearly)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        {trf(
          "Hesap: {lot} lot × günde {trades} işlem × ayda {days} işlem günü. Lot başına {rate} iade, 1 lotta 1 pip ≈ 10 $ varsayımıyla işlem maliyetinizi yaklaşık {pips} pip düşürür — nakit iadesi kâr değil, maliyet geri dönüşüdür ve kaybettiğiniz işlemde de ödenir.",
          {
            lot: lots(lotSize),
            trades: tradesPerDay,
            days: TRADING_DAYS,
            rate: money(effectiveRate),
            pips: pipsPerLot.toLocaleString(intl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          }
        )}
      </p>
    </div>
  );
}
