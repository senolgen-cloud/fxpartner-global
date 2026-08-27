"use client";
import { useTr } from "@/components/useTr";

import { useMemo, useState } from "react";
import {
  ACCOUNT_CURRENCIES,
  SUPPORTED_PAIRS,
  calculatePositionSizes,
  type AccountCurrency,
  type SupportedPair,
} from "@/lib/positionSize";

const RISK_BAR_COLOR = (pct: number) => {
  if (pct >= 85) return "bg-tick-up";
  if (pct >= 65) return "bg-signal";
  if (pct >= 45) return "bg-gold";
  return "bg-alert";
};

export default function PositionSizeCalculator({
  rates,
}: {
  rates: Record<AccountCurrency, number>;
}) {
  const tr = useTr();
  const [balance, setBalance] = useState("1000");
  const [currency, setCurrency] = useState<AccountCurrency>("USD");
  const [pair, setPair] = useState<SupportedPair>("EUR/USD");
  const [stopLoss, setStopLoss] = useState("20");

  const rows = useMemo(() => {
    const balanceNum = parseFloat(balance.replace(",", "."));
    const stopLossNum = parseFloat(stopLoss.replace(",", "."));
    if (!Number.isFinite(balanceNum) || balanceNum <= 0) return null;
    if (!Number.isFinite(stopLossNum) || stopLossNum <= 0) return null;
    return calculatePositionSizes({
      accountBalance: balanceNum,
      accountCurrency: currency,
      pair,
      stopLossPips: stopLossNum,
      rates,
    });
  }, [balance, currency, pair, stopLoss, rates]);

  const fieldClass =
    "mt-2 w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-sm text-text-on-ink outline-none transition-colors focus:border-signal";
  const labelClass = "font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted";

  return (
    <div className="rounded-2xl border border-hairline bg-ink-soft p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>Hesap Bakiyesi</label>
          <div className="mt-2 flex gap-2">
            <input
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-sm text-text-on-ink outline-none transition-colors focus:border-signal"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as AccountCurrency)}
              className="notranslate shrink-0 rounded-xl border border-hairline bg-ink px-3 py-3 text-sm text-text-on-ink outline-none transition-colors focus:border-signal"
            >
              {ACCOUNT_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>{tr("Parite")}</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value as SupportedPair)}
            className={`notranslate ${fieldClass}`}
          >
            {SUPPORTED_PAIRS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Stop Loss (pip)</label>
          <input
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            inputMode="decimal"
            className={fieldClass}
          />
        </div>

        <div className="flex items-end">
          <p className="text-xs leading-relaxed text-text-on-ink-muted">
            {tr("Kurlar canlı piyasa verisinden alınır (ECB referans kurları), birkaç dakikada bir güncellenir.")}
          </p>
        </div>
      </div>

      {!rows ? (
        <p className="mt-8 text-sm text-text-on-ink-muted">
          {tr("Geçerli bir hesap bakiyesi ve stop loss (pip) girin.")}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.riskPercent} className="rounded-2xl border border-hairline bg-ink p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-signal">
                  Risk %{r.riskPercent}
                </span>
                <span className="font-mono text-[11px] text-text-on-ink-muted">{tr(r.label)}</span>
              </div>

              <p className="mt-3 font-display text-2xl font-semibold text-text-on-ink">
                {r.lots >= 1
                  ? `${r.lots.toFixed(2)} lot`
                  : r.miniLots >= 1
                    ? `${r.miniLots.toFixed(2)} mini lot`
                    : `${r.microLots.toFixed(2)} mikro lot`}
              </p>
              <p className="mt-1 font-mono text-xs text-text-on-ink-muted">
                {Math.round(r.units).toLocaleString("en-US")} birim ·{" "}
                {r.lots.toFixed(2)} lot = {r.miniLots.toFixed(1)} mini = {r.microLots.toFixed(0)} mikro
              </p>

              <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-3">
                <span className="text-sm text-text-on-ink-muted">Riske edilen</span>
                <span className="font-mono text-sm font-semibold text-text-on-ink">
                  {r.riskAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} {currency} ·{" "}
                  {r.perPip.toLocaleString("en-US", { maximumFractionDigits: 2 })} {currency}/pip
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-text-on-ink-muted">
                  <span>{tr("10 üst üste kayıptan sonra bakiye")}</span>
                  <span className="font-mono font-semibold text-text-on-ink">
                    %{r.balanceAfter10LossesPercent.toFixed(0)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-soft">
                  <div
                    className={`h-full rounded-full ${RISK_BAR_COLOR(r.balanceAfter10LossesPercent)}`}
                    style={{ width: `${Math.max(2, r.balanceAfter10LossesPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
