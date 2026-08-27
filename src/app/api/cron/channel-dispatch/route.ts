import { NextRequest, NextResponse } from "next/server";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import {
  CHANNEL_PACE_MS,
  getPaceState,
  markChannelPosted,
  slotIndex,
  sourcesFromSlot,
  type RotationSource,
} from "@/lib/telegram-pace";

// The channel's only scheduler.
//
// Before this, six content crons each held their own schedule and posted
// whenever they woke up. That produced eight posts a day in clumps —
// blog-share at 09:30 and broker-review-share at 10:00 landing half an
// hour apart, then nothing for hours. The owner asked for one post every
// four hours; a single paced dispatcher is the only way to say that once
// rather than negotiating it between six crons that cannot see each other.
//
// This route posts nothing itself. It decides whether the channel is due,
// picks whose turn it is, and calls that cron's existing route — which
// keeps its own content logic and its own dedup, untouched.
//
// LIVE TRADE SIGNALS DO NOT COME THROUGH HERE and must not. /api/trade-
// signal, /api/trade-result and /api/pending-order post the moment the EA
// fires, because a signal held back to fit a content schedule is not a
// signal any more. The pace governs editorial output only.

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type SourceResult = { source: RotationSource; posted: boolean; reason?: string; status: number };

async function callSource(source: RotationSource, req: NextRequest): Promise<SourceResult> {
  const url = new URL(`/api/cron/${source}`, req.nextUrl.origin);
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    cache: "no-store",
  });

  // A source that errors must not consume the slot: fall through to the
  // next one and let the failure surface in the response. The called
  // route has its own withCronErrorAlert, so the alert has already been
  // sent by the time we see the status.
  if (!res.ok) return { source, posted: false, reason: `http ${res.status}`, status: res.status };

  const body = (await res.json()) as { posted?: boolean; reason?: string };
  return { source, posted: body.posted === true, reason: body.reason, status: res.status };
}

export const GET = withCronErrorAlert("channel-dispatch", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const pace = await getPaceState(now);

  if (pace.openInMs > 0 && !dry) {
    return NextResponse.json({
      ok: true,
      posted: false,
      reason: "paced",
      lastPostedAt: pace.lastPostedAt,
      minutesSinceLast: Math.round((pace.sinceMs ?? 0) / 60000),
      opensInMinutes: Math.round(pace.openInMs / 60000),
    });
  }

  const order = sourcesFromSlot(now);

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      paceHours: CHANNEL_PACE_MS / 3_600_000,
      slot: slotIndex(now),
      wouldTry: order,
      lastPostedAt: pace.lastPostedAt,
      minutesSinceLast: pace.sinceMs === null ? null : Math.round(pace.sinceMs / 60000),
      opensInMinutes: Math.round(pace.openInMs / 60000),
    });
  }

  const attempts: SourceResult[] = [];
  for (const source of order) {
    const result = await callSource(source, req);
    attempts.push(result);
    if (result.posted) {
      // Marked only after a source confirms it posted, so a run where
      // every source declines leaves the window open instead of buying
      // four hours of silence with nothing.
      await markChannelPosted(now);
      return NextResponse.json({ ok: true, posted: true, source, attempts });
    }
  }

  return NextResponse.json({ ok: true, posted: false, reason: "no source had anything", attempts });
});
