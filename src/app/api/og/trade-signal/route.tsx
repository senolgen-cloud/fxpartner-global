import { ImageResponse } from "next/og";
import { TEXT_ON_INK, TEXT_ON_INK_MUTED, SIGNAL, TICK_UP, TICK_DOWN, HAIRLINE } from "@/lib/ogAssets";
import { splitPair, Sparkline } from "@/lib/ogIcons";

export const runtime = "edge";

// Matches the user-provided design file (public/trade-card-bg.png) 1:1 —
// that PNG already contains the entire card (logo, headline, feature list,
// QR, footer, trusted-partner logos, social row) except the left info box,
// which is left blank there for this route to fill in per-trade.
const SIZE = 1254;

// Pixel geometry of the blank info box in trade-card-bg.png, measured
// directly off that file — keep in sync if the design file is replaced.
const BOX_LEFT = 76;
const BOX_TOP = 228;
const BOX_WIDTH = 332;
const MASK_LEFT = 54;
const MASK_TOP = 392;
const MASK_WIDTH = 376;
const MASK_HEIGHT = 404;
// Sampled from the box's interior background so the mask (which covers the
// design file's placeholder sample chart) is invisible against it.
const BOX_FILL = "#000000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL
  const confidence = searchParams.get("confidence");
  // Rolling track record, passed in by the caller rather than queried here —
  // this route is edge/`ImageResponse` and gets re-fetched by Telegram and X
  // on every post, so it stays a pure renderer with no DB round-trip.
  // Source of the numbers: lib/signalStats.ts (count-based only).
  const statTrades = searchParams.get("statTrades");
  const statWinRate = searchParams.get("statWinRate");
  const statDays = searchParams.get("statDays") ?? "30";
  const hasStats = Boolean(statTrades && statWinRate);

  // Public Telegram/X announcements carry the instrument, direction and
  // confidence; the price levels (entry/TP/SL) are the paid product and
  // require an active package on-site (see /api/trade-signal). This route
  // renders that teaser card when entry/stop are omitted — direction and
  // confidence still show, so the card says something real instead of
  // being a blank lock screen.
  const locked = !entry || !stop;

  if (!pair) {
    return new Response("Missing required param: pair", { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const [base, quote] = splitPair(pair);
  const directionColor = direction === "SELL" ? TICK_DOWN : TICK_UP;
  // Shown on locked cards too — direction alone isn't tradeable, and it's
  // what makes the later result card verifiable after the fact.
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";

  // A price of 0 means the EA hadn't detected a real SL/TP yet when it read
  // the position (it only retries for ~3s after open) — never display that
  // as if it were an actual level.
  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;
  const hasTarget1 = !locked && isRealLevel(target1);
  const hasStop = !locked && isRealLevel(stop);

  return new ImageResponse(
    (
      <div style={{ width: SIZE, height: SIZE, position: "relative", display: "flex", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${siteUrl}/trade-card-bg.png`}
          width={SIZE}
          height={SIZE}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          alt=""
        />

        {/* Symbol + direction badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            left: BOX_LEFT,
            top: BOX_TOP,
            width: BOX_WIDTH,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 800, color: TEXT_ON_INK }}>
            {base}
            {quote}
          </span>
          {directionLabel && (
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 1,
                color: "#ffffff",
                background: directionColor,
                borderRadius: 999,
                padding: "7px 22px",
              }}
            >
              {directionLabel}
            </div>
          )}
        </div>

        {/* Entry price value — sits directly under the "ENTRY PRICE" label
            already baked into the design file, just below the box top. */}
        <div style={{ display: "flex", position: "absolute", left: BOX_LEFT, top: 312, width: BOX_WIDTH }}>
          {locked ? (
            <span style={{ fontSize: 26, fontWeight: 800, color: TEXT_ON_INK_MUTED, letterSpacing: -0.5 }}>
              🔒 Üyelere Özel
            </span>
          ) : (
            <span style={{ fontSize: 60, fontWeight: 800, color: SIGNAL, letterSpacing: -1 }}>{entry}</span>
          )}
        </div>

        {/* Mask over the design file's placeholder sample chart, so the
            real sparkline/TP/SL below don't render on top of it. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: MASK_LEFT,
            top: MASK_TOP,
            width: MASK_WIDTH,
            height: MASK_HEIGHT,
            background: BOX_FILL,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            left: BOX_LEFT,
            top: MASK_TOP + 18,
            width: BOX_WIDTH,
          }}
        >
          {locked ? (
            // Locked cards lead with what we *can* show — the confidence the
            // EA assigned this setup, and the rolling track record — instead
            // of a bare padlock that gives a scroller no reason to stop.
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: BOX_WIDTH,
                height: 220,
                textAlign: "center",
              }}
            >
              {confidence ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Written pre-uppercased rather than via textTransform:
                      CSS uppercasing runs under a non-Turkish locale here and
                      turns "Sinyal Güveni" into "SINYAL GÜVENI", dropping the
                      dotted İ. */}
                  <span style={{ fontSize: 13, letterSpacing: 1.5, color: TEXT_ON_INK_MUTED }}>
                    SİNYAL GÜVENİ
                  </span>
                  <span style={{ fontSize: 68, fontWeight: 800, color: SIGNAL, letterSpacing: -2, marginTop: 2 }}>
                    %{confidence}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 48 }}>🔒</span>
              )}

              {hasStats ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: TICK_UP }}>
                    %{statWinRate} isabet
                  </span>
                  <span style={{ fontSize: 15, color: TEXT_ON_INK_MUTED, marginTop: 2 }}>
                    son {statDays} günde {statTrades} işlem
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 16, color: TEXT_ON_INK_MUTED, marginTop: 10 }}>
                  Seviyeler üyelere özel
                </span>
              )}
            </div>
          ) : (
            <Sparkline
              seed={`${pair}-${entry}-${direction}`}
              color={directionColor}
              trendUp={direction !== "SELL"}
              width={BOX_WIDTH}
              height={220}
            />
          )}

          <div style={{ display: "flex", width: BOX_WIDTH, marginTop: 20, height: 1, background: HAIRLINE }} />

          <div style={{ display: "flex", gap: 32, marginTop: 22 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                Take Profit
              </span>
              <span style={{ fontSize: 30, fontWeight: 800, color: hasTarget1 ? TICK_UP : TEXT_ON_INK_MUTED, marginTop: 4 }}>
                {locked ? "🔒" : hasTarget1 ? target1 : "—"}
              </span>
            </div>
            <div style={{ display: "flex", width: 1, background: HAIRLINE }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: TEXT_ON_INK_MUTED }}>
                Stop Loss
              </span>
              <span style={{ fontSize: 30, fontWeight: 800, color: hasStop ? TICK_DOWN : TEXT_ON_INK_MUTED, marginTop: 4 }}>
                {locked ? "🔒" : hasStop ? stop : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
