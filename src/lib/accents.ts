/**
 * The six accents a member can choose for their monogram.
 *
 * Plain module, no "use client": the picker in ProfileCard is a client
 * component and the monogram in MemberStatement is a server one, and both
 * need the same list. Exporting the palette from the client file made it a
 * client function, which the server could not call — a boundary error that
 * typechecks and builds cleanly and only shows up as a 500 at request time.
 *
 * Values are the site's own tokens where they exist, so a member's choice
 * still looks like this site rather than a colour wheel.
 */
export const ACCENTS = [
  { id: "signal", hex: "#0891b2" },
  { id: "gold", hex: "#c9a227" },
  { id: "green", hex: "#22c55e" },
  { id: "violet", hex: "#8b5cf6" },
  { id: "rose", hex: "#f43f5e" },
  { id: "slate", hex: "#94a3b8" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export const ACCENT_IDS: ReadonlySet<string> = new Set(ACCENTS.map((a) => a.id));

/** Falls back to signal for null, unknown, or a value edited by hand. */
export function accentHex(id: string | null | undefined): string {
  return ACCENTS.find((a) => a.id === id)?.hex ?? ACCENTS[0].hex;
}
