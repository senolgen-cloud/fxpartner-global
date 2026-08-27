import { NextRequest, NextResponse } from "next/server";
import { getWeekCalendar, type EconomicEvent } from "@/lib/economicCalendar";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { db } from "@/db";
import { economicCalendarAlerts } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { formatMessage } from "@/lib/chrome";
import { defaultLocale, localePath, type Locale } from "@/lib/i18n";

// Owned by Piyasa Analizi Departmanı — see src/lib/departments.ts.
// Runs every 5 minutes from .github/workflows/telegram-cron.yml, active
// since 2026-08-07 per owner approval.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// How far back to still consider a release "fresh" — protects against
// notifying on old events if a run was skipped/delayed.
const FRESHNESS_WINDOW_MS = 20 * 60 * 1000;

// High impact only, deliberately narrower than the Medium+High the
// /ekonomik-takvim board displays. The calendar carries ~87 released
// medium-or-high figures in a normal week — pushing all of them is ~12
// notifications a day, which is how a subscriber ends up revoking
// permission. High alone is ~17 a week (2-3 a day), which is the cadence
// a release alert is actually worth.
const ALERT_IMPACTS = new Set<EconomicEvent["impact"]>(["High"]);

// Releases cluster: three US PMIs land at the same minute. One push per
// event would fire three notifications back to back, so a run's releases
// go out as a single grouped notification instead.
const MAX_EVENTS_IN_BODY = 4;

// Carries the currency because the same indicator lands for several
// regions in one window — two "S&P Global Manufacturing PMI Flash" lines
// in a grouped notification are unreadable without it.
function line(event: EconomicEvent): string {
  return `${event.country} ${event.title}: ${event.actual} (bek. ${event.forecast || "—"})`;
}

function buildPayload(events: EconomicEvent[], loc: Locale): { title: string; body: string; url: string } {
  const t = (text: string, vars: Record<string, string | number> = {}) =>
    formatMessage(loc, text, vars);

  if (events.length === 1) {
    const event = events[0];
    return {
      // The release's own name comes from the calendar feed and is not
      // ours to translate; the labels around it are.
      title: `${event.title} (${event.country})`,
      body: t("Gerçekleşen: {actual} · Beklenti: {forecast} · Önceki: {previous}", {
        actual: event.actual,
        forecast: event.forecast || "—",
        previous: event.previous || "—",
      }),
      url: localePath(loc, "/ekonomik-takvim"),
    };
  }

  const shown = events.slice(0, MAX_EVENTS_IN_BODY).map(line);
  const rest = events.length - shown.length;
  return {
    title: t("{count} önemli veri açıklandı", { count: events.length }),
    body: shown.join(" · ") + (rest > 0 ? ` · ${t("+{rest} veri daha", { rest })}` : ""),
    url: localePath(loc, "/ekonomik-takvim"),
  };
}

export const GET = withCronErrorAlert("economic-calendar-alert", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getWeekCalendar();
  const now = Date.now();

  // Only real, freshly-released, high-impact events — never a made-up or
  // estimated figure, only what the feed actually reports as `actual`.
  const candidates = events.filter((e) => {
    if (e.actual === "") return false;
    if (!ALERT_IMPACTS.has(e.impact)) return false;
    const age = now - e.date.getTime();
    return age >= 0 && age <= FRESHNESS_WINDOW_MS;
  });

  // ?dry=1 answers "what would this run have pushed?" without sending or
  // marking anything — the question that had no answer while this cron
  // reported notified: 0 on every run for two weeks with a feed that was
  // never going to produce a candidate. `recentReleases` is the part that
  // actually tells the two apart: it ignores the freshness window, so a
  // quiet 20 minutes still shows whether the feed is reporting figures at
  // all. Behind CRON_SECRET like the rest of the route.
  if (req.nextUrl.searchParams.get("dry") === "1") {
    const recentReleases = events
      .filter((e) => e.actual !== "" && ALERT_IMPACTS.has(e.impact) && e.date.getTime() <= now)
      .slice(-5)
      .map((e) => `${e.date.toISOString()} ${e.country} ${e.title}: ${e.actual}`);

    return NextResponse.json({
      ok: true,
      dryRun: true,
      candidates: candidates.length,
      // The dry run reports the Turkish copy; it is a diagnostic, not a send.
      wouldSend: candidates.length > 0 ? buildPayload(candidates, defaultLocale) : null,
      recentReleases,
    });
  }

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

  if (toNotify.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, candidates: candidates.length });
  }

  let push: PushResult | { error: string };
  try {
    push = await sendPushToAll((loc) => buildPayload(toNotify, loc));
  } catch (err) {
    // Nothing is marked as notified, so the next run (5 minutes from now,
    // still inside the freshness window) retries the same releases.
    console.error("Economic calendar push failed:", err);
    return NextResponse.json(
      { ok: true, notified: 0, candidates: candidates.length, push: { error: (err as Error).message } },
      { status: 200 }
    );
  }

  await db
    .insert(economicCalendarAlerts)
    .values(toNotify.map((e) => ({ id: e.id })))
    .onConflictDoNothing();

  return NextResponse.json({
    ok: true,
    notified: toNotify.length,
    candidates: candidates.length,
    events: toNotify.map((e) => `${e.country} ${e.title}`),
    push,
  });
});
