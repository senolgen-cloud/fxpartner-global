"use client";

import { useEffect, useRef } from "react";

// Broker-side CFD names (GOLD, OILCASH, GER40CASH...) don't match any
// exchange's actual ticker, so they need explicit overrides — the generic
// OANDA:<pair> fallback below only works for real 6-letter FX pairs.
const SYMBOL_OVERRIDES: Record<string, string> = {
  GOLD: "OANDA:XAUUSD",
  XAUUSD: "OANDA:XAUUSD",
  SILVER: "OANDA:XAGUSD",
  XAGUSD: "OANDA:XAGUSD",
  OILCASH: "OANDA:WTICOUSD",
  USOIL: "OANDA:WTICOUSD",
  WTICOUSD: "OANDA:WTICOUSD",
  BRENTCASH: "OANDA:BCOUSD",
  UKOIL: "OANDA:BCOUSD",
  US100CASH: "OANDA:NAS100USD",
  US30CASH: "OANDA:US30USD",
  US500CASH: "OANDA:SPX500USD",
  GER40CASH: "OANDA:DE30EUR",
  UK100CASH: "OANDA:UK100GBP",
  JP225CASH: "OANDA:JP225USD",
};

// Maps our DB's plain pair strings (EURUSD, XAUUSD, BTCUSD...) to a
// TradingView ticker with an exchange prefix — TradingView's symbol search
// requires one, it won't resolve a bare "EURUSD". OANDA covers every major/
// minor FX pair under that prefix as-is; crypto pairs route to Binance's
// USDT market since that's what TradingView indexes most reliably for pairs
// like BTCUSD/ETHUSD; everything else falls back through SYMBOL_OVERRIDES.
function toTradingViewSymbol(pair: string): string {
  const p = pair.toUpperCase().replace(/[^A-Z]/g, "");
  if (SYMBOL_OVERRIDES[p]) return SYMBOL_OVERRIDES[p];
  if (/^(BTC|ETH|XRP|SOL|BNB|DOGE|ADA)/.test(p)) {
    const base = p.replace(/USD$/, "");
    return `BINANCE:${base}USDT`;
  }
  return `OANDA:${p}`;
}

// Embeds TradingView's free "Advanced Chart" widget — no API key, just their
// public embed script. The script tag's own JSON body (not a prop/attribute)
// is how TradingView's embed accepts config, so it's built and injected
// manually rather than rendered as JSX. Re-injected on every symbol change
// since the widget has no public API to swap symbols after mount.
export default function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '<div class="tradingview-widget-container__widget h-full w-full"></div>';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol: toTradingViewSymbol(symbol),
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "tr",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: true,
      withdateranges: true,
      save_image: false,
      backgroundColor: "rgba(10, 13, 18, 1)",
      gridColor: "rgba(255, 255, 255, 0.06)",
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container h-[420px] w-full overflow-hidden rounded-2xl border border-hairline sm:h-[520px]"
      ref={containerRef}
    />
  );
}
