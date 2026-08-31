import { brokers } from "@/data/brokers";
import { formatMessage } from "@/lib/chrome";
import { localePath, type Locale } from "@/lib/i18n";

const API_BASE = "https://api.telegram.org";

// Appended to every outbound Telegram message so each post nudges
// readers back to the site, not just the disclaimer + bare domain.
export function telegramSiteCta(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  return `👉 Daha fazla piyasa analizi ve broker karşılaştırması için sitemizi ziyaret edin: ${siteUrl}`;
}

// Personal contact route for readers who want to talk to someone rather
// than read another page. Goes on every post twice over: as the closing
// line of the text (Telegram auto-links a bare @handle, so no markup
// needed) and as a button, since on mobile the button is the one people
// actually tap.
const CONTACT_HANDLE = "@erdemtorun";
const CONTACT_URL = "https://t.me/erdemtorun";

export function telegramContactCta(): string {
  return `📩 Detaylı Bilgi ve İletişim: ${CONTACT_HANDLE}`;
}

export function contactButtonRow(locale: Locale = "tr"): InlineKeyboardButton[] {
  return [
    { text: `📩 ${formatMessage(locale, "Detaylı Bilgi ve İletişim", {})}`, url: CONTACT_URL },
  ];
}

// One shared set of buttons pointing at FXPARTNER's three core services,
// plus the contact row — attached under every content post (analysis,
// news, campaigns, blog, trade signals) so readers always have one tap
// back into the actual product, not just the bare site link in the
// caption text. The broker digest (broker-review-share) builds its own
// per-broker button rows and appends contactButtonRow() itself.
/**
 * The top three of the ranking, as their own row of buttons.
 *
 * Read from src/data/brokers.ts rather than written out here, so the row
 * follows the ranking instead of drifting from it — when TIO Markets moved
 * to 8th, nothing about this row had to be remembered.
 *
 * Referral links, which is what the equivalent buttons on the site are. A
 * broker with no referralUrl falls back to its review page: better a real
 * page than a dead button.
 */
export function topBrokerButtonRow(): InlineKeyboardButton[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  return brokers
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map((b) => ({
      text: `${b.rank}. ${b.name}`,
      url: b.referralUrl || `${siteUrl}/brokers/${b.slug}`,
    }));
}

/**
 * The Arabic channel, or null when there is not one yet.
 *
 * Null is the normal state until a channel exists and TELEGRAM_AR_CHAT_ID is
 * set in the environment, and every caller treats it as "skip" rather than
 * an error. That is what makes this safe to ship before the channel is
 * created: nothing is sent, nothing throws, and the day the variable appears
 * the Arabic posts start without another deploy.
 */
export function arabicChatId(): string | null {
  return process.env.TELEGRAM_AR_CHAT_ID?.trim() || null;
}

/**
 * The VIP group's SIGNALS topic, or null when it is not configured.
 *
 * TELEGRAM_VIP_CHAT_ID has existed for a while but only ever minted invite
 * links; nothing posted to the group. The members are paying for the levels
 * the public channel withholds, and until now the only place they could see
 * them was the site.
 *
 * BOTH VALUES OR NOTHING. The group is a forum, so a message without
 * message_thread_id does not land in SIGNALS — it lands in General, beside
 * the join notices. A signal in the wrong topic is worse than no signal:
 * the reader stops trusting where to look. So a missing topic id disables
 * the post rather than guessing, exactly as a missing Arabic channel id
 * skips the Arabic post.
 */
export function vipSignalTarget(): { chatId: string; threadId: string } | null {
  const chatId = process.env.TELEGRAM_VIP_CHAT_ID?.trim();
  const threadId = process.env.TELEGRAM_VIP_TOPIC_ID?.trim();
  if (!chatId || !threadId) return null;
  return { chatId, threadId };
}

export function mainServicesKeyboard(locale: Locale = "tr"): InlineKeyboardButton[][] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  // Links go to the reader's own tree: an Arabic post that lands a reader on
  // a Turkish page has wasted the translation.
  const at = (path: string) => `${siteUrl}${localePath(locale, path)}`;
  const t = (text: string) => formatMessage(locale, text, {});
  return [
    [
      { text: `📈 ${t("Sinyaller")}`, url: at("/signals") },
      { text: `🤖 ${t("AI Asistan")}`, url: at("/ai-asistan") },
    ],
    [{ text: `📊 ${t("Broker Karşılaştırmaları")}`, url: at("/brokerlar") }],
    // Three across: Telegram shrinks the label to fit the row, and these are
    // short enough to stay readable where "📊 Broker Karşılaştırmaları"
    // needs a row to itself.
    topBrokerButtonRow(),
    contactButtonRow(locale),
  ];
}

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not set");
  return { token, chatId };
}

