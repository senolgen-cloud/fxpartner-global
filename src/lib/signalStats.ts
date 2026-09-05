import { trData } from "@/lib/localizeContent";
import type { SignalStats, StatsScope } from "@/lib/trackRecord";

// How the record reads, in words. The numbers themselves come from
// lib/trackRecord — see the note at the top of that file for why the two
// are separate.
//
// Re-exported here so the Telegram routes, which want both halves, still
// have one import.
export type { SignalStats, StatsScope } from "@/lib/trackRecord";
export { getRecentSignalStats } from "@/lib/trackRecord";

const SCOPE_LABEL_TR: Record<StatsScope, string> = {
  all: "Tüm sinyaller",
  free: "Forex sinyalleri",
  pro: "Pro sinyalleri",
  vip: "VIP sinyalleri",
};

const SCOPE_LABEL_EN: Record<StatsScope, string> = {
  all: "All signals",
  free: "Forex signals",
  pro: "Pro signals",
  vip: "VIP signals",
};

// The scope label as the trade cards set it, in capitals.
//
// Written out rather than produced with .toUpperCase(): JavaScript
// uppercases Turkish "i" to "I" instead of "İ", so "Pro sinyalleri" would
// come off the transform as "PRO SINYALLERI" — misspelled, in capitals, on
// the one artefact that gets forwarded outside the site.
//
// Turkish only, like every other word drawn on those cards: one image goes
// to every channel and the template's own box labels are Turkish. The
// caption beside it is what changes per locale.
const SCOPE_LABEL_CARD: Record<StatsScope, string> = {
  all: "TÜM SİNYALLER",
  free: "FOREX SİNYALLERİ",
  pro: "PRO SİNYALLERİ",
  vip: "VIP SİNYALLERİ",
};

export function scopeLabelForCard(scope: StatsScope): string {
  return SCOPE_LABEL_CARD[scope];
}


export function statsLineTr(stats: SignalStats | null): string {
  if (!stats) return "";
  return `📊 ${trData(SCOPE_LABEL_TR)[stats.scope]} · son ${stats.windowDays} gün: ${stats.trades} işlem · %${stats.winRate} isabet`;
}

export function statsLineEn(stats: SignalStats | null): string {
  if (!stats) return "";
  return `📊 ${SCOPE_LABEL_EN[stats.scope]} · last ${stats.windowDays} days: ${stats.trades} trades · ${stats.winRate}% win rate`;
}