import { ImageResponse } from "next/og";
import {
  INK,
  INK_SOFT,
  HAIRLINE,
  TEXT_ON_INK,
  TEXT_ON_INK_MUTED,
  SIGNAL,
  TICK_UP,
  TICK_DOWN,
  SIGNAL_GLOW,
  SITE_QR_DATA_URI,
  LOGO_DATA_URI,
} from "@/lib/ogAssets";
import { splitPair, ShieldIcon, SearchIcon, ChartIcon, UsersIcon, CandlesIcon, CopyTradeIcon, CapIcon, HeadsetIcon, Feature, FooterItem } from "@/lib/ogIcons";

export const runtime = "edge";

const W = 1200;
const H = 630;

type Outcome = "WIN" | "LOSS" | "BE";

// Same 0-means-not-real convention as /api/og/trade-signal.
const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;

function resolveOutcome(
  outcomeParam: string | null,
  pips: string | null,
  profit: string | null
): Outcome | null {
  const fromParam = outcomeParam?.toUpperCase();
  if (fromParam === "WIN" || fromParam === "LOSS" || fromParam === "BE") return fromParam;
  const n = pips !== null ? parseFloat(pips) : profit !== null ? parseFloat(profit) : NaN;
  if (Number.isNaN(n)) return null;
  if (n > 0) return "WIN";
  if (n < 0) return "LOSS";
  return "BE";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const close = searchParams.get("close");
  const pips = searchParams.get("pips");
  const profit = searchParams.get("profit");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair || !entry || !close) {
    return new Response("Missing required params: pair, entry, close", { status: 400 });
  }

  const [base, quote] = splitPair(pair);
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";
  const iconColor = SIGNAL;

  const outcome = resolveOutcome(searchParams.get("outcome"), pips, profit);
  const outcomeColor = outcome === "LOSS" ? TICK_DOWN : outcome === "WIN" ? TICK_UP : TEXT_ON_INK_MUTED;
  const outcomeLabel = outcome === "WIN" ? "✅ WIN" : outcome === "LOSS" ? "❌ LOSS" : outcome === "BE" ? "➖ BREAKEVEN" : "TRADE CLOSED";

  const hasPips = isRealLevel(pips) || (pips !== null && parseFloat(pips) < 0);
  const hasProfit = isRealLevel(profit) || (profit !== null && parseFloat(profit) < 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {/* Result glow behind the outcome banner */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: 560,
              height: 560,
              top: -40,
              left: -220,
              borderRadius: 999,
              background: `radial-gradient(circle, ${outcome === "LOSS" ? "rgba(229,72,77,0.22)" : "rgba(34,197,94,0.22)"} 0%, rgba(0,0,0,0) 70%)`,
            }}
          />

          {/* Left: trade result data */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 700,
              padding: "40px 44px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DATA_URI} width={116} height={30} alt="" />
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                Trade Result
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
              <span style={{ fontSize: 46, fontWeight: 700, color: TEXT_ON_INK }}>
                {base}
                {quote}
              </span>
              {directionLabel && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: TEXT_ON_INK_MUTED,
                    border: `2px solid ${HAIRLINE}`,
                    borderRadius: 999,
                    padding: "6px 20px",
                  }}
                >
                  {directionLabel}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 800,
                color: outcomeColor,
                marginTop: 30,
                letterSpacing: -0.5,
              }}
            >
              {outcomeLabel}
            </div>

            {(hasPips || hasProfit) && (
              <span
                style={{
                  display: "flex",
                  fontSize: 64,
                  fontWeight: 800,
                  color: outcomeColor,
                  marginTop: 8,
                  letterSpacing: -1.5,
                }}
              >
                {hasPips ? `${parseFloat(pips!) > 0 ? "+" : ""}${pips} pips` : `${parseFloat(profit!) > 0 ? "+" : ""}${profit} USD`}
              </span>
            )}

            <div style={{ display: "flex", margin: "26px 0 0", height: 1, background: HAIRLINE }} />

            <div style={{ display: "flex", gap: 40, marginTop: 26 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 15,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: TEXT_ON_INK_MUTED,
                  }}
                >
                  Entry
                </span>
                <span style={{ fontSize: 32, fontWeight: 700, color: TEXT_ON_INK, marginTop: 6 }}>
                  {entry}
                </span>
              </div>
              <div style={{ display: "flex", width: 1, background: HAIRLINE }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 15,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: TEXT_ON_INK_MUTED,
                  }}
                >
                  Close
                </span>
                <span style={{ fontSize: 32, fontWeight: 700, color: outcomeColor, marginTop: 6 }}>
                  {close}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", margin: "26px 0 0", height: 1, background: HAIRLINE }} />

            <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
              <span style={{ display: "flex", fontSize: 15, color: TEXT_ON_INK_MUTED }}>
                fxpartner.global
              </span>
              <span style={{ display: "flex", fontSize: 12, color: TEXT_ON_INK_MUTED, marginTop: 4 }}>
                Trading involves risk. This is not investment advice.
              </span>
            </div>
          </div>

          {/* Diagonal glow seam */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: -20,
              left: 686,
              width: 3,
              height: 670,
              background: SIGNAL,
              boxShadow: `0 0 24px 4px ${SIGNAL_GLOW}`,
              transform: "rotate(7deg)",
            }}
          />

          {/* Right: brand + features */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "36px 48px 24px",
              background: INK_SOFT,
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, color: TEXT_ON_INK }}>
              FXPARTNER<span style={{ color: SIGNAL }}>.</span>
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
                marginTop: 4,
              }}
            >
              Your Partner in Financial Success
            </span>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: TEXT_ON_INK, lineHeight: 1.15 }}>
                Trade Smarter.
              </span>
              <span style={{ fontSize: 30, fontWeight: 700, color: SIGNAL, lineHeight: 1.15 }}>
                Grow Stronger.
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 26 }}>
              <Feature icon={<ShieldIcon color={iconColor} />} title="Verified Brokers" />
              <Feature icon={<SearchIcon color={iconColor} />} title="Broker Verification" />
              <Feature icon={<ChartIcon color={iconColor} />} title="Profitable Signals" />
              <Feature icon={<UsersIcon color={iconColor} />} title="Global Community" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: "auto",
                padding: "14px 18px",
                borderRadius: 16,
                border: `1px solid ${SIGNAL}55`,
                boxShadow: `0 0 20px 2px ${SIGNAL_GLOW}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 12,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: SIGNAL,
                  }}
                >
                  Scan to join
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: TEXT_ON_INK, marginTop: 2 }}>
                  FXPARTNER
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE_QR_DATA_URI}
                width={64}
                height={64}
                style={{ borderRadius: 8, marginLeft: "auto" }}
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Bottom footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 48px",
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <FooterItem icon={<CandlesIcon color={iconColor} />} label="MT5 Signals" />
          <FooterItem icon={<CopyTradeIcon color={iconColor} />} label="CopyTrade" />
          <FooterItem icon={<ShieldIcon color={iconColor} />} label="Risk Management" />
          <FooterItem icon={<CapIcon color={iconColor} />} label="Trading Education" />
          <FooterItem icon={<HeadsetIcon color={iconColor} />} label="24/7 Support" />
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
