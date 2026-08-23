// Unpins date formatting from Turkish.
//
//   node scripts/wire-date-locale.mjs --dry
//   node scripts/wire-date-locale.mjs
//
// Every toLocaleDateString / toLocaleTimeString / toLocaleString call was
// written with a literal "tr-TR". That is invisible while the site is only
// Turkish and wrong the moment it is not: /ua rendered "18 Ağustos 2026".
//
// Server files read the locale from the request store via trLocale(). Client
// files need useIntlLocale(), which is a hook, so they are listed rather than
// rewritten — a regex cannot tell a component body from a helper function
// defined above it, and getting that wrong breaks the rules of hooks.

import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");

// The bots post to Turkish-language channels; their timestamps stay Turkish.
const SKIP = ["src/app/api/"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const server = [];
const unanchored = [];
const client = [];

for (const file of walk("src")) {
  if (SKIP.some((p) => file.startsWith(p))) continue;
  let source = fs.readFileSync(file, "utf8");
  const hits = (source.match(/toLocale(?:Date|Time)?String\("tr-TR"/g) ?? []).length;
  if (!hits) continue;

  if (source.startsWith('"use client"')) {
    client.push({ file, hits });
    continue;
  }

  source = source.replace(/toLocale(Date|Time)?String\("tr-TR"/g, "toLocale$1String(trLocale()");

  if (!/\btrLocale\b.*from "@\/lib\/chrome"|from "@\/lib\/chrome".*\btrLocale\b/s.test(source)) {
    const existing = source.match(/import \{([^}]*)\} from "@\/lib\/chrome";/);
    if (existing) {
      source = source.replace(
        existing[0],
        `import {${existing[1].replace(/\s*$/, "")}, trLocale } from "@/lib/chrome";`
      );
    } else {
      const imports = [...source.matchAll(/^import [\s\S]*?;$/gm)];
      const last = imports[imports.length - 1];
      if (!last) {
        // A module with no imports of its own — leave it for a person
        // rather than guessing where a new import line belongs.
        unanchored.push({ file, hits });
        continue;
      }
      const at = last.index + last[0].length;
      source = source.slice(0, at) + '\nimport { trLocale } from "@/lib/chrome";' + source.slice(at);
    }
  }

  if (!DRY) fs.writeFileSync(file, source, "utf8");
  server.push({ file, hits });
}

console.log(`${DRY ? "would rewrite" : "rewrote"} ${server.reduce((s, r) => s + r.hits, 0)} calls in ${server.length} server files`);
for (const r of server) console.log(`  ${String(r.hits).padStart(2)}  ${r.file}`);
if (unanchored.length) {
  console.log(`
${unanchored.length} files have no import to anchor to:`);
  for (const r of unanchored) console.log(`  ${String(r.hits).padStart(2)}  ${r.file}`);
}
if (client.length) {
  console.log(`\n${client.reduce((s, r) => s + r.hits, 0)} calls in ${client.length} client files need useIntlLocale() by hand:`);
  for (const r of client) console.log(`  ${String(r.hits).padStart(2)}  ${r.file}`);
}
