import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, telegramSiteCta, telegramContactCta, mainServicesKeyboard } from "@/lib/telegram";
import { getCandles, MAX_CANDLE_AGE_MS, SYMBOLS } from "@/lib/market-data";
import { sma, rsi } from "@/lib/technicals";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Piyasa Analizi Departmanı (Kaan Ediz) — see src/lib/departments.ts
// and docs/ORGANIZATION.md. Paused by default: only fires via
// workflow_dispatch in .github/workflows/telegram-cron.yml.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("market-update", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbolId = "BTCUSD"; // TODO: rotate across symbols once more have a real intraday data source
  const config = SYMBOLS[symbolId];
  const candles = await getCandles(symbolId);

  // A price is a factual claim, and an old one is a false claim stated
  // with confidence. If the newest candle is not recent, this posts
  // nothing rather than posting a number it cannot stand behind.
  const newest = candles.length ? candles[candles.length - 1][0] : 0;
  const age = Date.now() - newest;
  if (!candles.length || age > MAX_CANDLE_AGE_MS) {
    return NextResponse.json({
      ok: true,
      posted: false,
      reason: "stale candles",
      newestCandleAgeMinutes: candles.length ? Math.round(age / 60000) : null,
    });
  }

  const closes = candles.map((c) => c[4]);
  const last = closes.length - 1;
  const currentPrice = closes[last];
  const ma10 = sma(closes, 10)[last];
  const ma20 = sma(closes, 20)[last];
  const rsiValue = rsi(closes, 14)[last];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  // The caption and the chart used to fetch the same feed independently,
  // which is how they came to disagree by $15,000. The numbers are
  // computed once here and handed to the image, so the two cannot drift
  // apart again whatever the feed does.
  const imageUrl =
    `${siteUrl}/api/og/market-chart?symbol=${symbolId}` +
    `&price=${currentPrice}&ma10=${ma10 ?? ""}&ma20=${ma20 ?? ""}&rsi=${rsiValue ?? ""}`;

  const aboveMA10 = ma10 !== null && currentPrice >= ma10;
  const aboveMA20 = ma20 !== null && currentPrice >= ma20;
  let rsiZone = "notr bolgede";
  if (rsiValue !== null) {
    if (rsiValue >= 70) rsiZone = "asiri alim bolgesine yakin";
    else if (rsiValue <= 30) rsiZone = "asiri satim bolgesine yakin";
  }

  const caption =
    `<b>${config.label}</b> su an $${currentPrice.toLocaleString("en-US")} seviyesinde.\n` +
    `Fiyat MA10'un ${aboveMA10 ? "uzerinde" : "altinda"}, MA20'nin ${aboveMA20 ? "uzerinde" : "altinda"}. ` +
    `RSI(14) ${rsiValue !== null ? rsiValue.toFixed(1) : "-"} ile ${rsiZone}.\n\n` +
    `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.\n\n` +
    telegramSiteCta() +
    `\n\n${telegramContactCta()}`;

  const result = await sendTelegramPhoto(imageUrl, caption, { inlineKeyboard: mainServicesKeyboard() });
  return NextResponse.json({ ok: true, symbol: symbolId, result });
});
