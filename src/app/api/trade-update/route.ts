import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * A live position changed in MT5 — bring the site's copy into line.
 *
 * /api/trade-signal records a trade as it was at the moment it opened, and
 * /api/trade-result records how it ended. Everything in between was
 * invisible: a stop pulled up to breakeven, a target moved, half the volume
 * taken off. The board kept showing the opening numbers, which is not a
 * stale detail but a wrong one — a reader looking at a live card was told a
 * stop sat where it no longer sat.
 *
 * GET, like the other EA routes, because the EA posts with WebRequest and
 * the existing ones are already shaped this way.
 *
 * Only touches signals that are still active. A closed trade is a record of
 * what happened and must not be rewritten by a late-arriving update.
 */
function isAuthorized(req: NextRequest, params: URLSearchParams): boolean {
  const secret = process.env.TRADE_SIGNAL_SECRET;
  if (!secret) return false;
  const headerKey = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return headerKey === secret || params.get("key") === secret;
}

/** A level of 0 or blank means "no such level", not "level zero". */
function level(v: string | null): string | null | undefined {
  if (v === null) return undefined; // not sent — leave whatever is stored
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? v : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (!isAuthorized(req, searchParams)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticket = searchParams.get("ticket");
  if (!ticket) {
    return NextResponse.json({ error: "Missing required param: ticket" }, { status: 400 });
  }

  const existing = await db.query.tradeSignals.findFirst({
    where: eq(tradeSignals.ticket, ticket),
  });

  if (!existing) {
    return NextResponse.json({ error: "Unknown ticket" }, { status: 404 });
  }
  if (existing.status !== "active") {
    // Not an error: a modification can land just after the close report, and
    // the EA has no way to know which arrived first.
    return NextResponse.json({ ok: true, changed: false, reason: "not active" });
  }

  const next: Partial<typeof tradeSignals.$inferInsert> = {};
  const stop = level(searchParams.get("stop"));
  const target1 = level(searchParams.get("target1"));
  const target2 = level(searchParams.get("target2"));
  const volumeRaw = searchParams.get("volume");

  if (stop !== undefined && stop !== existing.stop) next.stop = stop;
  if (target1 !== undefined && target1 !== existing.target1) next.target1 = target1;
  if (target2 !== undefined && target2 !== existing.target2) next.target2 = target2;

  if (volumeRaw !== null) {
    const v = parseFloat(volumeRaw);
    // Compared as numbers: the EA sends "0.50" where the row may hold "0.5",
    // and a string comparison would report a change on every single sweep.
    if (Number.isFinite(v) && v > 0 && v !== parseFloat(existing.volume ?? "")) {
      next.volume = volumeRaw;
    }
  }

  const changed = Object.keys(next);
  if (changed.length === 0) {
    return NextResponse.json({ ok: true, changed: false });
  }

  await db
    .update(tradeSignals)
    .set(next)
    .where(and(eq(tradeSignals.ticket, ticket), eq(tradeSignals.status, "active")));

  return NextResponse.json({ ok: true, changed: true, fields: changed });
}
