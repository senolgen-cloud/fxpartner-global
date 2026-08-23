// Finds tr() / trf() calls whose key is missing from a locale's catalogue.
//
//   node scripts/audit-dictionary-gaps.mjs              # report
//   node scripts/audit-dictionary-gaps.mjs --out <file> # write the gap bag
//
// Wrapping a string in tr() makes it translatable; it does not translate it.
// The two steps are separate on purpose — the wrap is a code change, the
// translation is an editorial one — which means a wrap can quietly ship with
// no entry behind it and render Turkish in every tree. This is the check
// that catches that, and it belongs in CI.
//
// Exit code is non-zero when a gap exists, so it can gate a deploy.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;

const LOCALES = [
  ["en", "src/data/i18n/en/chrome.json"],
  ["uk", "src/data/i18n/uk/chrome.json"],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

// tr("…") and trf("…", …). Double-quoted only: a key with an escape or an
// interpolation is not a literal key and would not resolve anyway.
const CALL = /\btrf?\(\s*"((?:[^"\\]|\\.)*)"/g;

const keys = new Map(); // key -> Set of files

for (const file of walk("src")) {
  const source = fs.readFileSync(file, "utf8");
  for (const m of source.matchAll(CALL)) {
    const key = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    if (!key.trim()) continue;
    if (!keys.has(key)) keys.set(key, new Set());
    keys.get(key).add(file);
  }
}

const gaps = {};
let worst = 0;

for (const [locale, dictPath] of LOCALES) {
  const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));
  const missing = [...keys.keys()].filter((k) => !dict[k]?.trim());
  gaps[locale] = missing;
  worst = Math.max(worst, missing.length);
  console.log(`${locale}: ${keys.size - missing.length}/${keys.size} keys translated, ${missing.length} missing`);
}

const union = [...new Set(Object.values(gaps).flat())];

if (union.length) {
  console.log(`\n${union.length} keys missing in at least one locale:\n`);
  for (const key of union.slice(0, 25)) {
    const where = [...keys.get(key)][0];
    console.log(`  ${key.slice(0, 90)}${key.length > 90 ? "…" : ""}`);
    console.log(`    ${where}`);
  }
  if (union.length > 25) console.log(`  … and ${union.length - 25} more`);
}

if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(union.map((k) => [k, k])), null, 2) + "\n", "utf8");
  console.log(`\nwrote ${union.length} strings to ${OUT}`);
}

process.exit(worst ? 1 : 0);
