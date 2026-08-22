// Builds exactly what is committed, in a throwaway worktree, so a build that
// only works because of uncommitted files fails here instead of on Vercel.
//
//   node scripts/verify-committed-build.mjs          # HEAD
//   node scripts/verify-committed-build.mjs --ref X
//
// Two deployments failed in one day for this reason: a module and then a
// function that existed on the authoring machine and nowhere else. A build in
// the dirty working copy cannot see either.
//
// The worktree is created inside the project on purpose. Node resolves
// node_modules by walking up parent directories, so a checkout at
// <project>/.verify-tree finds <project>/node_modules without copying 900MB
// or symlinking it, which Turbopack rejects as outside the project root.

import { execSync } from "node:child_process";
import fs from "node:fs";

const ref = (() => {
  const i = process.argv.indexOf("--ref");
  return i === -1 ? "HEAD" : process.argv[i + 1];
})();

const DIR = ".verify-tree";

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts });
}

function cleanup() {
  try {
    run(`git worktree remove --force ${DIR}`);
  } catch {
    // A half-removed worktree leaves the directory behind; prune the
    // bookkeeping so the next run can recreate it.
    try {
      fs.rmSync(DIR, { recursive: true, force: true });
    } catch {}
    try {
      run("git worktree prune");
    } catch {}
  }
}

cleanup();

console.log(`checking out ${ref} into ${DIR}/`);
run(`git worktree add --detach ${DIR} ${ref}`);

// The build needs the same environment the real one gets.
if (fs.existsSync(".env.local")) fs.copyFileSync(".env.local", `${DIR}/.env.local`);

let failed = false;
try {
  const out = run("npx next build", { cwd: DIR, maxBuffer: 32 * 1024 * 1024 });
  const compiled = /Compiled successfully/.test(out);
  const routes = (out.match(/^[├└]/gm) || []).length;
  console.log(compiled ? `build OK — ${routes} routes` : "build finished without the success line:\n" + out.slice(-2000));
  failed = !compiled;
} catch (err) {
  failed = true;
  const output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  const interesting = output
    .split("\n")
    .filter((l) => /error|Error|Type error|Module not found|doesn't exist|Failed/.test(l))
    .slice(0, 20);
  console.error(`build FAILED for ${ref}:\n` + (interesting.join("\n") || output.slice(-2000)));
}

cleanup();
process.exit(failed ? 1 : 0);
