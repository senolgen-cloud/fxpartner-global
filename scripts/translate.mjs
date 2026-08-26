// Translates a JSON bag of Turkish strings into a target locale with Gemini,
// for the /ua and /en trees. Run locally, commit the output: translation
// happens once at authoring time, never per request, so a visitor never waits
// on a model and a bad translation can be fixed by editing a file.
//
//   node scripts/translate.mjs --in tmp/sample.tr.json --out tmp/sample.uk.json --locale uk
//
// Input and output are flat objects of { key: string }. Keys are never
// touched; only values are translated, and the model is told to return the
// same keys so a dropped entry is detectable rather than silent.
//
// This is deliberately not wired into the build. Editorial copy about
// regulation and costs gets read by a human before it goes live — the
// pipeline's job is to remove the typing, not the judgement.

import fs from "node:fs";
import path from "node:path";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Enough strings per call to keep it cheap, few enough that one bad batch is
// cheap to retry and stays well inside the output token budget.
const BATCH_SIZE = 25;

const LOCALE_NAMES = {
  uk: "Ukrainian (українська)",
  ar: "Arabic (العربية), Modern Standard Arabic as written for a Gulf/UAE readership",
  en: "English",
  ru: "Russian (русский)",
  de: "German (Deutsch)",
};

// Terms that must survive untranslated. Broker and regulator names are
// proper nouns — a "Кіпрська комісія" instead of CySEC breaks both the
// reader's ability to verify a licence and our own search relevance.
const DO_NOT_TRANSLATE = [
  "FXPARTNER",
  "MultiBank Group",
  "XM Global",
  "Lite Finance",
  "FxPro",
  "AvaTrade",
  "IC Markets",
  "Tickmill",
  "Exness",
  "Bybit",
  "MT4",
  "MT5",
  "cTrader",
  "WebTrader",
  "ASIC",
  "CySEC",
  "FCA",
  "BaFin",
  "MAS",
  "SCA",
  "CIMA",
  "FMA",
  "VARA",
  "DFSA",
  "FSC",
  "FSA",
  "AUSTRAC",
  "ECN",
  "STP",
  "IB",
  "KYC",
  "Telegram",
  "MetaTrader",
];

function readEnv(name) {
  const line = fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(name + "="));
  if (!line) throw new Error(`${name} not found in .env.local`);
  let v = line.slice(name.length + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v;
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

function buildPrompt(locale, batch) {
  const target = LOCALE_NAMES[locale] ?? locale;
  return `You are translating a Turkish financial-education website into ${target}.

RULES — breaking any of these makes the output unusable:
1. Translate ONLY the values. Return the SAME keys, all of them, nothing added or dropped.
2. Never invent, round, convert or drop a number: prices, spreads like "0.8 pip", leverage like "1:1000", deposits like "$50", licence numbers like "416279", percentages and dates stay byte-for-byte identical.
3. Keep these terms exactly as written, untranslated: ${DO_NOT_TRANSLATE.join(", ")}.
4. Preserve any HTML tags, markdown, emoji, and placeholders such as {name} or \${value} exactly as they appear, including their position relative to the text.
5. Keep the register: plain, factual, second person where the Turkish is. This is regulated-industry copy — do not add enthusiasm, promises, guarantees or calls to action that are not in the source.
6. A risk disclaimer must stay a risk disclaimer. Never soften, shorten or omit one.
7. If a value is a proper noun, a URL, a slug or a code, return it unchanged.

Return ONLY a JSON object mapping every input key to its translated string. No prose, no code fences.

INPUT:
${JSON.stringify(batch, null, 1)}`;
}

async function translateBatch(apiKey, locale, batch) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(locale, batch) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text: " + JSON.stringify(data).slice(0, 300));

  const parsed = JSON.parse(text);
  const missing = Object.keys(batch).filter((k) => typeof parsed[k] !== "string");
  if (missing.length) throw new Error(`Missing keys in response: ${missing.slice(0, 5).join(", ")}`);
  return parsed;
}

// Numbers are where a translation model does the most damage the eye skips
// over, so every batch is checked: the digit sequence of the translation has
// to match the source's, in order.
function digitsOf(s) {
  return (s.match(/\d+(?:[.,]\d+)?/g) || []).join(" ");
}

async function main() {
  const inPath = arg("--in");
  const outPath = arg("--out");
  const locale = arg("--locale");
  if (!inPath || !outPath || !locale) {
    console.error("usage: node scripts/translate.mjs --in <file.json> --out <file.json> --locale <uk|en>");
    process.exit(1);
  }

  const apiKey = readEnv("GEMINI_API_KEY");
  const source = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const keys = Object.keys(source);
  const out = {};
  const warnings = [];

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const slice = keys.slice(i, i + BATCH_SIZE);
    const batch = Object.fromEntries(slice.map((k) => [k, source[k]]));
    process.stderr.write(`  ${locale}: ${i + slice.length}/${keys.length}\r`);

    let translated;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        translated = await translateBatch(apiKey, locale, batch);
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }

    for (const k of slice) {
      out[k] = translated[k];
      if (digitsOf(source[k]) !== digitsOf(translated[k])) {
        warnings.push({ key: k, source: digitsOf(source[k]), translated: digitsOf(translated[k]) });
      }
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  process.stderr.write("\n");
  console.log(`wrote ${outPath} (${keys.length} strings)`);

  if (warnings.length) {
    console.log(`\nNUMBER MISMATCHES — check these ${warnings.length} by hand:`);
    for (const w of warnings.slice(0, 20)) {
      console.log(`  ${w.key}\n    tr: ${w.source}\n    ${locale}: ${w.translated}`);
    }
  } else {
    console.log("every string's numbers survived unchanged");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
