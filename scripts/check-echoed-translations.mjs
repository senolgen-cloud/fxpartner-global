// Fails when a translation catalogue still holds Turkish prose.
//
//   node scripts/check-echoed-translations.mjs
//
// scripts/translate.mjs guards the numbers — it will not let a price, a
// spread or a licence number change on the way through — but it never
// checks that anything was translated at all. When the model echoes a
// string back unchanged the batch still reports success, the value lands in
// the catalogue, and nothing downstream notices: tr() finds an entry, so
// the fallback that would have shown Turkish anyway never fires and the
// page looks translated to every automated check we have.
//
// On 9 Eylül 2026 that put a Turkish risk disclaimer on the Arabic tree —
// "yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir" —
// and left one article title untranslated in Ukrainian. Seven strings in
// all. They were not random: every one was either a number-dense cost line
// or boilerplate legal text, the shapes a model is most likely to read as
// "code, do not touch". Boilerplate legal text is also the worst possible
// thing to leave in a language the reader does not speak.
//
// WHY FUNCTION WORDS AND NOT DIACRITICS. Turkish letters alone would flag
// every correct translation that keeps a proper noun: "Nilüfer Altundağ",
// "TSİ", "İntegral Yatırım" all belong in English and Arabic copy exactly
// as they are. A Turkish function word — ve, için, değildir — appears only
// when the SENTENCE is still Turkish, which is the thing being looked for.
//
// This is a smoke alarm, not a proof. A short echoed fragment with no
// function word in it slips through, and so does a mistranslation, which no
// amount of pattern matching would catch. It exists to make the specific
// silent failure above loud.

import fs from "node:fs";

const LOCALES = ["en", "uk", "ar"];
const FILES = ["blog", "brokers", "chrome", "ui"];

// Words a Turkish sentence long enough to matter almost always contains,
// and which would be strange to find inside English, Ukrainian or Arabic
// copy.
//
// FUNCTION WORDS AND VERB FORMS ONLY — no nouns. The first version of this
// list included "yatırım", which fired on three correctly translated
// English and Arabic strings because they quote a Turkish brokerage by its
// registered name: "the real, SPK-regulated QNB Yatırım Menkul Değerler".
// A noun travels into other languages inside proper names; "için" and
// "değildir" do not travel anywhere.
const TURKISH_SENTENCE =
  /(^|[^\p{L}])(ve|ile|için|bir|bu|değildir|değil|olarak|içerir|amaçlıdır|tavsiyesi|başına|kaybedebilirsiniz|hesabınızın|olabilir|gerekir|bulunur|yapılır)([^\p{L}]|$)/iu;

const findings = [];

for (const locale of LOCALES) {
  for (const file of FILES) {
    const path = `src/data/i18n/${locale}/${file}.json`;
    if (!fs.existsSync(path)) continue;
    const catalogue = JSON.parse(fs.readFileSync(path, "utf8"));

    for (const [key, value] of Object.entries(catalogue)) {
      const text = String(value);
      if (!TURKISH_SENTENCE.test(text)) continue;
      findings.push({ locale, file, key, text });
    }
  }
}

if (findings.length) {
  console.error(
    `${findings.length} catalogue value(s) still read as Turkish — the model almost certainly\n` +
      `echoed the source back instead of translating it:\n`
  );
  for (const f of findings.slice(0, 25)) {
    console.error(`  ${f.locale}/${f.file}.json  ${f.key}`);
    console.error(`      ${f.text.slice(0, 100)}`);
  }
  if (findings.length > 25) console.error(`  … +${findings.length - 25} more`);
  console.error(
    `\n  fix: collect those keys' Turkish source into a small bag and run\n` +
      `       scripts/translate.mjs on it again. A short batch of exactly the\n` +
      `       stubborn strings gets translated where the same strings buried in a\n` +
      `       batch of twenty-five did not.\n`
  );
  process.exit(1);
}

const counted = LOCALES.length * FILES.length;
console.log(`no echoed translations: ${counted} catalogue file(s) checked`);
