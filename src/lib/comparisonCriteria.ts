// Single source of truth for "how many criteria" the comparison table
// covers (Broker itself isn't a criterion). Lives outside ComparisonTable.tsx
// (a "use client" component) because a plain named export re-exported from a
// client-boundary module doesn't reliably cross back into a Server Component
// import — keeping it in a plain module avoids that pitfall entirely.
export const COMPARISON_CRITERIA = [
  "Index",
  "Rating",
  "Min. Deposit",
  "Max. Leverage",
  "Regulation",
  "Platform",
  // The two a reader cannot get off the broker's own site. Both come with a
  // caveat the table has to carry (see ComparisonTable): withdrawal is what
  // investors report, not a measurement, and cashback only ever shows a
  // confirmed rate — never an estimate.
  "Withdrawal",
  "Cashback",
] as const;
