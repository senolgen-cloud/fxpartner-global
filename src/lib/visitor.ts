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
