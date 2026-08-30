/**
 * Checks that every path a department claims to own actually exists.
 *
 *   node scripts/check-department-owns.mjs
 *
 * src/lib/departments.ts calls itself the single source of truth for who
 * owns what, and docs/ORGANIZATION.md is written on top of it. A registry
 * that points at files which are no longer there is worse than no registry:
 * it reads as authoritative and is quietly wrong, and nothing in the build
 * touches these strings, so nothing complains.
 *
 * That is not hypothetical. Adding a department in 2026-08 turned up seven
 * entries still pointing at `src/app/blog`, `src/app/campaigns` and friends
 * — routes that moved under `src/app/[locale]/` when the site went
 * multi-locale, and had been stale in the registry ever since.
 *
 * The file also says every responsibility belongs to *exactly* one
 * department, so a path claimed twice is checked as well. Two owners is the
 * same failure as none: when something breaks, nobody's name is on it, or
 * two people each assume it was the other's.
 *
 * Comments are stripped before parsing, and each department's `owns` array
 * is read by matching brackets from its own `id`, rather than with one
 * regex across the file — a greedy match here silently attributes one
 * department's paths to another, which is how the first version of this
 * check reported nonsense.
 */
import fs from "node:fs";

const SOURCE = "src/lib/departments.ts";
const source = fs.readFileSync(SOURCE, "utf8");

// No URLs live in this file, so a bare `//` is always a comment.
const code = source
  .split("\n")
  .map((line) => line.replace(/(^|\s)\/\/.*$/, ""))
  .join("\n");

/** The `[...]` that starts at `from`, with brackets matched. */
function bracketSlice(text, from) {
  const start = text.indexOf("[", from);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "[") depth++;
    else if (text[i] === "]" && --depth === 0) return text.slice(start + 1, i);
  }
  return null;
}

const ids = [...code.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)];
const problems = [];
const owners = new Map();
let checked = 0;

if (ids.length === 0) problems.push(`${SOURCE}: no departments found — has the file changed shape?`);

for (const match of ids) {
  const id = match[1];
  const ownsAt = code.indexOf("owns:", match.index);
  if (ownsAt === -1) {
    problems.push(`${id}: no owns array`);
    continue;
  }
  const body = bracketSlice(code, ownsAt);
  if (body === null) {
    problems.push(`${id}: owns array is unterminated`);
    continue;
  }
  const paths = [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (paths.length === 0) problems.push(`${id}: owns nothing`);
  for (const path of paths) {
    checked++;
    if (!fs.existsSync(path)) problems.push(`${id}: owns "${path}", which does not exist`);
    const already = owners.get(path);
    if (already) problems.push(`"${path}" is owned by both ${already} and ${id}`);
    else owners.set(path, id);
  }
}

if (problems.length) {
  console.error("department ownership:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `department ownership: ${ids.length} departments, ${checked} owned paths, all present`
);
