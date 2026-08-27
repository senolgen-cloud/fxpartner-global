import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, telegramSiteCta, telegramContactCta, mainServicesKeyboard } from "@/lib/telegram";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { brokers } from "@/data/brokers";
import { getCashbackProgram } from "@/data/cashback";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { formatMessage } from "@/lib/chrome";
import { localePath } from "@/lib/i18n";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";

// Owned by Reklam & Kampanya Departmanı (Sena Yıldırım) — see
// src/lib/departments.ts and docs/ORGANIZATION.md, which records this
// department as automation: "active". (This header used to say the job was
// paused pending Compliance & Brand sign-off; by then it had been on a
// weekly schedule in telegram-cron.yml for some time, and the department
// record is the authority on what is approved.)
//
// Scheduled through /api/cron/channel-dispatch rather than holding a cron
// of its own, so the weekly digest takes its turn in the channel's
// four-hour pace instead of landing on top of whatever else went out that
// morning.
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

  // Once a week, however often the dispatcher offers a turn. The rotation
  // can reach this source six times a day, and without a key it would
  // republish the same digest each time. Keyed on the Türkiye-time Monday,
  // so "this week" is the week the reader is in.
  const istanbulNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
  );
  // getDay(): 0 = Sunday, which belongs to the week that is ending.
  const monday = new Date(istanbulNow);
  monday.setDate(monday.getDate() - ((istanbulNow.getDay() + 6) % 7));
  const weekKey = `campaign-digest:${monday.toISOString().slice(0, 10)}`;
  if (await isAlreadyPostedToTelegram(weekKey)) {
    return NextResponse.json({ ok: true, posted: false, reason: "already posted this week" });
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
    `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.\n\n` +
    telegramSiteCta() +
    `\n\n${telegramContactCta()}`;

  const result = await sendTelegramMessage(text, {
    disablePreview: true,
    inlineKeyboard: mainServicesKeyboard(),
  });

  // Marked after the send, like every other source here: a failed post
  // must stay retryable rather than burning the week's slot.
  await markPostedToTelegram(weekKey);

  let push: PushResult | { error: string } = { sent: 0, removed: 0, failed: 0 };
  try {
    push = await sendPushToAll((loc) => ({
      title: formatMessage(loc, "Bu haftanın aktif broker kampanyaları", {}),
      // Broker names are proper nouns and stay as they are in every tree.
      body: campaigns.map((b) => b.name).join(", "),
      url: localePath(loc, "/campaigns"),
    }));
  } catch (err) {
    push = { error: (err as Error).message };
  }

  return NextResponse.json({ ok: true, posted: true, count: campaigns.length, result, push });
});
