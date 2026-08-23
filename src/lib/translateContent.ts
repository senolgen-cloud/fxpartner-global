import { locales, defaultLocale, type Locale } from "@/lib/i18n";

// Translation for content that is written by a job rather than by a person.
//
// The static catalogue (src/data/i18n) cannot reach anything generated at
// runtime: a news bulletin composed at 07:00 has no entry, and never will.
// So the job that writes it translates it, once, and stores the result
// alongside the Turkish. A reader never waits on a model, and a bad
// translation can be corrected by editing a row.
//
// Same model and the same rules as scripts/translate.mjs, because the
// output lands in the same place a reader looks: numbers survive
// byte-for-byte, proper nouns stay, and a risk disclaimer stays a risk
// disclaimer.

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LOCALE_NAMES: Record<string, string> = {
  ua: "Ukrainian (українська)",
  en: "English",
};

const DO_NOT_TRANSLATE = [
  "FXPARTNER", "XM Global", "Lite Finance", "FxPro", "AvaTrade", "IC Markets",
  "MultiBank Group", "Tickmill", "Exness", "Bybit", "MT4", "MT5", "cTrader",
  "ASIC", "CySEC", "FCA", "BaFin", "MAS", "SCA", "CIMA", "FMA", "DFSA", "FSC",
  "FSA", "SPK", "Fed", "FOMC", "ECB", "Telegram", "MetaTrader",
];

/** The shape a bulletin exposes to a reader. */
export type BulletinCopy = { title: string; excerpt: string; body: string };

/** What gets stored next to the Turkish, keyed by locale. */
export type ContentTranslations = Partial<Record<Locale, BulletinCopy>>;

function prompt(locale: string, copy: BulletinCopy): string {
  const target = LOCALE_NAMES[locale] ?? locale;
  return `You are translating a Turkish financial-news bulletin into ${target}.

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

async function translateOne(apiKey: string, locale: string, copy: BulletinCopy): Promise<BulletinCopy | null> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(locale, copy) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    console.error(`translateContent: Gemini ${res.status} for ${locale}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    console.error(`translateContent: no text in Gemini response for ${locale}`);
    return null;
  }

  try {
    const parsed = JSON.parse(text) as Partial<BulletinCopy>;
    if (!parsed.title?.trim() || !parsed.excerpt?.trim() || !parsed.body?.trim()) {
      console.error(`translateContent: incomplete translation for ${locale}`);
      return null;
    }
    return { title: parsed.title, excerpt: parsed.excerpt, body: parsed.body };
  } catch {
    console.error(`translateContent: unparseable JSON for ${locale}`);
    return null;
  }
}

/**
 * Translates one bulletin into every locale but the source.
 *
 * A locale that fails is left out rather than stored half-done — the reader
 * falls back to Turkish, which is what they saw before this existed, and a
 * backfill can fill the hole later. The bulletin publishes either way: a
 * translation failure must never stop the news going out.
 */
export async function translateBulletin(copy: BulletinCopy): Promise<ContentTranslations> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("translateContent: GEMINI_API_KEY not set — bulletin stays Turkish only");
    return {};
  }

  const targets = locales.filter((l) => l !== defaultLocale);
  const results = await Promise.all(
    targets.map(async (locale) => [locale, await translateOne(apiKey, locale, copy)] as const)
  );

  const out: ContentTranslations = {};
  for (const [locale, value] of results) if (value) out[locale] = value;

  const missing = targets.filter((l) => !out[l]);
  if (missing.length) console.error(`translateContent: no translation for ${missing.join(", ")}`);
  return out;
}

/**
 * Reads the stored translation for a locale, falling back to the Turkish.
 *
 * Fallback is per bulletin, not per field: a row translated before a field
 * existed would otherwise render half in each language, which reads worse
 * than one consistent language.
 */
export function pickTranslation(
  raw: string | null | undefined,
  locale: Locale,
  fallback: BulletinCopy
): BulletinCopy {
  if (locale === defaultLocale || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as ContentTranslations;
    const value = parsed?.[locale];
    if (value?.title?.trim() && value.excerpt?.trim() && value.body?.trim()) return value;
  } catch {
    // A malformed column is a data problem, not a reason to fail the page.
    console.error("pickTranslation: could not parse translations column");
  }
  return fallback;
}
