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
const GOLD = "#c9a227";
const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const TICK_UP_GLOW = "rgba(34,197,94,0.30)";
const TICK_DOWN_GLOW = "rgba(229,72,77,0.30)";

// Static QR code for https://fxpartner.global, pre-rendered at build time
// (the `qrcode` package needs Node APIs the edge runtime doesn't have) —
// safe to hardcode since the target URL never changes between signals.
const SITE_QR_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAAAklEQVR4AewaftIAAAX8SURBVO3B0W1jSxIFwVSBVlT7b1qff0kGaB1YsAePdy5Yo4z4+Pz6/kHSSIWksQpJYxWSxiokjVVIGquQNFYhaaxC0lgP/kD34rdKNpN0L66QbN5F9+K3SjbPFJLGKiSNVUgaq5A0ViFprELSWIWksQpJYz24SLKZpntxh+7FFZLNSbI56V6cdC+ukGzukGym6V68qpA0ViFprELSWIWksQpJYxWSxiokjVVIGuvBjboXd0k2d+henCSbk+7FFboXJ8nmN+pe3CXZ3KGQNFYhaaxC0liFpLEKSWMVksYqJI1VSBrrgf4pyeake/Euko3+u0LSWIWksQpJYxWSxiokjVVIGquQNFYhaawH+uu6FyfJ5qR7cZJsTpLNXboX+nsKSWMVksYqJI1VSBqrkDRWIWmsQtJYhaSxHtwo2fxGyeake3GX7sVvlGz+NYWksQpJYxWSxiokjVVIGquQNFYhaaxC0lgPLtK90N+VbE66FyfJ5qR7cZJsTroXd+he/EaFpLEKSWMVksYqJI1VSBqrkDRWIWmsQtJYD/5AstF/1724S7K5S/fiDslG/18haaxC0liFpLEKSWMVksYqJI1VSBrrwR/oXpwkm5PuxTTJ5plk8066F+8k2byqezFNsrlDIWmsQtJYhaSxCkljFZLGKiSNVUgaq5A01sfn1/cPb6R7cZdk86ruxUmyOeleXCHZnHQvTpLNFboXr0o2J92Lk2Rzl+7FSbJ5VSFprELSWIWksQpJYxWSxiokjVVIGquQNNaDi3Qv3kmyOelenCSbd5FsrpBsTroXV0g2d0g2J92LKySbK3QvTpLNM4WksQpJYxWSxiokjVVIGquQNFYhaaxC0lgfn1/fPxx0L+6SbE66F1dINifdi2eSzUn34iTZXKF7cZJs7tK9eCbZnHQvrpBs3kn34iTZPFNIGquQNFYhaaxC0liFpLEKSWMVksYqJI318fn1/cNNuhd3STYn3Yt3kWzu0r24QrJ5VffiCsnmpHtxkmxOuhd3STbPFJLGKiSNVUgaq5A0ViFprELSWIWksQpJYz34A92LuySbk+7FFZLNSffiVcnmpHtxkmxOuhdXSDZX6F68KtmcdC9Oks1J9+Ik2Zx0L06SzasKSWMVksYqJI1VSBqrkDRWIWmsQtJYhaSxHlwk2byT7sUkyeYKyeake3HSvbhCsnlV9+IK3Yt30r04STbPFJLGKiSNVUgaq5A0ViFprELSWIWksQpJYz14M92Lk2Rzl+7FM8nmpHtxhWRz0r04STYn3YsrdC+eSTbvJNlcIdmcdC9eVUgaq5A0ViFprELSWIWksQpJYxWSxiokjfXgRt2Lk2Rz0r24S7K5Q7K5S/fiXXQvpulenCSbk2TzqkLSWIWksQpJYxWSxiokjVVIGquQNNbH59f3D/rPuhcnyea36l48k2zu0r24QrJ5F4WksQpJYxWSxiokjVVIGquQNFYhaaxC0lgP/kD34rdKNs8km5PuxUmyOele3CXZvIvuxUmyuUKyOele3CXZPFNIGquQNFYhaaxC0liFpLEKSWMVksYqJI314CLJZpruxau6F1foXlwh2fxrks1duhcnyeYK3YtXFZLGKiSNVUgaq5A0ViFprELSWIWksQpJYz24UffiLsnmXSSbK3QvTroXk3Qv3kmyOelenCSbk2TzqkLSWIWksQpJYxWSxiokjVVIGquQNFYhaawH+uu6F1dINifdi5Nkc4XuxbtINifdi5PuxRW6F1dINs8UksYqJI1VSBqrkDRWIWmsQtJYhaSxCkljPdBbSDb/omTzLpLNSffiCsnmpHvxqkLSWIWksQpJYxWSxiokjVVIGquQNFYhaawHN0o2/5pkc9K9OOlenCSbk2Rzhe7FSbI56V48k2xOuhfvJNm8i0LSWIWksQpJYxWSxiokjVVIGquQNFYhaawHF+le/Ebdiyskm5PuxTTJ5pnuxTTdi3dRSBqrkDRWIWmsQtJYhaSxCkljFZLGKiSN9fH59f2DpJEKSWMVksYqJI1VSBqrkDRWIWmsQtJY/wPm2IYl8N8e+QAAAABJRU5ErkJggg==";

