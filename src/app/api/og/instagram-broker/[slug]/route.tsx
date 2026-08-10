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
const GOLD = "#c9a227";
const TICK_UP = "#22c55e";
const ALERT = "#c1443b";

function ratingWord(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Great";
  if (rating >= 2.5) return "Average";
  return "Poor";
}

function toneForScore(score: number): { color: string; glow: string; label: string } {
  if (score >= 7.5) return { color: TICK_UP, glow: "34,197,94", label: "Strong Trust Signal" };
  if (score >= 5) return { color: GOLD, glow: "201,162,39", label: "Fair Trust Signal" };
  return { color: ALERT, glow: "193,68,59", label: "Weak Trust Signal" };
}

// Unicode glyphs (★ ✓ –) render as tofu boxes under the edge font used by
// next/og's satori renderer — SVG paths instead, same paths as the site's
// real ScoreCheck/ReviewBadge components use.
function CheckIcon({ color, strokeWidth = 3 }: { color: string; strokeWidth?: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DashIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function StarIcon({ color, size = 16, outline = false }: { color: string; size?: number; outline?: boolean }) {
  const path = "M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6-4.8-4.6 6.6-.9L12 2.5z";
  return outline ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d={path} />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={path} />
    </svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
    </svg>
  );
}

function RefreshIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0115-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 01-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function MonitorIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function GlobeIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9z" />
    </svg>
  );
}

const CHECK_META: Record<
  "regulation" | "withdrawal" | "platform",
  { title: string; icon: (color: string) => React.ReactNode; good: string; bad: string }
> = {
  regulation: {
    title: "Regulation & Trust",
    icon: (color) => <ShieldIcon color={color} />,
    good: "High level of regulatory oversight and transparency",
    bad: "Limited or offshore-only regulatory oversight",
  },
  withdrawal: {
    title: "Withdrawal Reliability",
    icon: (color) => <RefreshIcon color={color} />,
    good: "Consistent and reliable withdrawal performance",
    bad: "Withdrawal reliability not yet fully verified",
  },
  platform: {
    title: "Platform & Tools",
    icon: (color) => <MonitorIcon color={color} />,
    good: "Advanced platforms with powerful trading tools",
    bad: "Basic platform and tool offering",
  },
};

function ScoreCard({ kind, good }: { kind: keyof typeof CHECK_META; good: boolean }) {
  const meta = CHECK_META[kind];
  const color = good ? TICK_UP : TEXT_ON_INK_MUTED;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 14,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 20,
        backgroundColor: INK_SOFT,
        padding: "24px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: good ? "#16341f" : HAIRLINE_LIGHT,
        }}
      >
        {meta.icon(color)}
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: TEXT_ON_INK, lineHeight: 1.25 }}>
        {meta.title}
      </span>
      <span style={{ fontSize: 16, color: TEXT_ON_INK_MUTED, lineHeight: 1.4 }}>
        {good ? meta.good : meta.bad}
      </span>
    </div>
  );
}

