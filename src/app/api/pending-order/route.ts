import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { sendTelegramMessage, mainServicesKeyboard } from "@/lib/telegram";
import { postTextToX } from "@/lib/x";
import { sendPushToMembers, sendPushToNonMembers } from "@/lib/push";
import { db } from "@/db";
import { pendingOrders } from "@/db/schema";
import { requiredTierForPair } from "@/lib/signalAccess";
import { ACCESS_TIER_LABEL } from "@/data/packageTiers";

// Called by the MT5 EA the moment a pending order is placed — before the
// market has reached it.
//
// This is the announcement that is actually worth having. Reporting a trade
// once it has already filled tells a reader about a price they can no longer
// get; telling them a buy limit is sitting at 1.3600 lets them put the same
// order in and be filled at the same level we are.
//
// Which means the obligation runs the other way too. An order that is
// cancelled or expires without ever filling has to be said out loud, or the
// channel is left holding a signal that never happened — on a site whose
// entire claim is that nothing is quietly removed, that is the failure that
// would matter. `action=cancelled` is not an afterthought here; it is half
// the feature.
//
// Tier discipline is the same as /api/trade-signal: everyone is notified,
// but the levels a package pays for stay behind the package. "Notify all
// packages" means nobody is left out of the alert, not that the paid levels
// stop being paid for.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest, params: URLSearchParams): boolean {
  const secret = process.env.TRADE_SIGNAL_SECRET;
  if (!secret) return false;
  const headerKey = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return headerKey === secret || params.get("key") === secret;
}

const PENDING_TYPES = new Set([
  "BUY_LIMIT",
  "SELL_LIMIT",
  "BUY_STOP",
  "SELL_STOP",
  "BUY_STOP_LIMIT",
  "SELL_STOP_LIMIT",
]);

const TYPE_LABEL: Record<string, string> = {
  BUY_LIMIT: "ALIŞ LİMİT",
  SELL_LIMIT: "SATIŞ LİMİT",
  BUY_STOP: "ALIŞ STOP",
  SELL_STOP: "SATIŞ STOP",
  BUY_STOP_LIMIT: "ALIŞ STOP LİMİT",
  SELL_STOP_LIMIT: "SATIŞ STOP LİMİT",
};

