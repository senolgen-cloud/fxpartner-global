import { NextRequest, NextResponse } from "next/server";
import { getWeekCalendar } from "@/lib/economicCalendar";
import { sendPushToAll } from "@/lib/push";
import { db } from "@/db";
import { economicCalendarAlerts } from "@/db/schema";
import { inArray } from "drizzle-orm";

// Owned by Piyasa Analizi Departmanı — see src/lib/departments.ts.
// Paused by default: only fires via workflow_dispatch in
// .github/workflows/telegram-cron.yml until Compliance signs off on
// adding it to the schedule (see the "automation" governance note on
// that department).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// How far back to still consider a release "fresh" — protects against
// notifying on old events if a run was skipped/delayed.
const FRESHNESS_WINDOW_MS = 20 * 60 * 1000;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getWeekCalendar();
  const now = Date.now();

  // Only real, freshly-released, meaningful-impact events — never a made-up
  // or estimated figure, only what the feed actually reports as `actual`.
  const candidates = events.filter((e) => {
    if (e.actual === "") return false;
    if (e.impact !== "Medium" && e.impact !== "High") return false;
    const age = now - e.date.getTime();
    return age >= 0 && age <= FRESHNESS_WINDOW_MS;
  });

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 });
  }

  const alreadyNotified = await db
    .select({ id: economicCalendarAlerts.id })
    .from(economicCalendarAlerts)
    .where(
      inArray(
        economicCalendarAlerts.id,
        candidates.map((e) => e.id)
      )
    );
  const notifiedIds = new Set(alreadyNotified.map((r) => r.id));

  const toNotify = candidates.filter((e) => !notifiedIds.has(e.id));
  let sent = 0;

  for (const event of toNotify) {
    try {
      await sendPushToAll({
        title: `${event.title} (${event.country})`,
        body: `Gerçekleşen: ${event.actual} · Beklenti: ${event.forecast || "—"} · Önceki: ${event.previous || "—"}`,
        url: "/ekonomik-takvim",
      });
      await db.insert(economicCalendarAlerts).values({ id: event.id }).onConflictDoNothing();
      sent += 1;
    } catch (err) {
      console.error("Economic calendar push failed for", event.title, err);
    }
  }

  return NextResponse.json({ ok: true, notified: sent, candidates: candidates.length });
}
