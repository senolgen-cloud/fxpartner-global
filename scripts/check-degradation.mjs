/**
 * Checks that a database outage cannot take the site down again.
 *
 *   node scripts/check-degradation.mjs
 *
 * On 2026-08-31 the database hit its compute quota. Nothing in the app
 * caught that, so for eleven hours a reader whose cache missed got a black
 * screen with an error id on it — on pages whose content was sitting in the
 * repo and needed no database at all. The fix was not one bug; it was a
 * missing rule, and a rule with nothing watching it is a rule that lasts
 * until the next page ships.
 *
 * Three things are checked, in the order they bite:
 *
 * 1. The chrome must not read the session directly. layout.tsx, the header
 *    and the proxy run on EVERY request, so auth() throwing in one of them
 *    is not a broken page, it is a broken site — that single query was the
 *    largest error group of the outage by more than double. They must go
 *    through optionalSession(), which fails closed to signed-out.
 *
 * 2. Both degradation helpers must rethrow Next's internal errors. This is
 *    the subtle one, and it was a real bug in the first version of this
 *    work: Next signals notFound(), redirect() and "this page is dynamic"
 *    by throwing, so a bare catch swallows control flow rather than an
 *    outage. The symptom was the build trying to prerender pages that read
 *    cookies — visible only if you read past a wall of stack traces in a
 *    build that still said it succeeded.
 *
 * 3. A page that reads the database must say what happens when it cannot.
 *    Either it calls loadOptional(), or it is named below with the reason
 *    it is allowed to fail. Both are fine answers; having no answer is not.
 *    The list is the point — it is short, and each line has to be worth
 *    writing.
 */
import fs from "node:fs";
import path from "node:path";

/** Runs on every request. A throw here is a broken site, not a broken page. */
const CHROME = [
  "src/app/[locale]/layout.tsx",
  "src/components/Header.tsx",
  "src/components/MobileBottomNav.tsx",
  "src/proxy.ts",
];

/**
 * Pages that are allowed to fail, and why. A page belongs here when it has
 * nothing left to render without its rows — the alternative is not a
 * degraded page, it is an empty one pretending to be the real thing.
 */
const MAY_FAIL = new Map([
  ["src/app/[locale]/egitim/[slug]/page.tsx", "the lesson IS the row"],
  ["src/app/[locale]/haber-bulteni/[slug]/page.tsx", "the bulletin IS the row"],
  ["src/app/[locale]/account/page.tsx", "every line of it is this member's own data"],
  ["src/app/[locale]/admin/cashback/page.tsx", "an admin table with nothing behind it"],
  ["src/app/[locale]/admin/ai-sorulari/page.tsx", "an admin table with nothing behind it"],
]);

const read = (p) => fs.readFileSync(p, "utf8");
const problems = [];

// 1. Chrome goes through optionalSession.
for (const file of CHROME) {
  if (!fs.existsSync(file)) {
    problems.push(`${file}: missing — has the chrome moved? this check is now blind`);
    continue;
  }
  const src = read(file);
  if (/\bawait auth\(\)/.test(src)) {
    problems.push(`${file}: calls auth() directly — use optionalSession() so an unreadable session is a signed-out reader, not a 500 on every page`);
  }
}

// 2. The helpers rethrow Next's own errors.
for (const file of ["src/lib/dbOptional.ts", "src/lib/optionalSession.ts"]) {
  if (!fs.existsSync(file)) {
    problems.push(`${file}: missing — the degradation helpers are the whole mechanism`);
    continue;
  }
  const src = read(file);
  if (!src.includes("unstable_rethrow(err)")) {
    problems.push(`${file}: catches without unstable_rethrow — it will swallow notFound(), redirect() and Next's dynamic-rendering marker along with the outage`);
  }
}

// 3. Every page that reads the database has an answer.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

let covered = 0;
const seen = new Set();
for (const file of [...walk("src/app"), ...walk("src/components")]) {
  const src = read(file);
  if (!/from "@\/db"/.test(src)) continue;
  seen.add(file);
  if (src.includes("loadOptional(")) {
    covered++;
    if (MAY_FAIL.has(file)) {
      problems.push(`${file}: listed as allowed to fail, but it degrades — drop the entry`);
    }
    continue;
  }
  if (!MAY_FAIL.has(file)) {
    problems.push(`${file}: reads the database with no answer for it being down — use loadOptional(), or add it to MAY_FAIL with the reason it has nothing to render without its rows`);
  }
}

for (const file of MAY_FAIL.keys()) {
  if (!seen.has(file)) problems.push(`MAY_FAIL lists ${file}, which no longer reads the database — drop the entry`);
}

if (problems.length) {
  console.error("degradation:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `degradation: chrome fails closed, both helpers rethrow Next's errors, ` +
    `${covered} database-reading page(s) degrade and ${MAY_FAIL.size} may fail on purpose`
);
