import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, telegramSiteCta, telegramContactCta, contactButtonRow } from "@/lib/telegram";
import { brokers, getBrokerScores } from "@/data/brokers";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Broker İstihbaratı & İnceleme Departmanı — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Was one broker's review
// per run, rotating hourly (24 posts/day) until 2026-08-14 — that flooded
// the channel, so it's now a single digest of the top 5 ranked brokers by
// FXPARTNER Index, sent as one text message instead of 5 separate photo
// posts, on the 4x/day cadence in telegram-cron.yml (was briefly weekly).
// Web push goes out once a day, not on every run — see below.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("broker-review-share", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (brokers.length === 0) {
    return NextResponse.json({ ok: true, posted: false, reason: "no brokers" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

  const top5 = [...brokers]
    .map((b) => ({ broker: b, scores: getBrokerScores(b) }))
    .sort((a, b) => b.scores.composite - a.scores.composite)
    .slice(0, 5);

  // Kept deliberately spare — no stars, no per-broker link repetition. The
  // buttons below already carry every action; the message itself is just
  // a clean, scannable ranking. Keeps telegramSiteCta()'s link so Telegram
  // still attaches its normal site preview card (the owner wants that
  // preview, just not the star-heavy/cluttered text from before).
  const lines = top5.map(
    ({ broker, scores }, i) => `${i + 1}.  <b>${broker.name}</b>  —  ${scores.composite.toFixed(1)}/10`
  );

  // "Haftanın" was left over from the week the digest was briefly weekly;
  // it posts four times a day now, and the push it fires alongside already
  // says Günün.
  const text =
    `🏆 <b>FXPARTNER Index — Günün En İyi 5 Broker'i</b>\n\n` +
    lines.join("\n") +
    `\n\n<i>Genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</i>\n\n` +
    telegramSiteCta() +
    `\n\n${telegramContactCta()}`;

  // One row per broker: "Hesap Aç" (referral link) + "İncele" (the full
  // FXPARTNER review) side by side, in the same 1-5 order as the text list.
  // Contact row appended by hand: this is the one post that builds its own
  // keyboard instead of mainServicesKeyboard(), which carries that row for
  // everything else.
  const inlineKeyboard = [
    ...top5.map(({ broker }) => [
      { text: `${broker.name} — Hesap Aç`, url: broker.referralUrl },
      { text: "İncele", url: `${siteUrl}/brokers/${broker.slug}` },
    ]),
    contactButtonRow(),
  ];

  const result = await sendTelegramMessage(text, { inlineKeyboard });

  // Telegram gets this digest four times a day; push subscribers get it
  // once. A ranking that barely moves between runs is not worth four
  // notifications, and the daily budget is already shared with the news
  // bulletin, the blog, the market analysis and the calendar alerts.
  // Keyed on the Türkiye-time date so "once a day" means the local day.
  const todayKey = `push:broker-digest:${new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
  }).format(new Date())}`;

  let push: PushResult | { skipped: string } | { error: string } = { skipped: "already pushed today" };
  if (!(await isAlreadyPostedToTelegram(todayKey))) {
    try {
      push = await sendPushToAll({
        title: "FXPARTNER Index — Günün En İyi 5 Brokeri",
        body: top5.map(({ broker, scores }) => `${broker.name} ${scores.composite.toFixed(1)}`).join(" · "),
        url: "/brokerlar",
      });
      await markPostedToTelegram(todayKey);
    } catch (err) {
      // Not marked, so the next run today retries — the Telegram post has
      // already gone out either way and must not fail over this.
      console.error("Broker digest push failed:", err);
      push = { error: (err as Error).message };
    }
  }

  return NextResponse.json({
    ok: true,
    posted: true,
    slugs: top5.map((t) => t.broker.slug),
    result,
    push,
  });
});
