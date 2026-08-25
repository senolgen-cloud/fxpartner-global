import { db } from "@/db";
import {
  cashbackAccounts,
  cashbackRecords,
  tradeSignals,
  users,
} from "@/db/schema";
import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { canViewSignal, type AccessTier } from "@/lib/signalAccess";

/**
 * What the bell shows a member.
 *
 * Derived on read from the tables the events already live in, rather than
 * written into a notifications table as they happen. Two reasons: a member
 * who upgrades to VIP should retroactively see the VIP signals they can now
 * read, which a table written at signal time cannot do; and a copy of
 * trade_signal kept in sync by hand is a copy that will drift.
 *
 * The cost is that "read" is a single watermark per member
 * (users.notificationsSeenAt) rather than per item. That matches what a bell
 * actually promises — everything above the line is new — and it is the whole
 * reason this needs one nullable column instead of a table and a backfill.
 *
 * Every timestamp here — the events, the watermark, and the "now" the
 * caller renders ages against — comes from the database, never from the
 * application. They do not agree: writing SQL now() into one of these
 * timestamp columns and reading it back lands three hours behind a JS Date
 * written the same second, because the column carries no time zone and the
 * session's is not UTC. Mixing the two would mark a signal read three hours
 * before the member saw it, and label a fresh one "3 hours ago". Picking one
 * clock costs a scalar in a query we were already making and needs no
 * hard-coded offset, which would rot the first time that setting changes.
 *
 * Money is handed over as a number, never as a formatted string: the
 * grouping and the currency placement belong to the reader's locale, and
 * this module has no idea who is reading. The caller formats it.
 *
 * Titles come out as a Turkish template plus its variables, never as a
 * finished sentence: a sentence built here would be a string no dictionary
 * has a key for, and every non-Turkish reader would get it in Turkish. The
 * caller runs the template through trf().
 */

export type MemberNotification = {
  id: string;
  at: Date;
  title: string;
  titleVars: Record<string, string | number>;
  detail: string | null;
  detailVars: Record<string, string | number>;
  href: string;
  kind: "signal-opened" | "signal-closed" | "cashback-paid" | "cashback-status";
};

/** Nothing older than this, however long someone has been away. */
const WINDOW_DAYS = 30;
const MAX_ITEMS = 20;

export async function getMemberNotifications(
  userId: string,
  viewerTier: AccessTier | null
): Promise<{ items: MemberNotification[]; unread: number; now: Date }> {
  const clock = await db.execute<{ now: Date }>(sql`select now() as now`);
  const now = new Date(clock.rows[0].now);
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [me, myAccounts] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { notificationsSeenAt: true },
    }),
    db.select().from(cashbackAccounts).where(eq(cashbackAccounts.userId, userId)),
  ]);

  const seenAt = me?.notificationsSeenAt ?? null;
  const accountIds = myAccounts.map((a) => a.id);

  const [signals, records] = await Promise.all([
    db
      .select()
      .from(tradeSignals)
      .where(gt(tradeSignals.createdAt, since))
      .orderBy(desc(tradeSignals.createdAt))
      .limit(120),
    accountIds.length
      ? db
          .select()
          .from(cashbackRecords)
          .where(
            and(
              inArray(cashbackRecords.accountId, accountIds),
              gt(cashbackRecords.createdAt, since)
            )
          )
          .orderBy(desc(cashbackRecords.createdAt))
          .limit(MAX_ITEMS)
      : Promise.resolve([]),
  ]);

  const items: MemberNotification[] = [];

  for (const s of signals) {
    // A signal the member cannot read is not news to them. Closings are
    // public regardless — past performance is never gated (see signalAccess).
    if (canViewSignal(viewerTier, s.pair)) {
      items.push({
        id: `signal-open-${s.id}`,
        at: s.createdAt,
        title: s.direction ? "Yeni sinyal: {pair} {direction}" : "Yeni sinyal: {pair}",
        titleVars: { pair: s.pair, direction: s.direction ?? "" },
        detail: s.entry ? "Giriş {entry}" : null,
        detailVars: { entry: s.entry },
        href: "/signals",
        kind: "signal-opened",
      });
    }

    if (s.closedAt && s.outcome && s.closedAt > since) {
      const profit = Number(s.profit);
      items.push({
        id: `signal-close-${s.id}`,
        at: s.closedAt,
        title: "{pair} kapandı",
        titleVars: { pair: s.pair },
        detail: Number.isFinite(profit) ? "{amount} · 1 lot" : null,
        detailVars: { amount: profit },
        href: "/signals",
        kind: "signal-closed",
      });
    }
  }

  const brokerByAccount = new Map(myAccounts.map((a) => [a.id, a.brokerSlug]));
  for (const r of records) {
    const broker = brokerByAccount.get(r.accountId);
    items.push({
      id: `cashback-${r.id}`,
      at: r.createdAt,
      title: "{period} iadeniz hesabınıza işlendi",
      titleVars: { period: r.period },
      detail: broker ? "{amount} · {broker}" : "{amount}",
      detailVars: { amount: Number(r.amountUsd), broker: broker ?? "" },
      href: "/account",
      kind: "cashback-paid",
    });
  }

  for (const a of myAccounts) {
    if (!a.statusChangedAt || a.statusChangedAt <= since) continue;
    if (a.status === "pending") continue;
    items.push({
      id: `cashback-status-${a.id}`,
      at: a.statusChangedAt,
      title:
        a.status === "verified"
          ? "Kazanç iadesi hesabınız doğrulandı"
          : "Kazanç iadesi hesabınız uygun bulunmadı",
      titleVars: {},
      detail: "{broker} · {account}",
      detailVars: { broker: a.brokerSlug, account: a.accountNumber },
      href: "/account",
      kind: "cashback-status",
    });
  }

  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  const trimmed = items.slice(0, MAX_ITEMS);

  // First sight of the panel starts the clock. Without this the watermark
  // stays null forever on an account that never opens the bell, and counting
  // "everything in the last 30 days" instead would greet a brand-new member
  // with a 20 — teaching them on day one that the number is noise.
  if (!seenAt) {
    await db
      .update(users)
      .set({ notificationsSeenAt: sql`now()` })
      .where(eq(users.id, userId));
    return { items: trimmed, unread: 0, now };
  }

  return {
    items: trimmed,
    unread: trimmed.filter((i) => i.at > seenAt).length,
    now,
  };
}
