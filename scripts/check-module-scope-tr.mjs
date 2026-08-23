// Finds translation calls made at module scope, where there is no request.
//
//   node scripts/check-module-scope-tr.mjs
//
// tr(), trf(), trData() and trLocale() all read the per-request locale store.
// A module body runs once, when the module is first imported — not per
// request — so a call up there resolves against whatever locale happened to
// be active then (or the default) and that answer is frozen into the module
// for the life of the server process. Every later reader gets it, whatever
// language they asked for.
//
// Nothing throws. The page just renders one language to everyone, which is
// indistinguishable from "not translated yet" and is why this needs a check
// rather than a test.
//
// Two shapes count as module scope. The obvious one is a call at brace depth
// 0. The other is a call inside a top-level `const x = …` initialiser, even
// when it sits in an arrow function — `PACKAGE_TIER_ORDER.map(t => trData(…))`
// runs the moment the module loads, exactly like a bare call would. A
// function *declaration* is different: its body is deferred until something
// calls it, by which time a request exists.

import fs from "node:fs";
import path from "node:path";

const CALLS = /\b(tr|trf|trData|trLocale)\s*\(/g;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

// Brace depth at every character index, plus which indexes are inside a
// comment or a string (a call named in a doc comment is prose, not code).
function depths(source) {
  const out = new Int32Array(source.length);
  const inert = new Uint8Array(source.length);
  let depth = 0;
  let quote = null;
  let comment = null; // "line" | "block"
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    out[i] = depth;
    if (comment || quote) inert[i] = 1;

    if (comment === "line") { if (ch === "\n") comment = null; continue; }
    if (comment === "block") { if (ch === "*" && next === "/") { comment = null; i++; } continue; }
    if (quote) {
      if (ch === "\\") { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { comment = "line"; i++; continue; }
    if (ch === "/" && next === "*") { comment = "block"; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") depth = Math.max(0, depth - 1);
  }
  return { depth: out, inert };
}

// Spans of top-level `const|let|var` statements, whose initialisers run at
// import. Function declarations are deliberately not included.
function eagerSpans(source, depth, inert) {
  const spans = [];
  for (const m of source.matchAll(/^(?:export\s+)?(?:const|let|var)\s/gm)) {
    if (depth[m.index] !== 0 || inert[m.index]) continue;
    // Ends at the first depth-0 semicolon after the declaration.
    let i = m.index;
    for (; i < source.length; i++) {
      if (inert[i]) continue;
      if (source[i] === ";" && depth[i] === 0) break;
    }
    spans.push([m.index, i]);
  }
  return spans;
}

const findings = [];

for (const file of walk("src")) {
  const source = fs.readFileSync(file, "utf8");
  if (!CALLS.test(source)) continue;
  CALLS.lastIndex = 0;

  const { depth, inert } = depths(source);
  const eager = eagerSpans(source, depth, inert);

  for (const m of source.matchAll(CALLS)) {
    if (inert[m.index]) continue; // named in a comment or a string
    // A definition, not a call: `export function tr(` / `const tr = useTr()`.
    const before = source.slice(Math.max(0, m.index - 30), m.index);
    if (/\b(function|const|let|var)\s+$/.test(before)) continue;
    if (/\.\s*$/.test(before)) continue;

    const bare = depth[m.index] === 0;
    const inEager = eager.some(([a, b]) => m.index > a && m.index < b);
    if (!bare && !inEager) continue;

    const line = source.slice(0, m.index).split(/\r?\n/).length;
    const text = source.slice(source.lastIndexOf("\n", m.index) + 1, source.indexOf("\n", m.index)).trim();
    findings.push({ file, line, fn: m[1], text: text.slice(0, 90) });
  }
}

if (!findings.length) {
  console.log("no translation call runs at module scope");
  process.exit(0);
}

console.error(`${findings.length} translation call(s) at module scope — the locale would be frozen at import:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.fn}()`);
  console.error(`    ${f.text}`);
  console.error(`    fix: move the call inside the component body, or wrap where the value is read.\n`);
}
process.exit(1);
