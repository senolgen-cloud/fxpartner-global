import { db } from "@/db";
import {
  cashbackAccounts,
  cashbackRecords,
  tradeSignals,
  users,
} from "@/db/schema";
import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { canViewSignal, type AccessTier } from "@/lib/signalAccess";
import { SIGNALS_EPOCH } from "@/lib/signalPeriods";

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
 * application.
 *
 * These columns carry no time zone, so their values only mean anything if
 * everyone reading them agrees on which zone that is. The server pins
 * itself to UTC for exactly this reason (src/instrumentation.ts), and with
 * that in place a JS Date and SQL now() land on the same instant. Taking
 * both sides from the database anyway keeps the comparison exact without
 * depending on that pin holding: a watermark three hours off would mark a
 * signal read before the member ever saw it, and label a fresh one
 * "3 hours ago". scripts/check-db-clock.mjs guards the pin.
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

/**
 * Just the number on the bell.
 *
 * Split out for the header, which wants a badge on every page and none of
 * the twenty formatted items behind it.
 *
 * IT MUST NOT WRITE THE WATERMARK, and that is the whole reason this could
 * not simply call getMemberNotifications and read .unread. That function
 * stamps notificationsSeenAt on first sight, which is right when the panel
 * is actually open and being read. Run from the header it would stamp on
 * the first page load of a session, so the bell would mark everything read
 * before the member ever looked at it and the badge would never appear
 * again. A member who has never opened the panel gets 0 here and the stamp
 * happens when they do open it.
 *
 * Counts only what is newer than the watermark rather than scanning the
 * whole window, and stops at MAX_ITEMS because the panel itself only ever
 * shows that many — a badge promising 34 above a list of 20 is a badge that
 * lies about what a tap will produce.
 */
export async function getUnreadNotificationCount(
  userId: string,
  viewerTier: AccessTier | null
): Promise<number> {
  const me = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { notificationsSeenAt: true },
  });
  const seenAt = me?.notificationsSeenAt ?? null;
  if (!seenAt) return 0;

  // Nothing older than the window can be unread-and-shown, so the watermark
  // is clamped to it rather than trusted on its own: a member away for a
  // year would otherwise have every row in the window counted.
  // Never older than the reset — the bell must not offer a member a signal
  // that /signals no longer shows.
  const window = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const floor = window > SIGNALS_EPOCH ? window : SIGNALS_EPOCH;
  const since = seenAt > floor ? seenAt : floor;

  const myAccounts = await db
    .select()
    .from(cashbackAccounts)
    .where(eq(cashbackAccounts.userId, userId));
  const accountIds = myAccounts.map((a) => a.id);

  const [signals, records] = await Promise.all([
    db
      .select({
        pair: tradeSignals.pair,
        createdAt: tradeSignals.createdAt,
        closedAt: tradeSignals.closedAt,
        outcome: tradeSignals.outcome,
      })
      .from(tradeSignals)
      .where(gt(tradeSignals.createdAt, floor))
      // ORDER BY IS LOAD-BEARING, not tidiness. A LIMIT without one returns
      // an arbitrary 120 of the matching rows, and on this table it handed
      // back the oldest — the newest row in the result was nine days behind
      // the newest row in the window, so every recent signal was cut off
      // before the count ever looked at it and the badge read 0 forever.
      .orderBy(desc(tradeSignals.createdAt))
      .limit(120),
    accountIds.length
      ? db
          .select({ id: cashbackRecords.id })
          .from(cashbackRecords)
          .where(
            and(
              inArray(cashbackRecords.accountId, accountIds),
              gt(cashbackRecords.createdAt, since)
            )
          )
          .limit(MAX_ITEMS)
      : Promise.resolve([]),
  ]);

  let n = records.length;

  for (const s of signals) {
    // Same two rules the panel applies: an opening the member cannot read
    // is not news to them, and a closing is public whatever their tier.
    if (s.createdAt > since && canViewSignal(viewerTier, s.pair)) n++;
    if (s.closedAt && s.outcome && s.closedAt > since) n++;
  }

  for (const a of myAccounts) {
    if (!a.statusChangedAt || a.statusChangedAt <= since) continue;
    if (a.status === "pending") continue;
    n++;
  }

  return Math.min(n, MAX_ITEMS);
}

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
