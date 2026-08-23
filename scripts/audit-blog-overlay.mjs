// Finds blog fields the translation overlay is missing.
//
//   node scripts/audit-blog-overlay.mjs
//   node scripts/audit-blog-overlay.mjs --out tmp/blog-gap.tr.json
//
// The original extractor matched `excerpt: "…"` on one line, and Prettier
// puts a long excerpt on the line *after* the key. Twenty posts went out
// with a translated title and a Turkish summary underneath it — visible on
// /blog, which is exactly where a reader decides whether to click.
//
// Keys mirror localizeBlogPost(): <slug>.title, <slug>.excerpt,
// <slug>.sN.heading, <slug>.sN.pN, <slug>.sN.lN.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;

const source = fs.readFileSync("src/data/blog.ts", "utf8");

// Post boundaries: each entry opens with its slug.
const marks = [...source.matchAll(/^\s*slug: "([^"]+)",?$/gm)];
const posts = marks.map((m, i) => ({
  slug: m[1],
  body: source.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : source.length),
}));

// A key whose value may sit on the same line or the next one.
function field(body, key) {
  const m = body.match(new RegExp(`\\b${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\") : null;
}

const wanted = new Map(); // key -> Turkish
for (const { slug, body } of posts) {
  for (const key of ["title", "excerpt"]) {
    const value = field(body, key);
    if (value) wanted.set(`${slug}.${key}`, value);
  }
}

const LOCALES = [
  ["uk", "src/data/i18n/uk/blog.json"],
  ["en", "src/data/i18n/en/blog.json"],
];

const gaps = {};
let worst = 0;
for (const [locale, file] of LOCALES) {
  const overlay = JSON.parse(fs.readFileSync(file, "utf8"));
  const missing = [...wanted].filter(([key]) => !overlay[key]?.trim());
  worst = Math.max(worst, missing.length);
  console.log(`${locale}: ${wanted.size - missing.length}/${wanted.size} title+excerpt entries present, ${missing.length} missing`);
  for (const [key, value] of missing) gaps[key] = value;
}

if (Object.keys(gaps).length) {
  console.log(`\n${Object.keys(gaps).length} missing across locales:`);
  for (const [key, value] of Object.entries(gaps).slice(0, 12)) {
    console.log(`  ${key}`);
    console.log(`    ${value.slice(0, 70)}`);
  }
}

if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // Keyed by the Turkish text, because scripts/translate.mjs preserves keys
  // and the merge step maps them back onto the overlay keys.
  fs.writeFileSync(OUT, JSON.stringify(gaps, null, 2) + "\n", "utf8");
  console.log(`\nwrote ${Object.keys(gaps).length} entries to ${OUT}`);
}

process.exit(worst ? 1 : 0);
