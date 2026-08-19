// Shared building blocks for the edge-rendered trade card images
// (/api/og/trade-signal, /api/og/trade-result) — the icon set, and the
// small layout primitives used in the identical right-hand brand panel and
// bottom footer strip of both cards.
import { TEXT_ON_INK, TEXT_ON_INK_MUTED, HAIRLINE } from "@/lib/ogAssets";

// Splits a 6-letter FX pair into its two currency codes (EURUSD -> EUR,USD)
// so the OG cards can style the halves separately. Anything that isn't a
// plain 6-letter alphabetic pair is returned whole: index, metal, crypto and
// energy symbols carry digits and longer names, and the old version both
// stripped the digits and then sliced blindly — turning US100CASH into
// "USCASH" and GOLD24-7 into "GOL"+"D". Only strip separators, never digits.
export function splitPair(pair: string): [string, string] {
  const clean = pair.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length === 6 && /^[A-Z]{6}$/.test(clean)) {
    return [clean.slice(0, 3), clean.slice(3, 6)];
  }
  return [clean, ""];
}

export function ShieldIcon({ color }: { color: string }) {
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

export function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M20 20 16 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ color }: { color: string }) {
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

export function UsersIcon({ color }: { color: string }) {
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

export function CandlesIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M6 3v4M6 13v8M10 6h-4v5h4z" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M14 9v3M14 18v3M18 5h-4v9h4z" stroke={color} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function CopyTradeIcon({ color }: { color: string }) {
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

export function CapIcon({ color }: { color: string }) {
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

export function HeadsetIcon({ color }: { color: string }) {
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

export function Feature({
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

export function FooterItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon}
      <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED }}>{label}</span>
    </div>
  );
}

export function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TelegramIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        d="M21 4 3 11.2c-.9.35-.9 1.63.02 1.96l4.3 1.55 1.65 5.1c.28.86 1.4 1.06 1.96.35l2.34-2.95 4.4 3.28c.8.6 1.95.16 2.16-.82L23 5.1c.24-1.1-.9-1.98-2-1.1Zm-3.1 3.7-8.1 7.1-.35 3.2-1.6-4.95 9.1-6.35Z"
        fill={color}
      />
    </svg>
  );
}

export function YoutubeIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M10.2 9.5v5l4.6-2.5Z" fill={color} />
    </svg>
  );
}

export function InstagramIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5.5" stroke={color} strokeWidth="1.7" fill="none" />
      <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.7" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill={color} />
    </svg>
  );
}

export function XIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path d="M4 4l16 16M20 4 4 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FacebookIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="16" viewBox="0 0 20 24">
      <path
        d="M14 3h-2.5C9 3 7.5 4.6 7.5 7.3V10H5v3.6h2.5V21H11v-7.4h2.6l.5-3.6h-3.1V7.6c0-1 .3-1.7 1.7-1.7H14Z"
        fill={color}
      />
    </svg>
  );
}

export function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 999,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      {children}
    </div>
  );
}

// Icon + title + muted subtitle, in its own translucent rounded box — used
// where these sit on top of the hero photo and need contrast against
// whatever's behind them, unlike the plain-background footer strip.
export function FeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(7,9,11,0.64)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(34,211,238,0.18)",
        }}
      >
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_ON_INK }}>{title}</span>
        <span style={{ fontSize: 11, color: "#c7ced1" }}>{subtitle}</span>
      </div>
    </div>
  );
}

// Icon + title + muted subtitle for the plain-background bottom footer
// strip (no translucent box needed there, unlike FeatureCard).
export function FooterFeature({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "rgba(34,211,238,0.12)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_ON_INK }}>{title}</span>
        <span style={{ fontSize: 10.5, color: TEXT_ON_INK_MUTED }}>{subtitle}</span>
      </div>
    </div>
  );
}

// Deterministic (seeded) squiggle so the same card always renders the same
// decorative line — not real price data, just visual flavor for the info
// card, so it must stay stable across re-renders/retries of the same trade.
function seededRandom(seedStr: string): () => number {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  if (seed === 0) seed = 1;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Sparkline({
  seed,
  color,
  trendUp,
  width,
  height,
}: {
  seed: string;
  color: string;
  trendUp: boolean;
  width: number;
  height: number;
}) {
  const rand = seededRandom(seed);
  const points = 22;
  const pad = 6;
  const vals: number[] = [];
  let v = 0.5;
  for (let i = 0; i < points; i++) {
    v += (rand() - 0.48) * 0.16 + (trendUp ? 0.012 : -0.012);
    v = Math.max(0.08, Math.min(0.92, v));
    vals.push(v);
  }
  const step = (width - pad * 2) / (points - 1);
  const coords = vals.map((val, i) => [pad + i * step, pad + (1 - val) * (height - pad * 2)]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = coords[coords.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={5} fill={color} />
    </svg>
  );
}

export function InfoPill({
  icon,
  mutedText,
  accentText,
  accentColor,
}: {
  icon: React.ReactNode;
  mutedText: string;
  accentText: string;
  accentColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 16,
        padding: "13px 20px",
        borderRadius: 999,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      {icon}
      <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED }}>{mutedText}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: accentColor }}>{accentText}</span>
    </div>
  );
}

