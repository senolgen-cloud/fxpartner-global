import { ImageResponse } from "next/og";

export const runtime = "edge";

const W = 1200;
const H = 630;

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT_ON_INK = "#f1f2f3";
const TEXT_ON_INK_MUTED = "#9a9fa6";
const SIGNAL = "#2f6ff0";
const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const TICK_UP_GLOW = "rgba(34,197,94,0.28)";
const TICK_DOWN_GLOW = "rgba(229,72,77,0.28)";

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

// A thick chevron built from two rotated bars — a quiet geometric texture
// in the corner, in the spirit of the reference card's background motif.
// Plain CSS shapes instead of an SVG path so it stays trivially reliable
// under Satori.
function ChevronWatermark() {
  const bar = "#14181c";
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: -60,
        right: -40,
        width: 460,
        height: 460,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: 340,
          height: 84,
          background: bar,
          borderRadius: 10,
          transform: "rotate(45deg)",
          top: 40,
          left: 70,
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: 340,
          height: 84,
          background: bar,
          borderRadius: 10,
          transform: "rotate(-45deg)",
          top: 40,
          left: 250,
        }}
      />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontSize: 18,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: TEXT_ON_INK_MUTED,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 42, fontWeight: 700, color, marginTop: 8 }}>{value}</span>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const target2 = searchParams.get("target2");
  const stop = searchParams.get("stop");
  const confidence = searchParams.get("confidence");
  const volume = searchParams.get("volume");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair || !entry || !stop) {
    return new Response("Missing required params: pair, entry, stop", { status: 400 });
  }

  const [base, quote] = splitPair(pair);
  const directionColor = direction === "SELL" ? TICK_DOWN : TICK_UP;
  const directionGlow = direction === "SELL" ? TICK_DOWN_GLOW : TICK_UP_GLOW;
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";

  // Only render stats the EA actually sent — no placeholder dashes for
  // fields it doesn't provide (e.g. this EA has a single TP, no confidence score).
  const stats: { label: string; value: string; color: string }[] = [];
  if (target1) stats.push({ label: "Take Profit", value: target1, color: TICK_UP });
  stats.push({ label: "Stop Loss", value: stop, color: TICK_DOWN });
  if (target2) stats.push({ label: "Take Profit 2", value: target2, color: TICK_UP });
  if (confidence) stats.push({ label: "Confidence", value: `${confidence}%`, color: SIGNAL });

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
        <ChevronWatermark />

        {/* Ignition glow — direction-colored light behind the entry price */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 640,
            height: 640,
            top: 40,
            left: -220,
            borderRadius: 999,
            background: `radial-gradient(circle, ${directionGlow} 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", padding: "44px 56px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: TEXT_ON_INK }}>
              FXPARTNER
              <span style={{ color: SIGNAL }}>.</span>
            </span>
            <span
              style={{
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Trade Signal
            </span>
          </div>

          <span
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 700,
              color: TEXT_ON_INK,
              marginTop: 28,
            }}
          >
            {base}
            {quote}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
            {directionLabel && (
              <span style={{ fontSize: 24, fontWeight: 700, color: directionColor }}>
                {directionLabel}
              </span>
            )}
            {directionLabel && volume && (
              <div style={{ display: "flex", width: 2, height: 22, background: HAIRLINE }} />
            )}
            {volume && (
              <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>{volume} lot</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
            <span
              style={{
                fontSize: 19,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Entry Price
            </span>
            <span
              style={{
                fontSize: 92,
                fontWeight: 800,
                color: directionColor,
                marginTop: 4,
                letterSpacing: -2,
              }}
            >
              {entry}
            </span>
          </div>

          <div style={{ display: "flex", gap: 72, marginTop: 40 }}>
            {stats.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} color={s.color} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 48px",
            marginTop: "auto",
            borderTop: `1px solid ${HAIRLINE}`,
            background: INK_SOFT,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <span style={{ fontSize: 19, color: TEXT_ON_INK, fontWeight: 700 }}>
              FXPARTNER<span style={{ color: SIGNAL }}>.</span>global
            </span>
            <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED, marginTop: 4 }}>
              General information only, not investment advice. Trade at your own risk.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: 13,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
                textAlign: "right",
              }}
            >
              Scan to
              <br />
              join FXPARTNER
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_QR_DATA_URI}
              width={72}
              height={72}
              style={{ borderRadius: 8, border: `2px solid ${HAIRLINE}` }}
              alt=""
            />
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
