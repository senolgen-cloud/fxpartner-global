// Fails when the committed tree imports something the committed tree cannot
// provide — either the file isn't there, or it is but doesn't export the name.
// Both shipped in one day: src/lib/xm.ts was never added to git, and
// getAttribution existed only in an uncommitted edit of src/lib/visitor.ts.
// Each built fine on the machine that had the file and failed on Vercel.
//
//   node scripts/check-imports.mjs          # checks HEAD
//   node scripts/check-imports.mjs --ref X  # checks any ref
//
// Cheap enough to run before every push. For the real thing — a full build of
// exactly what is committed — see scripts/verify-committed-build.mjs.

import { execSync } from "node:child_process";

const ref = (() => {
  const i = process.argv.indexOf("--ref");
  return i === -1 ? "HEAD" : process.argv[i + 1];
})();

const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"];
const INDEX_FILES = ["/index.ts", "/index.tsx", "/index.js"];

function trackedFiles(ref) {
  return new Set(
    execSync(`git ls-tree -r --name-only ${ref}`, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
      .split("\n")
      .filter(Boolean)
  );
}

function fileAt(ref, path) {
  return execSync(`git show ${ref}:"${path}"`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
}

const files = trackedFiles(ref);
const sources = [...files].filter((f) => /^src\/.*\.(ts|tsx)$/.test(f));

// Captures the whole statement so the named bindings can be read back out.
const importPattern = /(?:^|\n)\s*import\s+([^;]*?)\s*from\s+["']([^"']+)["']/g;
const problems = [];

function resolve(base) {
  return (
    EXTENSIONS.map((ext) => base + ext).find((candidate) => files.has(candidate)) ??
    INDEX_FILES.map((idx) => base + idx).find((candidate) => files.has(candidate))
  );
}

function exportsName(source, name) {
  const declaration = new RegExp(
    `export\\s+(?:async\\s+)?(?:function|const|let|var|class|type|interface|enum)\\s+${name}\\b`
  );
  // export { x }, and export type { x } — the re-export shape signalAccess.ts
  // uses to pass vip.ts's types through.
  const braced = new RegExp(`export\\s*(?:type\\s+)?\\{[^}]*\\b${name}\\b`);
  // export const { auth, signIn } = NextAuth(...) — how src/auth.ts does it.
  const destructured = new RegExp(`export\\s+(?:const|let|var)\\s*\\{[^}]*\\b${name}\\b`);
  const reexportAll = /export\s+\*/;
  const defaultExport = name === "default" && /export\s+default/.test(source);
  return (
    declaration.test(source) ||
    braced.test(source) ||
    destructured.test(source) ||
    reexportAll.test(source) ||
    defaultExport
  );
}

for (const file of sources) {
  const content = fileAt(ref, file);

  for (const match of content.matchAll(importPattern)) {
    const [, bindings, spec] = match;

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
    } else continue; // a package: npm's problem, not git's

    const resolved = resolve(base);
    if (!resolved) {
      problems.push({ file, spec, target: base, why: "file is not committed" });
      continue;
    }
    if (!/\.(ts|tsx)$/.test(resolved)) continue;

    const braces = bindings.match(/\{([^}]*)\}/);
    if (!braces) continue;

    const target = fileAt(ref, resolved);
    for (const raw of braces[1].split(",")) {
      const name = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (!name) continue;
      if (!exportsName(target, name)) {
        problems.push({ file, spec, target: resolved, why: `does not export ${name}` });
      }
    }
  }
}

if (problems.length === 0) {
  console.log(`${ref}: every internal import resolves inside the tree (${sources.length} files checked)`);
} else {
  console.error(`${ref}: ${problems.length} broken import(s) in the committed tree:\n`);
  for (const p of problems) {
    console.error(`  ${p.file}\n    imports "${p.spec}" -> ${p.target}\n    ${p.why}`);
  }
  process.exit(1);
}
