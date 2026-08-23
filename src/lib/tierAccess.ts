import { auth } from "@/auth";
import { db } from "@/db";
import { vipSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type AccessTier } from "@/lib/vip";

export type ViewerAccess = {
  signedIn: boolean;
  tier: AccessTier | null;
  // Needed wherever a per-member allowance is counted; null when signed out.
  userId: string | null;
};

// Server-side viewer access check, shared by page-level gating (AI
// assistant, copytrade, community) and by the signals board.
//
// `tier: null` means signed OUT. A signed-in visitor with no active
// subscription gets "free" — that's the whole point of the free tier: the
// account is the price. Pro/VIP-gated pages still deny "free" via
// hasTierAccess below, since free ranks under both.
export async function getViewerAccess(): Promise<ViewerAccess> {
  const session = await auth();
  if (!session?.user?.id) return { signedIn: false, tier: null, userId: null };

  const subscription = await db.query.vipSubscriptions.findFirst({
    where: eq(vipSubscriptions.userId, session.user.id),
  });
  if (!subscription || subscription.status !== "active") {
    return { signedIn: true, tier: "free", userId: session.user.id };
  }
  return {
    signedIn: true,
    tier: (subscription.tier as AccessTier | null) ?? "free",
    userId: session.user.id,
  };
}

const RANK: Record<AccessTier, number> = { free: 0, pro: 1, vip: 2 };

export function hasTierAccess(tier: AccessTier | null, required: AccessTier): boolean {
  if (!tier) return false;
  return RANK[tier] >= RANK[required];
}
