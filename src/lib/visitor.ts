import { cookies } from "next/headers";

// Kept in sync with the same constant in src/proxy.ts, which is the only
// place that ever writes this cookie.
export const VISITOR_COOKIE = "fxp_vid";

// Reads the anonymous per-browser ID proxy.ts sets on first visit. Returns
// null on the very first request of a session, before proxy.ts's response
// has round-tripped back — callers that need it unconditionally should read
// it from a page/layout below proxy.ts, not the initial request.
export async function getVisitorId(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}

// Kept in sync with the same constant in src/proxy.ts, which is the only
// place that ever writes this cookie.
export const ATTR_COOKIE = "fxp_attr";

export interface Attribution {
  source: string | null;
  campaign: string | null;
  landingPath: string | null;
}

const EMPTY_ATTRIBUTION: Attribution = {
  source: null,
  campaign: null,
  landingPath: null,
};

// Reads the first-touch attribution proxy.ts recorded on this browser's
// first request. Every funnel table (user, cashback_lead, cashback_account,
// vip_subscription) carries these three columns, so the caller spreads the
// result straight into its insert. Returns all-null rather than throwing
// when the cookie is missing or unparseable — attribution is a nice-to-have
// on top of the row, never a reason to fail the signup itself.
export async function getAttribution(): Promise<Attribution> {
  const store = await cookies();
  const raw = store.get(ATTR_COOKIE)?.value;
  if (!raw) return EMPTY_ATTRIBUTION;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_ATTRIBUTION;
    const { source, campaign, landingPath } = parsed as Record<string, unknown>;
    return {
      source: typeof source === "string" ? source : null,
      campaign: typeof campaign === "string" ? campaign : null,
      landingPath: typeof landingPath === "string" ? landingPath : null,
    };
  } catch {
    return EMPTY_ATTRIBUTION;
  }
}
