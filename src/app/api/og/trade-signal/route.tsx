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
  LOGO_DATA_URI,
} from "@/lib/ogAssets";
import {
  splitPair,
  ShieldIcon,
  CandlesIcon,
  CopyTradeIcon,
  CapIcon,
  HeadsetIcon,
  ClockIcon,
  ChartIcon,
  FooterFeature,
  Sparkline,
  TelegramIcon,
  YoutubeIcon,
  InstagramIcon,
  XIcon,
  FacebookIcon,
  SocialIcon,
} from "@/lib/ogIcons";

export const runtime = "edge";

const SIZE = 1254;
const GOLD = "#f5a623";

// Fields the trade doesn't actually vary by (the EA doesn't report order
// type/timeframe, and risk level isn't tracked per-signal yet) — kept as
// fixed display copy per an explicit editorial decision, not fabricated
// per-trade data. Only pair/direction/entry/TP/SL/time are real and dynamic.
const FIXED_TYPE = "MARKET ORDER";
const FIXED_TIMEFRAME = "M15";
const FIXED_RISK = "MEDIUM";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair || !entry || !stop) {
    return new Response("Missing required params: pair, entry, stop", { status: 400 });
  }

  const [base, quote] = splitPair(pair);
  const directionColor = direction === "SELL" ? TICK_DOWN : TICK_UP;
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";

  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;
  const hasTarget1 = isRealLevel(target1);
  const hasStop = isRealLevel(stop);

  const time = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
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
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "44px 48px 0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} width={168} height={44} alt="" />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 30, height: 1, background: HAIRLINE }} />
            <span
              style={{
                fontSize: 16,
                letterSpacing: 5,
                textTransform: "uppercase",
                fontWeight: 700,
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Trade Signal
            </span>
          </div>
        </div>

        {/* Main info card */}
        <div style={{ display: "flex", flex: 1, padding: "36px 48px 0" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              borderRadius: 28,
              border: `1px solid ${HAIRLINE}`,
              background: INK_SOFT,
              padding: 36,
              gap: 32,
            }}
          >
            {/* Left: pair, entry, sparkline */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1.3 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 46, fontWeight: 800, color: TEXT_ON_INK }}>
                  {base}
                  {quote}
                </span>
                {directionLabel && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 20,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "#ffffff",
                      background: directionColor,
                      borderRadius: 999,
                      padding: "9px 26px",
                    }}
                  >
                    {directionLabel}
                  </div>
                )}
              </div>

              <span
                style={{
                  display: "flex",
                  fontSize: 15,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: TEXT_ON_INK_MUTED,
                  marginTop: 28,
                }}
              >
                Entry Price
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 64,
                  fontWeight: 800,
                  color: TEXT_ON_INK,
                  letterSpacing: -1,
                  marginTop: 6,
                }}
              >
                {entry}
              </span>

              <div style={{ display: "flex", flex: 1, alignItems: "flex-end", marginTop: 24 }}>
                <Sparkline
                  seed={`${pair}-${entry}-${direction}`}
                  color={directionColor}
                  trendUp={direction !== "SELL"}
                  width={520}
                  height={230}
                />
              </div>
            </div>

            {/* Right: TP/SL + meta */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "row", gap: 18 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    borderRadius: 18,
                    border: `1px solid ${HAIRLINE}`,
                    padding: "18px 20px",
                  }}
                >
                  <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                    Take Profit
                  </span>
                  <span style={{ fontSize: 30, fontWeight: 800, color: hasTarget1 ? TICK_UP : TEXT_ON_INK_MUTED, marginTop: 6 }}>
                    {hasTarget1 ? target1 : "—"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    borderRadius: 18,
                    border: `1px solid ${HAIRLINE}`,
                    padding: "18px 20px",
                  }}
                >
                  <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                    Stop Loss
                  </span>
                  <span style={{ fontSize: 30, fontWeight: 800, color: hasStop ? TICK_DOWN : TEXT_ON_INK_MUTED, marginTop: 6 }}>
                    {hasStop ? stop : "—"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderRadius: 18,
                  border: `1px solid ${HAIRLINE}`,
                  padding: "6px 24px",
                }}
              >
                {[
                  { icon: <ClockIcon color={SIGNAL} />, label: "Time", value: time, color: TEXT_ON_INK },
                  { icon: <ChartIcon color={SIGNAL} />, label: "Type", value: FIXED_TYPE, color: TEXT_ON_INK },
                  { icon: <CandlesIcon color={SIGNAL} />, label: "Timeframe", value: FIXED_TIMEFRAME, color: TEXT_ON_INK },
                  { icon: <ShieldIcon color={GOLD} />, label: "Risk", value: FIXED_RISK, color: GOLD },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flex: 1,
                      borderBottom: i < arr.length - 1 ? `1px solid ${HAIRLINE}` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {row.icon}
                      <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 700, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer feature strip */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "30px 48px",
            marginTop: 12,
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <FooterFeature icon={<CandlesIcon color={SIGNAL} />} title="Real-Time Signals" subtitle="Instant alerts on MetaTrader 5" />
          <FooterFeature icon={<CopyTradeIcon color={SIGNAL} />} title="CopyTrade" subtitle="Follow professionals." />
          <FooterFeature icon={<ShieldIcon color={SIGNAL} />} title="Risk Management" subtitle="Protect your capital." />
          <FooterFeature icon={<CapIcon color={SIGNAL} />} title="Trading Education" subtitle="Learn, improve and stay ahead." />
          <FooterFeature icon={<HeadsetIcon color={SIGNAL} />} title="24/7 Support" subtitle="We're here for you, anytime." />
        </div>

        {/* Trusted partners */}
        <div style={{ display: "flex", flexDirection: "column", padding: "0 48px 28px" }}>
          <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
            Our Trusted Partners
          </span>
          <div style={{ display: "flex", flexDirection: "row", gap: 28, marginTop: 14 }}>
            {["XM", "LiteFinance", "Exness", "AvaTrade", "FxPro", "Tickmill"].map((name) => (
              <span key={name} style={{ fontSize: 20, fontWeight: 700, color: TEXT_ON_INK }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 48px 36px",
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED }}>fxpartner.global</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldIcon color={TEXT_ON_INK_MUTED} />
            <span style={{ fontSize: 12, color: TEXT_ON_INK_MUTED }}>Trading involves risk. This is not investment advice.</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SocialIcon>
              <TelegramIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <YoutubeIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <InstagramIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <XIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <FacebookIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
