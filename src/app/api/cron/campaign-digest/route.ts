import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, telegramSiteCta } from "@/lib/telegram";
import { sendPushToAll } from "@/lib/push";
import { brokers } from "@/data/brokers";
import { getCashbackProgram } from "@/data/cashback";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

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

export const GET = withCronErrorAlert("campaign-digest", async (req: NextRequest) => {
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
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
    telegramSiteCta();

  const result = await sendTelegramMessage(text, { disablePreview: true });

  let push: { sent: number; removed: number } | { error: string } = { sent: 0, removed: 0 };
  try {
    push = await sendPushToAll({
      title: "Bu haftanın aktif broker kampanyaları",
      body: campaigns.map((b) => b.name).join(", "),
      url: "/campaigns",
    });
  } catch (err) {
    push = { error: (err as Error).message };
  }

  return NextResponse.json({ ok: true, posted: true, count: campaigns.length, result, push });
});
