/**
 * Checks that every public page is announced, and every private one is not.
 *
 *   node scripts/check-sitemap-coverage.mjs
 *
 * A page can be perfectly crawlable and still effectively invisible. On
 * 2026-08-31 five of them were: /signals, /ai-asistan, /ekonomik-takvim,
 * /topluluk and /about were all live, all allowed by robots.ts, and none of
 * them appeared in the sitemap. /signals is the product the header, the home
 * page and the Telegram channel all point at.
 *
 * Nothing catches that on its own. A route is added under src/app/[locale]/
 * and it works; the sitemap is a separate file that nobody is reminded to
 * open, and the symptom — pages that rank later and thinner than they
 * should — takes months to show up and is never obviously traceable to a
 * missing line in a list.
 *
 * Two rules, and the second is the one that keeps the first honest:
 *
 * 1. Every route with a page of its own is either in the sitemap or listed
 *    below as deliberately unlisted, with the reason.
 * 2. Every deliberately unlisted route is also disallowed in robots.ts, and
 *    every robots-disallowed path is unlisted here. The two files are the
 *    same decision written twice; when they disagree, one of them is
 *    telling a crawler something the other contradicts.
 */
import fs from "node:fs";

const ROUTES_DIR = "src/app/[locale]";
const SITEMAP = "src/app/sitemap.ts";
const ROBOTS = "src/app/robots.ts";

/**
 * Routes deliberately kept out of the sitemap, and why. Each of these must
 * also be disallowed in robots.ts — rule 2 checks that.
 */
const UNLISTED = new Map([
  ["account", "authenticated member surface; nothing here is for a stranger"],
  ["admin", "operator-only"],
]);

const problems = [];

for (const file of [SITEMAP, ROBOTS]) {
  if (!fs.existsSync(file)) problems.push(`${file} is missing — this check is now blind`);
}
if (problems.length) {
  console.error("sitemap coverage:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const sitemap = fs.readFileSync(SITEMAP, "utf8");
const robots = fs.readFileSync(ROBOTS, "utf8");

// Routes that own a page. A directory holding only dynamic children (brokers,
// raporlar) is covered by whatever the sitemap says about those children.
const routes = fs
  .readdirSync(ROUTES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("["))
  .filter((e) => fs.existsSync(`${ROUTES_DIR}/${e.name}/page.tsx`))
  .map((e) => e.name);

if (routes.length === 0) problems.push(`${ROUTES_DIR}: no routes found — has the tree moved?`);

let listed = 0;
for (const route of routes) {
  // `${SITE_URL}/route` — as its own entry, or as the parent of one.
  const named = new RegExp(`SITE_URL\\}/${route}(?![a-z0-9-])`).test(sitemap);
  const unlisted = UNLISTED.has(route);

  if (named && unlisted) {
    problems.push(`/${route}: listed in the sitemap and also marked deliberately unlisted — pick one`);
  } else if (!named && !unlisted) {
    problems.push(
      `/${route}: has a page but is not in the sitemap — add it, or add it to UNLISTED here with the reason it should not be found`
    );
  } else if (named) {
    listed++;
  }
}

// Rule 2: the two files have to agree about what is private.
const disallowed = [...robots.matchAll(/PRIVATE_PATHS = \[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/"\/([a-z0-9-]+)"/g)].map((x) => x[1]));

if (disallowed.length === 0) {
  problems.push(`${ROBOTS}: could not read PRIVATE_PATHS — has the file changed shape?`);
}
for (const route of UNLISTED.keys()) {
  if (!disallowed.includes(route)) {
    problems.push(
      `/${route}: kept out of the sitemap but not disallowed in robots.ts — a crawler is still invited in, it just has to find the door`
    );
  }
}
for (const route of disallowed) {
  if (!UNLISTED.has(route)) {
    problems.push(
      `/${route}: disallowed in robots.ts but not marked unlisted here — the two files disagree about whether it is private`
    );
  }
}

if (problems.length) {
  console.error("sitemap coverage:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `sitemap coverage: ${listed} public route(s) announced, ${UNLISTED.size} deliberately unlisted and disallowed to match`
);
