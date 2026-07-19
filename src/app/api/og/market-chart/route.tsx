import { ImageResponse } from "next/og";
import { getCandles, SYMBOLS } from "@/lib/market-data";
import { sma, rsi } from "@/lib/technicals";

export const runtime = "edge";

const W = 1200;
const H = 630;
const CHART_X = 60;
// Relative to the chart container's own top edge (that div is already
// pushed down by the header/price rows via normal flow) — not a
// page-absolute offset.
const CHART_Y = 10;
const CHART_W = W - CHART_X * 2;
const CHART_H = 260;

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT_ON_INK = "#f1f2f3";
const TEXT_ON_INK_MUTED = "#9a9fa6";
const SIGNAL = "#2f6ff0";
const GOLD = "#c9a227";
const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get("symbol") ?? "BTCUSD";
  const config = SYMBOLS[symbolId];

  if (!config) {
    return new Response(`Unknown symbol: ${symbolId}`, { status: 400 });
  }

  const candles = await getCandles(symbolId);
  const closes = candles.map((c) => c[4]);
  const highs = candles.map((c) => c[2]);
  const lows = candles.map((c) => c[3]);

  const ma10 = sma(closes, 10);
  const ma20 = sma(closes, 20);
  const rsi14 = rsi(closes, 14);

  const last = closes.length - 1;
  const currentPrice = closes[last];
  const firstPrice = closes[0];
  const isUp = currentPrice >= firstPrice;
  const rsiValue = rsi14[last];
  const ma10Value = ma10[last];
  const ma20Value = ma20[last];

  const priceMin = Math.min(...lows);
  const priceMax = Math.max(...highs);
  const priceRange = priceMax - priceMin || 1;

  function yFor(price: number) {
    return CHART_Y + (1 - (price - priceMin) / priceRange) * CHART_H;
  }

  const n = candles.length;
  const slot = CHART_W / n;
  const bodyWidth = Math.max(3, slot * 0.55);

  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: config.decimals, minimumFractionDigits: config.decimals });

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: INK,
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 48px",
            borderBottom: `1px solid ${HAIRLINE}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: TEXT_ON_INK }}>
              FXPARTNER
              <span style={{ color: SIGNAL }}>.</span>
            </span>
            <span
              style={{
                fontSize: 15,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Piyasa Guncellemesi
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: TEXT_ON_INK,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {config.timeframeLabel}
          </div>
        </div>

        {/* Price row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "22px 48px 0",
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 700, color: TEXT_ON_INK }}>{config.label}</span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: isUp ? TICK_UP : TICK_DOWN,
            }}
          >
            ${fmt(currentPrice)}
          </span>
        </div>

        {/* Chart */}
        <div style={{ display: "flex", position: "relative", width: W, height: CHART_H + 40 }}>
          {candles.map((c, i) => {
            const [, o, h, l, cl] = c;
            const up = cl >= o;
            const color = up ? TICK_UP : TICK_DOWN;
            const cx = CHART_X + i * slot + slot / 2;
            const wickTop = yFor(h);
            const wickHeight = Math.max(1, yFor(l) - yFor(h));
            const bodyTop = yFor(Math.max(o, cl));
            const bodyHeight = Math.max(2, yFor(Math.min(o, cl)) - bodyTop);
            return (
              <div key={i} style={{ display: "flex" }}>
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: cx - 1,
                    top: wickTop,
                    width: 2,
                    height: wickHeight,
                    background: color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: cx - bodyWidth / 2,
                    top: bodyTop,
                    width: bodyWidth,
                    height: bodyHeight,
                    background: color,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "20px 48px 0",
          }}
        >
          {[
            { label: "MA10", value: ma10Value !== null ? fmt(ma10Value) : "-", color: SIGNAL },
            { label: "MA20", value: ma20Value !== null ? fmt(ma20Value) : "-", color: GOLD },
            {
              label: "RSI(14)",
              value: rsiValue !== null ? rsiValue.toFixed(1) : "-",
              color: GOLD,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: INK_SOFT,
                borderRadius: 12,
                padding: "14px 22px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                {stat.label}
              </span>
              <span style={{ fontSize: 26, fontWeight: 700, color: stat.color, marginTop: 4 }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 48px",
            marginTop: "auto",
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <span style={{ fontSize: 14, color: TEXT_ON_INK_MUTED }}>
            Kaynak: CoinGecko (gercek zamanli) · FXPARTNER tarafindan otomatik hesaplanmistir
          </span>
          <span style={{ fontSize: 15, color: TEXT_ON_INK, fontWeight: 600 }}>fxpartner.tr</span>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
