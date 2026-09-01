import { ImageResponse } from "next/og";
import { INK, INK_SOFT, HAIRLINE, TEXT_ON_INK, TEXT_ON_INK_MUTED, TICK_UP, TICK_DOWN } from "@/lib/ogAssets";

export const runtime = "edge";

// Coded from scratch (no background design file, unlike /api/og/trade-signal)
// — a compact "pivot ladder" card: resistance levels stacked above the pivot,
// supports below it, with the bias arrow pointing at whichever side the
// preference scenario targets. Levels' strength (0-2 asterisks in the source
// research) controls how bold each row renders.
const WIDTH = 1200;
const HEIGHT = 1200;

function levelWeight(strength: number) {
  return strength >= 2 ? 800 : strength >= 1 ? 700 : 500;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instrument = searchParams.get("instrument") ?? "";
  const timeframe = searchParams.get("timeframe") ?? "";
  const pivot = searchParams.get("pivot") ?? "";
  const lastPrice = searchParams.get("last") ?? "";
  const bias = (searchParams.get("bias") ?? "BEARISH").toUpperCase();
  const headline = searchParams.get("headline") ?? "";
  // ";" and not "," between levels: the prices arrive in Turkish notation
  // ("1,1614", "4.458", "309,13"), so splitting on a comma tears every
  // decimal in half and the ladder renders "309" and "13" as two levels.
  // See the matching join in components/TechnicalAnalysisCard.tsx.
  const levels = (raw: string | null) =>
    (raw ?? "")
      .split(";")
      .filter(Boolean)
      .map((s) => {
        const [price, strength] = s.split(":");
        return { price, strength: Number(strength ?? 0) };
      });
  const resistances = levels(searchParams.get("resistances"));
  const supports = levels(searchParams.get("supports"));

  if (!instrument || !pivot) {
    return new Response("Missing required params: instrument, pivot", { status: 400 });
  }

  const isBearish = bias === "BEARISH";
  const biasColor = isBearish ? TICK_DOWN : TICK_UP;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          background: INK,
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: TEXT_ON_INK_MUTED, textTransform: "uppercase" }}>
              FXPARTNER Teknik Analiz
            </span>
            <span style={{ fontSize: 56, fontWeight: 800, color: TEXT_ON_INK, marginTop: 6 }}>
              {instrument}
              {timeframe && (
                <span style={{ fontSize: 26, fontWeight: 600, color: TEXT_ON_INK_MUTED, marginLeft: 16 }}>{timeframe}</span>
              )}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1,
              color: "#ffffff",
              background: biasColor,
              borderRadius: 999,
              padding: "12px 28px",
            }}
          >
            {isBearish ? "▼ DÜŞÜŞ" : "▲ YÜKSELİŞ"}
          </div>
        </div>

        {headline && (
          <span style={{ display: "flex", fontSize: 30, fontWeight: 700, color: TEXT_ON_INK, marginTop: 28 }}>{headline}</span>
        )}

        {/* Ladder: resistances (top, muted-to-strong descending toward pivot), pivot, supports */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, flex: 1 }}>
          {resistances.map((r) => (
              <div
                key={`res-${r.price}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 28px",
                  marginBottom: 10,
                  borderRadius: 14,
                  background: INK_SOFT,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, color: TICK_UP, letterSpacing: 1 }}>DİRENÇ</span>
                <span style={{ fontSize: 34, fontWeight: levelWeight(r.strength), color: TEXT_ON_INK }}>{r.price}</span>
              </div>
            ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 28px",
              margin: "6px 0",
              borderRadius: 14,
              background: "#1b2430",
              border: "1px solid #2c3a4a",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: "#8fb3ff", letterSpacing: 1 }}>PIVOT</span>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#ffffff" }}>{pivot}</span>
          </div>

          {supports.map((s) => (
            <div
              key={`sup-${s.price}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 28px",
                marginTop: 10,
                borderRadius: 14,
                background: INK_SOFT,
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 700, color: TICK_DOWN, letterSpacing: 1 }}>DESTEK</span>
              <span style={{ fontSize: 34, fontWeight: levelWeight(s.strength), color: TEXT_ON_INK }}>{s.price}</span>
            </div>
          ))}
        </div>

        {/* Last price strip — only shown when the source write-up gave one */}
        {lastPrice && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 24,
              padding: "16px 28px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: TEXT_ON_INK_MUTED, letterSpacing: 1 }}>GÜNCEL FİYAT</span>
            <span style={{ fontSize: 30, fontWeight: 800, color: TEXT_ON_INK }}>{lastPrice}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: TEXT_ON_INK }}>FXPARTNER</span>
          <span style={{ fontSize: 20, color: TEXT_ON_INK_MUTED }}>{siteUrl.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
