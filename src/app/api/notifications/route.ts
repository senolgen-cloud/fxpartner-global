import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { vipSubscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getUnreadNotificationCount, getMemberNotifications } from "@/lib/memberNotifications";
import type { AccessTier } from "@/lib/signalAccess";

// What the header bell polls.
//
// DELIBERATELY DOES NOT MARK ANYTHING READ. getMemberNotifications stamps
// notificationsSeenAt on first sight, which is correct when the panel is
// open in front of someone; called from a poll it would mark everything
// read the moment a page loaded. The count path never writes, and the item
// path is only taken when the client asks for it — see below.
//
// Returns templates and their variables, never finished sentences: a
// sentence built on the server here would be a string no dictionary has a
// key for, and a non-Turkish reader would get Turkish. The client runs them
// through trf(), exactly as the account panel does.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    // Not an error: the bell polls on every page and a signed-out reader is
    // the ordinary case. 200 with nothing keeps that out of the error logs.
    return NextResponse.json({ unread: 0, items: [] });
  }

  const subscription = await db.query.vipSubscriptions.findFirst({
    where: and(eq(vipSubscriptions.userId, userId), eq(vipSubscriptions.status, "active")),
  });
  const viewerTier: AccessTier = (subscription?.tier as AccessTier | null) ?? "free";

  const wantItems = new URL(req.url).searchParams.get("items") === "1";

  if (!wantItems) {
    return NextResponse.json({ unread: await getUnreadNotificationCount(userId, viewerTier) });
  }

  // The toast needs something to say, so this branch fetches the real list.
  // It is only requested when the count has actually gone up, which is why
  // the expensive path is not on the polling interval.
  //
  // This one DOES stamp the watermark on a member who has never opened the
  // panel, because getMemberNotifications owns that rule and reproducing a
  // second copy of it here is how the two would drift apart. The count
  // branch above is the one that runs on every poll, and it never writes.
  const { items, unread } = await getMemberNotifications(userId, viewerTier);
  return NextResponse.json({
    unread,
    items: items.slice(0, 3).map((i) => ({
      id: i.id,
      at: i.at.toISOString(),
      title: i.title,
      titleVars: i.titleVars,
      detail: i.detail,
      detailVars: i.detailVars,
      href: i.href,
      kind: i.kind,
    })),
  });
}
