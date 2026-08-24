import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { liveQuotes } from "@/db/schema";

// Live bid/ask for the instruments the signal engine watches.
//
// POST is the MT5 EA pushing quotes; GET is the signals page reading them.
// The EA is the source because it is attached to the very account the signals
// come from — see the note above liveQuotes in src/db/schema.ts for why the
// public rate APIs cannot do this job for FX.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same secret as /api/trade-signal and /api/trade-result: it is the same
// publisher, the same terminal and the same trust boundary. A second secret
// would be one more thing to rotate and one more thing to get out of sync.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.TRADE_SIGNAL_SECRET;
  if (!secret) return false;
  const headerKey = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const queryKey = new URL(req.url).searchParams.get("key");
  return headerKey === secret || queryKey === secret;
}

// A quote older than this is not shown. The EA pushes every 15 seconds, so
// this is six missed cycles: long enough to ride out a slow round trip,
// short enough that a terminal which died — or a market that closed for the
// weekend — stops producing a "live" price within about a minute.
//
// This is the part that matters most in the whole feature. A frozen price
// beside a stop-loss is exactly the harm that ruled out the ECB feed; it
// would be absurd to rule that out and then reintroduce it by leaving a dead
// EA's last tick on screen forever.
export const QUOTE_MAX_AGE_MS = 90_000;

type IncomingQuote = { symbol: string; bid: string; ask: string };

function parseQuotes(body: unknown): IncomingQuote[] | null {
  if (!body || typeof body !== "object") return null;
  const list = (body as { quotes?: unknown }).quotes;
  if (!Array.isArray(list)) return null;

  const out: IncomingQuote[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const { symbol, bid, ask } = raw as Record<string, unknown>;
    if (typeof symbol !== "string" || !symbol.trim()) continue;
    // Numbers arrive as strings to keep the EA's digit formatting intact, but
    // they still have to *be* numbers — a malformed tick should be dropped,
    // not stored and rendered.
    const b = String(bid ?? "").trim();
    const a = String(ask ?? "").trim();
    if (!b || !a) continue;
    if (!Number.isFinite(Number(b)) || !Number.isFinite(Number(a))) continue;
    if (Number(b) <= 0 || Number(a) <= 0) continue;
    out.push({ symbol: symbol.trim().slice(0, 32), bid: b, ask: a });
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body is not JSON" }, { status: 400 });
  }

  const quotes = parseQuotes(body);
  if (!quotes) {
    return NextResponse.json({ error: "Expected { quotes: [...] }" }, { status: 400 });
  }
  if (!quotes.length) {
    return NextResponse.json({ ok: true, stored: 0 });
  }

  // One statement, not one per symbol: the EA pushes a dozen instruments on
  // every cycle and a round trip each would cost more than the quotes are
  // worth. updated_at is set here rather than defaulted so a repeated value
  // still counts as fresh — the price not moving is not the price being old.
  await db
    .insert(liveQuotes)
    .values(quotes.map((q) => ({ ...q, updatedAt: new Date() })))
    .onConflictDoUpdate({
      target: liveQuotes.symbol,
      set: {
        bid: sql`excluded.bid`,
        ask: sql`excluded.ask`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  return NextResponse.json({ ok: true, stored: quotes.length });
}

export async function GET() {
  const rows = await db.select().from(liveQuotes);
  const now = Date.now();

  // Stale rows are filtered out server-side so a client cannot render one by
  // ignoring a field, and the age that survives is the age the reader's own
  // clock would have computed — never trust the browser's clock for this.
  const quotes: Record<string, { bid: string; ask: string; ageMs: number }> = {};
  for (const row of rows) {
    const ageMs = now - new Date(row.updatedAt).getTime();
    if (ageMs > QUOTE_MAX_AGE_MS || ageMs < 0) continue;
    quotes[row.symbol] = { bid: row.bid, ask: row.ask, ageMs };
  }

  return NextResponse.json(
    { quotes, maxAgeMs: QUOTE_MAX_AGE_MS },
    { headers: { "Cache-Control": "no-store" } }
  );
}
