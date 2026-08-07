import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sentimentVotes, sentimentVoteValues, type SentimentVote } from "@/db/schema";
import { getVisitorId } from "@/lib/visitor";
import { eq, inArray, sql } from "drizzle-orm";

export const runtime = "nodejs";

const TRACKED_PAIRS = ["EURUSD", "XAUUSD"] as const;

async function getCounts() {
  const rows = await db
    .select({ pair: sentimentVotes.pair, vote: sentimentVotes.vote, count: sql<number>`count(*)::int` })
    .from(sentimentVotes)
    .where(inArray(sentimentVotes.pair, TRACKED_PAIRS as unknown as string[]))
    .groupBy(sentimentVotes.pair, sentimentVotes.vote);

  const byPair: Record<string, { bullish: number; bearish: number }> = {};
  for (const pair of TRACKED_PAIRS) byPair[pair] = { bullish: 0, bearish: 0 };
  for (const r of rows) {
    if (r.vote === "bullish" || r.vote === "bearish") byPair[r.pair][r.vote] = r.count;
  }
  return byPair;
}

export async function GET() {
  const counts = await getCounts();
  const visitorId = await getVisitorId();

  let myVotes: Record<string, SentimentVote | null> = {};
  if (visitorId) {
    const rows = await db
      .select({ pair: sentimentVotes.pair, vote: sentimentVotes.vote })
      .from(sentimentVotes)
      .where(eq(sentimentVotes.visitorId, visitorId));
    myVotes = Object.fromEntries(rows.map((r) => [r.pair, r.vote as SentimentVote]));
  }

  return NextResponse.json({ counts, myVotes });
}

export async function POST(req: NextRequest) {
  const visitorId = await getVisitorId();
  if (!visitorId) {
    return NextResponse.json({ error: "Missing visitor id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const pair = typeof body?.pair === "string" ? body.pair : null;
  const vote = typeof body?.vote === "string" ? body.vote : null;

  if (!pair || !TRACKED_PAIRS.includes(pair as (typeof TRACKED_PAIRS)[number])) {
    return NextResponse.json({ error: "Unknown pair" }, { status: 400 });
  }
  if (!vote || !sentimentVoteValues.includes(vote as SentimentVote)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  await db
    .insert(sentimentVotes)
    .values({ pair, visitorId, vote: vote as SentimentVote })
    .onConflictDoUpdate({
      target: [sentimentVotes.pair, sentimentVotes.visitorId],
      set: { vote: vote as SentimentVote, createdAt: new Date() },
    });

  const counts = await getCounts();
  return NextResponse.json({ counts });
}
