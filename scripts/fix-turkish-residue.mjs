// Repairs, by rule, the Turkish words a translation keeps around a number:
// month and weekday names, and units — dolar, milyon, varil, puan, baz puan.
//
//   node scripts/fix-turkish-residue.mjs          # rewrite the catalogues
//   node scripts/fix-turkish-residue.mjs --dry    # report only
//
// The 2026-09-10 market backfill found the model translating a sentence and
// leaving its figures in Turkish: "read on 8 Eylül 2026", "4.487 dolara",
// "18 milyon varile на день", "5 اقتصاديين 100 baz puanlık". Asking the model
// again fixed some and moved others. These words form a closed set, the
// right replacement depends only on the number beside it, and a lookup never
// has a bad day — so they are fixed here, not retranslated.
//
// scripts/translate-market.mjs runs this after every merge, before
// check-echoed-translations, so the scheduled market job gets it for free.
// Run it by hand after any scripts/translate.mjs batch too.
//
// Only en, uk and ar are touched, and only a word standing on its own
// ("Eylül'de" included — the Turkish case suffix goes with it). Proper names
// that contain a Turkish word are safe because the patterns need a digit or
// a date beside the unit.

import fs from "node:fs";

const DRY = process.argv.includes("--dry");
const LOCALES = ["en", "uk", "ar"];
const FILES = ["blog", "brokers", "chrome", "ui"];

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
// Longest first so "Cumartesi" is not read as "Cuma", "Pazartesi" not as "Pazar".
const TR_DAYS = ["Pazartesi","Cumartesi","Çarşamba","Perşembe","Salı","Cuma","Pazar"];
const DAY_INDEX = { Pazartesi: 0, Salı: 1, Çarşamba: 2, Perşembe: 3, Cuma: 4, Cumartesi: 5, Pazar: 6 };

const MONTHS = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  // Ukrainian declines months: genitive after a day number ("5 вересня"),
  // locative after у/в ("у червні"), nominative otherwise.
  ukNom: ["січень","лютий","березень","квітень","травень","червень","липень","серпень","вересень","жовтень","листопад","грудень"],
  ukGen: ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"],
  ukLoc: ["січні","лютому","березні","квітні","травні","червні","липні","серпні","вересні","жовтні","листопаді","грудні"],
};
const DAYS = {
  en: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  uk: ["понеділок","вівторок","середа","четвер","п'ятниця","субота","неділя"],
  ar: ["الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"],
};

const B = "(^|[^\\p{L}])";          // left word boundary (captured)
const E = "(?=[^\\p{L}]|$)";        // right word boundary
const SUFFIX = "(?:['’][a-zçğıöşü]+)?";
// A figure as the site writes it: 4.487 · 5,85 · 4.470-4.500 · 68M+ · %0,9.
// Bold markers may sit between the figure and the unit ("**4.500 dolar**" has
// none, "**4.500** dolar" has one pair).
const NUM = "(\\d[\\d.,]*(?:\\s*[-–]\\s*\\d[\\d.,]*)?(?:[MK]\\+?)?)(\\**\\s*)";

// Ukrainian noun agreement with a number: 1 долар, 2 долари, 5 доларів,
// 5,85 долара (a fraction takes the genitive singular).
function ukForm(num, [one, few, many, frac]) {
  const last = num.replace(/\s/g, "").split(/[-–]/).pop();
  if (/[.,]\d{1,2}$/.test(last) && !/^\d{1,3}(\.\d{3})+$/.test(last)) return frac;
  const n = parseInt(last.replace(/[.,]/g, ""), 10);
  if (Number.isNaN(n)) return many;
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
}
const UK = {
  dollar: ["долар", "долари", "доларів", "долара"],
  point: ["пункт", "пункти", "пунктів", "пункту"],
  bp: ["базисний пункт", "базисні пункти", "базисних пунктів", "базисного пункту"],
  cent: ["цент", "центи", "центів", "цента"],
  share: ["акція", "акції", "акцій", "акції"],
};

