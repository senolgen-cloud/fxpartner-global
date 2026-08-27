import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID keys are not set (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT)");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/**
 * What to send, per language.
 *
 * A caller that passes a plain payload sends the same text to everyone,
 * which is what every caller did before locales were stored and is still
 * right for anything genuinely language-free. A caller that passes a
 * function gets asked once per language actually present in the
 * subscriber list — so a bulletin can hand back the translation it already
 * has in its own row rather than re-translating anything.
 */
export type PushPayloadFor = PushPayload | ((locale: Locale) => PushPayload);

function resolve(payload: PushPayloadFor, locale: Locale): PushPayload {
  return typeof payload === "function" ? payload(locale) : payload;
}

/** Rows written before the column existed have been getting Turkish. */
function localeOf(row: { locale: string | null }): Locale {
  return row.locale && isLocale(row.locale) ? row.locale : defaultLocale;
}

export interface PushResult {
  sent: number;
  removed: number;
  failed: number;
  // Deduped "<status> <push-service host>: <reason>" summaries. Present
  // only when something actually failed, so a healthy run's JSON stays
  // as small as it was before.
  errors?: string[];
}

// Best-effort broadcast to every stored subscription, including anonymous
// ones. Use this for open, top-of-funnel content (blog posts, campaign
// digests, market analysis, economic-calendar alerts) — things whose whole
// job is reach. For trade signals use sendPushToMembers below instead.
export async function sendPushToAll(payload: PushPayloadFor): Promise<PushResult> {
  return broadcast(payload, await db.query.pushSubscriptions.findMany(), "all");
}

// Signal notifications go only to subscriptions tied to a real account.
// Instant signal alerts are a member benefit — that's the trade: the levels
// and the alerts are free, the registration isn't optional (see the header
// comment in lib/signalAccess.ts, where the account explicitly earns its
// keep on push alerts rather than on withholding levels). An anonymous
// push subscription (userId null) is skipped here rather than rejected at
// subscribe time, so the same browser opt-in still works for the content
// pushes above — and gets the teaser below instead.
export async function sendPushToMembers(payload: PushPayloadFor): Promise<PushResult> {
  const subs = await db.query.pushSubscriptions.findMany();
  return broadcast(
    payload,
    subs.filter((s) => s.userId !== null),
    "members"
  );
}

// The other half of that split: subscriptions with no account behind them.
// They opted into notifications and then hear nothing whenever a signal
// fires, which is both a wasted permission grant and a wasted conversion —
// so they get a teaser telling them a signal just went out and that the
// levels-on-your-phone part needs a (free) account. Never send the actual
// entry/TP/SL levels through this.
export async function sendPushToNonMembers(payload: PushPayloadFor): Promise<PushResult> {
  const subs = await db.query.pushSubscriptions.findMany();
  return broadcast(
    payload,
    subs.filter((s) => s.userId === null),
    "non-members"
  );
}

type PushSubscriptionRow = Awaited<ReturnType<typeof db.query.pushSubscriptions.findMany>>[number];

// Just the push service, e.g. "fcm.googleapis.com" — enough to tell a
// Chrome-wide outage from a Safari-wide one, with no per-user endpoint
// token in the logs.
function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).host;
  } catch {
    return "unknown-host";
  }
}

// A subscription that the browser has revoked (410 Gone) or that no longer
// exists (404) is deleted so the table doesn't accumulate dead endpoints.
// Every other failure is still swallowed per-subscription — one bad row
// must not fail a whole broadcast — but it is now counted, logged, and
// returned to the caller. It used to be dropped in complete silence, which
// meant a wrong VAPID key or a rate-limited push service looked exactly
// like a healthy run in the cron output.
async function broadcast(
  payload: PushPayloadFor,
  subs: PushSubscriptionRow[],
  audience: string
): Promise<PushResult> {
  ensureConfigured();

  // Resolved once per language present, not once per subscriber: a
  // thousand Turkish subscribers should cost one lookup, not a thousand.
  const byLocale = new Map<Locale, PushPayload>();
  const payloadFor = (locale: Locale) => {
    let p = byLocale.get(locale);
    if (!p) {
      p = resolve(payload, locale);
      byLocale.set(locale, p);
    }
    return p;
  };

  let sent = 0;
  let removed = 0;
  let failed = 0;
  const errors = new Set<string>();

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payloadFor(localeOf(sub)))
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        const host = endpointHost(sub.endpoint);

        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          removed += 1;
          return;
        }

        failed += 1;
        const reason = String((err as { body?: string }).body ?? (err as Error).message ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 120);
        errors.add(`${status ?? "no-status"} ${host}: ${reason || "unknown error"}`);
        console.error(`Push to ${host} failed (${audience}, status ${status ?? "none"}):`, reason);
      }
    })
  );

  if (failed > 0) {
    console.error(`Push broadcast to ${audience}: ${sent} sent, ${failed} failed, ${removed} pruned`);
  }

  return errors.size > 0 ? { sent, removed, failed, errors: [...errors].slice(0, 5) } : { sent, removed, failed };
}
