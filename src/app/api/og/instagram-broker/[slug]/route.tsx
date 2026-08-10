import { ImageResponse } from "next/og";
import { getBrokerBySlug, getBrokerScores } from "@/data/brokers";

// Square (1080x1080) Instagram feed card for a broker review. Mirrors the
// real score-card UI on the broker page (TrustGauge ring, ScoreCheck pills,
// ranked badge, verified badge) — same colors/thresholds as
// src/components/TrustGauge.tsx and src/app/brokers/[slug]/page.tsx so the
// card reads as a screenshot of the site, not a separate design.
export const runtime = "edge";
const SIZE = 1080;

const INK = "#06090b";
const INK_SOFT = "#0e1417";
const HAIRLINE = "#172226";
const HAIRLINE_LIGHT = "#232c30";
const TEXT_ON_INK = "#f1f2f3";
const TEXT_ON_INK_MUTED = "#9aa8ac";
const SIGNAL = "#0891b2";
const GOLD = "#c9a227";
const TICK_UP = "#22c55e";
const ALERT = "#c1443b";

function ratingWord(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Great";
  if (rating >= 2.5) return "Average";
  return "Poor";
}

function toneForScore(score: number): { color: string; label: string } {
  if (score >= 7.5) return { color: TICK_UP, label: "Strong Trust Signal" };
  if (score >= 5) return { color: GOLD, label: "Fair Trust Signal" };
  return { color: ALERT, label: "Weak Trust Signal" };
}

// Unicode glyphs (★ ✓ –) render as tofu boxes under the edge font used by
// next/og's satori renderer — SVG paths instead, same paths as the site's
// real ScoreCheck/ReviewBadge components use.
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DashIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  );
}

function CheckPill({ label, good }: { label: string; good: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 14,
        backgroundColor: INK_SOFT,
        padding: "16px 20px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 20,
          height: 20,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: good ? "#16341f" : HAIRLINE_LIGHT,
        }}
      >
        {good ? <CheckIcon color={TICK_UP} /> : <DashIcon color={TEXT_ON_INK_MUTED} />}
      </div>
      <span style={{ fontSize: 21, color: TEXT_ON_INK_MUTED }}>{label}</span>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);

  if (!broker) {
    return new Response("Broker not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const scores = getBrokerScores(broker);
  const fullStars = Math.round(broker.rating);
  const tone = toneForScore(scores.composite);

  // Ring gauge geometry — same math as TrustGauge.tsx, static (no mount
  // animation needed for a rendered-once image).
  const RING_SIZE = 300;
  const STROKE = 18;
  const RADIUS = (RING_SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const pct = Math.max(0, Math.min(10, scores.composite)) / 10;
  const offset = CIRCUMFERENCE * (1 - pct);

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          backgroundColor: INK,
          backgroundImage: `radial-gradient(circle at 88% 8%, ${GOLD}22, transparent 45%)`,
          padding: "76px 76px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Ranked badge */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${HAIRLINE_LIGHT}`,
            borderRadius: 999,
            padding: "10px 20px",
            color: TEXT_ON_INK_MUTED,
            fontSize: 20,
            letterSpacing: 2,
          }}
        >
          <StarIcon color={GOLD} size={18} />
          <span>RANKED #{String(broker.rank).padStart(2, "0")}</span>
        </div>

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 40 }}>
          {broker.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${siteUrl}${broker.logo}`}
              width={110}
              height={110}
              style={{ borderRadius: 24, objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 110,
                height: 110,
                borderRadius: 24,
                backgroundColor: INK_SOFT,
                border: `1px solid ${HAIRLINE}`,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 800,
                color: TEXT_ON_INK,
              }}
            >
              {broker.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 68, fontWeight: 800, color: TEXT_ON_INK, lineHeight: 1 }}>
            {broker.name}
          </span>
        </div>

        <span style={{ marginTop: 26, fontSize: 27, color: TEXT_ON_INK_MUTED }}>
          {broker.tagline}
        </span>

        <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: HAIRLINE, marginTop: 44 }} />

        {/* Rating + gauge row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 44 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
              FXPARTNER is rated
            </span>
            <span style={{ marginTop: 8, fontSize: 52, fontWeight: 800, color: SIGNAL }}>
              {ratingWord(broker.rating)}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: i < fullStars ? GOLD : HAIRLINE,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i < fullStars && <StarIcon color={INK} size={16} />}
                </div>
              ))}
              <span style={{ marginLeft: 8, fontSize: 26, color: TEXT_ON_INK_MUTED }}>
                {broker.rating.toFixed(1)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
                alignSelf: "flex-start",
                border: `1px solid ${HAIRLINE_LIGHT}`,
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 18,
                color: SIGNAL,
              }}
            >
              <CheckIcon color={SIGNAL} />
              <span style={{ letterSpacing: 1 }}>FXPARTNER VERIFIED</span>
            </div>
          </div>

          {/* Trust gauge ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", position: "relative", width: RING_SIZE, height: RING_SIZE }}>
              <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={HAIRLINE}
                  strokeWidth={STROKE}
                />
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={tone.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                />
              </svg>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: RING_SIZE,
                  height: RING_SIZE,
                }}
              >
                <span style={{ fontSize: 62, fontWeight: 800, color: TEXT_ON_INK }}>
                  {scores.composite.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                  / 10 Index
                </span>
              </div>
            </div>
            <span style={{ marginTop: 20, fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: tone.color }}>
              {tone.label}
            </span>
          </div>
        </div>

        {/* Score check pills */}
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          <CheckPill label="Regulation & Trust" good={scores.regulation >= 3.75} />
          <CheckPill label="Withdrawal Reliability" good={scores.withdrawal >= 3.75} />
          <CheckPill label="Platform & Tools" good={scores.platform >= 3.75} />
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>FX</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: TEXT_ON_INK }}>PARTNER</span>
          <span style={{ marginLeft: 14, fontSize: 22, color: TEXT_ON_INK_MUTED }}>fxpartner.global</span>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
