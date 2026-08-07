import { NextResponse } from "next/server";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

// Backs the /signals page's live polling — same query the page itself runs
// on first load, just returned as JSON instead of rendered HTML.
export async function GET() {
  const [active, closed] = await Promise.all([
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

  return NextResponse.json({ active, closed });
}