// [pattern, replacement(match groups) ] per locale, applied in order. Every
// pattern needs a figure beside the word, except the handful of fixed
// phrases, which are unambiguous on their own.
function unitRules(locale) {
  const re = (s) => new RegExp(s, "gu");
  if (locale === "uk") {
    return [
      [re(`${B}[Dd]olar\\s*/\\s*TL${E}`), (m, p) => `${p}USD/TRY`],
      [re(`${NUM}milyon\\s+varil\\p{L}*${E}`), (m, n, s) => `${n}${s}млн барелів`],
      [re(`${NUM}milyar${E}`), (m, n, s) => `${n}${s}млрд`],
      [re(`${NUM}milyon${E}`), (m, n, s) => `${n}${s}млн`],
      [re(`${NUM}[Dd]olar\\s*/\\s*[Vv]aril\\p{L}*${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.dollar)} за барель`],
      [re(`${NUM}[Dd]olar\\s*/\\s*[Gg]alon\\p{L}*${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.dollar)} за галон`],
      [re(`${NUM}[Dd]olar\\p{L}*${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.dollar)}`],
      [re(`${NUM}baz\\s+puan\\p{L}*${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.bp)}`],
      [re(`${NUM}puan\\p{L}*${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.point)}`],
      [re(`${NUM}sent${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.cent)}`],
      [re(`${NUM}hisse${E}`), (m, n, s) => `${n}${s}${ukForm(n, UK.share)}`],
      [re(`${B}dolar(\\s+(?:long|short))${E}`), (m, p, t) => `${p}долар${t}`],
      [re(`${B}druga${E}`), (m, p) => `${p}друга`],
    ];
  }
  if (locale === "ar") {
    return [
      [re(`${B}[Dd]olar\\s*/\\s*TL${E}`), (m, p) => `${p}USD/TRY`],
      // "5 اقتصاديين 100 baz puanlık خفضاً بمقدار 100 نقطة أساس": the
      // Turkish modifier is a duplicate of the Arabic that follows it.
      [re(`${NUM}baz\\s+puanl[ıi]k\\s+(?=خفض)`), () => ""],
      [re(`${NUM}milyon\\s+varil\\p{L}*${E}`), (m, n, s) => `${n}${s}مليون برميل`],
      [re(`${NUM}milyar${E}`), (m, n, s) => `${n}${s}مليار`],
      [re(`${NUM}milyon${E}`), (m, n, s) => `${n}${s}مليون`],
      [re(`${NUM}[Dd]olar\\s*/\\s*[Vv]aril\\p{L}*${E}`), (m, n, s) => `${n}${s}دولار للبرميل`],
      [re(`${NUM}[Dd]olar\\s*/\\s*[Gg]alon\\p{L}*${E}`), (m, n, s) => `${n}${s}دولار للغالون`],
      [re(`${NUM}[Dd]olar\\p{L}*${E}`), (m, n, s) => `${n}${s}دولار`],
      [re(`${NUM}baz\\s+puan\\p{L}*${E}`), (m, n, s) => `${n}${s}نقطة أساس`],
      [re(`${NUM}puan\\p{L}*${E}`), (m, n, s) => `${n}${s}نقطة`],
      [re(`${NUM}sent${E}`), (m, n, s) => `${n}${s}سنتاً`],
      [re(`${NUM}hisse${E}`), (m, n, s) => `${n}${s}سهماً`],
      [re(`${NUM}ton${E}`), (m, n, s) => `${n}${s}طن`],
      [re(`/ons${E}`), () => `/أونصة`],
      [re(`${B}([Pp]rop)\\s+firma${E}`), (m, p, w) => `${p}${w} firm`],
      [re(`${B}statik\\s+veya${E}`), (m, p) => `${p}static أو`],
      [re(`${B}bazı${E}`), (m, p) => `${p}بعض`],
      [re(`"1:500 kaldıraç"`), () => `"رافعة 1:500"`],
      [re(`${B}kaldıraç${E}`), (m, p) => `${p}الرافعة المالية`],
    ];
  }
  if (locale === "en") {
    return [
      [re(`${NUM}milyon\\s+varil\\p{L}*${E}`), (m, n, s) => `${n}${s}million barrels`],
      [re(`${NUM}milyar${E}`), (m, n, s) => `${n}${s}billion`],
      [re(`${NUM}milyon${E}`), (m, n, s) => `${n}${s}million`],
      [re(`${NUM}[Dd]olar\\p{L}*${E}`), (m, n, s) => `${n}${s}dollars`],
      [re(`${NUM}baz\\s+puan\\p{L}*${E}`), (m, n, s) => `${n}${s}basis points`],
      [re(`${NUM}puan\\p{L}*${E}`), (m, n, s) => `${n}${s}points`],
    ];
  }
  return [];
}

function fixDates(text, locale) {
  let out = text;
  for (const d of TR_DAYS) {
    out = out.replace(new RegExp(`${B}${d}${SUFFIX}${E}`, "gu"), (m, p) => p + DAYS[locale][DAY_INDEX[d]]);
  }
  TR_MONTHS.forEach((m, i) => {
    out = out.replace(new RegExp(`${B}${m}${SUFFIX}${E}`, "gu"), (match, p, offset, whole) => {
      if (locale !== "uk") return p + MONTHS[locale][i];
      const before = whole.slice(0, offset + p.length);
      if (/\d\s*[-–]?\s*\**\s*$/u.test(before)) return p + MONTHS.ukGen[i];
      if (/(^|[^\p{L}])[уУвВ]\s*\**\s*$/u.test(before)) return p + MONTHS.ukLoc[i];
      return p + MONTHS.ukNom[i];
    });
  });
  return out;
}

// "Mart" and "Pazar" are months/days only next to a figure: on their own
// they are the English word "mart" or part of a name, so the date pass skips
// values that merely contain them without one.
const TOUCH = /(^|[^\p{L}])(Ocak|Şubat|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık|Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|\d\s*(Mart|Pazar))|dolar|milyon|milyar|varil|puan|sent|hisse|firma|statik|bazı|kaldıraç|\bton\b|\/ons|druga/iu;

export function fixValue(text, locale) {
  if (!TOUCH.test(text)) return text;
  let out = fixDates(text, locale);
  for (const [re, fn] of unitRules(locale)) out = out.replace(re, fn);
  return out;
}

function main() {
  let total = 0;
  for (const locale of LOCALES) {
    for (const f of FILES) {
      const file = `src/data/i18n/${locale}/${f}.json`;
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, "utf8");
      const cat = JSON.parse(raw);
      let changed = 0;
      for (const [k, v] of Object.entries(cat)) {
        if (typeof v !== "string") continue;
        const fixed = fixValue(v, locale);
        if (fixed === v) continue;
        cat[k] = fixed;
        changed++;
        if (DRY) console.log(`  ${locale}/${f}  ${k.slice(0, 40)}\n      ${v.slice(0, 110)}\n   →  ${fixed.slice(0, 110)}`);
      }
      if (changed && !DRY) {
        let text = JSON.stringify(cat, null, 2) + "\n";
        if (raw.includes("\r\n")) text = text.replace(/\n/g, "\r\n");
        fs.writeFileSync(file, text);
      }
      if (changed) console.log(`${locale}/${f}.json: ${changed} value(s) ${DRY ? "would change" : "fixed"}`);
      total += changed;
    }
  }
  console.log(`turkish residue: ${total} value(s) ${DRY ? "would change" : "fixed"}`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("fix-turkish-residue.mjs")) main();
