import { ImageResponse } from "next/og";
import { getBrokerBySlug, getBrokerScores } from "@/data/brokers";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT_ON_INK = "#f1f2f3";
const TEXT_ON_INK_MUTED = "#9a9fa6";
const SIGNAL = "#2f6ff0";
const GOLD = "#c9a227";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);

  if (!broker) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: INK,
            color: TEXT_ON_INK,
            fontSize: 48,
          }}
        >
          FXPARTNER
        </div>
      ),
      { ...size }
    );
  }

  const score = getBrokerScores(broker).composite;
  const fullStars = Math.round(broker.rating);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          backgroundImage: `radial-gradient(circle at 85% 15%, ${GOLD}2e, transparent 45%), radial-gradient(circle at 10% 85%, ${SIGNAL}2e, transparent 45%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 34, fontWeight: 800, color: GOLD }}>FX</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: TEXT_ON_INK }}>PARTNER</span>
          <span style={{ marginLeft: 16, fontSize: 22, color: TEXT_ON_INK_MUTED }}>
            Broker Review
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 84, fontWeight: 800, color: TEXT_ON_INK }}>
            {broker.name}
          </span>
          <span style={{ marginTop: 12, fontSize: 30, color: TEXT_ON_INK_MUTED }}>
            {broker.tagline}
          </span>
          <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 22,
                  marginRight: 10,
                  borderRadius: 6,
                  backgroundColor: i < fullStars ? GOLD : HAIRLINE,
                }}
              />
            ))}
            <span style={{ marginLeft: 12, fontSize: 28, color: TEXT_ON_INK_MUTED }}>
              {broker.rating.toFixed(1)} / 5
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 20,
              backgroundColor: INK_SOFT,
              padding: "20px 28px",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: GOLD }}>
              {score.toFixed(1)}/10
            </span>
            <span
              style={{
                marginTop: 6,
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: TEXT_ON_INK_MUTED,
              }}
            >
              FXPARTNER Index
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 20,
              backgroundColor: INK_SOFT,
              padding: "20px 28px",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: TEXT_ON_INK }}>
              {broker.minDeposit}
            </span>
            <span
              style={{
                marginTop: 6,
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Min. Deposit
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 20,
              backgroundColor: INK_SOFT,
              padding: "20px 28px",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: TEXT_ON_INK }}>
              {broker.maxLeverage}
            </span>
            <span
              style={{
                marginTop: 6,
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: TEXT_ON_INK_MUTED,
              }}
            >
              Max. Leverage
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