async function callTelegram(method: string, body: Record<string, unknown>) {
  const { token } = getConfig();
  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description ?? res.statusText}`);
  }
  return data.result;
}

export type InlineKeyboardButton = { text: string; url: string };

export async function sendTelegramMessage(
  text: string,
  options: {
    disablePreview?: boolean;
    // Each inner array is one row of buttons, rendered left-to-right —
    // e.g. [[{text: "Hesap Aç", url: "..."}, {text: "İncele", url: "..."}]].
    inlineKeyboard?: InlineKeyboardButton[][];
    // Threads this message under an earlier one, the same way
    // sendTelegramPhoto already does for a trade result replying to its
    // entry post. A follow-up that corrects or closes an earlier
    // announcement — "that pending order was cancelled" — is unreadable as a
    // bare new post; it has to hang off the message it is about.
    replyToMessageId?: string;
    /** Overrides the main channel — see arabicChatId(). */
    chatId?: string;
    /**
     * The forum topic to post into. A supergroup with topics ignores nothing
     * without this — it just files the message under General.
     */
    threadId?: string;
    /**
     * Posts without buzzing anyone's phone. The message still lands in the
     * channel, still threads, still reads identically — only the push is
     * suppressed.
     *
     * This is the lever for volume. A channel's problem is almost never how
     * many messages it holds; it is how many times it interrupts someone.
     * Silencing a post keeps the record complete and costs the reader
     * nothing.
     */
    silent?: boolean;
  } = {}
) {
  const { chatId } = getConfig();
  return callTelegram("sendMessage", {
    chat_id: options.chatId ?? chatId,
    ...(options.threadId ? { message_thread_id: options.threadId } : {}),
    text,
    parse_mode: "HTML",
    disable_web_page_preview: options.disablePreview ?? false,
    ...(options.silent ? { disable_notification: true } : {}),
    ...(options.replyToMessageId
      ? { reply_parameters: { message_id: options.replyToMessageId } }
      : {}),
    ...(options.inlineKeyboard
      ? { reply_markup: { inline_keyboard: options.inlineKeyboard } }
      : {}),
  });
}

// photoUrl must be a publicly reachable URL — Telegram fetches it itself,
// no need to upload bytes from our side. Passing replyToMessageId makes the
// photo appear as a reply/quote under that earlier message (e.g. a trade
// result replying to its original entry-signal post) instead of a bare new
// post in the channel.
export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string,
  options: {
    replyToMessageId?: string;
    inlineKeyboard?: InlineKeyboardButton[][];
    /** Overrides the main channel — see arabicChatId(). */
    chatId?: string;
    /**
     * The forum topic to post into. A supergroup with topics ignores nothing
     * without this — it just files the message under General.
     */
    threadId?: string;
    /**
     * Posts without buzzing anyone's phone. The message still lands in the
     * channel, still threads, still reads identically — only the push is
     * suppressed.
     *
     * This is the lever for volume. A channel's problem is almost never how
     * many messages it holds; it is how many times it interrupts someone.
     * Silencing a post keeps the record complete and costs the reader
     * nothing.
     */
    silent?: boolean;
  } = {}
) {
  const { chatId } = getConfig();
  return callTelegram("sendPhoto", {
    chat_id: options.chatId ?? chatId,
    ...(options.threadId ? { message_thread_id: options.threadId } : {}),
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    ...(options.silent ? { disable_notification: true } : {}),
    ...(options.replyToMessageId ? { reply_parameters: { message_id: options.replyToMessageId } } : {}),
    ...(options.inlineKeyboard
      ? { reply_markup: { inline_keyboard: options.inlineKeyboard } }
      : {}),
  });
}

// Sends up to 10 photos as one Telegram album (sendMediaGroup) — only the
// first item's caption is shown by Telegram clients, the rest render
// caption-less thumbnails in the same album. Used for bulletin-style posts
// bundling several instruments' real charts into a single message instead
// of one photo post per instrument (which would flood the channel).
export async function sendTelegramMediaGroup(
  photoUrls: string[],
  firstCaption: string
): Promise<{ message_id: number }[]> {
  const { chatId } = getConfig();
  const media = photoUrls.map((url, i) => ({
    type: "photo",
    media: url,
    ...(i === 0 ? { caption: firstCaption, parse_mode: "HTML" } : {}),
  }));
  return callTelegram("sendMediaGroup", { chat_id: chatId, media });
}

// One-time, expiring invite link to the VIP group — generated per user on
// request rather than sharing one static link, so it can't be leaked/reused
// by non-members.
export async function createVipInviteLink(name: string): Promise<string> {
  const vipChatId = process.env.TELEGRAM_VIP_CHAT_ID;
  if (!vipChatId) throw new Error("TELEGRAM_VIP_CHAT_ID is not set");
  const result = await callTelegram("createChatInviteLink", {
    chat_id: vipChatId,
    name: name.slice(0, 32),
    member_limit: 1,
    expire_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  });
  return result.invite_link as string;
}
