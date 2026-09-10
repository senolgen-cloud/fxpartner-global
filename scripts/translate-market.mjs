// Translates whatever market summary / technical bulletin copy is not yet in
// the catalogues, into every non-Turkish locale, in one command.
//
//   node scripts/translate-market.mjs          # translate and merge
//   node scripts/translate-market.mjs --dry    # report what is missing
//
// Owner's call, 2026-09-10: market summaries and technical bulletins are
// published in all four languages, not Turkish only. The summaries are
// written several times a day by a scheduled job that commits
// src/data/marketAnalysis.ts; this is the step that job runs after writing,
// so a summary never reaches /en, /ua or /ar untranslated.
//
// These two modules are walked by localizeData() and translated by the
// Turkish string itself, so the translations go into chrome.json keyed by
// that string — the same place tr() reads. Existing entries are never
// overwritten: a value already there is a human's or an earlier run's.
//
// Runs scripts/translate.mjs for the model call, so the rules are the same
// ones every other translation on the site goes through — numbers keep
// their value, proper nouns stay, a risk disclaimer stays a disclaimer —
// and then scripts/check-echoed-translations.mjs, because a string the
// model handed back untranslated would otherwise land looking finished.
//
// Reads GEMINI_API_KEY from .env.local via translate.mjs.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DRY = process.argv.includes("--dry");
const LOCALES = ["en", "uk", "ar"];

// Mirrors STRUCTURAL_KEYS in src/lib/localizeContent.ts: identifiers, not
// prose. Translating a slug breaks a route; translating a pair breaks a
// lookup.
const STRUCT = new Set([
  "slug","href","id","icon","key","type","src","url","code","logo","image","color",
  "variant","group","path","locale","pair","affiliateUrl","trackingUrl","email","phone",
  "categories","category","segment","segments","models","platforms","regulators","status",
  "outcome","tier","verdict","unit","drawdownUnit","direction","scope","role",
  "symbol","ticker","currency","date","updatedAt","publishedAt",
  // Mirrors the 2026-09-10 additions to STRUCTURAL_KEYS: the Bias enum and
  // the chart path. Translating either breaks the card.
  "bias","chartImage",
]);

// Values that are identifiers even under a prose-looking key: a /public
// path, a URL, or an instrument pair like EUR/USD. The first backfill sent
// all three to the model; the paths and pairs came back unchanged, but only
// by luck.
// A bare time like "17:00 (GMT+3)" is the same in every language too.
const NOT_PROSE = [/^\//, /^https?:/i, /^[A-Z0-9]{2,6}\/[A-Z0-9]{2,6}$/, /^[\d:.\s()+\-–]*(GMT|UTC)?[\d:.\s()+\-–]*$/];

function readArray(file, name) {
  const s = fs.readFileSync(file, "utf8");
  const st = s.indexOf(`export const ${name}`);
  if (st < 0) throw new Error(`${name} not found in ${file}`);
  // "= [" rather than "[": the first bracket after the name is the one in
  // the type annotation, and matching it yields an empty array silently.
  const op = s.indexOf("= [", st) + 2;
  let d = 0, e = -1;
  for (let i = op; i < s.length; i++) {
    if (s[i] === "[") d++;
    else if (s[i] === "]") { d--; if (d === 0) { e = i; break; } }
  }
  return eval("(" + s.slice(op, e + 1).replace(/,(\s*[}\]])/g, "$1") + ")");
}

function collect(v, out, k) {
  if (typeof v === "string") {
    if (k && STRUCT.has(k)) return;
    if (v.trim().length > 2 && /\p{L}/u.test(v) && !NOT_PROSE.some((re) => re.test(v.trim()))) out.add(v);
    return;
  }
  if (Array.isArray(v)) { for (const x of v) collect(x, out, k); return; }
  if (v && typeof v === "object") {
    for (const [kk, vv] of Object.entries(v)) {
      if (STRUCT.has(kk)) continue;
      collect(vv, out, kk);
    }
  }
}

const source = new Set();
collect(readArray("src/data/marketAnalysis.ts", "marketAnalysisPosts"), source);
collect(readArray("src/data/technicalAnalysis.ts", "technicalAnalysisPosts"), source);

// The per-day bulletin titles live in a separate date -> title map
// (bulletinTitles), rendered through trData() on /teknik-analiz. The first
// version of this script only walked the posts array and missed them, so
// "01.09.2026 - Gün İçi Teknik Analiz Bülteni" stayed Turkish on /en.
{
  const src = fs.readFileSync("src/data/technicalAnalysis.ts", "utf8");
  const start = src.indexOf("export const bulletinTitles");
  const block = src.slice(start, src.indexOf("};", start));
  for (const m of block.matchAll(/"\d{4}-\d{2}-\d{2}":\s*"([^"]+)"/g)) source.add(m[1]);
}

// Catalogue files keep CRLF like the rest of the repo; JSON.stringify emits
// LF, so line endings are restored on write to keep the diff to real changes.
function writeJson(file, obj) {
  const crlf = fs.readFileSync(file, "utf8").includes("\r\n");
  let text = JSON.stringify(obj, null, 2) + "\n";
  if (crlf) text = text.replace(/\n/g, "\r\n");
  fs.writeFileSync(file, text);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fxp-market-"));
let total = 0;

for (const locale of LOCALES) {
  const file = `src/data/i18n/${locale}/chrome.json`;
  const cat = JSON.parse(fs.readFileSync(file, "utf8"));
  const missing = [...source].filter((s) => !(cat[s] && cat[s].trim()));
  console.log(`${locale}: ${missing.length} missing`);
  if (!missing.length || DRY) continue;

  const bag = Object.fromEntries(missing.map((s, i) => [`m${String(i).padStart(4, "0")}`, s]));
  const inFile = path.join(tmp, `${locale}.tr.json`);
  const outFile = path.join(tmp, `${locale}.json`);
  fs.writeFileSync(inFile, JSON.stringify(bag, null, 2));

  execFileSync(process.execPath, ["scripts/translate.mjs", "--in", inFile, "--out", outFile, "--locale", locale], {
    stdio: "inherit",
  });

  const translated = JSON.parse(fs.readFileSync(outFile, "utf8"));
  let added = 0;
  for (const [key, turkish] of Object.entries(bag)) {
    const value = translated[key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (cat[turkish] && cat[turkish].trim()) continue;
    cat[turkish] = value;
    added++;
  }
  writeJson(file, cat);
  total += added;
  console.log(`${locale}: +${added} written to ${file}`);
}

fs.rmSync(tmp, { recursive: true, force: true });

if (!DRY && total) {
  // Dates and units the model left in Turkish ("4 Eylül", "4.487 dolara")
  // are a closed set; fix them by rule before the check below sees them.
  execFileSync(process.execPath, ["scripts/fix-turkish-residue.mjs"], { stdio: "inherit" });
  // Fails loudly if the model echoed any of it back in Turkish.
  execFileSync(process.execPath, ["scripts/check-echoed-translations.mjs"], { stdio: "inherit" });
}
