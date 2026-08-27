import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  telegramSiteCta,
  telegramContactCta,
  mainServicesKeyboard,
} from "@/lib/telegram";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { postTextToX, postTradeSignalToX } from "@/lib/x";
import { blogPosts } from "@/data/blog";
import { localizeBlogPost } from "@/lib/localizeContent";
import { localePath } from "@/lib/i18n";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Haber & Editöryal Departmanı — see src/lib/departments.ts and
// docs/ORGANIZATION.md. Announces /blog posts to Telegram + web push once
// they're live. Unlike market-analysis-share (one post per day), several
// blog posts can go live at once, so this posts the single OLDEST
// not-yet-announced entry per run — with the every-2h schedule in
// telegram-cron.yml, a backlog drains one post per run instead of
// flooding the channel all at once.

// X counts every link as 23 characters regardless of its real length, and the
// hard cap is 280. Reserve the link allowance plus the two newlines that
// separate it from the body, then spend what's left on title + excerpt.
const X_LIMIT = 280;
const X_LINK_COST = 23;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

// Title always survives intact; the excerpt is what gets trimmed, and is
// dropped entirely rather than shown as a two-word stub when the title alone
// already eats the budget.
function buildTweet(title: string, excerpt: string, url: string): string {
  const budget = X_LIMIT - X_LINK_COST - 2;
  const head = truncate(title, budget);
  const remaining = budget - head.length - 2;
  const body = remaining >= 40 ? `\n\n${truncate(excerpt, remaining)}` : "";
  return `${head}${body}\n\n${url}`;
}

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
    push = await sendPushToAll((locale) => {
      const copy = localizeBlogPost(target, locale);
      return { title: copy.title, body: copy.excerpt, url: localePath(locale, `/blog/${target.slug}`) };
    });
  } catch (err) {
    push = { error: (err as Error).message };
  }

  // X is best-effort and runs last: the Telegram post is the canonical
  // announcement and has already been marked as sent, so a missing X
  // credential or a rate-limited API must not fail the run and make the
  // next invocation re-announce the same post to the channel.
  let x: { tweetId: string } | { error: string } = { error: "not attempted" };
  try {
    const tweet = buildTweet(target.title, target.excerpt, url);
    x = photoUrl ? await postTradeSignalToX(photoUrl, tweet) : await postTextToX(tweet);
  } catch (err) {
    x = { error: (err as Error).message };
  }

  return NextResponse.json({ ok: true, posted: true, slug: target.slug, result, push, x });
});
