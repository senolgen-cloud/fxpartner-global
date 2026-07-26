import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { brokers } from "@/data/brokers";
import { getCashbackProgram } from "@/data/cashback";

// Owned by Reklam & Kampanya Departmanı (Sena Yıldırım) — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Paused by default:
// only fires via workflow_dispatch in .github/workflows/telegram-cron.yml.
// Compliance & Brand sign-off is required before this is ever put on a
// schedule (see docs/ORGANIZATION.md "Otomasyon durumları ne anlama gelir").
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = brokers.filter((b) => b.promotion);
  if (campaigns.length === 0) {
    return NextResponse.json({ ok: true, posted: false, reason: "no active campaigns" });
  }

  const lines = campaigns.map((b) => {
    const cashback = getCashbackProgram(b.slug);
    const cashbackLine = cashback ? `\nCashback: ${cashback.rateLabel}` : "";
    return `<b>${b.name}</b> — ${b.promotion!.tag}: ${b.promotion!.title}${cashbackLine}`;
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const text =
    `<b>Bu haftanin aktif broker kampanyalari</b>\n\n` +
    lines.join("\n\n") +
    `\n\nTum detaylar ve guncel sartlar: ${siteUrl}/campaigns\n\n` +
    `Sartlar brokere gore degisebilir ve onceden haber verilmeden guncellenebilir. ` +
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n` +
    `fxpartner.global`;

  const result = await sendTelegramMessage(text, { disablePreview: true });
  return NextResponse.json({ ok: true, posted: true, count: campaigns.length, result });
}
