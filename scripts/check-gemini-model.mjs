/**
 * Checks that the Gemini model is named in exactly one place.
 *
 *   node scripts/check-gemini-model.mjs
 *
 * It used to be written out in six files, each building the same request URL
 * from its own copy. A model change was six edits, and missing one failed in
 * the way that is hardest to catch: nothing breaks, nothing warns, and one
 * surface keeps calling the old model until somebody notices its output reads
 * differently. src/lib/gemini.ts is now the only place the string lives.
 *
 * Two things are checked, because consolidating created a second way to
 * break it:
 *
 * 1. No file outside gemini.ts contains a model id. A copy pasted back in is
 *    exactly the regression this exists to stop.
 * 2. scripts/lib/gemini.mjs can still read the value. The scripts are plain
 *    .mjs and cannot import TypeScript, so they parse the constant out of
 *    gemini.ts — a coupling to that file's shape which would otherwise only
 *    announce itself the next time somebody ran a translation.
 */
import fs from "node:fs";
import path from "node:path";

const SOURCE = "src/lib/gemini.ts";
// Deliberately matches any Gemini model id, not just today's. A copy pasted
// back in is usually a *different* version, which is the whole problem.
const MODEL_ID = /"(gemini-[a-z0-9.-]+)"/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const problems = [];

if (!fs.existsSync(SOURCE)) {
  problems.push(`${SOURCE} is missing — the model has no single home`);
} else if (!MODEL_ID.test(fs.readFileSync(SOURCE, "utf8"))) {
  problems.push(`${SOURCE} does not name a model`);
}

for (const file of [...walk("src"), ...walk("scripts")]) {
  if (file === SOURCE) continue;
  const match = fs.readFileSync(file, "utf8").match(MODEL_ID);
  if (match) problems.push(`${file}: names the model directly (${match[1]}) — import it from ${SOURCE}`);
}

// The scripts' reader, exercised rather than assumed.
try {
  const { GEMINI_MODEL } = await import("./lib/gemini.mjs");
  const declared = fs.readFileSync(SOURCE, "utf8").match(MODEL_ID)?.[1];
  if (GEMINI_MODEL !== declared) {
    problems.push(
      `scripts/lib/gemini.mjs read "${GEMINI_MODEL}" but ${SOURCE} declares "${declared}"`
    );
  }
} catch (err) {
  problems.push(`scripts/lib/gemini.mjs could not read the model: ${err.message}`);
}

if (problems.length) {
  console.error("gemini model:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`gemini model: named once, in ${SOURCE}, and readable from scripts`);
