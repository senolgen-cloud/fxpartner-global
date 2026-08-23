// Translates the bulletins that were published before translation existed.
//
//   node scripts/backfill-bulletin-translations.mjs --dry
//   node scripts/backfill-bulletin-translations.mjs
//   node scripts/backfill-bulletin-translations.mjs --limit 5
//
// The cron translates from now on; this is for the archive. Rows are done
// one at a time and written as they go, so an interrupted run loses at most
// one bulletin's work and a rerun picks up where it stopped — it only ever
// selects rows whose translations column is still null.
//
// Reads DATABASE_URL from .env.local, same as the app.

import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;

function readEnv(name) {
  const line = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).find((l) => l.startsWith(name + "="));
  if (!line) throw new Error(`${name} not found in .env.local`);
  let v = line.slice(name.length + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v;
}

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const LOCALE_NAMES = { ua: "Ukrainian (українська)", en: "English" };
const DO_NOT_TRANSLATE = [
  "FXPARTNER", "XM Global", "Lite Finance", "FxPro", "AvaTrade", "IC Markets",
  "MultiBank Group", "Tickmill", "Exness", "Bybit", "MT4", "MT5", "cTrader",
  "ASIC", "CySEC", "FCA", "BaFin", "MAS", "SCA", "CIMA", "FMA", "DFSA", "FSC",
  "FSA", "SPK", "Fed", "FOMC", "ECB", "Telegram", "MetaTrader",
];

// Kept identical to src/lib/translateContent.ts on purpose: the archive
// should read the same as what the cron writes tomorrow.
function prompt(locale, copy) {
  return `You are translating a Turkish financial-news bulletin into ${LOCALE_NAMES[locale] ?? locale}.

RULES — breaking any of these makes the output unusable:
1. Return a JSON object with exactly the keys "title", "excerpt" and "body". Nothing else.
2. Never invent, round, convert or drop a number: prices, percentages, dates, basis points and index levels stay byte-for-byte identical.
3. Keep these terms exactly as written: ${DO_NOT_TRANSLATE.join(", ")}.
4. Preserve the paragraph breaks in "body" exactly as they appear.
5. Keep the register: factual news prose. Do not add analysis, predictions, enthusiasm or a call to action that is not in the source.
6. A risk disclaimer must stay a risk disclaimer. Never soften, shorten or omit one.
7. Translate nothing that is a proper noun, a ticker or a currency pair.

INPUT:
${JSON.stringify(copy, null, 1)}`;
}

async function translateOne(apiKey, locale, copy) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(locale, copy) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    console.error(`  ${locale}: Gemini ${res.status}`);
    return null;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed.title?.trim() || !parsed.excerpt?.trim() || !parsed.body?.trim()) return null;
    return { title: parsed.title, excerpt: parsed.excerpt, body: parsed.body };
  } catch {
    return null;
  }
}

// Numbers are the one thing a financial bulletin cannot afford to lose.
function digitsOf(text) {
  return (text.match(/\d[\d.,]*/g) ?? []).map((d) => d.replace(/[.,]$/, "")).sort();
}

const sql = neon(readEnv("DATABASE_URL"));
const apiKey = readEnv("GEMINI_API_KEY");

const rows = await sql`
  SELECT id, slug, title, excerpt, body
  FROM news_bulletin
  WHERE translations IS NULL
  ORDER BY published_at DESC
`;

console.log(`${rows.length} bulletin(s) without translations`);
if (DRY) {
  for (const r of rows.slice(0, 10)) console.log(`  ${r.slug}`);
  process.exit(0);
}

let done = 0;
let skipped = 0;

for (const row of rows.slice(0, LIMIT)) {
  const copy = { title: row.title, excerpt: row.excerpt, body: row.body };
  const out = {};
  for (const locale of ["ua", "en"]) {
    const value = await translateOne(apiKey, locale, copy);
    if (!value) continue;
    const before = digitsOf(copy.title + " " + copy.body);
    const after = digitsOf(value.title + " " + value.body);
    if (before.join("|") !== after.join("|")) {
      console.error(`  ${row.slug} [${locale}]: numbers changed, dropping this locale`);
      continue;
    }
    out[locale] = value;
  }

  if (!Object.keys(out).length) {
    console.error(`  ${row.slug}: no locale succeeded, left null`);
    skipped++;
    continue;
  }

  await sql`UPDATE news_bulletin SET translations = ${JSON.stringify(out)} WHERE id = ${row.id}`;
  done++;
  console.log(`  ${done}/${rows.length}  ${row.slug}  [${Object.keys(out).join(", ")}]`);
}

console.log(`\n${done} translated, ${skipped} left for a rerun`);
