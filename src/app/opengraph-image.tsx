import { ImageResponse } from "next/og";
import { brokers } from "@/data/brokers";
import { getBrokerScores } from "@/data/brokers";

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

export default async function Image() {
  const regulatorCount = new Set(brokers.flatMap((b) => b.regulators)).size;
  const topScore = Math.max(...brokers.map((b) => getBrokerScores(b).composite));

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
          backgroundImage: `radial-gradient(circle at 15% 15%, ${SIGNAL}33, transparent 45%), radial-gradient(circle at 85% 20%, ${GOLD}2e, transparent 45%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 76, fontWeight: 800, color: GOLD }}>FX</span>
            <span style={{ fontSize: 76, fontWeight: 800, color: TEXT_ON_INK }}>PARTNER</span>
          </div>
          <span style={{ marginTop: 20, fontSize: 32, color: TEXT_ON_INK_MUTED }}>
            Forex Broker Comparison and Reviews
          </span>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Brokers Reviewed", value: String(brokers.length) },
            { label: "Regulators", value: `${regulatorCount}+` },
            { label: "Top FXPARTNER Index", value: `${topScore.toFixed(1)}/10` },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 20,
                backgroundColor: INK_SOFT,
                padding: "24px 32px",
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 700, color: TEXT_ON_INK }}>
                {stat.value}
              </span>
              <span
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: TEXT_ON_INK_MUTED,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
