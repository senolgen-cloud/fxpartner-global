import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, telegramSiteCta } from "@/lib/telegram";
import { brokers, getBrokerScores } from "@/data/brokers";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Broker İstihbaratı & İnceleme Departmanı — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Was one broker's review
// per run, rotating hourly (24 posts/day) until 2026-08-14 — that flooded
// the channel, so it's now a single weekly digest of the top 5 ranked
// brokers by FXPARTNER Index, sent as one text message instead of 5
// separate photo posts.
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

  const text =
    `🏆 <b>FXPARTNER Index — Haftanın En İyi 5 Broker'i</b>\n\n` +
    lines.join("\n") +
    `\n\n<i>Genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</i>\n\n` +
    telegramSiteCta();

  // One row per broker: "Hesap Aç" (referral link) + "İncele" (the full
  // FXPARTNER review) side by side, in the same 1-5 order as the text list.
  const inlineKeyboard = top5.map(({ broker }) => [
    { text: `${broker.name} — Hesap Aç`, url: broker.referralUrl },
    { text: "İncele", url: `${siteUrl}/brokers/${broker.slug}` },
  ]);

  const result = await sendTelegramMessage(text, { inlineKeyboard });

  return NextResponse.json({
    ok: true,
    posted: true,
    slugs: top5.map((t) => t.broker.slug),
    result,
  });
});
