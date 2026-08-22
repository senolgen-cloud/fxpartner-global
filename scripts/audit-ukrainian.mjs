// Finds the mistakes a Turkish→Ukrainian machine translation actually makes,
// so a native reviewer reads a list instead of 45,000 words.
//
//   node scripts/audit-ukrainian.mjs            # report
//   node scripts/audit-ukrainian.mjs --json     # machine-readable
//
// The dominant failure is Russian bleeding in: the model has far more Russian
// than Ukrainian in its training data and the languages are close enough that
// a Russian word lands without looking broken. "была" instead of "була" is
// the one that got through by hand.
//
// Three checks, cheapest first:
//   1. Letters that exist in Russian and not in Ukrainian at all — ы, э, ъ,
//      and ё. Any of these is a certain error.
//   2. A word list of Russian forms whose Ukrainian equivalents differ.
//   3. Untranslated leftovers: strings still carrying Turkish-only letters.

import fs from "node:fs";

const JSON_OUT = process.argv.includes("--json");

const FILES = [
  ["broker", "src/data/i18n/uk/brokers.json"],
  ["blog", "src/data/i18n/uk/blog.json"],
  ["chrome", "src/data/i18n/uk/chrome.json"],
  ["ui", "src/data/i18n/uk/ui.json"],
];

// Letters Ukrainian does not use.
const RUSSIAN_LETTERS = /[ыъэё]/i;

// Russian forms with a different Ukrainian equivalent. Kept to words that are
// unambiguous — no Ukrainian text should contain them.
const RUSSIAN_WORDS = [
  ["была", "була"],
  ["были", "були"],
  ["было", "було"],
  ["этот", "цей"],
  ["это", "це"],
  ["или", "або"],
  ["если", "якщо"],
  ["который", "який"],
  ["которые", "які"],
  ["очень", "дуже"],
  ["сейчас", "зараз"],
  ["всегда", "завжди"],
  ["только", "лише"],
  ["может", "може"],
  ["нужно", "потрібно"],
  ["сколько", "скільки"],
  ["деньги", "гроші"],
  ["счет", "рахунок"],
  ["счета", "рахунку"],
  ["рынок", "ринок"],
  ["рынке", "ринку"],
  ["торговый", "торговий"],
  ["условия", "умови"],
  ["время", "час"],
  ["вопрос", "питання"],
  ["ответ", "відповідь"],
];

const TURKISH_ONLY = /[ğışĞİŞ]/;

const findings = [];

for (const [label, path] of FILES) {
  if (!fs.existsSync(path)) continue;
  const data = JSON.parse(fs.readFileSync(path, "utf8"));

  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "string" || !value.trim()) continue;

    const letter = value.match(RUSSIAN_LETTERS);
    if (letter) {
      findings.push({ set: label, key, issue: `Russian letter "${letter[0]}"`, text: value, severity: "certain" });
      continue;
    }

    const word = RUSSIAN_WORDS.find(([ru]) => new RegExp(`(^|[^а-яіїєґ])${ru}([^а-яіїєґ]|$)`, "i").test(value));
    if (word) {
      findings.push({
        set: label,
        key,
        issue: `Russian word "${word[0]}" — Ukrainian is "${word[1]}"`,
        text: value,
        severity: "certain",
      });
      continue;
    }

    if (TURKISH_ONLY.test(value)) {
      findings.push({ set: label, key, issue: "still contains Turkish letters", text: value, severity: "likely" });
    }
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const certain = findings.filter((f) => f.severity === "certain");
  const likely = findings.filter((f) => f.severity === "likely");
  console.log(`${findings.length} strings to review — ${certain.length} certain, ${likely.length} likely\n`);
  for (const f of findings.slice(0, 60)) {
    console.log(`[${f.set}] ${f.key}`);
    console.log(`  ${f.issue}`);
    console.log(`  ${f.text.slice(0, 160)}${f.text.length > 160 ? "…" : ""}\n`);
  }
  if (findings.length > 60) console.log(`… and ${findings.length - 60} more (use --json)`);
}

process.exit(findings.length ? 1 : 0);
