import { NextResponse } from "next/server";
import { getViewerAccess } from "@/lib/tierAccess";
import { maskLockedActiveSignal } from "@/lib/signalAccess";
import { cachedSignalBoard } from "@/lib/cachedReads";

export const runtime = "nodejs";

// Backs the /signals page's live polling — same rows the page itself renders
// on first load, returned as JSON instead of HTML.
//
// THIS is the route that was keeping the database awake. It is polled every
// fifteen seconds by every open /signals tab, so one tab left open ran two
// queries a minute for as long as it stayed open, and Neon — which bills
// compute time and sleeps when idle — never got to sleep. The rows are the
// same for every reader, so they are read once and shared now; a new or
// closed trade clears the tag from the routes that write it, so the poll
// still sees a change immediately rather than at the end of a TTL.
//
// The tier is NOT shared. It is the one per-reader thing here, and it is
// what the masking below turns on.
export async function GET() {
  const [{ tier }, board] = await Promise.all([getViewerAccess(), cachedSignalBoard(30)]);

  // Same real server-side masking as the initial page load — the poll
  // response must never leak a locked signal's actual entry/SL/TP/volume,
  // even though the UI only relies on this for the initial render today.
  // Masking happens after the shared read, per request, for that reason.
  const maskedActive = board.active.map((s) => maskLockedActiveSignal(s, tier));

  return NextResponse.json({ active: maskedActive, closed: board.closed });
}
