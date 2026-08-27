// The chevron on secondary actions.
//
// Extracted the first time a fourth copy of the same path was about to be
// written. It also replaced the "→" glyph these links used to end with: an
// arrow inside the text runs with the sentence and flips meaning in an RTL
// tree, where /ar reads right to left and a rightward arrow points back at
// where the reader came from. An SVG in the flex row is laid out by
// direction like any other box.
export default function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 rtl:-scale-x-100 ${className}`}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
