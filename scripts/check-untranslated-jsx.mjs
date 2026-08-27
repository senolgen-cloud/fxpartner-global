/**
 * Finds Turkish copy sitting in JSX that nobody wrapped in tr().
 *
 * check-client-tr.mjs guards the opposite mistake — the server translator
 * leaking into a client bundle. Nothing was watching for a literal that was
 * simply never wrapped, which renders Turkish in every tree including the
 * Arabic one, and is invisible until somebody opens the page in another
 * language and reads it.
 *
 * The signal is Turkish-specific letters (ğışöçü and the dotted/dotless I).
 * A string without one of those is usually a proper noun, a unit or English,
 * and flagging it would bury the real findings.
 *
 * Matching runs over the whole file rather than line by line, because the
 * common shape is a label on its own line between its tags:
 *
 *     <label ...>
 *       E-posta
 *     </label>
 *
 * A line-by-line version of this missed every one of those — six form
 * labels, found only when a reader opened the Arabic tree and saw them.
 *
 * Deliberately heuristic and reporting-only: it reads JSX text nodes and the
 * handful of attributes a reader actually sees. Failing a build on a guess
 * about whether a string is copy or a proper noun would be worse than the
 * bug it is looking for.
 */
import fs from "node:fs";
import path from "node:path";

const TURKISH = /[ğışöçüĞİŞÖÇÜ]/;

// The stronger signal: the string is already a key in the chrome dictionary,
// so it is known translatable copy that someone forgot to wrap *here*. This
// is what catches "E-posta" — perfectly ordinary Turkish with not one
// Turkish-specific letter in it, which the alphabet test alone walks past.
const KNOWN = new Set(
  Object.keys(JSON.parse(fs.readFileSync("src/data/i18n/en/chrome.json", "utf8")))
);
// Proper nouns that happen to also be catalogue keys. "Telegram" is a
// translatable word in a sentence like "Telegram kanalımız" and a brand
// name on a button that opens Telegram — the KNOWN test cannot tell those
// apart, and a checker that reports the same false positive forever is a
// checker people stop reading.
const BRAND_NAMES = new Set([
  "Telegram",
  "Instagram",
  "WhatsApp",
  "FXPARTNER",
  "FXPARTNER Index",
  "MetaTrader",
  "TradingView",
]);

const VISIBLE_ATTR = /\b(?:aria-label|title|placeholder|alt)=\{?"([^"]{3,})"/g;
/** >  text  < with no tags, braces or quotes between — newlines allowed. */
const JSX_TEXT = />\s*([^<>{}"'`][^<>{}"'`]*?)\s*</g;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Strips comments so prose inside them is not reported as copy. */
function withoutComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
            .replace(/^[ \t]*\/\/.*$/gm, (m) => m.replace(/[^\n]/g, " "));
}

const findings = [];
for (const file of walk("src")) {
  const raw = fs.readFileSync(file, "utf8");
  const src = withoutComments(raw);
  const lineOf = (idx) => src.slice(0, idx).split("\n").length;

  const seen = new Set();
  const consider = (text, idx) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (!t) return;
    if (BRAND_NAMES.has(t)) return;
    if (!TURKISH.test(t) && !KNOWN.has(t)) return;
    // Utility-class strings and file paths slip through the text matcher.
    if (/^[a-z0-9-]+(\s+[a-z0-9:./[\]%-]+)*$/.test(t)) return;
    const line = lineOf(idx);
    // Already handled on this line.
    const lineSrc = src.split("\n")[line - 1] ?? "";
    if (/\btr\(|\btrf\(|formatMessage\(/.test(lineSrc)) return;
    const key = `${line}:${t}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({ file: file.replace(/\\/g, "/"), line, text: t.slice(0, 72) });
  };

  for (const m of src.matchAll(JSX_TEXT)) consider(m[1], m.index);
  for (const m of src.matchAll(VISIBLE_ATTR)) consider(m[1], m.index);
}

if (findings.length === 0) {
  console.log("no unwrapped Turkish copy found in JSX");
  process.exit(0);
}

console.log(`${findings.length} unwrapped Turkish string(s) in JSX:\n`);
for (const f of findings) console.log(`  ${f.file}:${f.line}\n    ${f.text}`);
