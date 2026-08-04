import { ImageResponse } from "next/og";

export const runtime = "edge";

const W = 1200;
const H = 630;

const INK = "#07090b";
const INK_SOFT = "#0e1216";
const HAIRLINE = "#20272b";
const TEXT_ON_INK = "#f1f2f3";
const TEXT_ON_INK_MUTED = "#93a1a6";
const SIGNAL = "#22d3ee";
const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const SIGNAL_GLOW = "rgba(34,211,238,0.35)";

// Static QR code for https://fxpartner.global, pre-rendered at build time
// (the `qrcode` package needs Node APIs the edge runtime doesn't have) —
// safe to hardcode since the target URL never changes between signals.
const SITE_QR_DATA_URI =
  "data:image/png;base64,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";

function splitPair(pair: string): [string, string] {
  const clean = pair.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (clean.length >= 6) return [clean.slice(0, 3), clean.slice(3, 6)];
  return [clean, ""];
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M20 20 16 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        d="M4 20V10 M11 20V4 M18 20v-7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.8" fill="none" />
      <path
        d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 8.5a3 3 0 1 1 0-5.99 M15 14.2c2.7.4 5 2.9 5 5.8"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CandlesIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M6 3v4M6 13v8M10 6h-4v5h4z" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M14 9v3M14 18v3M18 5h-4v9h4z" stroke={color} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function CopyTradeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M4 7h11l-3-3M20 17H9l3 3"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CapIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M2 8l10-4 10 4-10 4-10-4Zm4 2v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadsetIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M4 13v-1a8 8 0 0 1 16 0v1M4 13v4a2 2 0 0 0 2 2h1v-7H5a1 1 0 0 0-1 1Zm16 0v4a2 2 0 0 1-2 2h-1v-7h2a1 1 0 0 1 1 1Zm-3 6a3 3 0 0 1-3 2h-1"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(34,211,238,0.12)",
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 19, fontWeight: 600, color: TEXT_ON_INK }}>{title}</span>
    </div>
  );
}

function FooterItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon}
      <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED }}>{label}</span>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const volume = searchParams.get("volume");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair || !entry || !stop) {
    return new Response("Missing required params: pair, entry, stop", { status: 400 });
  }

  const [base, quote] = splitPair(pair);
  const directionColor = direction === "SELL" ? TICK_DOWN : TICK_UP;
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";
  const iconColor = SIGNAL;

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
          {/* Ignition glow behind the entry price */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: 560,
              height: 560,
              top: -40,
              left: -220,
              borderRadius: 999,
              background: `radial-gradient(circle, ${direction === "SELL" ? "rgba(229,72,77,0.22)" : "rgba(34,197,94,0.22)"} 0%, rgba(0,0,0,0) 70%)`,
            }}
          />

          {/* Left: trade data */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 700,
              padding: "40px 44px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: TEXT_ON_INK }}>
                FXPARTNER
                <span style={{ color: SIGNAL }}>.</span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                Trade Signal
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
                    color: directionColor,
                    border: `2px solid ${directionColor}`,
                    borderRadius: 999,
                    padding: "6px 20px",
                  }}
                >
                  {directionLabel}
                </div>
              )}
            </div>
            {volume && (
              <span style={{ display: "flex", fontSize: 17, color: TEXT_ON_INK_MUTED, marginTop: 8 }}>
                Volume: {volume} lot
              </span>
            )}

            <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
              <span
                style={{
                  fontSize: 16,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                Entry Price
              </span>
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: SIGNAL,
                  marginTop: 2,
                  letterSpacing: -1.5,
                }}
              >
                {entry}
              </span>
            </div>

            <div style={{ display: "flex", margin: "26px 0 0", height: 1, background: HAIRLINE }} />

            <div style={{ display: "flex", gap: 40, marginTop: 26 }}>
              {target1 && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 15,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: TEXT_ON_INK_MUTED,
                    }}
                  >
                    Take Profit
                  </span>
                  <span style={{ fontSize: 32, fontWeight: 700, color: TICK_UP, marginTop: 6 }}>
                    {target1}
                  </span>
                </div>
              )}
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
                  Stop Loss
                </span>
                <span style={{ fontSize: 32, fontWeight: 700, color: TICK_DOWN, marginTop: 6 }}>
                  {stop}
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
