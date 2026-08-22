// Fails when the committed tree imports a file that isn't in the committed
// tree. Written after exactly that shipped: src/lib/xm.ts sat untracked while
// two commits that import it went out, so the build worked on the machine
// that had the file and nowhere else — the Vercel deployment failed and
// production quietly kept serving the previous build.
//
//   node scripts/check-imports.mjs          # checks HEAD
//   node scripts/check-imports.mjs --ref X  # checks any ref
//
// Resolves the "@/..." alias against src/, tries the usual extensions and
// index files, and ignores anything that isn't a relative or aliased import
// (packages are npm's problem, not git's).

import { execSync } from "node:child_process";

const ref = (() => {
  const i = process.argv.indexOf("--ref");
  return i === -1 ? "HEAD" : process.argv[i + 1];
})();

const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"];
const INDEX_FILES = ["/index.ts", "/index.tsx", "/index.js"];

function tracked(ref) {
  return new Set(
    execSync(`git ls-tree -r --name-only ${ref}`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
      .split("\n")
      .filter(Boolean)
  );
}

function fileAt(ref, path) {
  return execSync(`git show ${ref}:"${path}"`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
}

const files = tracked(ref);
const sources = [...files].filter((f) => /^src\/.*\.(ts|tsx)$/.test(f));

const importPattern = /(?:from|import)\s+["']([^"']+)["']/g;
const missing = [];

for (const file of sources) {
  const content = fileAt(ref, file);
  for (const match of content.matchAll(importPattern)) {
    const spec = match[1];
    let base;
    if (spec.startsWith("@/")) base = "src/" + spec.slice(2);
    else if (spec.startsWith("./") || spec.startsWith("../")) {
      const dir = file.split("/").slice(0, -1);
      for (const part of spec.split("/")) {
        if (part === ".") continue;
        else if (part === "..") dir.pop();
        else dir.push(part);
      }
      base = dir.join("/");
    } else continue; // a package

    const found =
      EXTENSIONS.some((ext) => files.has(base + ext)) ||
      INDEX_FILES.some((idx) => files.has(base + idx));
    if (!found) missing.push({ file, spec, base });
  }
}

if (missing.length === 0) {
  console.log(`${ref}: every internal import resolves inside the tree (${sources.length} files checked)`);
} else {
  console.error(`${ref}: ${missing.length} import(s) point at files that are not committed:\n`);
  for (const m of missing) console.error(`  ${m.file}\n    imports "${m.spec}" -> ${m.base}.*  MISSING`);
  process.exit(1);
}
