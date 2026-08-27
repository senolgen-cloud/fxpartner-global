// Shared between the middleware (which enforces a decision) and the API
// route (which records one). Kept out of proxy.ts so the client component
// and the route can import the parsing without pulling the middleware in.

export const CONSENT_COOKIE = "fxp_consent";

/**
 * The version of the cookie list on the privacy page that a reader was
 * shown. Bump it when that list changes materially — a new cookie, or an
 * existing one used for something new — and every answer given against the
 * old list stops counting, because consent is to a specific set of
 * cookies, not to the idea of them.
 */
export const POLICY_VERSION = "2026-08-27";

export type Decision = "all" | "essential";

/**
 * Reads the decision out of the cookie value.
 *
 * The value is written as `<decision>.<consent record id>`, but a bare
 * `<decision>` is accepted too: browsers that answered before the record
 * existed still hold one, and re-asking them would be a worse answer than
 * honouring what they already said.
 */
export function parseDecision(value: string | undefined): Decision | null {
  if (!value) return null;
  const decision = value.split(".")[0];
  return decision === "all" || decision === "essential" ? decision : null;
}

export function cookieValue(decision: Decision, recordId: string | null): string {
  return recordId ? `${decision}.${recordId}` : decision;
}
