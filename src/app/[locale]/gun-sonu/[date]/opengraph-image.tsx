import { ImageResponse } from "next/og";
import { formatDayLabel, formatUsd, getDailyReport, lastCompletedDay } from "@/lib/dailyReport";

// Telegram'a giden linkin önizleme kartı. Sahibinin istediği "tabloyu
// paylaş" işini yapan parça bu: mesajda rakamlar, sayfada tam kayıt.
//
// Node runtime — broker OG görselindeki gerekçenin aynısı (çeviri kataloğu
// edge'in 1MB sınırını aşıyor) ve bir OG görseli zaten CDN'de önbelleklenir.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FXPARTNER gün sonu raporu";

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT = "#f1f2f3";
const MUTED = "#9a9fa6";
const UP = "#22c55e";
const DOWN = "#e5484d";

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const report = date <= lastCompletedDay() ? await getDailyReport(date) : null;
  const trades = report?.trades ?? [];
  const total = report?.total ?? 0;
  const up = total >= 0;
  const label = formatDayLabel(date);

  // En büyük dört işlem: bir gün 36 işlem kapatabiliyor, karta hepsi sığmaz
  // ve sığdırmaya çalışmak okunmayan bir liste üretir.
  const top = [...trades].sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: INK,
          color: TEXT,
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 6, color: MUTED }}>GÜN SONU RAPORU</div>
            <div style={{ fontSize: 34, marginTop: 10 }}>{label}</div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: MUTED }}>FXPARTNER</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 34 }}>
          <div style={{ fontSize: 108, fontWeight: 800, color: up ? UP : DOWN, lineHeight: 1 }}>
            {formatUsd(total, 2)}
          </div>
          {/* Tek bir metin düğümü: Satori, birden çok çocuğu olan her div'de
              açık display:flex istiyor ve parçalı yazınca 500 veriyor. */}
          <div style={{ fontSize: 26, color: MUTED, paddingBottom: 14 }}>
            {`${trades.length} işlem · ${report?.wins ?? 0}W / ${report?.losses ?? 0}L`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 40 }}>
          {top.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: INK_SOFT,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 14,
                padding: "16px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
                <span style={{ fontWeight: 700 }}>{t.pair}</span>
                <span style={{ fontSize: 22, color: t.direction === "SELL" ? DOWN : UP }}>
                  {t.direction ?? ""}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: t.profit >= 0 ? UP : DOWN }}>
                {formatUsd(t.profit, 2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: MUTED }}>
          {`fxpartner.global/gun-sonu/${date}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
