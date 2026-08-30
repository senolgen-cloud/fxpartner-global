/**
 * The Gemini model, read out of src/lib/gemini.ts rather than restated here.
 *
 * The scripts are plain .mjs and run under bare `node`, so they cannot import
 * the TypeScript module the app uses. Copying the string would defeat the
 * whole point of consolidating it — two places is not one place, and the
 * second one is exactly the one that gets forgotten.
 *
 * So it is read at startup. A regex over a two-line constant is not elegant,
 * but it is honest: the value lives in one file and everything else asks that
 * file. If the shape of gemini.ts changes this throws immediately and loudly,
 * which is the right failure — a script that silently falls back to a guessed
 * model name would be worse than one that refuses to start.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Relative to this file, not to cwd: these scripts are run from the repo root
// today, and that is a habit rather than a guarantee.
const SOURCE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/lib/gemini.ts"
);

function readModel() {
  const source = fs.readFileSync(SOURCE, "utf8");
  const match = source.match(/export const GEMINI_MODEL = "([^"]+)";/);
  if (!match) {
    throw new Error(
      `could not read GEMINI_MODEL from ${SOURCE} — has the file changed shape?`
    );
  }
  return match[1];
}

export const GEMINI_MODEL = readModel();

export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
