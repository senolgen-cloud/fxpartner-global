// Fails if an edge route can reach the translation catalogue.
//
//   node scripts/check-edge-bundles.mjs
//
// Edge functions are capped at 1MB on this plan, and the two chrome.json
// catalogues are 640KB between them. A single tr() call in an edge route
// pulls both in, and the result is a deployment that builds cleanly for 55
// seconds and then fails at "Deploying outputs..." — the one failure mode
// `next build` will not show you locally.
//
// The fix is always the same: that route runs on Node instead. An OG image
// is generated once and cached at the CDN, so it gains nothing from edge.

import fs from "node:fs";
import path from "node:path";

const HEAVY = "src/data/i18n/";
const SRC = "src";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk(SRC);
const byModule = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

// "@/x" -> "src/x" with the extension guessed the way the bundler would.
function resolve(spec, from) {
  let base;
  if (spec.startsWith("@/")) base = `${SRC}/${spec.slice(2)}`;
  else if (spec.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  else return null;

  for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (byModule.has(cand)) return cand;
    if (cand.startsWith(HEAVY) && fs.existsSync(cand)) return cand;
  }
  return fs.existsSync(base) ? base : null;
}

function importsOf(file) {
  const source = byModule.get(file) ?? "";
  const specs = [];
  for (const m of source.matchAll(/\bfrom\s+"([^"]+)"/g)) specs.push(m[1]);
  for (const m of source.matchAll(/\bimport\s+"([^"]+)"/g)) specs.push(m[1]);
  return specs.map((s) => resolve(s, file)).filter(Boolean);
}

// Shortest path from an edge route to the catalogue, for a useful message.
function pathToHeavy(entry) {
  const queue = [[entry]];
  const seen = new Set([entry]);
  while (queue.length) {
    const chain = queue.shift();
    const current = chain[chain.length - 1];
    if (current.startsWith(HEAVY)) return chain;
    for (const next of importsOf(current)) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([...chain, next]);
    }
  }
  return null;
}

const offenders = [];
for (const [file, source] of byModule) {
  if (!/export const runtime\s*=\s*"edge"/.test(source)) continue;
  const chain = pathToHeavy(file);
  if (chain) offenders.push(chain);
}

if (!offenders.length) {
  const edgeCount = [...byModule.values()].filter((s) => /export const runtime\s*=\s*"edge"/.test(s)).length;
  console.log(`no edge route reaches the translation catalogue (${edgeCount} edge routes checked)`);
  process.exit(0);
}

console.error(`${offenders.length} edge route(s) reach the translation catalogue:\n`);
for (const chain of offenders) {
  console.error(`  ${chain[0]}`);
  for (const step of chain.slice(1)) console.error(`    -> ${step}`);
  console.error(`  fix: export const runtime = "nodejs";\n`);
}
process.exit(1);
