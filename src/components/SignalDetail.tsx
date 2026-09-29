"use client";
import { SignalCard, toSignal } from "@/components/SignalsBoard";
import { useLiveQuotes } from "@/components/useLiveQuotes";
import type { SignalJson } from "@/lib/cachedReads";
import type { AccessTier } from "@/lib/signalAccess";

/**
 * One signal on its own page — /signals/<ticket>, the page a Telegram post
 * links to. The same card as the board, opened, so the chart is already on
 * screen for someone who tapped through from their phone.
 *
 * Live quotes only while the trade is open: a closed trade's card has no
 * "right now" to show, and the poll is not free (see POLL_MS in
 * SignalsBoard).
 */
export default function SignalDetail({
  signal,
  viewerTier,
}: {
  signal: SignalJson;
  viewerTier: AccessTier | null;
}) {
  const quotes = useLiveQuotes(signal.status === "active");
  return (
    <SignalCard
      signal={toSignal(signal)}
      viewerTier={viewerTier}
      quote={quotes[signal.pair]}
      defaultOpen
      linkToPage={false}
    />
  );
}
