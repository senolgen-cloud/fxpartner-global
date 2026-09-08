// Fails if a dynamic route can answer a bad address with HTTP 200.
//
//   node scripts/check-soft-404.mjs
//
// Every [slug] page here calls notFound(), and on this site that call cannot
// set the status code. The whole [locale] tree renders dynamically because
// the layout reads the session; a dynamic response is streamed; and the
// headers are already sent by the time the page looks its slug up. So the
// reader gets the not-found page under a 200 — a soft 404. Next's own docs
// describe this and prescribe checking before the body streams, which is
// what src/proxy.ts does through src/lib/knownSlugs.ts.
//
// Three cheaper fixes were measured against a production build and none of
// them changed the status: deleting [locale]/loading.tsx, dynamicParams =
// false on the slug segments, and calling notFound() from generateMetadata.
// If a future Next.js makes one of those work, this guard can go.
//
// What this catches: somebody adds src/app/[locale]/kurslar/[slug] and the
// section silently starts serving 200 for every address anyone invents. The
// fix is one line in KNOWN_SLUGS — or, when the slugs live in the database
// rather than the repo, one line here saying so.

import fs from "node:fs";
import path from "node:path";

const APP = "src/app/[locale]";
const KNOWN_SLUGS_FILE = "src/lib/knownSlugs.ts";

// Sections whose slugs are not in the repository. A proxy cannot check
// these without a database query on every request, and guessing would 404
// content published since the last deploy — worse than the soft 404 it
// would be fixing. Next marks the streamed not-found page noindex, so these
// are still kept out of search results; they just answer 200 while doing it.
const DB_BACKED = new Set([
  "egitim", // lessons are rows in the education tables
  "haber-bulteni", // bulletins are generated and stored, not committed
  "cashback", // programmes are configured per broker at runtime
]);

function sections(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    // A dynamic segment directly under a section names that section.
    const hasDynamicChild = fs
      .readdirSync(child, { withFileTypes: true })
      .some((e) => e.isDirectory() && e.name.startsWith("[") && e.name.endsWith("]"));
    if (hasDynamicChild) found.push(entry.name);
    found.push(...sections(child).map((s) => s));
  }
  return found;
}

const guarded = new Set(
  [...fs.readFileSync(KNOWN_SLUGS_FILE, "utf8").matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s*new Set\(/gm)].map(
    (m) => m[1]
  )
);

const unguarded = sections(APP).filter((s) => !guarded.has(s) && !DB_BACKED.has(s));

// The other half of the same problem, and the one that actually shipped a
// broken page during development: /prop-firmalar/indirim-kodlari is a real
// route sitting beside the [slug] route. Read as a slug it matches no prop
// firm, so the proxy 404d a live page until LITERAL_ROUTES was added. Every
// such sibling under a guarded section must be declared there, or the next
// one added will 404 the same silent way.
const declaredLiteral = new Map();
{
  const src = fs.readFileSync(KNOWN_SLUGS_FILE, "utf8");
  const block = src.split("LITERAL_ROUTES")[1] ?? "";
  for (const m of block.matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s*new Set\(\[([^\]]*)\]/gm)) {
    const names = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    declaredLiteral.set(m[1], new Set(names));
  }
}

const undeclared = [];
for (const section of guarded) {
  const dir = path.join(APP, section);
  if (!fs.existsSync(dir)) continue;
  const declared = declaredLiteral.get(section) ?? new Set();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("[")) continue;
    if (!declared.has(entry.name)) undeclared.push(`${section}/${entry.name}`);
  }
}

if (undeclared.length) {
  console.error(`${undeclared.length} real route(s) beside a [slug] route would be 404d as unknown slugs:
`);
  for (const r of undeclared) console.error(`  ${APP}/${r}`);
  console.error(`
  fix: add each to LITERAL_ROUTES in ${KNOWN_SLUGS_FILE} so the proxy
       leaves it to the router.
`);
  process.exit(1);
}

if (unguarded.length) {
  console.error(
    `${unguarded.length} section(s) with a dynamic segment answer unknown addresses with 200:\n`
  );
  for (const s of unguarded) {
    console.error(`  ${APP}/${s}/[...]`);
  }
  console.error(
    `\n  fix: add the section to KNOWN_SLUGS in ${KNOWN_SLUGS_FILE} so the proxy can` +
      `\n       reject unknown slugs before the response streams, or — if its slugs` +
      `\n       come from the database rather than the repo — add it to DB_BACKED in` +
      `\n       this file with a line saying where they come from.\n`
  );
  process.exit(1);
}

console.log(
  `no soft 404s: ${guarded.size} section(s) checked in the proxy, ` +
    `${DB_BACKED.size} database-backed section(s) exempt`
);
