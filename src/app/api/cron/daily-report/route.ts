import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, mainServicesKeyboard } from "@/lib/telegram";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { markChannelPosted } from "@/lib/telegram-pace";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { formatDayLabel, formatUsd, getDailyReport, lastCompletedDay } from "@/lib/dailyReport";

// Gün sonu raporu — TSİ 00:00'da biten günün kaydı.
//
// Sıra: önce site, sonra Telegram. Sayfa zaten veritabanından üretiliyor
// (/gun-sonu/<tarih>), yani rapor cron çalışmadan önce de oradadır; bu rota
// yalnızca kanala özeti ve linki gönderir. Kanal mesajı özet, sayfa kayıt.
//
// NEDEN channel-dispatch ROTASYONUNDA DEĞİL: dispatcher içerik gönderilerini
// 4 saatte bire paceliyor ve sırayı kendi seçiyor. Bu gönderinin anlamı
// saatinde olmasında — "gün sonu" 06:00'da gelirse gün sonu olmaz. Günde tek
// bir mesaj olduğu için de dispatcher'ın önlediği taşkınlığı yaratmıyor.
// Yine de markChannelPosted ile pace saati güncelleniyor: rapordan hemen
// sonra dispatcher'ın bir içerik daha atmasının önüne geçiyor.
//
// GitHub cron'u hatırlatma: hafızadaki nota göre zamanlama ~1 saat kayabiliyor
// ve aynı saat içinde birden fazla tetikleme gelebiliyor. Bu yüzden rota
// tarihi kendisi hesaplıyor (lastCompletedDay) ve gönderim anahtarı tarihe
// bağlı — 00:05'te de 00:55'te de aynı gün için ikinci mesaj çıkmaz.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("daily-report", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  // ?date=YYYY-MM-DD ile elle de çalıştırılabilir (geçmiş bir günü yeniden
  // yayınlamak ya da testler için); verilmezse biten gün.
  const date = req.nextUrl.searchParams.get("date") ?? lastCompletedDay();

  const key = `daily-report:${date}`;
  if (await isAlreadyPostedToTelegram(key)) {
    return NextResponse.json({ ok: true, posted: false, reason: "already posted", date });
  }

  const report = await getDailyReport(date);
  if (!report || report.trades.length === 0) {
    // İşlemsiz gün gönderilmez. "Bugün işlem yok" mesajı her hafta sonu iki
    // kez düşerse kanal okunmaz hale gelir; sayfa da o gün için açılmıyor.
    return NextResponse.json({ ok: true, posted: false, reason: "no closed trades", date });
  }

  const label = formatDayLabel(date);
  const up = report.total >= 0;
  const winRate = Math.round((report.wins / report.trades.length) * 100);
  const url = `${siteUrl}/gun-sonu/${date}`;

  // En büyük üç işlem. Tamamı sayfada; mesaj özet olarak kalıyor.
  const top = [...report.trades]
    .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))
    .slice(0, 3)
    .map((t) => `• ${t.pair} ${t.direction ?? ""} — <b>${formatUsd(t.profit)}</b>`)
    .join("\n");

  const text = [
    `${up ? "🟢" : "🔴"} <b>GÜN SONU RAPORU</b>`,
    label,
    "",
    `Sonuç: <b>${formatUsd(report.total)}</b>`,
    `İşlem: <b>${report.trades.length}</b> · ${report.wins}W / ${report.losses}L · Başarı %${winRate}`,
    "",
    top,
    "",
    `Günün tamamı — her işlem tek tek:`,
    url,
    "",
    `<i>Takip edilen MT5 hesabında gerçekleşen kâr/zarardır. Geçmiş performans gelecekteki sonuçların garantisi değildir.</i>`,
  ].join("\n");

  // ?dry=1 — mesajı kurar, göndermez ve hiçbir şeyi işaretlemez. Kanala
  // test mesajı düşürmeden metni görmek için; hafızadaki not gereği cron
  // mantığı canlı uca istek atılarak denenmiyor.
  if (req.nextUrl.searchParams.get("dry") === "1") {
    return NextResponse.json({
      ok: true,
      posted: false,
      dryRun: true,
      date,
      total: report.total,
      trades: report.trades.length,
      url,
      text,
    });
  }

  await sendTelegramMessage(text, {
    // Önizleme açık: paylaşılan şey zaten o kart (gün sonu OG görseli).
    disablePreview: false,
    inlineKeyboard: [
      [{ text: "📊 Günün raporu", url }],
      ...mainServicesKeyboard(),
    ],
  });

  await markPostedToTelegram(key);
  await markChannelPosted();

  return NextResponse.json({
    ok: true,
    posted: true,
    date,
    total: report.total,
    trades: report.trades.length,
    url,
  });
});