// Two-letter currency badges instead of real flag graphics — Satori's emoji
// support is inconsistent across renders, while a colored initial badge
// always renders identically. Falls back to a neutral badge for anything
// not in this map (crypto, indices, metals typed some other way, etc.).
const CURRENCY_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
  EUR: { label: "EU", bg: "#2f6ff0", fg: "#ffffff" },
  USD: { label: "US", bg: "#1a3d8f", fg: "#ffffff" },
  GBP: { label: "GB", bg: "#c1443b", fg: "#ffffff" },
  JPY: { label: "JP", bg: "#f1f2f3", fg: "#c1443b" },
  CHF: { label: "CH", bg: "#c1443b", fg: "#ffffff" },
  AUD: { label: "AU", bg: "#1a3d8f", fg: "#ffffff" },
  CAD: { label: "CA", bg: "#c1443b", fg: "#ffffff" },
  NZD: { label: "NZ", bg: "#1a3d8f", fg: "#ffffff" },
  TRY: { label: "TR", bg: "#c1443b", fg: "#ffffff" },
  XAU: { label: "AU", bg: "#c9a227", fg: "#0b0c0e" },
  XAG: { label: "AG", bg: "#9a9fa6", fg: "#0b0c0e" },
};
const DEFAULT_BADGE = { label: "FX", bg: "#232629", fg: "#f1f2f3" };

function splitPair(pair: string): [string, string] {
  const clean = pair.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (clean.length >= 6) return [clean.slice(0, 3), clean.slice(3, 6)];
  return [clean, ""];
}

function badgeFor(code: string) {
  return CURRENCY_BADGES[code] ?? DEFAULT_BADGE;
}

function Badge({ code, offset }: { code: string; offset: number }) {
  const b = badgeFor(code);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: offset,
        top: 0,
        width: 60,
        height: 60,
        borderRadius: 999,
        background: b.bg,
        color: b.fg,
        fontSize: 22,
        fontWeight: 700,
        border: `3px solid ${INK}`,
      }}
    >
      {b.label}
    </div>
  );
}

// A small hand-drawn rocket, angled as if launching — used on the BUY pill.
// Custom shapes instead of an emoji glyph: Satori's color-emoji support is
// inconsistent across renders, plain SVG paths always render identically.
function RocketIcon({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      style={{ transform: "rotate(-45deg)" }}
    >
      <path d="M12 2c3 3 4.2 7.4 3.4 11.8H8.6C7.8 9.4 9 5 12 2Z" fill={color} />
      <circle cx="12" cy="8.6" r="1.5" fill={INK} />
      <path d="M8.6 12.6 5.4 16.4l3.6-1.5Z" fill={color} />
      <path d="M15.4 12.6 18.6 16.4l-3.6-1.5Z" fill={color} />
      <path d="M10.3 13.8 12 19.8l1.7-6Z" fill={color} />
    </svg>
  );
}

