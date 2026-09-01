import { ImageResponse } from "next/og";
import { TICK_UP, TICK_DOWN } from "@/lib/ogAssets";
import { splitPair } from "@/lib/ogIcons";

export const runtime = "edge";

// Composited over the design file (public/trade-card-poster.png), which is
// the owner's own draft: logo lockup, device mockups, the download call to
// action, the feature row and the footer are all painted into that PNG. The
// only per-trade region is the bordered box near the top, which this route
// masks and redraws.
//
// This replaces a version that drew the whole card from the trade data. That
// one carried more of the trade — signal confidence, the rolling record, the
// lot ladder — because it had the room. The poster does not: between the box
// and the laptop mockup there are about twenty-five pixels. Those numbers now
// live only in the Telegram caption, which still carries them.
//
// Portrait, because the design file is. The result card
// (/api/og/trade-result) is still square, so an opening call and its result
// no longer match shape in a thread.
const WIDTH = 1086;
const HEIGHT = 1448;

// Pixel geometry of the box in trade-card-poster.png, measured off that file
// by scanning for its border — keep in sync if the design file is replaced.
const BOX_LEFT = 146;
const BOX_TOP = 157;
const BOX_WIDTH = 790;
const BOX_HEIGHT = 280;
// The mask sits inside the border rather than over it, so the gold frame in
// the design file survives and only the sample trade printed inside it is
// covered.
const MASK_INSET = 3;
// Sampled from the box's interior in the design file, so the mask is
// invisible against it.
const BOX_FILL = "#050607";

// Sampled from the design file too: the warm gold of its frame and pill.
const GOLD = "#e0a75a";
const GOLD_DIM = "#b69c72";
const LABEL = "#8f8b86";
const VALUE = "#f4f4f5";
const COLUMN_RULE = "#43382c";

function pct(from: number, to: number): string {
  if (!from) return "";
  const v = ((to - from) / from) * 100;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}%${Math.abs(v).toFixed(2)}`;
}

function Column({
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
      {/* Pre-uppercased in the source, never via textTransform: CSS
          uppercasing runs under a non-Turkish locale here and turns "Giriş"
          into "GIRIS", dropping the dotted İ and the ş. */}
      <span style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: LABEL }}>{label}</span>
      <span style={{ display: "flex", marginTop: 12, fontSize: 46, fontWeight: 700, color }}>
        {value}
      </span>
      <span style={{ display: "flex", marginTop: 8, fontSize: 21, color: delta ? color : "transparent" }}>
        {delta || "—"}
      </span>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair) {
    return new Response("Missing required param: pair", { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

  // A price of 0 means the EA hadn't detected a real SL/TP yet when it read
  // the position (it only retries for ~3s after open) — never display that as
  // if it were an actual level.
  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;

  // Locked means the caller withheld the levels, and the only thing that says
  // so is a missing entry. It must not also require a missing stop: a trade
  // opened with no stop loss set arrives with an entry and a target but no
  // stop, and testing for that locked the card while the caption below it
  // listed the levels in full.
  const locked = !entry;
  const hasTarget1 = !locked && isRealLevel(target1);
  const hasStop = !locked && isRealLevel(stop);

  const entryNum = entry ? parseFloat(entry) : 0;
  // "EUR/USD" for an FX pair, "GOLD" for everything else — splitPair returns
  // an empty quote for the instruments that are not two currencies, and a
  // trailing slash on GOLD would read as a typo.
  const [base, quote] = splitPair(pair);
  const pairLabel = quote ? `${base}/${quote}` : pair;
  // The design file's badge holds a gold-bars glyph, which is only true of
  // one instrument. The base code is the generic version of the same thing.
  const badge = base.slice(0, 4);

  // The draft draws BUY in gold. SELL is not drawn in the draft at all, and a
  // sell that looks exactly like a buy is the one difference on this card a
  // reader cannot afford to miss — so the pill keeps the drafted shape and
  // takes the direction's colour.
  const isSell = direction === "SELL";
  const directionLabel = isSell ? "SELL" : direction === "BUY" ? "BUY" : "";
  const pillColor = directionLabel ? (isSell ? TICK_DOWN : GOLD) : GOLD;

  return new ImageResponse(
    (
      <div style={{ width: WIDTH, height: HEIGHT, display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${siteUrl}/trade-card-poster.png`}
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
          {/* Instrument, badge, direction */}
          <div style={{ display: "flex", alignItems: "center" }}>
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
                fontSize: badge.length > 3 ? 22 : 26,
                fontWeight: 700,
              }}
            >
              {badge}
            </div>
            <span
              style={{
                display: "flex",
                marginLeft: 30,
                fontSize: 58,
                fontWeight: 700,
                color: VALUE,
                letterSpacing: -1,
              }}
            >
              {pairLabel}
            </span>
            {directionLabel && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 32,
                  padding: "10px 34px",
                  borderRadius: 32,
                  border: `2px solid ${pillColor}`,
                  color: pillColor,
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {directionLabel}
              </div>
            )}
          </div>

          {/* Levels */}
          {locked ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: LABEL }}>
                GİRİŞ · ZARAR DURDUR · KÂR AL
              </span>
              <span style={{ display: "flex", marginTop: 14, fontSize: 38, fontWeight: 700, color: GOLD }}>
                Seviyeler üyelere özel
              </span>
              <span style={{ display: "flex", marginTop: 8, fontSize: 21, color: LABEL }}>
                fxpartner.global/paketler
              </span>
            </div>
          ) : (
            <div style={{ display: "flex" }}>
              <Column label="GİRİŞ FİYATI" value={entry as string} delta="" color={VALUE} ruled={false} />
              <Column
                label="ZARAR DURDUR"
                value={hasStop ? (stop as string) : "—"}
                delta={hasStop ? pct(entryNum, parseFloat(stop as string)) : ""}
                color={hasStop ? TICK_DOWN : LABEL}
                ruled
              />
              <Column
                label="KÂR AL"
                value={hasTarget1 ? (target1 as string) : "—"}
                delta={hasTarget1 ? pct(entryNum, parseFloat(target1 as string)) : ""}
                color={hasTarget1 ? TICK_UP : LABEL}
                ruled
              />
            </div>
          )}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
