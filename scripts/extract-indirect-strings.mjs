// Extracts Turkish from constants that are translated through a variable.
//
//   node scripts/extract-indirect-strings.mjs --out tmp/indirect.tr.json
//
// audit-dictionary-gaps.mjs can only see tr("literal"). When the call is
// tr(col.label) or trData(categoryInfo), the key is decided at runtime and
// no scanner reading call sites will ever find it — the string lives in the
// table, not in the call. Those tables are listed here explicitly, because
// guessing which constants feed a translated read is how you end up
// translating slugs.
//
// Add a line when you wire a new table through trData() or tr(variable).

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : "tmp/indirect.tr.json";

// file -> constants whose prose is read through a translating wrapper.
const SOURCES = {
  "src/data/brokers.ts": ["categoryInfo"],
  "src/components/PropFirmComparisonTable.tsx": ["PROP_CRITERIA", "SEGMENT_LABEL", "MODEL_LABEL"],
  "src/components/PropFirmFeaturedCard.tsx": [],
  "src/components/LiveMarketsGrid.tsx": ["CARD_META"],
  "src/components/PartnerDashboardPreview.tsx": ["recentActivity"],
  "src/lib/brokerContent.ts": ["PLATFORM_BLURBS"],
  "src/lib/positionSize.ts": ["RISK_LABEL"],
};

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;
const STRUCTURAL_KEYS = new Set([
  "slug", "href", "id", "icon", "key", "type", "src", "url", "code",
  "logo", "image", "color", "variant", "group", "path", "locale", "pair",
  "symbol", "ticker", "currency", "date", "updatedAt", "publishedAt", "country",
]);

function spanOf(source, from) {
  const open = source[from];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let quote = null;
  for (let i = from; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

const bag = {};
let count = 0;

for (const [file, names] of Object.entries(SOURCES)) {
  if (!names.length || !fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");

  for (const name of names) {
    const m = source.match(new RegExp(`^(?:export\\s+)?const ${name}\\s*(?::[\\s\\S]*?)?=\\s*([\\[{])`, "m"));
    if (!m) {
      console.error(`not found: ${name} in ${file}`);
      continue;
    }
    const start = m.index + m[0].length - 1;
    const end = spanOf(source, start);
    if (end === -1) continue;

    for (const lit of source.slice(start, end + 1).matchAll(/(?:(\w+)\s*:\s*)?"((?:[^"\\]|\\.)*)"/g)) {
      if (lit[1] && STRUCTURAL_KEYS.has(lit[1])) continue;
      const text = lit[2]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      if (!TURKISH.test(text) || text.trim().length < 2) continue;
      bag[text] = text;
      count++;
    }
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bag, null, 2) + "\n", "utf8");
console.log(`${Object.keys(bag).length} unique strings (${count} occurrences) -> ${OUT}`);
