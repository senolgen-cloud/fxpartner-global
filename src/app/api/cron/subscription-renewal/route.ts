import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, vipSubscriptions } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { GRACE_DAYS, syncIsVipCache } from "@/lib/subscription";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { sendLapsedEmail, sendRenewalReminderEmail } from "@/lib/subscriptionEmails";

// Abonelik yenileme — günde bir kez (vercel.json).
//
// NOWPayments otomatik yenilemiyor: her dönem ayrı bir kripto ödemesi. Bu
// rota olmadan aylık üye 30. günde hiçbir uyarı almadan düşüyordu, daha da
// kötüsü erişimi hiç kapanmıyordu (status "active" kalıyordu). İki iş yapar:
//
//   1. Bitişe 5 gün ve 1 gün kala hatırlatma e-postası.
//   2. Bitişin üstünden GRACE_DAYS geçmiş aboneliği past_due'ya çeker,
//      users.isVip'i senkronlar ve "süren doldu" e-postası gönderir.
//
// Tekrar koruması tarih penceresine değil anahtara bağlı: cron aynı gün iki
// kez çalışsa ya da bir gün atlasa da her aşama her dönem için bir kez gider.
// Anahtar bitiş tarihini içerdiği için yenileyen üye bir sonraki dönemde
// hatırlatmaları yeniden alır. telegram_post tablosu adına rağmen genel bir
// "bu anahtar işlendi mi" deposu — bkz. telegram-posted-store.ts.
const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_STAGES = [5, 1] as const;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("subscription-renewal", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const rows = await db
    .select({
      userId: vipSubscriptions.userId,
      tier: vipSubscriptions.tier,
      currentPeriodEnd: vipSubscriptions.currentPeriodEnd,
      email: users.email,
      name: users.name,
    })
    .from(vipSubscriptions)
    .innerJoin(users, eq(users.id, vipSubscriptions.userId))
    // Açık uçlu (bitişsiz) manuel erişim hiç dolmaz; burada işi yok.
    .where(and(eq(vipSubscriptions.status, "active"), isNotNull(vipSubscriptions.currentPeriodEnd)));

  let reminded = 0;
  let lapsed = 0;
  const failures: string[] = [];

  for (const row of rows) {
    const end = row.currentPeriodEnd!;
    const endKey = end.toISOString().slice(0, 10);

    try {
      if (end.getTime() + GRACE_DAYS * DAY_MS <= now) {
        // Durum yalnızca hâlâ aynı dönemdeyse değişir: bu tur ile yenileme
        // webhook'u yarışırsa yeni ödenmiş dönem past_due'ya düşmesin.
        const [flipped] = await db
          .update(vipSubscriptions)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(and(eq(vipSubscriptions.userId, row.userId), eq(vipSubscriptions.currentPeriodEnd, end)))
          .returning({ userId: vipSubscriptions.userId });
        if (!flipped) continue; // az önce yenilendi
        await syncIsVipCache(row.userId);
        lapsed++;

        const key = `sub-lapsed:${row.userId}:${endKey}`;
        if (row.email && !(await isAlreadyPostedToTelegram(key))) {
          await sendLapsedEmail({ to: row.email, name: row.name, tier: row.tier });
          await markPostedToTelegram(key);
        }
        continue;
      }

      const daysLeft = Math.ceil((end.getTime() - now) / DAY_MS);
      if (daysLeft <= 0) continue; // ek süre içinde: erişim açık, hatırlatma zaten gitti

      // En yakın aşama: 5 gün kala çalışmayan bir cron 3 gün kala "5 gün"
      // değil, yalnızca vadesi gelmiş aşamayı gönderir.
      const stage = [...REMINDER_STAGES].reverse().find((s) => daysLeft <= s);
      if (!stage || !row.email) continue;

      const key = `sub-remind:${row.userId}:${endKey}:${stage}`;
      if (await isAlreadyPostedToTelegram(key)) continue;

      await sendRenewalReminderEmail({
        to: row.email,
        name: row.name,
        tier: row.tier,
        until: end,
        daysLeft,
      });
      await markPostedToTelegram(key);
      reminded++;
    } catch (err) {
      // Tek üyenin e-postası patlarsa diğerleri yine işlensin.
      console.error(`[cron:subscription-renewal] ${row.userId}`, err);
      failures.push(row.userId);
    }
  }

  if (failures.length > 0 && failures.length === rows.length) {
    throw new Error(`subscription-renewal: all ${rows.length} rows failed`);
  }

  return NextResponse.json({ ok: true, checked: rows.length, reminded, lapsed, failed: failures.length });
});
