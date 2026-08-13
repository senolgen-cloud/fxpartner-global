const API_BASE = "https://api.telegram.org";

// Appended to every outbound Telegram message so each post nudges
// readers back to the site, not just the disclaimer + bare domain.
export function telegramSiteCta(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  return `👉 Daha fazla piyasa analizi ve broker karşılaştırması için sitemizi ziyaret edin: ${siteUrl}`;
}

// One shared row of buttons pointing at FXPARTNER's three core services —
// attached under every content post (analysis, news, campaigns, blog,
// trade signals) so readers always have one tap back into the actual
// product, not just the bare site link in the caption text. The broker
// digest (broker-review-share) builds its own per-broker button rows
// instead of this one.
export function mainServicesKeyboard(): InlineKeyboardButton[][] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  return [
    [
      { text: "📈 Sinyaller", url: `${siteUrl}/signals` },
      { text: "🤖 AI Asistan", url: `${siteUrl}/ai-asistan` },
    ],
    [{ text: "📊 Broker Karşılaştırmaları", url: siteUrl }],
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
  } = {}
) {
  const { chatId } = getConfig();
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: options.disablePreview ?? false,
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
  options: { replyToMessageId?: string; inlineKeyboard?: InlineKeyboardButton[][] } = {}
) {
  const { chatId } = getConfig();
  return callTelegram("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
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
