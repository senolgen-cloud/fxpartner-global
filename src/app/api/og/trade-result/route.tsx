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
import {
  splitPair,
  ShieldIcon,
  SearchIcon,
  ChartIcon,
  UsersIcon,
  CandlesIcon,
  CopyTradeIcon,
  CapIcon,
  HeadsetIcon,
  FooterFeature,
  FeatureCard,
  ClockIcon,
  TelegramIcon,
  YoutubeIcon,
  InstagramIcon,
  XIcon,
  FacebookIcon,
  SocialIcon,
  Sparkline,
  InfoPill,
} from "@/lib/ogIcons";

export const runtime = "edge";

// Square, matching /api/og/trade-signal — built to also be posted as an
// Instagram feed/story image, which wants 1:1.
const SIZE = 1080;

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const [base, quote] = splitPair(pair);
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";
  const iconColor = SIGNAL;

  const outcome = resolveOutcome(searchParams.get("outcome"), pips, profit);
  const outcomeColor = outcome === "LOSS" ? TICK_DOWN : outcome === "WIN" ? TICK_UP : TEXT_ON_INK_MUTED;
  const outcomeLabel =
    outcome === "WIN" ? "✅ WIN" : outcome === "LOSS" ? "❌ LOSS" : outcome === "BE" ? "➖ BREAKEVEN" : "TRADE CLOSED";

  const hasPips = isRealLevel(pips) || (pips !== null && parseFloat(pips) < 0);
  const hasProfit = isRealLevel(profit) || (profit !== null && parseFloat(profit) < 0);

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
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "40px 44px 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_DATA_URI} width={150} height={39} alt="" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
              <div style={{ display: "flex", width: 26, height: 1, background: HAIRLINE }} />
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                Trade Result
              </span>
              <div style={{ display: "flex", width: 26, height: 1, background: HAIRLINE }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "rgba(34,211,238,0.12)",
              }}
            >
              <ShieldIcon color={iconColor} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                Your Partner In
              </span>
              <span style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color: TEXT_ON_INK }}>
                Financial Success
              </span>
            </div>
          </div>
        </div>

        {/* Main content: left result card + right hero panel */}
        <div style={{ display: "flex", flexDirection: "row", flex: 1, padding: "28px 44px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 372 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                borderRadius: 24,
                border: `1px solid ${HAIRLINE}`,
                background: INK_SOFT,
                padding: "28px 26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  width: 320,
                  height: 320,
                  top: -80,
                  left: -100,
                  borderRadius: 999,
                  background: `radial-gradient(circle, ${outcome === "LOSS" ? "rgba(229,72,77,0.20)" : "rgba(34,197,94,0.20)"} 0%, rgba(0,0,0,0) 70%)`,
                }}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: TEXT_ON_INK }}>
                  {base}
                  {quote}
                </span>
                {directionLabel && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: TEXT_ON_INK_MUTED,
                      border: `2px solid ${HAIRLINE}`,
                      borderRadius: 999,
                      padding: "5px 16px",
                    }}
                  >
                    {directionLabel}
                  </div>
                )}
              </div>

              <span style={{ display: "flex", fontSize: 32, fontWeight: 800, color: outcomeColor, marginTop: 22 }}>
                {outcomeLabel}
              </span>
              {(hasPips || hasProfit) && (
                <span style={{ display: "flex", fontSize: 50, fontWeight: 800, color: outcomeColor, marginTop: 4, letterSpacing: -1 }}>
                  {hasPips
                    ? `${parseFloat(pips!) > 0 ? "+" : ""}${pips} pips`
                    : `${parseFloat(profit!) > 0 ? "+" : ""}${profit} USD`}
                </span>
              )}

              <div style={{ display: "flex", marginTop: 14 }}>
                <Sparkline
                  seed={`${pair}-${entry}-${close}`}
                  color={outcomeColor}
                  trendUp={outcome !== "LOSS"}
                  width={318}
                  height={64}
                />
              </div>

              <div style={{ display: "flex", margin: "18px 0 0", height: 1, background: HAIRLINE }} />

              <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                    Entry
                  </span>
                  <span style={{ fontSize: 27, fontWeight: 700, color: TEXT_ON_INK, marginTop: 4 }}>{entry}</span>
                </div>
                <div style={{ display: "flex", width: 1, background: HAIRLINE }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                    Close
                  </span>
                  <span style={{ fontSize: 27, fontWeight: 700, color: outcomeColor, marginTop: 4 }}>{close}</span>
                </div>
              </div>
            </div>

            <InfoPill
              icon={<ClockIcon color={SIGNAL} />}
              mutedText="Real trade."
              accentText="Real result."
              accentColor={SIGNAL}
            />
          </div>

          {/* Hero panel: photo + headline + feature list + QR, all on top */}
          <div
            style={{
              display: "flex",
              flex: 1,
              position: "relative",
              marginLeft: 24,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${siteUrl}/trade-card-bg.jpg`}
              width={684}
              height={636}
              style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
              alt=""
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                inset: 0,
                background: "linear-gradient(100deg, rgba(7,9,11,0.88) 18%, rgba(7,9,11,0.45) 55%, rgba(7,9,11,0.7) 100%)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "row", flex: 1, position: "relative", padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", paddingRight: 12 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: TEXT_ON_INK, lineHeight: 1.15 }}>Trade Smarter.</span>
                <span style={{ fontSize: 30, fontWeight: 700, color: SIGNAL, lineHeight: 1.15 }}>Grow Stronger.</span>
                <span style={{ display: "flex", fontSize: 15, color: "#dbe1e3", marginTop: 16, lineHeight: 1.5 }}>
                  FXPARTNER delivers real-time signals, trusted tools, and a global community to help you succeed in every
                  market condition.
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", width: 250, gap: 10 }}>
                <FeatureCard icon={<ShieldIcon color={iconColor} />} title="Verified Brokers" subtitle="Trusted & regulated only." />
                <FeatureCard icon={<SearchIcon color={iconColor} />} title="Broker Verification" subtitle="Compare and choose right." />
                <FeatureCard icon={<ChartIcon color={iconColor} />} title="Profitable Signals" subtitle="Built for consistency." />
                <FeatureCard icon={<UsersIcon color={iconColor} />} title="Global Community" subtitle="Thousands of traders." />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: "auto",
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: "rgba(7,9,11,0.72)",
                    border: `1px solid ${SIGNAL}55`,
                    boxShadow: `0 0 20px 2px ${SIGNAL_GLOW}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SITE_QR_DATA_URI} width={54} height={54} style={{ borderRadius: 8 }} alt="" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: SIGNAL }}>
                      Scan to join
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_ON_INK }}>FXPARTNER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip: 5 features */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 44px",
            marginTop: 24,
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <FooterFeature icon={<CandlesIcon color={iconColor} />} title="MT5 Signals" subtitle="Real-time alerts" />
          <FooterFeature icon={<CopyTradeIcon color={iconColor} />} title="CopyTrade" subtitle="Follow professionals" />
          <FooterFeature icon={<ShieldIcon color={iconColor} />} title="Risk Management" subtitle="Protect your capital" />
          <FooterFeature icon={<CapIcon color={iconColor} />} title="Trading Education" subtitle="Learn & improve" />
          <FooterFeature icon={<HeadsetIcon color={iconColor} />} title="24/7 Support" subtitle="Always available" />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 44px 32px",
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
