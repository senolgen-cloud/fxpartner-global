// Every public read of `trade_signal` must respect SIGNALS_EPOCH.
//
// The published track record restarts at src/lib/signalPeriods.ts's
// SIGNALS_EPOCH on a stated starting balance. That reset is a cutoff applied
// on READ, not a DELETE — the pre-reset rows are still in the table, because
// a position opened before the cutoff can still report its close and that
// close has to find its original row. Which means the reset holds only for
// as long as every read that feeds a public number remembers to filter.
//
// One forgotten filter is not a cosmetic bug: it silently republishes months
// of pre-reset trades into a balance, a win rate or a Telegram post that
// claims to describe the new record. Nothing about it looks wrong in review —
// the query is a perfectly ordinary one — so this runs instead of trusting
// that it will be noticed.
//
// The rule: any file under src/ that touches the `tradeSignals` table must
// either reference SIGNALS_EPOCH or be listed below with a reason.
//
// Run: node scripts/check-signals-epoch.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";

// Exempt, each for a stated reason. Adding to this list is how you say "this
// read is genuinely not part of the public record" — and it should be rare.
const EXEMPT = new Map([
  ["src/db/schema.ts", "defines the table; reads nothing"],
  [
    "src/app/api/trade-signal/route.ts",
    "writes a new signal — every row it creates is post-epoch by construction",
  ],
  [
    "src/app/api/trade-result/route.ts",
    "closes a row by ticket. MUST NOT filter: a position opened before the cutoff still reports its close, and that close has to find its original row so the result replies to the original post instead of orphaning it. The row it updates simply stays off the board.",
  ],
  [
    "src/app/api/trade-update/route.ts",
    "updates a row by ticket, same reasoning as trade-result",
  ],
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
}

// A type-only import is not a read — SignalsBoard imports the row type to
// describe its props and never issues a query.
const TABLE_USE = /(?<!type\s)\btradeSignals\b/;
const TYPE_ONLY_IMPORT = /import\s+type\s*\{[^}]*\btradeSignals\b[^}]*\}/;

const offenders = [];
let checked = 0;

for (const path of walk(ROOT)) {
  const src = readFileSync(path, "utf8");
  if (!TABLE_USE.test(src)) continue;
  if (EXEMPT.has(path)) continue;

  // Strip type-only imports before deciding whether the file queries.
  const withoutTypeImports = src.replace(new RegExp(TYPE_ONLY_IMPORT.source, "g"), "");
  if (!/\btradeSignals\b/.test(withoutTypeImports)) continue;

  checked++;
  if (!/\bSIGNALS_EPOCH\b/.test(src)) offenders.push(path);
}

// The guard is only as good as its coverage: if a refactor moves the reads
// somewhere this pattern no longer matches, it would keep printing success
// over nothing. So an empty sweep is itself a failure.
const MIN_COVERAGE = 5;

if (offenders.length > 0) {
  console.error("These files read trade_signal without applying SIGNALS_EPOCH:\n");
  for (const path of offenders) console.error(`  ${path}`);
  console.error(
    "\nFilter the query with gte(tradeSignals.createdAt, SIGNALS_EPOCH), or add the\n" +
      "file to EXEMPT in this script with the reason it is not part of the public record."
  );
  process.exit(1);
}

if (checked < MIN_COVERAGE) {
  console.error(
    `Only ${checked} trade_signal reader(s) found, expected at least ${MIN_COVERAGE}.\n` +
      "The detection above has probably gone blind — check it before lowering this number."
  );
  process.exit(1);
}

console.log(`✓ ${checked} trade_signal reader(s) apply SIGNALS_EPOCH (${EXEMPT.size} exempt)`);
