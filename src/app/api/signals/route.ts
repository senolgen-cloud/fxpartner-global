import { NextResponse } from "next/server";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getViewerAccess } from "@/lib/tierAccess";
import { maskLockedActiveSignal } from "@/lib/signalAccess";

export const runtime = "nodejs";

// Backs the /signals page's live polling — same query the page itself runs
// on first load, just returned as JSON instead of rendered HTML.
export async function GET() {
  const [{ tier }, active, closed] = await Promise.all([
    getViewerAccess(),
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
      limit: 30,
    }),
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "closed"),
      orderBy: desc(tradeSignals.closedAt),
      limit: 30,
    }),
  ]);

  // Same real server-side masking as the initial page load — the poll
  // response must never leak a locked signal's actual entry/SL/TP/volume,
  // even though the UI only relies on this for the initial render today.
  const maskedActive = active.map((s) => maskLockedActiveSignal(s, tier));

  return NextResponse.json({ active: maskedActive, closed });
}
