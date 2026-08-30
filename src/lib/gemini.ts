/**
 * The one place the Gemini model is named.
 *
 * It used to be written out in six files — the assistant route, the bulletin
 * writer, the education writer, the content translator and two scripts — each
 * with its own copy of the same string and the same URL built from it. A
 * model change was therefore six edits, and the failure mode of missing one
 * was the worst kind: nothing breaks, nothing warns, and one surface quietly
 * keeps calling the old model until somebody notices the output reads
 * differently.
 *
 * Owned by the AI assistant department (see lib/departments.ts). Not because
 * the assistant is the biggest caller — it is not — but because deciding
 * which model the site talks to is one decision, and it needs one owner.
 *
 * scripts/lib/gemini.mjs reads the value out of this file rather than
 * restating it, because the scripts are plain .mjs and cannot import
 * TypeScript. That keeps this the only place the string is written; the
 * check in scripts/check-gemini-model.mjs makes sure it stays that way.
 */
export const GEMINI_MODEL = "gemini-3.6-flash";

export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