// Highlights platform names (MT4, MT5, cTrader, …) inside the tagline in
// the tone color, matching the reference design's colored-keyword styling.
function renderTagline(tagline: string, platforms: string[], color: string) {
  const names = [...platforms].filter(Boolean).sort((a, b) => b.length - a.length);
  if (names.length === 0) return <span>{tagline}</span>;
  const pattern = new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = tagline.split(pattern);
  // whiteSpace: "pre" on every segment — satori (next/og's renderer)
  // collapses/strips leading & trailing whitespace on each independent
  // text span, which otherwise eats the space between plain and
  // highlighted words (e.g. "via MT4, MT5" -> "viaMT4,MT5").
  return (
    <>
      {parts.map((part, i) =>
        names.some((n) => n.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} style={{ color, whiteSpace: "pre" }}>
            {part}
          </span>
        ) : (
          <span key={i} style={{ whiteSpace: "pre" }}>
            {part}
          </span>
        )
      )}
    </>
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
  // satori (next/og's renderer) can't decode webp — falls back to the
  // monogram box for those instead of silently rendering nothing.
  const hasRenderableLogo = !!broker.logo && !broker.logo.toLowerCase().endsWith(".webp");
  const scores = getBrokerScores(broker);
  const fullStars = Math.round(broker.rating);
  const tone = toneForScore(scores.composite);
  const verified = scores.composite >= 5;

  // Ring gauge geometry — same math as TrustGauge.tsx, static (no mount
  // animation needed for a rendered-once image).
  const RING_SIZE = 320;
  const STROKE = 20;
  const RADIUS = (RING_SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const pct = Math.max(0, Math.min(10, scores.composite)) / 10;
  const offset = CIRCUMFERENCE * (1 - pct);

  // Faint chart-line silhouette across the lower half, echoing a price
  // chart without competing with the real content on top of it.
  const chartPath =
    "M0,420 L90,388 L180,402 L270,340 L360,360 L450,300 L540,318 L630,255 L720,270 L810,205 L900,220 L990,150 L1080,168";

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: INK,
          backgroundImage: `radial-gradient(circle at 88% 8%, ${GOLD}22, transparent 45%), radial-gradient(circle at 8% 96%, ${tone.color}1f, transparent 50%)`,
          padding: "72px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background texture: grid + chart silhouette + vignette, all
            behind the real content (z-index via paint order). */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 54" fill="none" stroke={HAIRLINE} strokeWidth="1" />
            </pattern>
            <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={tone.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width={SIZE} height={SIZE} fill="url(#grid)" opacity={0.5} />
          <g transform="translate(0,560)" opacity={0.8}>
            <path d={`${chartPath} L1080,420 L0,420 Z`} fill="url(#chartFade)" />
            <path d={chartPath} fill="none" stroke={tone.color} strokeOpacity="0.35" strokeWidth="3" />
          </g>
        </svg>

        {/* Ranked badge */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 10,
            border: `1px solid ${HAIRLINE_LIGHT}`,
            borderRadius: 999,
            padding: "12px 22px",
            color: TEXT_ON_INK_MUTED,
            fontSize: 20,
            letterSpacing: 2,
          }}
        >
          <StarIcon color={GOLD} size={18} />
          <span>RANKED #{String(broker.rank).padStart(2, "0")}</span>
        </div>

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 36 }}>
          {hasRenderableLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${siteUrl}${broker.logo}`}
              width={100}
              height={100}
              style={{ borderRadius: 22, objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 100,
                height: 100,
                borderRadius: 22,
                backgroundColor: INK_SOFT,
                border: `1px solid ${HAIRLINE}`,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 800,
                color: TEXT_ON_INK,
              }}
            >
              {broker.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 60, fontWeight: 800, color: TEXT_ON_INK, lineHeight: 1 }}>
            {broker.name}
          </span>
        </div>

        <span style={{ marginTop: 22, fontSize: 24, color: TEXT_ON_INK_MUTED, lineHeight: 1.4 }}>
          {renderTagline(broker.tagline, broker.platforms, tone.color)}
        </span>

        <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: HAIRLINE, marginTop: 36 }} />

        {/* Rating + gauge row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 36 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 17, letterSpacing: 3, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
              FXPARTNER is rated
            </span>
            <span style={{ marginTop: 6, fontSize: 50, fontWeight: 800, color: tone.color }}>
              {ratingWord(broker.rating)}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: i < fullStars ? GOLD : INK_SOFT,
                    border: i < fullStars ? "none" : `1px solid ${HAIRLINE_LIGHT}`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StarIcon color={i < fullStars ? INK : HAIRLINE_LIGHT} size={16} outline={i >= fullStars} />
                </div>
              ))}
              <span style={{ marginLeft: 8, fontSize: 26, color: TEXT_ON_INK_MUTED }}>
                {broker.rating.toFixed(1)}
              </span>
            </div>
            {verified && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 22,
                  alignSelf: "flex-start",
                  border: `1px solid ${tone.color}55`,
                  borderRadius: 999,
                  padding: "12px 20px",
                  fontSize: 19,
                  color: tone.color,
                  fontWeight: 600,
                }}
              >
                <ShieldIcon color={tone.color} />
                <span style={{ letterSpacing: 1 }}>FXPARTNER VERIFIED</span>
              </div>
            )}
          </div>

          {/* Trust gauge ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: RING_SIZE,
                height: RING_SIZE,
                filter: `drop-shadow(0 0 26px rgba(${tone.glow},0.45))`,
              }}
            >
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
                <span style={{ fontSize: 66, fontWeight: 800, color: TEXT_ON_INK }}>
                  {scores.composite.toFixed(1)}
                </span>
                <span style={{ fontSize: 17, letterSpacing: 2, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                  / 10 Index
                </span>
              </div>
            </div>
            <span style={{ marginTop: 22, fontSize: 21, letterSpacing: 2, textTransform: "uppercase", color: tone.color, fontWeight: 600 }}>
              {tone.label}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        {/* Score check cards */}
        <div style={{ display: "flex", gap: 16 }}>
          <ScoreCard kind="regulation" good={scores.regulation >= 3.75} />
          <ScoreCard kind="withdrawal" good={scores.withdrawal >= 3.75} />
          <ScoreCard kind="platform" good={scores.platform >= 3.75} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 28,
            border: `1px solid ${GOLD}55`,
            borderRadius: 16,
            padding: "20px 26px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>FX</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: TEXT_ON_INK }}>PARTNER</span>
          </div>
          <div style={{ display: "flex", width: 1, height: 22, backgroundColor: HAIRLINE_LIGHT }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GlobeIcon color={TEXT_ON_INK_MUTED} />
            <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>fxpartner.global</span>
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
