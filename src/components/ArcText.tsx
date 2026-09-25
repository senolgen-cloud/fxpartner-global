// Slowly rotating text on a circle, the way Pipcy runs "READY TO TRADE" off
// the right edge of its challenge CTA.
//
// It is decoration and nothing else: aria-hidden, no link, no information
// that is not already in the section's own heading and button. A screen
// reader that read a ring of repeating words would be worse off than one
// that skipped it.
//
// Three things it is careful about:
//   1. It never widens the page. The ring is absolutely positioned and its
//      container needs overflow-hidden; half of it hangs off-screen by
//      design, which is where the effect comes from.
//   2. prefers-reduced-motion stops the rotation rather than the element:
//      the arc still reads, it just stops moving. Motion that loops forever
//      is exactly what that setting exists for.
//   3. The text is repeated to fill the circle rather than stretched, so a
//      Turkish string and an Arabic one both keep their own letterforms.

export default function ArcText({
  text,
  repeat = 3,
  className = "",
  size = 360,
}: {
  text: string;
  repeat?: number;
  className?: string;
  size?: number;
}) {
  // One space-padded copy per repetition, laid end to end around the path.
  const ring = Array.from({ length: repeat }, () => `${text}   •   `).join("");
  const id = `arc-${text.replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase()}`;

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`arc-text-spin pointer-events-none select-none ${className}`}
    >
      <defs>
        {/* Clockwise circle, starting at the top. */}
        <path id={id} d="M200,200 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0" fill="none" />
      </defs>
      <text
        className="fill-signal font-display font-bold uppercase"
        style={{ fontSize: 34, letterSpacing: "0.12em" }}
      >
        <textPath href={`#${id}`} startOffset="0%">
          {ring}
        </textPath>
      </text>
    </svg>
  );
}
