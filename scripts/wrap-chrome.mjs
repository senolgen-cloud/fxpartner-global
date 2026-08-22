// Wraps Turkish copy in JSX with tr(), so it can be translated.
//
//   node scripts/wrap-chrome.mjs --file src/app/[locale]/about/page.tsx
//   node scripts/wrap-chrome.mjs --dir  src/app/[locale] --dry
//
// Deliberately conservative. It only touches shapes it can reason about with
// certainty:
//
//   1. A run of one or more lines that are pure JSX text, bounded by a line
//      ending a tag and a line opening one. Multi-line paragraphs are the
//      bulk of the body copy, and JSX collapses their newlines to single
//      spaces, so the run is joined with spaces and comes out identical.
//   2. A string-literal attribute among alt, title, placeholder, aria-label.
//
// Everything else is left for a person: text sharing a line with an
// expression or a {" "}, template literals, ternaries, strings passed as
// props. Those are where a regex silently changes meaning, and a
// half-translated page that renders beats a fully-translated one that throws.
//
// Server components get `import { tr } from "@/lib/chrome"`. Client
// components can't read the request store, so they get useTr() and a
// `const tr = useTr();` inside the component.

import fs from "node:fs";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const argOf = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};
const DRY = args.includes("--dry");

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;
const ATTRS = ["alt", "title", "placeholder", "aria-label"];

// JSX text carries HTML entities; a JS string does not, so they are decoded
// on the way in or the page would render a literal "&apos;".
const ENTITIES = {
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&amp;": "&",
  "&nbsp;": " ",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&rsquo;": "’",
  "&lsquo;": "‘",
};

function decodeEntities(text) {
  return text.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
}

function targets() {
  const file = argOf("--file");
  if (file) return [file];
  const dir = argOf("--dir");
  if (!dir) {
    console.error("usage: --file <path> | --dir <path> [--dry]");
    process.exit(1);
  }
  return execSync(`find "${dir}" -name '*.tsx'`, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
}

// A line that is nothing but JSX text: no tags, no braces, nothing that
// would make it part of an expression, an attribute or a comment.
function isTextLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (/[<>{}]/.test(t)) return false;
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return false;
  if (/^["'`]/.test(t)) return false;
  if (/^[\w.]+\s*[:=]/.test(t)) return false; // object property or assignment
  if (t.endsWith(";")) return false; // a statement, not prose
  // A trailing comma only means "still inside an expression" when the line is
  // a single token; prose wraps mid-sentence on commas all the time —
  // "…yardımcı oluyoruz — regülasyon," is text, "brokers," is code.
  if (t.endsWith(",") && !/\s/.test(t)) return false;
  return true;
}

function wrapFile(path) {
  const original = fs.readFileSync(path, "utf8");
  const isClient = original.startsWith('"use client"');
  const lines = original.split("\n");
  const out = [];
  const collected = [];
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- a run of text lines ---------------------------------------------
    if (isTextLine(line)) {
      let end = i;
      while (end + 1 < lines.length && isTextLine(lines[end + 1])) end++;

      const before = out.slice().reverse().find((l) => l.trim());
      const after = lines.slice(end + 1).find((l) => l.trim());
      const run = lines.slice(i, end + 1);
      const joined = decodeEntities(run.map((l) => l.trim()).join(" "));

      const insideJsx =
        before && /[>}]\s*$/.test(before.trim()) && after && /^[<{]/.test(after.trim());

      if (insideJsx && TURKISH.test(joined)) {
        const indent = line.slice(0, line.length - line.trimStart().length);
        out.push(`${indent}{tr(${JSON.stringify(joined)})}`);
        collected.push(joined);
        changed++;
        i = end;
        continue;
      }

      for (let k = i; k <= end; k++) out.push(lines[k]);
      i = end;
      continue;
    }

    // --- a translatable attribute ----------------------------------------
    let current = line;
    for (const attr of ATTRS) {
      const pattern = new RegExp(`(\\s${attr}=)"([^"]*[çğıöşüÇĞİÖŞÜ][^"]*)"`);
      const m = current.match(pattern);
      if (m) {
        const text = decodeEntities(m[2]);
        current = current.replace(pattern, `$1{tr(${JSON.stringify(text)})}`);
        collected.push(text);
        changed++;
      }
    }
    out.push(current);
  }

  if (!changed) return { path, changed: 0, collected: [] };

  let result = out.join("\n");

  if (isClient) {
    if (!result.includes('from "@/components/useTr"')) {
      result = result.replace(/^("use client";\n)/, '$1import { useTr } from "@/components/useTr";\n');
    }
    if (!/const tr = useTr\(\);/.test(result)) {
      const fn = result.match(/export default function [A-Za-z0-9_]+\([\s\S]*?\)\s*\{\n/);
      if (!fn) return { path, changed: 0, collected: [], skipped: "client component with no plain default export" };
      result = result.replace(fn[0], fn[0] + "  const tr = useTr();\n");
    }
  } else if (!result.includes('from "@/lib/chrome"')) {
    const firstImport = result.match(/^import .*\n/m);
    result = firstImport
      ? result.replace(firstImport[0], firstImport[0] + 'import { tr } from "@/lib/chrome";\n')
      : 'import { tr } from "@/lib/chrome";\n' + result;
  }

  if (!DRY) fs.writeFileSync(path, result, "utf8");
  return { path, changed, collected };
}

const results = targets().map(wrapFile);
const total = results.reduce((sum, r) => sum + r.changed, 0);
const touched = results.filter((r) => r.changed > 0);

console.log(`${DRY ? "would wrap" : "wrapped"} ${total} strings across ${touched.length} files`);
for (const r of touched.slice(0, 50)) console.log(`  ${String(r.changed).padStart(3)}  ${r.path}`);
for (const r of results.filter((x) => x.skipped)) console.log(`  skipped ${r.path}: ${r.skipped}`);

// The collected Turkish is the translation input, keyed by itself.
if (!DRY) {
  const all = {};
  for (const r of results) for (const text of r.collected) all[text] = text;
  if (Object.keys(all).length) {
    fs.mkdirSync("tmp", { recursive: true });
    const existing = fs.existsSync("tmp/chrome.tr.json")
      ? JSON.parse(fs.readFileSync("tmp/chrome.tr.json", "utf8"))
      : {};
    const merged = { ...existing, ...all };
    fs.writeFileSync("tmp/chrome.tr.json", JSON.stringify(merged, null, 2) + "\n", "utf8");
    console.log(`tmp/chrome.tr.json now holds ${Object.keys(merged).length} strings`);
  }
}
