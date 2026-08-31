/**
 * Checks that the Akademi keeps publishing even when a cron run is dropped.
 *
 *   node scripts/check-education-cadence.mjs
 *
 * On 2026-08-31 the site published no lesson. Nothing was broken: the job
 * simply never ran. GitHub's scheduled workflows are best-effort, and over
 * the six days to that date every run of this one landed hours off its
 * 07:40 slot — 08:22, 18:24, 19:34, 13:21, 13:17 — before the last was
 * dropped entirely. A once-a-day schedule has no second chance, so one
 * dropped run is one missing day, and nothing anywhere says so: the site
 * looks fine, it is just quietly a lesson short.
 *
 * The fix is two halves that only work together, which is why they are
 * checked together:
 *
 * 1. Several attempts a day, so a dropped run costs hours instead of a day.
 * 2. A per-day cap in the route, so those extra attempts do not publish
 *    extra lessons.
 *
 * Either half alone is a bug. Attempts without the cap publish eight
 * lessons a day — the burst the two-a-day cadence exists to avoid, and the
 * pattern Google's scaled-content guidance is written about. The cap
 * without the attempts is where this started.
 *
 * The arithmetic is exercised rather than read: the helper is compiled and
 * run against the cases that matter, including the one that would let a
 * manual ?count= overrun the day's quota.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE = "src/lib/educationCadence.ts";
const ROUTE = "src/app/api/cron/education-posts/route.ts";
const WORKFLOW = ".github/workflows/education-posts.yml";

const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

for (const file of [SOURCE, ROUTE, WORKFLOW]) {
  if (!fs.existsSync(file)) problems.push(`${file} is missing — this check is now blind`);
}
if (problems.length) {
  console.error("education cadence:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

// 1. The schedule offers more than one chance a day.
const workflow = fs.readFileSync(WORKFLOW, "utf8");
const crons = [...workflow.matchAll(/cron:\s*["']([^"']+)["']/g)].map((m) => m[1]);
check(crons.length >= 2,
  `${WORKFLOW}: ${crons.length} scheduled run(s) — a single daily slot has no second chance when GitHub drops it`);
// Distinct hours, not the same hour twice: two entries at the same time are
// one chance wearing two hats.
const hours = new Set(crons.map((c) => c.split(" ")[1]));
check(hours.size === crons.length,
  `${WORKFLOW}: two scheduled runs share an hour — the retries have to be spread out to be retries`);

// 2. The route caps the day, and does it through the shared helper rather
//    than a second copy of the number.
const route = fs.readFileSync(ROUTE, "utf8");
check(route.includes("lessonsAllowedNow("),
  `${ROUTE}: does not call lessonsAllowedNow — without the per-day cap, ${crons.length} attempts publish ${crons.length} times the cadence`);
check(!/const\s+DEFAULT_COUNT\s*=\s*\d/.test(route),
  `${ROUTE}: hard-codes a count — the cadence belongs in ${SOURCE} so there is one number to change`);
check(/import\s*\{[^}]*\}\s*from\s*"@\/lib\/educationCadence"/.test(route),
  `${ROUTE}: does not import the cadence module, so the number it uses is not the one checked here`);
check(/slice\(0,\s*allowed\)/.test(route),
  `${ROUTE}: the queue is not sliced by the allowance, so the cap is computed and then ignored`);

// 3. The arithmetic, run rather than assumed.
const ts = (await import("typescript")).default;
const js = ts.transpileModule(fs.readFileSync(SOURCE, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tmp = path.join(process.cwd(), "node_modules", ".cache", "check-education-cadence.mjs");
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, js);

const { lessonsAllowedNow, DAILY_LESSON_TARGET, startOfUtcDay } = await import(pathToFileURL(tmp).href);

const cases = [
  // [published today, requested, expected, why]
  [0, 2, 2, "a fresh day publishes the full cadence"],
  [1, 2, 1, "a half-done day finishes it and no more"],
  [2, 2, 0, "a done day publishes nothing, however often it is asked"],
  [3, 2, 0, "an over-published day does not go negative"],
  [0, 6, DAILY_LESSON_TARGET, "?count= cannot exceed the day's cadence"],
  [1, 6, 1, "?count= cannot exceed what is left of it"],
  [0, 1, 1, "?count= can ask for less"],
  [0, 0, 0, "asking for none writes none"],
];
for (const [today, requested, expected, why] of cases) {
  const got = lessonsAllowedNow(today, requested);
  check(got === expected,
    `lessonsAllowedNow(${today}, ${requested}) returned ${got}, expected ${expected} — ${why}`);
}

// A day boundary that is not UTC would hand one timezone two lessons and
// another none on the same calendar day.
const noon = new Date("2026-08-31T12:34:56.000Z");
check(startOfUtcDay(noon).toISOString() === "2026-08-31T00:00:00.000Z",
  `startOfUtcDay is not returning UTC midnight (got ${startOfUtcDay(noon).toISOString()})`);

if (problems.length) {
  console.error("education cadence:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `education cadence: ${crons.length} attempts a day, capped at ${DAILY_LESSON_TARGET} lessons, ` +
    `${cases.length} arithmetic cases pass`
);
