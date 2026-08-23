// Finds server-side translation helpers used inside the client bundle.
//
//   node scripts/check-client-tr.mjs
//
// tr(), trf(), trData() and trLocale() read the locale from a React cache()
// store that only exists during a server render. A module without "use
// client" is still compiled into the client bundle if a client component
// imports it — and there those helpers quietly fall back to the default
// locale, so the component renders Turkish to everyone.
//
// LotLadder was the example: it is written as a server component, and it is
// only ever rendered from SignalsBoard, which is "use client".
//
// The fix is the client half: useTr(), useTrf(), useIntlLocale(),
// useLocalizedData().

import fs from "node:fs";
import path from "node:path";

const SERVER_HELPERS = /import\s+\{[^}]*\b(tr|trf|trLocale)\b[^}]*\}\s+from\s+"@\/lib\/chrome"|import\s+\{[^}]*\btrData\b[^}]*\}\s+from\s+"@\/lib\/localizeContent"/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk("src");
const source = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

function resolve(spec, from) {
  let base;
  if (spec.startsWith("@/")) base = `src/${spec.slice(2)}`;
  else if (spec.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  else return null;
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (source.has(cand)) return cand;
  }
  return null;
}

function importsOf(file) {
  const src = source.get(file) ?? "";
  return [...src.matchAll(/\bfrom\s+"([^"]+)"/g)]
    .map((m) => resolve(m[1], file))
    .filter(Boolean);
}

// Everything reachable from a "use client" entry point is in the client bundle.
const inClientBundle = new Map(); // file -> the client entry that pulls it in
for (const [file, src] of source) {
  if (!src.startsWith('"use client"')) continue;
  const queue = [file];
  const seen = new Set([file]);
  while (queue.length) {
    const current = queue.shift();
    if (!inClientBundle.has(current)) inClientBundle.set(current, file);
    for (const next of importsOf(current)) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
}

const offenders = [];
for (const [file, entry] of inClientBundle) {
  const src = source.get(file) ?? "";
  if (src.startsWith('"use client"')) {
    // A client component importing the server helper is wrong on its face.
    if (SERVER_HELPERS.test(src)) offenders.push({ file, entry: null });
    continue;
  }
  if (SERVER_HELPERS.test(src)) offenders.push({ file, entry });
}

if (!offenders.length) {
  console.log(`no server translation helper reaches the client bundle (${inClientBundle.size} modules checked)`);
  process.exit(0);
}

console.error(`${offenders.length} module(s) use a server translation helper inside the client bundle:\n`);
for (const o of offenders) {
  console.error(`  ${o.file}`);
  if (o.entry) console.error(`    pulled in by ${o.entry}`);
  console.error(`    fix: useTr() / useTrf() / useIntlLocale() / useLocalizedData()\n`);
}
process.exit(1);
