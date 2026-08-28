// Client helpers, not the server tr(): this component has no "use client" of
// its own, but SignalsBoard does, so it is compiled into the client bundle —
// where the per-request locale store does not exist and tr() would quietly
// return Turkish to every reader. Same trap TradeNowButton and LotLadder
// hit; see scripts/check-client-tr.mjs.
import { useTr } from "@/components/useTr";
import { COPYTRADE_URL } from "@/data/copytrade";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Two overlapping sheets — the standard "duplicate" mark. Not a
          clipboard: a clipboard means "copy this text", and what this offers
          is copying the account's trades. */}
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

/**
 * Opens the copy-trading programme the tracked account is published through.
 *
 * SITS BESIDE TradeNowButton, NOT INSTEAD OF IT. They are different offers:
 * one opens a broker so the reader can place the trade themselves, this one
 * mirrors the account automatically.
 *
 * FILLED, WHERE TradeNowButton IS OUTLINED. Gold was the first choice and
 * it was wrong: the locked card already carries a gold "unlock" pill, so a
 * locked row showed two buttons in exactly the same colour saying different
 * things. Filled signal separates it from both — the gold outline that
 * unlocks, and the signal outline that opens a broker — and it makes the
 * copy offer the loudest thing in the row, which is what it is meant to be.
 *
 * Offered on closed trades as well as open ones, and that is deliberate
 * rather than an oversight: it does not offer to copy a finished trade,
 * which would be meaningless, but to copy the account from here on. A
 * reader who has just read a closed result is exactly the reader for whom
 * that is the next question.
 */
export default function CopyTradeButton({
  variant = "card",
  className = "",
}: {
  variant?: "card" | "inline";
  className?: string;
}) {
  const tr = useTr();

  if (variant === "inline") {
    return (
      <a
        href={COPYTRADE_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-signal px-4 py-2 text-[12px] font-semibold text-on-signal transition-colors duration-200 hover:bg-signal-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:transition-[colors,transform] ${className}`}
      >
        <CopyIcon className="h-3.5 w-3.5" />
        {tr("Kopyala")}
      </a>
    );
  }

  return (
    <a
      href={COPYTRADE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-signal px-3 py-2 text-[12px] font-semibold text-on-signal transition-colors hover:bg-signal-strong ${className}`}
    >
      <CopyIcon className="h-3.5 w-3.5" />
      {tr("Kopyala")}
    </a>
  );
}
