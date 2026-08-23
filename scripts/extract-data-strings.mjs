// Pulls the prose out of the Turkish-authored data modules, for translation.
//
//   node scripts/extract-data-strings.mjs --out tmp/data.tr.json
//
// It imports the modules and walks their exported values rather than parsing
// the source, so it sees exactly the strings localizeData() will look up —
// same traversal, same structural-key skips. A regex over the file would
// find strings the walk never reaches and miss ones built by the module.

import fs from "node:fs";
import path from "node:path";
import { looksLikeCopy } from "./lib/turkish.mjs";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const OUT = args[args.indexOf("--out") + 1] ?? "tmp/data.tr.json";

// Kept in step with STRUCTURAL_KEYS in src/lib/localizeContent.ts.
const STRUCTURAL_KEYS = new Set([
  "slug", "href", "id", "icon", "key", "type", "src", "url", "code",
  "logo", "image", "color", "variant", "group", "path", "locale", "pair",
  "affiliateUrl", "trackingUrl", "email", "phone",
  // Values used as lookup keys or enum members, not shown as prose. These
  // became dangerous the moment the copy test stopped requiring a Turkish
  // diacritic: broker.categories holds "Beginners" and "Low Spread", which
  // read as English copy but are the keys categoryInfo is indexed by —
  // translating them made every broker card throw.
  "categories", "category", "segment", "segments", "models", "platforms",
  "regulators", "status", "outcome", "tier", "verdict", "unit",
  "drawdownUnit", "direction", "scope", "role",
  "symbol", "ticker", "currency", "date", "updatedAt", "publishedAt",
]);


const MODULES = [
  "src/data/propFirms.ts",
  "src/data/marketAnalysis.ts",
  "src/data/technicalAnalysis.ts",
  "src/data/partnerProgram.ts",
  "src/data/packageTiers.ts",
  "src/data/brokerLookup.ts",
  "src/data/cashback.ts",
  // The broker records too: localizeBroker names the fields it covers, and
  // localizeBrokerDeep now walks the rest through this catalogue.
  "src/data/brokers.ts",
];

const found = new Set();

function walk(value) {
  if (typeof value === "string") {
    if (looksLikeCopy(value)) found.add(value);
    return;
  }
  if (Array.isArray(value)) return value.forEach(walk);
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    for (const [key, item] of Object.entries(value)) {
      if (!STRUCTURAL_KEYS.has(key)) walk(item);
    }
  }
}

// Node strips the types itself (24.x). The only thing it will not resolve
// is the "@/" alias, so type-only imports are dropped and the module is
// loaded from a temporary plain copy — these files are data, not logic.
function loadable(source) {
  return source
    .replace(/^import type .*$/gm, "")
    .replace(/^import \{[^}]*\} from "@\/[^"]*";$/gm, "");
}

for (const file of MODULES) {
  if (!fs.existsSync(file)) {
    console.warn(`missing: ${file}`);
    continue;
  }
  const temp = path.resolve("tmp", path.basename(file));
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(temp, loadable(fs.readFileSync(file, "utf8")), "utf8");
  const mod = await import(pathToFileURL(temp).href + `?t=${Date.now()}`);
  const before = found.size;
  for (const value of Object.values(mod)) walk(value);
  console.log(`${file}: ${found.size - before} new strings`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const bag = Object.fromEntries([...found].map((s) => [s, s]));
fs.writeFileSync(OUT, JSON.stringify(bag, null, 2) + "\n", "utf8");
console.log(`\n${found.size} strings -> ${OUT}`);
