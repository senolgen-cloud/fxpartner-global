import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isLocale } from "@/lib/i18n";

// Public, anonymous-friendly opt-in — no auth required. If the visitor
// happens to be signed in the row is linked to their account, otherwise
// userId stays null (see the comment on pushSubscriptions in schema.ts).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint as string | undefined;
  const p256dh = body?.keys?.p256dh as string | undefined;
  const auth_ = body?.keys?.auth as string | undefined;
  // The language tree the reader was on when they said yes. Anything
  // unrecognised is dropped rather than stored, so a bad value cannot end
  // up deciding what language somebody's phone speaks.
  const rawLocale = body?.locale;
  const locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : null;

  if (!endpoint || !p256dh || !auth_) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const session = await auth();
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const existing = await db.query.pushSubscriptions.findFirst({
    where: eq(pushSubscriptions.endpoint, endpoint),
  });

  if (existing) {
    await db
      .update(pushSubscriptions)
      // Re-subscribing from another tree moves the row's language with
      // it; a missing locale never overwrites one already stored.
      .set({
        p256dh,
        auth: auth_,
        userAgent,
        userId: session?.user?.id ?? existing.userId,
        locale: locale ?? existing.locale,
      })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  } else {
    await db.insert(pushSubscriptions).values({
      endpoint,
      p256dh,
      auth: auth_,
      userAgent,
      userId: session?.user?.id ?? null,
      locale,
    });
  }

  return NextResponse.json({ ok: true });
}
