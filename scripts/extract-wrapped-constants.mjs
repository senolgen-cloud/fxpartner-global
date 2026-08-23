// Collects the Turkish inside module-scope constants that are now read
// through trData(), so those strings can be translated.
//
//   node scripts/extract-wrapped-constants.mjs --out tmp/consts.tr.json
//
// Source-level, not import-level: these constants are local to a page and
// cannot be imported without dragging the page's whole module graph in. The
// declaration is found by the same brace matching the wiring codemod uses,
// then the string literals inside it are read off.

import fs from "node:fs";
import path from "node:path";
import { looksLikeCopy } from "./lib/turkish.mjs";

const args = process.argv.slice(2);
const OUT = args[args.indexOf("--out") + 1] ?? "tmp/consts.tr.json";


// Keys whose values are identifiers, not prose — same list localizeData
// steps over at runtime, so extracting them would produce entries that are
// never looked up.
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

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

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
let files = 0;

for (const file of walk("src")) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes("trData(") && !source.includes("useLocalizedData(")) continue;

  let found = false;
  for (const m of source.matchAll(/^const ([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*([[{])/gm)) {
    const name = m[1];
    // Both wrappers: trData() on the server, useLocalizedData() on the client.
    if (!new RegExp(`(?:trData|useLocalizedData)\\(${name}\\)`).test(source)) continue;
    const end = spanOf(source, m.index + m[0].length - 1);
    if (end === -1) continue;
    const body = source.slice(m.index, end + 1);

    // Double-quoted literals, with the key in front of them so structural
    // values can be skipped.
    for (const lit of body.matchAll(/(?:(\w+)\s*:\s*)?"((?:[^"\\]|\\.)*)"/g)) {
      const key = lit[1];
      if (key && STRUCTURAL_KEYS.has(key)) continue;
      // Decode the escapes JS would, not just the quote. A key stored as the
      // literal characters backslash-n never matches the real newline the
      // runtime hands tr(), so the string silently stays Turkish.
      const text = lit[2]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      if (!looksLikeCopy(text)) continue;
      bag[text] = text;
      found = true;
    }
  }
  if (found) files++;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bag, null, 2) + "\n", "utf8");
console.log(`${Object.keys(bag).length} strings from ${files} files -> ${OUT}`);
