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

/**
 * How many investors the reports come from.
 *
 * A ranking with a sample size behind it is a different claim from one
 * without: it is the number that lets a reader decide how much weight the
 * order deserves, and it is the number competing sites do not publish.
 * Written as given rather than rounded to a precise-looking figure we do
 * not have.
 */
export const WITHDRAWAL_SURVEY_RESPONSES = "500+";

export const withdrawalReports: WithdrawalReport[] = [
  { slug: "lite-finance", label: "Anlık — 1 saniyeden az" },
  { slug: "exness", label: "1-2 dakika" },
  { slug: "xm", label: "3-5 dakika" },
  { slug: "fxpro", label: "15-30 dakika" },
  { slug: "avatrade", label: "1 saat ve üzeri" },
];

/**
 * The reports in the order the table shows them.
 *
 * The array order IS the ranking, because the ranking is the finding. An
 * earlier version carried a `sortMinutes` field and re-derived the order
 * from it, which forced a fake precision: two brokers reported the same
 * lower bound, so one had to be given a number nobody reported in order to
 * hold its place. Nothing was gained by deriving twice what was known once.
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
