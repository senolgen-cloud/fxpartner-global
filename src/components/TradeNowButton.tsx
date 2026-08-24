// Client helpers, not the server tr(): this component has no "use client" of
// its own, but SignalsBoard does, so it is compiled into the client bundle —
// where the per-request locale store does not exist and tr() would quietly
// return Turkish to every reader. Same trap LotLadder hit; see
// scripts/check-client-tr.mjs.
import { useTr } from "@/components/useTr";
import { getBrokerBySlug } from "@/data/brokers";

// Read the partner link out of the broker data instead of keeping a second
// copy of it here. It already lives there as FxPro's referralUrl, and a CTA
// holding its own duplicate is a link that quietly stops paying the day the
// other one is updated — with nothing to notice, because both still work.
// brokers.ts is already in the client bundle via BrokerList and nine other
// client components, so reading it here adds nothing to the download.
//
// The fallback is the FxPro review page: a real destination on our own site
// if the slug ever moves, rather than an href of "undefined".
const FXPRO_URL = getBrokerBySlug("fxpro")?.referralUrl ?? "/brokerlar/fxpro";

function TradeIcon({ className }: { className?: string }) {
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
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  );
}

/**
 * Sponsored CTA beside a live signal: take this trade at FxPro.
 *
 * It used to be CopyTradeButton, pointing at an XM Copytrade strategy so a
 * reader could mirror the account these signals come from. The ask changed to
 * sending them to FxPro to place the trade themselves, which is a different
 * action, so the label, the icon and the name all moved with it — a button
 * still called "copy" and drawn with a copy icon while it opens a broker's
 * order ticket is the kind of stale naming that outlives the person who
 * remembers why.
 *
 * - `card`   — full-width, sits inside a single signal card
 * - `inline` — pill for a signal row's action area, no top margin, sized to
 *              its label rather than the container
 */
export default function TradeNowButton({
  variant = "card",
  label,
  className = "",
}: {
  variant?: "card" | "inline";
  label?: string;
  className?: string;
}) {
  const tr = useTr();

  if (variant === "inline") {
    return (
      <a
        href={FXPRO_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-signal px-4 py-2 text-[12px] font-semibold text-on-signal transition-colors hover:bg-signal-strong ${className}`}
      >
        <TradeIcon className="h-3.5 w-3.5" />
        {label ?? tr("İşlem Yap")}
      </a>
    );
  }

  return (
    <a
      href={FXPRO_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2 text-[12px] font-semibold text-signal transition-colors hover:border-signal hover:bg-signal hover:text-on-signal ${className}`}
    >
      <TradeIcon className="h-3.5 w-3.5" />
      {label ?? tr("İşlem Yap")}
    </a>
  );
}