function isRealLevel(v: string | null): v is string {
  return v !== null && v !== "" && Number.isFinite(Number(v)) && Number(v) > 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!isAuthorized(req, searchParams)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = (searchParams.get("action") ?? "placed").toLowerCase();
  const ticket = searchParams.get("ticket");
  if (!ticket) {
    return NextResponse.json({ error: "Missing ticket" }, { status: 400 });
  }

  // ---- the order came off the book without filling -----------------------
  if (action === "cancelled" || action === "filled") {
    const existing = await db.query.pendingOrders.findFirst({
      where: eq(pendingOrders.ticket, ticket),
    });
    if (!existing || existing.state !== "waiting") {
      // Nothing announced, or already resolved — say so rather than posting a
      // correction to a message the channel never saw.
      return NextResponse.json({ ok: true, posted: false, reason: "not an open announcement" });
    }

    await db
      .update(pendingOrders)
      .set({ state: action === "filled" ? "filled" : "cancelled", resolvedAt: new Date() })
      .where(eq(pendingOrders.ticket, ticket));

    // A fill is already announced by /api/trade-signal when the position
    // opens, so this side stays quiet and only closes the record. A
    // cancellation has no other voice, so it gets one.
    if (action === "filled") {
      return NextResponse.json({ ok: true, posted: false, reason: "fill announced by trade-signal" });
    }

    const text =
      `⚪️ <b>${existing.pair}</b> ${TYPE_LABEL[existing.orderType] ?? existing.orderType} emri iptal edildi.\n\n` +
      `Fiyat ${existing.price} seviyesine gelmeden emir kaldırıldı — bu kurulum gerçekleşmedi. ` +
      `Aynı emri kurduysanız siz de kaldırabilirsiniz.`;

    const result = await sendTelegramMessage(text, {
      replyToMessageId: existing.telegramMessageId ?? undefined,
    });

    return NextResponse.json({ ok: true, posted: true, action: "cancelled", telegram: result });
  }

  // ---- a new pending order has been placed -------------------------------
  const pair = searchParams.get("pair");
  const orderType = (searchParams.get("type") ?? "").toUpperCase();
  const price = searchParams.get("price");

  if (!pair || !price || !PENDING_TYPES.has(orderType)) {
    return NextResponse.json(
      { error: "Missing or invalid: pair, price, type" },
      { status: 400 }
    );
  }

  const stop = searchParams.get("stop");
  const target1 = searchParams.get("target1");
  const volume = searchParams.get("volume");
  const direction = orderType.startsWith("BUY") ? "BUY" : "SELL";

  const tier = requiredTierForPair(pair);
  const showLevels = tier === "free";
  const dirEmoji = direction === "BUY" ? "🟢" : "🔴";
  const typeLabel = TYPE_LABEL[orderType] ?? orderType;

  const levelsBlock = showLevels
    ? `Emir fiyatı: <b>${price}</b>\n` +
      (isRealLevel(stop) ? `Zarar durdur: ${stop}\n` : "") +
      (isRealLevel(target1) ? `Kâr al: ${target1}\n` : "")
    : `🔒 Emir fiyatı, SL ve TP seviyeleri ${ACCESS_TIER_LABEL[tier]} üyelere özel.\n`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const text =
    `⏳ <b>BEKLEYEN EMİR</b> — ${dirEmoji} <b>${pair}</b> ${typeLabel}\n\n` +
    `Bu emir şu an piyasada bekliyor; fiyat seviyeye gelirse açılacak. ` +
    `Aynı emri kendi hesabınıza şimdiden kurabilirsiniz.\n\n` +
    levelsBlock +
    `\nEmir gerçekleşmezse iptal edildiğini de buradan duyuracağız.\n\n` +
    `Canlı takip: ${siteUrl}/tr/signals\n\n` +
    `⚠️ Yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. ` +
    `Geçmiş sonuçlar gelecekteki sonuçları garanti etmez.`;

  const telegram = await sendTelegramMessage(text, {
    inlineKeyboard: mainServicesKeyboard(),
  });

  await db
    .insert(pendingOrders)
    .values({
      ticket,
      pair,
      orderType,
      direction,
      price,
      stop: isRealLevel(stop) ? stop : null,
      target1: isRealLevel(target1) ? target1 : null,
      volume,
      state: "waiting",
      telegramMessageId:
        telegram && typeof telegram === "object" && "message_id" in telegram
          ? String((telegram as { message_id: number }).message_id)
          : null,
    })
    .onConflictDoNothing();

  // Best-effort from here — the announcement has already gone out, and a
  // failed tweet or push must not turn into a retry that posts it twice.
  let xResult: { tweetId: string } | { error: string };
  try {
    xResult = await postTextToX(
      `⏳ BEKLEYEN EMİR — ${pair} ${typeLabel}\n\n` +
        `Fiyat seviyeye gelirse açılacak. Detaylar: ${siteUrl}/tr/signals\n\n` +
        `Yatırım tavsiyesi değildir.`
    );
  } catch (err) {
    xResult = { error: err instanceof Error ? err.message : String(err) };
  }

  const [memberPush, teaserPush] = await Promise.allSettled([
    sendPushToMembers({
      title: `⏳ ${pair} ${typeLabel} emri kuruldu`,
      body: showLevels
        ? `Emir ${price}${isRealLevel(stop) ? ` · SL ${stop}` : ""}${isRealLevel(target1) ? ` · TP ${target1}` : ""}`
        : `Seviyeler ${ACCESS_TIER_LABEL[tier]} üyelere özel — görmek için dokunun.`,
      url: "/signals",
    }),
    sendPushToNonMembers({
      title: `⏳ ${pair} ${typeLabel} emri kuruldu`,
      body: "Emir seviyeleri anında üyelere gidiyor. Ücretsiz hesap aç, bir sonrakini kaçırma.",
      url: "/account/login",
    }),
  ]);

  if (memberPush.status === "rejected") console.error("Pending push failed (members):", memberPush.reason);
  if (teaserPush.status === "rejected") console.error("Pending push failed (non-members):", teaserPush.reason);

  return NextResponse.json({ ok: true, posted: true, ticket, pair, orderType, tier, telegram, x: xResult });
}
