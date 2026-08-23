// Client helpers, not the server tr(): this component has no "use client" of
// its own, but SignalsBoard does, so it is compiled into the client bundle —
// where the per-request locale store does not exist and tr() would quietly
// return Turkish to every reader. Same trap LotLadder hit; see
// scripts/check-client-tr.mjs.
import { useTr } from "@/components/useTr";
import { XM_COPYTRADE_URL } from "@/lib/copytrade";

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
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/**
 * Sponsored CTA that sends a visitor to XM Copytrade, where they can mirror
 * the same tracked MT5 account these signals come from.
 *
 * - `card`    — compact, sits inside a single signal card
 * - `inline`  — pill for a signal row's action area, no top margin, sized to
 *               its label rather than the container
 * - `banner`  — full-width block for the top of the signals feed
 */
export default function CopyTradeButton({
  variant = "card",
  label,
  className = "",
}: {
  variant?: "card" | "inline" | "banner";
  label?: string;
  className?: string;
}) {
  const tr = useTr();
  if (variant === "inline") {
    return (
      <a
        href={XM_COPYTRADE_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-signal px-4 py-2 text-[12px] font-semibold text-on-signal transition-colors hover:bg-signal-strong ${className}`}
      >
        <CopyIcon className="h-3.5 w-3.5" />
        {label ?? tr("İşlemi Kopyala")}
      </a>
    );
  }

  if (variant === "banner") {
    return (
      <a
        href={XM_COPYTRADE_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`group flex flex-col items-center gap-4 rounded-2xl border border-signal/40 bg-gradient-to-b from-signal/10 to-transparent p-6 text-center transition-colors hover:border-signal sm:flex-row sm:justify-between sm:text-left ${className}`}
      >
        <span className="flex flex-col gap-1">
          <span className="font-display text-lg font-semibold text-text-on-ink">
            {label ?? tr("Bu sinyalleri otomatik kopyalayın")}
          </span>
          <span className="text-sm text-text-on-ink-muted">
            {tr("XM Copytrade ile hesabınıza bağlanın — her yeni işlem otomatik olarak sizde de açılır.")}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-transform group-hover:scale-[1.03]">
          <CopyIcon className="h-4 w-4" />
          {tr("Üye Ol & Kopyala")}
        </span>
      </a>
    );
  }

  return (
    <a
      href={XM_COPYTRADE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2 text-[12px] font-semibold text-signal transition-colors hover:border-signal hover:bg-signal hover:text-on-signal ${className}`}
    >
      <CopyIcon className="h-3.5 w-3.5" />
      {label ?? tr("Bu İşlemi Kopyala")}
    </a>
  );
}
