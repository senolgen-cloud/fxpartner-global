/**
 * Checks that every shared cache tag has someone clearing it.
 *
 *   node scripts/check-cache-tags.mjs
 *
 * lib/cachedReads.ts makes several database reads shared between readers,
 * which is the whole point — Neon bills compute time and sleeps when idle,
 * so the expensive thing is waking it, not the query. But a shared read is
 * only correct if the code that writes the data clears it. Get that wrong
 * and nothing breaks loudly: the site simply keeps serving the answer from
 * before the write, and the first person to notice is a reader wondering
 * where their comment went, or an editor wondering why the bulletin that
 * went out on Telegram is not on the site.
 *
 * The time-to-live is a floor, not the mechanism. It bounds how long a
 * missed invalidation can last; it is not a reason to skip one.
 *
 * Two rules:
 *
 * 1. Every tag in CACHE_TAGS is cleared somewhere outside cachedReads.ts.
 *    A tag nobody clears is a stale page waiting to happen.
 * 2. Every cached read declares at least one tag. A read with only a TTL
 *    cannot be cleared at all, so a write can never reach it.
 */
import fs from "node:fs";

const SOURCE = "src/lib/cachedReads.ts";
const problems = [];

if (!fs.existsSync(SOURCE)) {
  console.error(`cache tags:\n  ${SOURCE} is missing — the shared reads have no single home`);
  process.exit(1);
}

const source = fs.readFileSync(SOURCE, "utf8");

// The tag table: CACHE_TAGS = { name: "value", ... }
const table = source.match(/export const CACHE_TAGS = \{([\s\S]*?)\} as const;/);
if (!table) problems.push(`${SOURCE}: no CACHE_TAGS table — has the file changed shape?`);
const tags = table ? [...table[1].matchAll(/(\w+):\s*"([^"]+)"/g)].map((m) => m[1]) : [];
if (table && tags.length === 0) problems.push(`${SOURCE}: CACHE_TAGS is empty`);

// Rule 2: every cached read carries a tag. The options object is the last
// argument of each cachedRead(...) call.
const reads = [...source.matchAll(/export const (\w+) = cachedRead\(/g)];
if (reads.length === 0) problems.push(`${SOURCE}: no cached reads found — has the file changed shape?`);
for (const read of reads) {
  const body = source.slice(read.index, source.indexOf("\n);", read.index));
  if (!/tags:\s*\[[^\]]*CACHE_TAGS\./.test(body)) {
    problems.push(`${read[1]}: cached with no tag — nothing can ever clear it, so a write will not reach it`);
  }
}

// Rule 1: somebody clears each tag.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const writers = walk("src")
  .filter((f) => f !== SOURCE)
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

for (const tag of tags) {
  if (!new RegExp(`revalidateTag\\(\\s*CACHE_TAGS\\.${tag}\\b`).test(writers)) {
    problems.push(
      `CACHE_TAGS.${tag}: nothing calls revalidateTag for it — whatever writes this data must clear it, or the site serves the answer from before the write`
    );
  }
}

if (problems.length) {
  console.error("cache tags:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `cache tags: ${reads.length} shared reads, ${tags.length} tags, each declared and each cleared by a writer`
);
