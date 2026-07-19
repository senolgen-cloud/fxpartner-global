const API_BASE = "https://api.telegram.org";

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

export async function sendTelegramMessage(
  text: string,
  options: { disablePreview?: boolean } = {}
) {
  const { chatId } = getConfig();
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: options.disablePreview ?? false,
  });
}

// photoUrl must be a publicly reachable URL — Telegram fetches it itself,
// no need to upload bytes from our side.
export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  const { chatId } = getConfig();
  return callTelegram("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  });
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
