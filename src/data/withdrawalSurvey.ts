/**
 * How long a withdrawal actually takes, as reported by the people who make
 * them.
 *
 * THIS IS A SURVEY, NOT A MEASUREMENT, and the file is separate from
 * src/data/brokers.ts for that reason. Spread, leverage and licence numbers
 * in the broker records are facts anyone can check against the broker's own
 * documentation. This is the aggregate of what investors told FXPARTNER,
 * and it can be wrong in ways a licence number cannot: a reader who
 * withdrew on a Sunday, a method we have no reports for, a broker that
 * changes its processing while this file sits still. Keeping it out of the
 * broker record keeps that difference visible to the next person who edits
 * either one.
 *
 * What the site may claim from this, and what it may not: it may say "this
 * is what investors report", ranked, dated and attributed. It may not say
 * "the fastest broker" as a measured fact — we have not stopwatched anyone,
 * and a site that publishes its losing trades cannot spend its credibility
 * on an unverifiable superlative.
 *
 * Only brokers with enough responses to be worth reporting are listed. An
 * unlisted broker is one we do not have reports for; it is NOT a slow one,
 * and the table has to say so, because a reader will otherwise read the
 * absence as a verdict.
 */
export interface WithdrawalReport {
  /** Broker slug — must match a record in src/data/brokers.ts. */
  slug: string;
  /** What investors report, in their terms. Translated like other copy. */
  label: string;
}

/** When these reports were last collected, for the line under the table. */
export const WITHDRAWAL_SURVEY_DATE = "2026-09-09";

export const withdrawalReports: WithdrawalReport[] = [
  { slug: "lite-finance", label: "Anlık — 1 saniyeden az" },
  { slug: "exness", label: "1-2 dakika" },
  { slug: "xm", label: "3-5 dakika" },
  { slug: "fxpro", label: "15-30 dakika" },
  { slug: "markets-com", label: "15-45 dakika" },
  { slug: "avatrade", label: "1 saat ve üzeri" },
];

/**
 * The reports in the order the table shows them.
 *
 * The array order IS the ranking. An earlier version carried a
 * `sortMinutes` field and sorted on it, which forced a fake precision:
 * FxPro and markets.com both start at 15 minutes, so one of them had to be
 * given a number it was never reported with in order to hold its place.
 * The order the reports arrived in is the finding; nothing is gained by
 * deriving it a second time from invented numbers.
 */
export function rankedWithdrawalReports(): WithdrawalReport[] {
  return withdrawalReports;
}

/** Where a broker sits in that ranking, or null when it has no reports. */
export function withdrawalRank(slug: string): { rank: number; total: number } | null {
  const ranked = rankedWithdrawalReports();
  const i = ranked.findIndex((r) => r.slug === slug);
  return i === -1 ? null : { rank: i + 1, total: ranked.length };
}

export function withdrawalReportFor(slug: string): WithdrawalReport | undefined {
  return withdrawalReports.find((r) => r.slug === slug);
}
