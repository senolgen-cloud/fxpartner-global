// A live signal's levels must be masked on every path that renders them.
//
// Entry, TP, SL and volume on an OPEN trade are the product. Once a trade has
// closed they are public history and are never masked — but while it is
// running, a reader who has not paid for that instrument's tier must not be
// able to read them, and "the UI hides it" is not masking: the numbers still
// sit in the HTML and in the JSON.
//
// This existed on /signals and /api/signals from the start. It did NOT exist
// on the home page, which renders the newest open trade in its hero card —
// so the busiest page on the site published the live entry, TP and SL of
// Pro/VIP instruments to every anonymous visitor, for as long as that card
// has been there. Nothing about it looked wrong; the card simply showed the
// numbers it was given.
//
// The rule: any file that reads a signal through lib/cachedReads must also
// apply maskLockedActiveSignal to what it renders.
//
// Run: node scripts/check-signal-masking.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";

// Reads that return live signals. A file importing one of these is rendering
// or serving an open trade and owes it a mask.
const SIGNAL_READS = /\b(cachedLatestSignal|cachedSignalBoard)\b/;
const MASK = /\bmaskLockedActiveSignal\b/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
}

const offenders = [];
let checked = 0;

for (const path of walk(ROOT)) {
  // The module that defines the reads is not a consumer of them.
  if (path === join("src", "lib", "cachedReads.ts")) continue;

  const src = readFileSync(path, "utf8");
  if (!SIGNAL_READS.test(src)) continue;

  checked++;
  if (!MASK.test(src)) offenders.push(path);
}

// If a refactor renames the reads, this sweep would find nothing and still
// pass. An empty sweep is a failure, not a success.
const MIN_COVERAGE = 3;

if (offenders.length > 0) {
  console.error("These files render live signals without masking them:\n");
  for (const path of offenders) console.error(`  ${path}`);
  console.error(
    "\nPass what you render through maskLockedActiveSignal(signal, viewerTier) from\n" +
      "lib/signalAccess — or maskLockedActiveSignal(signal, null) where the page\n" +
      "deliberately does not read the session."
  );
  process.exit(1);
}

if (checked < MIN_COVERAGE) {
  console.error(
    `Only ${checked} signal renderer(s) found, expected at least ${MIN_COVERAGE}.\n` +
      "The detection above has probably gone blind — check it before lowering this number."
  );
  process.exit(1);
}

console.log(`✓ ${checked} signal renderer(s) mask locked levels`);
