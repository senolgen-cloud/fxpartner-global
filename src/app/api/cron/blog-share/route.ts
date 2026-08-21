import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  telegramSiteCta,
  telegramContactCta,
  mainServicesKeyboard,
} from "@/lib/telegram";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { blogPosts } from "@/data/blog";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Haber & Editöryal Departmanı — see src/lib/departments.ts and
// docs/ORGANIZATION.md. Announces /blog posts to Telegram + web push once
// they're live. Unlike market-analysis-share (one post per day), several
// blog posts can go live at once, so this posts the single OLDEST
// not-yet-announced entry per run — with the every-2h schedule in
// telegram-cron.yml, a backlog drains one post per run instead of
// flooding the channel all at once.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("blog-share", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let target: (typeof blogPosts)[number] | undefined;
  for (const post of blogPosts) {
    const key = `blog:${post.slug}`;
    if (!(await isAlreadyPostedToTelegram(key))) {
      target = post;
      break;
    }
  }

  if (!target) {
    return NextResponse.json({ ok: true, posted: false, reason: "no unposted entries" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const url = `${siteUrl}/blog/${target.slug}`;
  const text =
    `<b>${target.title}</b>\n\n${target.excerpt}\n\n` +
    `Devamını oku: ${url}\n\n` +
    `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.\n\n` +
    telegramSiteCta() +
    `\n\n${telegramContactCta()}`;

  // Posts that ship a cover go out as a photo post rather than a bare link
  // whose preview Telegram may or may not expand — the cover is already a
  // purpose-made image and reads far better in the channel feed. sendPhoto
  // caps the caption at 1024 characters, so anything longer (or any post
  // without a cover) falls back to the plain text message.
  const photoUrl = target.coverImage ? `${siteUrl}${target.coverImage}` : undefined;
  const keyboard = mainServicesKeyboard();
  const result =
    photoUrl && text.length <= 1024
      ? await sendTelegramPhoto(photoUrl, text, { inlineKeyboard: keyboard })
      : await sendTelegramMessage(text, { inlineKeyboard: keyboard });
  await markPostedToTelegram(`blog:${target.slug}`);

  let push: PushResult | { error: string } = { sent: 0, removed: 0, failed: 0 };
  try {
    push = await sendPushToAll({ title: target.title, body: target.excerpt, url: `/blog/${target.slug}` });
  } catch (err) {
    push = { error: (err as Error).message };
  }

  return NextResponse.json({ ok: true, posted: true, slug: target.slug, result, push });
});
