// Finds Turkish copy that still renders untranslated.
//
//   node scripts/audit-untranslated.mjs            # ranked report
//   node scripts/audit-untranslated.mjs --json     # machine-readable
//   node scripts/audit-untranslated.mjs --file <p> # one file
//
// The wrapping codemod (scripts/wrap-chrome.mjs) only ever touched shapes it
// could reason about with certainty: whole-line JSX text and a short list of
// attributes. Everything else it deliberately skipped — strings in object
// literals, ternaries, template expressions, props. Those skips are invisible
// until someone loads /en and reads a Turkish word, so this counts them.
//
// A string is reported when it looks like Turkish copy, is not already
// inside a tr(...) or useTr()(...) call, and is not a comment, an import, a
// className, a route or a data key.
//
// "Looks like Turkish" is a heuristic and it is worth knowing its edge. The
// original test was a diacritic — ç, ğ, ı, ö, ş, ü — which misses every
// Turkish phrase written in plain ASCII: "FX Sinyalleri", "Yapay Zeka
// Analizi", "Spread ve swap, yan yana". Those rendered Turkish on /en for
// months while this script reported the page clean. A function-word list
// closes most of that gap; a two-word noun phrase with no function word and
// no diacritic will still slip through, so a zero here means "nothing
// obvious left", not "nothing left".

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const ONE = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;

const DIACRITICS = /[çğıöşüÇĞİÖŞÜ]/;

// Words a Turkish sentence long enough to matter almost always contains, and
// that would be strange to find in English or Ukrainian copy. This is the
// half of the test that catches ASCII-only Turkish.
const TR_WORDS =
  /(^|[^\p{L}])(ve|ile|için|bir|şu|nasıl|neden|hangi|kadar|daha|gibi|veya|değil|olarak|sonra|önce|göre|kendi|edildi|ediliyor|yapın|alın|olun|edin|yana|sinyalleri|analizi|brokerlar)([^\p{L}]|$)/iu;

const TURKISH = {
  test: (text) => DIACRITICS.test(text) || TR_WORDS.test(text),
};

// Files whose Turkish is translated through a different mechanism: the data
// overlays (src/data/i18n/<locale>/{brokers,blog}.json) and the dictionaries
// themselves. Reporting them would be noise.
const OVERLAY_OWNED = [
  "src/data/brokers.ts",
  "src/data/blog.ts",
  "src/data/i18n/",
  "src/lib/dictionary.ts",
  "src/lib/chrome.ts",
  // Turkish here is the translation KEY, not the rendered output: every
  // consumer passes these through tr() or localizeData() at the render site,
  // which is exactly how a gettext catalogue works. Reporting them would be
  // a false positive — verify with scripts/audit-dictionary-gaps.mjs and the
  // page scan instead, both of which look at what actually renders.
  "src/lib/navLinks.ts",
  "src/data/propFirms.ts",
  "src/data/marketAnalysis.ts",
  "src/data/technicalAnalysis.ts",
  "src/data/partnerProgram.ts",
  "src/data/packageTiers.ts",
  "src/data/brokerLookup.ts",
  "src/data/cashback.ts",
  // A table definition, not copy. Its column names read like Turkish to a
  // word list and are not shown to anyone.
  "src/db/schema.ts",
];

// Server-side text that is never localized: what the bots post to Telegram
// and X, which are Turkish-language channels, and the prompts sent to the
// model. A reader never sees these through a locale.
const NOT_READER_FACING = ["src/app/api/"];

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "tmp"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Is the match already inside a tr(...) argument? Walk back from the string's
// opening quote through balanced parens to find the call that owns it.
function insideTr(line, index) {
  const before = line.slice(0, index);
  let depth = 0;
  for (let i = before.length - 1; i >= 0; i--) {
    const ch = before[i];
    if (ch === ")") depth++;
    else if (ch === "(") {
      if (depth === 0) return /\btr\s*$/.test(before.slice(0, i));
      depth--;
    }
  }
  return false;
}

function classify(line) {
  const t = line.trim();
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return "comment";
  if (t.startsWith("import ") || t.startsWith("export {")) return "import";
  return null;
}

// Attributes and values that are never shown to a reader.
const NON_COPY_KEY = /\b(className|href|src|id|key|slug|type|name|group|icon|path|url|locale|charSet|as|rel|value)\s*[:=]\s*$/;

const findings = [];
const files = ONE ? [ONE] : walk("src");

for (const file of files) {
  if (OVERLAY_OWNED.some((p) => file.startsWith(p))) continue;
  if (NOT_READER_FACING.some((p) => file.startsWith(p))) continue;
  const source = fs.readFileSync(file, "utf8");
  // Every literal already passed to tr() or trf(), anywhere in the file,
  // including across line breaks. The Turkish in those calls IS the
  // catalogue key, so counting it as untranslated reports the fix as the
  // problem — which is what the single-line insideTr() check did once the
  // calls got long enough to wrap.
  const wrapped = new Set(
    [...source.matchAll(/\btrf?\(\s*"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    )
  );
  const lines = source.split("\n");
  let blockComment = false;

  lines.forEach((line, i) => {
    if (blockComment) {
      if (line.includes("*/")) blockComment = false;
      return;
    }
    if (/\/\*/.test(line) && !/\*\//.test(line)) blockComment = true;
    if (classify(line)) return;

    // String literals: "…", '…', `…`
    for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
      const text = m[2];
      if (!TURKISH.test(text)) continue;
      if (insideTr(line, m.index) || wrapped.has(text)) continue;
      if (NON_COPY_KEY.test(line.slice(0, m.index))) continue;
      if (text.length < 2) continue;
      findings.push({ file, line: i + 1, kind: "string", text: text.slice(0, 120) });
    }

    // Bare JSX text on a line that also carries an expression — the shape
    // wrap-chrome.mjs explicitly refuses to touch.
    const jsxText = line.replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, "").replace(/\{[^}]*\}/g, "");
    const stripped = jsxText.replace(/<[^>]*>/g, "").trim();
    if (TURKISH.test(stripped) && stripped.length > 2 && /[<>{}]/.test(line)) {
      findings.push({ file, line: i + 1, kind: "jsx", text: stripped.slice(0, 120) });
    }
  });
}

if (JSON_OUT) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const byFile = new Map();
  for (const f of findings) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
  const ranked = [...byFile].sort((a, b) => b[1] - a[1]);
  console.log(`${findings.length} untranslated strings across ${ranked.length} files\n`);
  for (const [file, count] of ranked.slice(0, 40)) {
    console.log(`${String(count).padStart(4)}  ${file}`);
  }
  if (ranked.length > 40) console.log(`      … and ${ranked.length - 40} more files`);
}

process.exit(findings.length ? 1 : 0);
