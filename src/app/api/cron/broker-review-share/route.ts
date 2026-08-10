import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, telegramSiteCta } from "@/lib/telegram";
import { brokers, getBrokerBySlug } from "@/data/brokers";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Broker İstihbaratı & İnceleme Departmanı — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Posts one broker's
// review page per run, rotating deterministically through src/data/brokers.ts
// by the current hour so every run (hourly, see telegram-cron.yml) advances
// to the next broker with no DB-backed dedup needed — the list just loops.
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

  // Optional manual override (used by the broker-review-manual workflow to
  // backfill/post a specific broker on demand) — falls back to the normal
  // hour-rotation pick when absent, so the hourly schedule is unaffected.
  const slugOverride = req.nextUrl.searchParams.get("slug");
  const hoursSinceEpoch = Math.floor(Date.now() / 3_600_000);
  const target = slugOverride ? getBrokerBySlug(slugOverride) : brokers[hoursSinceEpoch % brokers.length];

  if (!target) {
    return NextResponse.json({ error: "Unknown broker slug" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const url = `${siteUrl}/brokers/${target.slug}`;
  const imageUrl = `${siteUrl}/api/og/instagram-broker/${target.slug}`;
  const stars = "⭐".repeat(Math.round(target.rating));
  // Score card image already shows rating/min-deposit/leverage/regulation
  // checks, so the caption stays short — Telegram photo captions cap at
  // 1024 chars and the full detail text used to exceed that once summary
  // was included.
  const caption =
    `<b>${target.name}</b> ${stars} (${target.rating}/5)\n\n` +
    `İncelemenin tamamı: ${url}\n\n` +
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
    telegramSiteCta();

  const result = await sendTelegramPhoto(imageUrl, caption);

  return NextResponse.json({ ok: true, posted: true, slug: target.slug, result });
});