// A descending trend line with an arrowhead — the SELL counterpart to the
// rocket, drawn from the same "price chart" visual language.
function TrendDownIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M4 7 10 13 14 9 20 15 M20 15 20 9.5 M20 15 14.5 15"
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stat({
  label,
  value,
  color,
  dir,
}: {
  label: string;
  value: string;
  color: string;
  dir?: "up" | "down";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {dir && (
          <span style={{ display: "flex", fontSize: 17, color }}>
            {dir === "up" ? "▲" : "▼"}
          </span>
        )}
        <span
          style={{
            fontSize: 19,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: TEXT_ON_INK_MUTED,
          }}
        >
          {label}
        </span>
      </div>
      <span style={{ fontSize: 54, fontWeight: 700, color, marginTop: 8 }}>{value}</span>
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
  const stats: { label: string; value: string; color: string; dir?: "up" | "down" }[] = [];
  if (target1) stats.push({ label: "Target 1", value: target1, color: TICK_UP, dir: "up" });
  if (target2) stats.push({ label: "Target 2", value: target2, color: TICK_UP, dir: "up" });
  stats.push({ label: "Stop Loss", value: stop, color: TICK_DOWN, dir: "down" });
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
        {/* Ignition glow — direction-colored light behind the pair/entry zone */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 680,
            height: 680,
            top: -200,
            right: -100,
            borderRadius: 999,
            background: `radial-gradient(circle, ${directionGlow} 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        {/* Ghost watermark of the pair, for depth */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 44,
            right: -20,
            fontSize: 260,
            fontWeight: 800,
            letterSpacing: -8,
            color: TEXT_ON_INK,
            opacity: 0.035,
          }}
        >
          {base}
          {quote}
        </div>

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
            <span style={{ fontSize: 32, fontWeight: 700, color: TEXT_ON_INK }}>
              FXPARTNER
              <span style={{ color: SIGNAL }}>.</span>
            </span>
            <span
              style={{
                fontSize: 17,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Trade Signal
            </span>
          </div>
          {directionLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: 2,
                color: TEXT_ON_INK,
                background: directionColor,
                borderRadius: 999,
                padding: "10px 24px 10px 18px",
                boxShadow: `0 0 28px 6px ${directionGlow}`,
              }}
            >
              {direction === "SELL" ? (
                <TrendDownIcon color={TEXT_ON_INK} />
              ) : (
                <RocketIcon color={TEXT_ON_INK} />
              )}
              {directionLabel}
            </div>
          )}
        </div>

        {/* Pair + entry */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "36px 48px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", position: "relative", width: 94, height: 60 }}>
              <Badge code={base} offset={0} />
              <Badge code={quote} offset={34} />
            </div>
            <span style={{ fontSize: 56, fontWeight: 700, color: TEXT_ON_INK }}>
              {base}
              {quote}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span
              style={{
                fontSize: 19,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Entry
            </span>
            <span style={{ fontSize: 68, fontWeight: 700, color: GOLD, marginTop: 4 }}>
              {entry}
            </span>
          </div>
        </div>

        {/* Divider — a fading energy beam instead of a flat bar */}
        <div
          style={{
            display: "flex",
            margin: "36px 48px 0",
            height: 2,
            background: `linear-gradient(90deg, rgba(201,162,39,0) 0%, ${GOLD} 18%, ${GOLD} 82%, rgba(201,162,39,0) 100%)`,
          }}
        />

        {/* Stats — only fields the EA actually sent */}
        <div style={{ display: "flex", padding: "36px 48px 0", gap: 24 }}>
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} color={s.color} dir={s.dir} />
          ))}
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
