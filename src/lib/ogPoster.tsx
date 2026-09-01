import type { ReactNode } from "react";

// The poster both trade cards are composited over — /api/og/trade-signal for
// the opening call and /api/og/trade-result for its close.
//
// public/trade-card-poster.png is the owner's own design file and carries
// everything except one bordered box near the top: the logo lockup, the
// device mockups, the download call to action, the feature row and the
// footer are all painted into it. Each route masks that box and draws its
// own trade inside it.
//
// The geometry lives here rather than in either route because there are two
// of them now and a box measured twice is a box that drifts. All of it was
// measured off the PNG by scanning for the box's border — replace the design
// file and these have to be measured again.

// Absolute, because Satori fetches it over HTTP rather than reading it off
// disk. The ASCII filename matters: the design file was uploaded under a
// Turkish name, and a non-ASCII path in a URL is a fragile thing to depend
// on here.
const posterSrc = () =>
  `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global"}/trade-card-poster.png`;

export const WIDTH = 1086;
export const HEIGHT = 1448;

export const BOX_LEFT = 146;
export const BOX_TOP = 157;
export const BOX_WIDTH = 790;
export const BOX_HEIGHT = 280;

// The mask sits inside the border rather than over it, so the gold frame in
// the design file survives and only the sample trade printed inside it is
// covered.
const MASK_INSET = 3;
// Sampled from the box's interior in the design file, so the mask is
// invisible against it.
const BOX_FILL = "#050607";

// Sampled from the design file too: the warm gold of its frame and pill.
export const GOLD = "#e0a75a";
export const GOLD_DIM = "#b69c72";
export const LABEL = "#8f8b86";
export const VALUE = "#f4f4f5";
const COLUMN_RULE = "#43382c";

/** The poster, the mask, and a content box positioned over the blank frame. */
export function PosterCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc()}
        width={WIDTH}
        height={HEIGHT}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />

      {/* Mask over the sample trade printed into the design file. */}
      <div
        style={{
          position: "absolute",
          left: BOX_LEFT + MASK_INSET,
          top: BOX_TOP + MASK_INSET,
          width: BOX_WIDTH - MASK_INSET * 2,
          height: BOX_HEIGHT - MASK_INSET * 2,
          background: BOX_FILL,
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: BOX_LEFT,
          top: BOX_TOP,
          width: BOX_WIDTH,
          height: BOX_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "34px 56px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The round instrument badge from the design file. */
export function Badge({ code }: { code: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 78,
        height: 78,
        borderRadius: 39,
        border: `2px solid ${GOLD_DIM}`,
        color: GOLD,
        fontSize: code.length > 3 ? 22 : 26,
        fontWeight: 700,
      }}
    >
      {code}
    </div>
  );
}

/** The outlined pill from the design file — BUY/SELL, or WIN/LOSS. */
export function Pill({ label, color, size = 30 }: { label: string; color: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 30px",
        borderRadius: 32,
        border: `2px solid ${color}`,
        color,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  );
}

/** One of the three level columns under the instrument row. */
export function Column({
  label,
  value,
  delta,
  color,
  ruled,
}: {
  label: string;
  value: string;
  delta: string;
  color: string;
  ruled: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 0,
        paddingLeft: ruled ? 34 : 0,
        borderLeft: ruled ? `1px solid ${COLUMN_RULE}` : "none",
      }}
    >
      {/* Labels are pre-uppercased at the call site, never via textTransform:
          CSS uppercasing runs under a non-Turkish locale here and turns
          "Giriş" into "GIRIS", dropping the dotted İ and the ş. */}
      <span style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: LABEL }}>{label}</span>
      <span style={{ display: "flex", marginTop: 12, fontSize: 46, fontWeight: 700, color }}>
        {value}
      </span>
      <span
        style={{ display: "flex", marginTop: 8, fontSize: 21, color: delta ? color : "transparent" }}
      >
        {delta || "—"}
      </span>
    </div>
  );
}

/** Signed percentage change between two prices, Turkish notation. */
export function pct(from: number, to: number): string {
  if (!from) return "";
  const v = ((to - from) / from) * 100;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}%${Math.abs(v).toFixed(2)}`;
}
