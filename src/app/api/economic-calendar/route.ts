import { NextResponse } from "next/server";
import { getWeekCalendar } from "@/lib/economicCalendar";

export const runtime = "nodejs";

// Backs the /ekonomik-takvim page's live polling — same feed the page
// itself reads on first load, just returned as JSON.
export async function GET() {
  try {
    const events = await getWeekCalendar();
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Economic calendar fetch failed:", err);
    return NextResponse.json({ error: "Calendar temporarily unavailable" }, { status: 502 });
  }
}
