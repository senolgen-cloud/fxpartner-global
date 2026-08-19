import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

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

// Best-effort broadcast to every stored subscription, including anonymous
// ones. Use this for open, top-of-funnel content (blog posts, campaign
// digests, market analysis, economic-calendar alerts) — things whose whole
// job is reach. For trade signals use sendPushToMembers below instead.
//
// A subscription that the browser has revoked (410 Gone) or that no longer
// exists (404) is deleted so the table doesn't accumulate dead endpoints;
// any other per-subscription failure is swallowed so one bad row can't fail
// the whole broadcast.
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  return broadcast(payload, await db.query.pushSubscriptions.findMany());
}

// Signal notifications go only to subscriptions tied to a real account.
// Instant signal alerts are a member benefit — that's the trade: the levels
// and the alerts are free, the registration isn't optional. An anonymous
// push subscription (userId null) is silently skipped here rather than
// rejected at subscribe time, so the same browser opt-in still works for
// the content pushes above.
export async function sendPushToMembers(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  const subs = await db.query.pushSubscriptions.findMany();
  return broadcast(
    payload,
    subs.filter((s) => s.userId !== null)
  );
}

type PushSubscriptionRow = Awaited<ReturnType<typeof db.query.pushSubscriptions.findMany>>[number];

async function broadcast(
  payload: PushPayload,
  subs: PushSubscriptionRow[]
): Promise<{ sent: number; removed: number }> {
  ensureConfigured();

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          removed += 1;
        }
      }
    })
  );

  return { sent, removed };
}
