// Shared building blocks for the edge-rendered trade card images
// (/api/og/trade-signal, /api/og/trade-result) — the icon set, and the
// small layout primitives used in the identical right-hand brand panel and
// bottom footer strip of both cards.
import { TEXT_ON_INK, TEXT_ON_INK_MUTED } from "@/lib/ogAssets";

export function splitPair(pair: string): [string, string] {
  const clean = pair.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (clean.length >= 6) return [clean.slice(0, 3), clean.slice(3, 6)];
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

