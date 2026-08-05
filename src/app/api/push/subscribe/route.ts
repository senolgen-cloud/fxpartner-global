import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Public, anonymous-friendly opt-in — no auth required. If the visitor
// happens to be signed in the row is linked to their account, otherwise
// userId stays null (see the comment on pushSubscriptions in schema.ts).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint as string | undefined;
  const p256dh = body?.keys?.p256dh as string | undefined;
  const auth_ = body?.keys?.auth as string | undefined;

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
      .set({ p256dh, auth: auth_, userAgent, userId: session?.user?.id ?? existing.userId })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  } else {
    await db.insert(pushSubscriptions).values({
      endpoint,
      p256dh,
      auth: auth_,
      userAgent,
      userId: session?.user?.id ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
