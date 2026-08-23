// Extracts the promotion copy off each broker record.
//
//   node scripts/extract-broker-promos.mjs --out tmp/promo.tr.json
//
// localizeBroker() covers tagline, summary, pros, cons and the deep dive,
// but promotions were added later and never joined the overlay, so every
// campaign card rendered Turkish in all three trees.
//
// Keys mirror localizeBroker(): <slug>.promo.{tag,title,intro}.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : "tmp/promo.tr.json";

const source = fs.readFileSync("src/data/brokers.ts", "utf8");
const marks = [...source.matchAll(/^    slug: "([^"]+)",$/gm)];

const bag = {};
marks.forEach((m, i) => {
  const body = source.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : source.length);
  const promo = body.match(/promotion:\s*\{([\s\S]*?)\n    \}/);
  if (!promo) return;
  for (const key of ["tag", "title", "intro"]) {
    // The value may sit on the same line or the next one.
    const found = promo[1].match(new RegExp(`\\b${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (found) bag[`${m[1]}.promo.${key}`] = found[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
});

const LOCALES = [
  ["uk", "src/data/i18n/uk/brokers.json"],
  ["en", "src/data/i18n/en/brokers.json"],
];

const gaps = {};
for (const [locale, file] of LOCALES) {
  const overlay = JSON.parse(fs.readFileSync(file, "utf8"));
  const missing = Object.entries(bag).filter(([key]) => !overlay[key]?.trim());
  console.log(`${locale}: ${Object.keys(bag).length - missing.length}/${Object.keys(bag).length} promo entries present`);
  for (const [key, value] of missing) gaps[key] = value;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(gaps, null, 2) + "\n", "utf8");
console.log(`${Object.keys(gaps).length} missing -> ${OUT}`);
process.exit(Object.keys(gaps).length ? 1 : 0);
