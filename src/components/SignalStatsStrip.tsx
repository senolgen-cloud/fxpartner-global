import { tr, trf } from "@/lib/chrome";
import type { SignalStats, StatsScope } from "@/lib/trackRecord";

// The "son 30 gün" strip from our posted signal graphics:
//   PRO SİNYALLERİ · SON 30 GÜN · 102 İŞLEM · 72 KAZANÇ · 30 KAYIP
//
// Server-only: it uses the server translation helpers, and the numbers come
// from lib/trackRecord — the same rolling, tier-scoped count the Telegram
// posts quote, so the site and the group can never disagree. Breakevens are
// in neither column (see getRecentSignalStats), which is why wins + losses
// is the trade count.
//
// No stats, no strip: getRecentSignalStats returns null below the minimum
// sample, and a thin window is not something to put in large type.

const SCOPE_LABEL: Record<StatsScope, string> = {
  all: "Tüm sinyaller",
  free: "Forex sinyalleri",
  pro: "Pro sinyalleri",
  vip: "VIP sinyalleri",
};

function Sep() {
  return <span className="text-text-on-ink-muted/50">·</span>;
}

export default function SignalStatsStrip({
  stats,
}: {
  stats: SignalStats | null;
}) {
  if (!stats) return null;
  const losses = stats.trades - stats.wins;

  return (
    <div className="rounded-2xl border border-hairline bg-ink-soft/60 px-4 py-3">
      {/* Spelled out for screen readers, which would otherwise read the
          separators and the capitals as a list of fragments. */}
      <p className="sr-only">
        {trf(
          "{scope}, son {days} gün: {trades} işlem, {wins} kazanç, {losses} kayıp",
          {
            scope: tr(SCOPE_LABEL[stats.scope]),
            days: stats.windowDays,
            trades: stats.trades,
            wins: stats.wins,
            losses,
          },
        )}
      </p>
      <div
        aria-hidden="true"
        className="flex flex-col items-center justify-center gap-x-3 gap-y-1.5 sm:flex-row sm:flex-wrap text-center font-display text-[13px] font-semibold uppercase tracking-[0.06em] sm:text-[15px]"
      >
        {/* Two halves that wrap as units: on a phone the strip breaks once,
            between "which record" and "what it says", instead of wherever
            the line runs out — which left a separator hanging at the end. */}
        <span className="inline-flex items-center gap-x-3">
          <span className="text-text-on-ink">{tr(SCOPE_LABEL[stats.scope])}</span>
          <Sep />
          <span className="text-text-on-ink-muted">
            {trf("Son {days} gün", { days: stats.windowDays })}
          </span>
        </span>
        <span className="hidden sm:inline">
          <Sep />
        </span>
        <span className="inline-flex items-center gap-x-3">
          <span className="text-text-on-ink">
            <span className="font-mono tabular-stat">{stats.trades}</span> {tr("işlem")}
          </span>
          <Sep />
          <span className="text-[#22c55e]">
            <span className="font-mono tabular-stat">{stats.wins}</span> {tr("kazanç")}
          </span>
          <Sep />
          <span className="text-[#e5484d]">
            <span className="font-mono tabular-stat">{losses}</span> {tr("kayıp")}
          </span>
        </span>
      </div>
    </div>
  );
}
