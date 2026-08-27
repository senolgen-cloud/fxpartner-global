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

// How far back to still consider a release "fresh".
//
// Was 20 minutes, on the assumption that a */5 schedule means a run every
// five minutes. It does not: across the last twenty scheduled runs the
// real gap averaged 55 minutes and reached 226. A 20-minute window and
// roughly one high-impact release a day meant a run almost never landed
// inside one — economic_calendar_alert had zero rows, ever, since this
// cron was switched on.
//
// Three hours covers the worst gap observed with room to spare. The
// notification says a figure was released, not that it was released this
// minute, so it is still true at the far end of that window.
const FRESHNESS_WINDOW_MS = 3 * 60 * 60 * 1000;

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

// The heads-up: told about a release before it lands.
//
// Asked for as "an hour before", and built as a lookahead rather than a
// window around the hour mark, because this cron does not run when it says
// it does. Its schedule is */5, but GitHub drops most of those ticks: over
// the last twenty scheduled runs the real interval averaged 55 minutes,
// with gaps up to 226. A [50, 70] window would be missed almost every
// time — which is exactly what happened to the release alert this file was
// already sending: zero rows in economic_calendar_alert, ever.
//
// So each run takes everything releasing within the next 90 minutes that
// has not been announced yet, and the message states the real time left
// rather than claiming an hour. A run 85 minutes out says 85 minutes; one
// that only wakes 20 minutes out says 20. Neither lies, and nothing is
// silently skipped because a tick was dropped.
const PRE_ALERT_LOOKAHEAD_MS = 90 * 60 * 1000;

/** "1 sa 12 dk" / "48 dk" — the time actually left, not a fixed promise. */
function untilLabel(ms: number, t: (text: string, vars?: Record<string, string | number>) => string): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return t("{m} dk", { m: mins });
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? t("{h} sa", { h }) : t("{h} sa {m} dk", { h, m });
}

// Prefixed so a heads-up and the release alert for the same event are two
// separate rows. Sharing an id would mean whichever fired first silenced
// the other, and the one that fires first is always the heads-up.
const preAlertId = (event: EconomicEvent) => `pre:${event.id}`;

/** What is about to be released, and what a reader should do about it. */
function buildPreAlert(events: EconomicEvent[], loc: Locale): { title: string; body: string; url: string } {
  const t = (text: string, vars: Record<string, string | number> = {}) =>
    formatMessage(loc, text, vars);

  const check = t("Açık işlemlerinizi ve bekleyen emirlerinizi kontrol edin.");

  // The soonest one sets the headline time; a group announced together is
  // read as "this is about to start", not as five separate countdowns.
  const soonest = Math.min(...events.map((e) => e.date.getTime())) - Date.now();
  const until = untilLabel(soonest, t);

  if (events.length === 1) {
    const event = events[0];
    return {
      title: t("{until} sonra: {title}", { until, title: `${event.country} ${event.title}` }),
      body: `${t("Beklenti: {forecast} · Önceki: {previous}", {
        forecast: event.forecast || "—",
        previous: event.previous || "—",
      })} — ${check}`,
      url: localePath(loc, "/ekonomik-takvim"),
    };
  }

  const shown = events
    .slice(0, MAX_EVENTS_IN_BODY)
    .map((e) => `${e.country} ${e.title}`);
  const rest = events.length - shown.length;
  return {
    title: t("{until} sonra {count} önemli veri açıklanacak", { until, count: events.length }),
    body:
      shown.join(" · ") +
      (rest > 0 ? ` · ${t("+{rest} veri daha", { rest })}` : "") +
      ` — ${check}`,
    url: localePath(loc, "/ekonomik-takvim"),
  };
}

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

  // The heads-up runs first and on its own dedup rows, so a release alert
  // for the same event later in the day is unaffected either way.
  // ?lookahead=<minutes> widens the heads-up window for the dry run only,
  // so the copy can be seen against a real upcoming release instead of
  // waiting for one to come within 90 minutes. Ignored on a real run.
  const lookaheadOverride = Number(req.nextUrl.searchParams.get("lookahead"));
  const lookaheadMs =
    req.nextUrl.searchParams.get("dry") === "1" && Number.isFinite(lookaheadOverride) && lookaheadOverride > 0
      ? lookaheadOverride * 60 * 1000
      : PRE_ALERT_LOOKAHEAD_MS;

  const preCandidates = events.filter((e) => {
    if (!ALERT_IMPACTS.has(e.impact)) return false;
    if (e.actual !== "") return false; // already out; that is the other alert's job
    const until = e.date.getTime() - now;
    return until > 0 && until <= lookaheadMs;
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
      preCandidates: preCandidates.length,
      // The dry run reports the Turkish copy; it is a diagnostic, not a send.
      wouldSend: candidates.length > 0 ? buildPayload(candidates, defaultLocale) : null,
      wouldPreSend: preCandidates.length > 0 ? buildPreAlert(preCandidates, defaultLocale) : null,
      recentReleases,
    });
  }

  // Heads-ups, before the release path so an event about to land is
  // announced even on a run where nothing has been released yet.
  let preNotified = 0;
  let prePush: PushResult | { error: string } | null = null;
  if (preCandidates.length > 0) {
    const preIds = preCandidates.map(preAlertId);
    const alreadyPre = await db
      .select({ id: economicCalendarAlerts.id })
      .from(economicCalendarAlerts)
      .where(inArray(economicCalendarAlerts.id, preIds));
    const done = new Set(alreadyPre.map((r) => r.id));
    const toPre = preCandidates.filter((e) => !done.has(preAlertId(e)));

    if (toPre.length > 0) {
      try {
        prePush = await sendPushToAll((loc) => buildPreAlert(toPre, loc));
        await db
          .insert(economicCalendarAlerts)
          .values(toPre.map((e) => ({ id: preAlertId(e) })))
          .onConflictDoNothing();
        preNotified = toPre.length;
      } catch (err) {
        // Unmarked, so the next run tries again — still inside the
        // 90-minute lookahead unless the release has already happened.
        console.error("Economic calendar pre-alert push failed:", err);
        prePush = { error: (err as Error).message };
      }
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, preNotified, prePush });
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
    return NextResponse.json({ ok: true, notified: 0, candidates: candidates.length, preNotified, prePush });
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
    preNotified,
    prePush,
    candidates: candidates.length,
    events: toNotify.map((e) => `${e.country} ${e.title}`),
    push,
  });
});
