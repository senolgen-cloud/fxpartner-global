import { auth } from "@/auth";
import { db } from "@/db";
import { vipSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tierFromPriceId, type PackageTier } from "@/lib/vip";

export type ViewerAccess = {
  signedIn: boolean;
  tier: PackageTier | null;
};

// Server-side viewer access check for page-level gating (AI assistant,
// copytrade, community) — distinct from src/lib/signalAccess.ts's
// viewerRank, which treats signed-out visitors as "starter" so public FX
// signals stay visible. Here `tier: null` means "no active paid
// subscription" and correctly denies Pro/VIP-gated pages; it's never
// defaulted up to starter.
export async function getViewerAccess(): Promise<ViewerAccess> {
  const session = await auth();
  if (!session?.user?.id) return { signedIn: false, tier: null };

  const subscription = await db.query.vipSubscriptions.findFirst({
    where: eq(vipSubscriptions.userId, session.user.id),
  });
  if (!subscription || subscription.status !== "active") {
    return { signedIn: true, tier: null };
  }
  const tier: PackageTier | null =
    (subscription.tier as PackageTier | null) ??
    (subscription.stripePriceId ? tierFromPriceId(subscription.stripePriceId) : null);
  return { signedIn: true, tier };
}

const RANK: Record<PackageTier, number> = { starter: 1, pro: 2, vip: 3 };

export function hasTierAccess(tier: PackageTier | null, required: PackageTier): boolean {
  if (!tier) return false;
  return RANK[tier] >= RANK[required];
}
