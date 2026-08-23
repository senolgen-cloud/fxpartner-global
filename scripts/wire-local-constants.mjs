// Routes page-local Turkish constants through the translation walk.
//
//   node scripts/wire-local-constants.mjs --dry
//   node scripts/wire-local-constants.mjs
//   node scripts/wire-local-constants.mjs --file "src/app/[locale]/page.tsx"
//
// Most remaining Turkish lives in module-scope tables — `const steps = [{
// title, body }, …]` — which the JSX codemod refuses to touch and which
// cannot be wrapped where they are declared: tr() reads a per-request store,
// and module scope is evaluated once at import, so a tr() up there would
// freeze whichever locale rendered first and serve it to everyone.
//
// So the declaration stays Turkish and the READ is wrapped, inside the
// component body where a request exists. Server files only — useLocalizedData
// is a hook with placement rules a regex cannot honour.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ONE = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;

const TURKISH = /[çğıöşüÇĞİÖŞÜ]/;
const SKIP = ["src/app/api/", "src/app/sitemap.ts", "src/data/", "src/lib/i18n.ts"];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

// Span of a bracketed initialiser starting at `from`, respecting strings and
// template literals so a "]" inside copy does not end it early.
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
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const results = [];

for (const file of ONE ? [ONE] : walk("src")) {
  if (SKIP.some((p) => file.startsWith(p))) continue;
  let source = fs.readFileSync(file, "utf8");
  if (source.startsWith('"use client"')) continue;

  // Module-scope constants whose contents carry Turkish prose.
  const targets = [];
  for (const m of source.matchAll(/^const ([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*([[{])/gm)) {
    const end = spanOf(source, m.index + m[0].length - 1);
    if (end === -1) continue;
    const body = source.slice(m.index, end + 1);
    if (!TURKISH.test(body)) continue;
    targets.push({ name: m[1], start: m.index, end });
  }
  if (!targets.length) continue;

  // Everything after the last module-scope declaration we care about is fair
  // game; reads before that point are still in the declaration region.
  const declEnd = Math.max(...targets.map((t) => t.end));
  let changed = 0;

  for (const { name } of targets) {
    const read = new RegExp(`(?<![.\\w$])${name}(?![\\w$:])`, "g");
    source = source.replace(read, (match, offset) => {
      if (offset <= declEnd) return match;
      if (source.slice(Math.max(0, offset - 7), offset) === "trData(") return match;
      // A type position, not a value: (typeof steps)[number] is a type query
      // and wrapping it in a call is a syntax error.
      if (/\btypeof\s+$/.test(source.slice(Math.max(0, offset - 12), offset))) return match;
      changed++;
      return `trData(${match})`;
    });
  }

  if (!changed) {
    results.push({ file, changed: 0, note: "constants declared but never read after them" });
    continue;
  }

  const importLines = source.match(/^import [\s\S]*?;$/gm) ?? [];
  const alreadyImported = importLines.some(
    (l) => /\btrData\b/.test(l) && l.includes('"@/lib/localizeContent"')
  );
  if (!alreadyImported) {
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    const existing = importLines.find((l) => l.includes('from "@/lib/localizeContent"'));
    if (existing) {
      const names = existing.match(/import \{([\s\S]*?)\} from/)[1].trim().replace(/,$/, "");
      source = source.replace(existing, `import { ${names}, trData } from "@/lib/localizeContent";`);
    } else {
      const last = importLines[importLines.length - 1];
      if (!last) {
        results.push({ file, changed: 0, note: "no import to anchor to" });
        continue;
      }
      const at = source.indexOf(last) + last.length;
      source = source.slice(0, at) + eol + 'import { trData } from "@/lib/localizeContent";' + source.slice(at);
    }
  }

  if (!DRY) fs.writeFileSync(file, source, "utf8");
  results.push({ file, changed, constants: targets.map((t) => t.name) });
}

const touched = results.filter((r) => r.changed > 0);
console.log(`${DRY ? "would wrap" : "wrapped"} ${touched.reduce((s, r) => s + r.changed, 0)} reads in ${touched.length} files`);
for (const r of touched) console.log(`  ${String(r.changed).padStart(3)}  ${r.file}  [${r.constants.join(", ")}]`);
for (const r of results.filter((r) => !r.changed)) console.log(`  --   ${r.file} (${r.note})`);
