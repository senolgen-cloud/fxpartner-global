import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto } from "@/lib/telegram";
import { getCandles, SYMBOLS } from "@/lib/market-data";
import { sma, rsi } from "@/lib/technicals";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbolId = "BTCUSD"; // TODO: rotate across symbols once more have a real intraday data source
  const config = SYMBOLS[symbolId];
  const candles = await getCandles(symbolId);
  const closes = candles.map((c) => c[4]);
  const last = closes.length - 1;
  const currentPrice = closes[last];
  const ma10 = sma(closes, 10)[last];
  const ma20 = sma(closes, 20)[last];
  const rsiValue = rsi(closes, 14)[last];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const imageUrl = `${siteUrl}/api/og/market-chart?symbol=${symbolId}`;

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
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n` +
    `fxpartner.global`;

  const result = await sendTelegramPhoto(imageUrl, caption);
  return NextResponse.json({ ok: true, symbol: symbolId, result });
}
