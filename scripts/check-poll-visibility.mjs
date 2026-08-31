// A client-side poller that fetches an API route must skip hidden tabs.
//
// Every one of these is a serverless invocation billed against a fixed
// monthly Active CPU allowance, and the tab that costs the most is the one
// nobody is looking at: a background tab lives for hours, and at one request
// every fifteen seconds /api/signals alone spent 169% of the month's CPU.
// A hidden tab has no reader, so its ticks buy nothing at all.
//
// This is invisible in review — a setInterval that polls is the obvious way
// to write the feature, and the missing guard reads as nothing rather than
// as a mistake. The bill is the only place it shows up, a month later. So it
// is checked here instead.
//
// The rule: a client component with a setInterval whose body fetches an
// "/api/..." route must also mention document.hidden or visibilityState.
// Refetching on the visibilitychange edge is what makes the guard cheap to
// satisfy without making a returning reader wait out a poll period — see
// SignalsBoard and useLiveQuotes for the shape.
//
// Run: node scripts/check-poll-visibility.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";

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
  const src = readFileSync(path, "utf8");
  // Client modules only. A server file has no document to ask.
  if (!src.includes("setInterval")) continue;
  if (!/fetch\(\s*[`"']\/api\//.test(src)) continue;

  checked++;
  if (!/document\.hidden|visibilityState/.test(src)) offenders.push(path);
}

// Coverage floor: if a refactor moves the polling somewhere these patterns no
// longer match, the sweep would keep printing success over nothing.
const MIN_COVERAGE = 3;

if (offenders.length > 0) {
  console.error("These client pollers hit an /api route without checking tab visibility:\n");
  for (const path of offenders) console.error(`  ${path}`);
  console.error(
    "\nSkip the tick when document.visibilityState !== \"visible\", and refetch on the\n" +
      "visibilitychange edge so a returning reader does not wait out a poll period."
  );
  process.exit(1);
}

if (checked < MIN_COVERAGE) {
  console.error(
    `Only ${checked} API poller(s) found, expected at least ${MIN_COVERAGE}.\n` +
      "The detection above has probably gone blind — check it before lowering this number."
  );
  process.exit(1);
}

console.log(`✓ ${checked} client API poller(s) skip hidden tabs`);
