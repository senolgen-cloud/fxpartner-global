import { intlLocale, type Locale } from "@/lib/i18n";

// ISO 3166-1 alpha-2 code -> flag emoji, via regional indicator symbols.
export function flagEmoji(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const code = countryCode.toUpperCase();
  const points = [...code].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export type Country = { code: string; name: string };

// The handful worth putting above the line, in the order they matter to this
// audience. Everything else follows alphabetically — this is about saving a
// scroll for most readers, not about ranking countries.
const PINNED = ["TR", "UA", "DE", "GB", "US", "AE"];

/**
 * Every country the runtime can name, in the reader's language.
 *
 * The list used to be sixteen countries typed out by hand with English
 * names, which had two problems the moment the site grew a Ukrainian tree: a
 * reader on /ua could not select Ukraine, and the ones they could select
 * were labelled "Turkey" and "Germany" on a page that was otherwise entirely
 * in Ukrainian.
 *
 * Codes are discovered rather than listed. Intl.DisplayNames with
 * fallback "none" returns undefined for anything that is not a real region,
 * so walking AA–ZZ and keeping what it names gives the full set without a
 * hardcoded table that goes stale — and the names come out translated for
 * free. Sorting uses the locale's own collator, because alphabetical order
 * is not the same question in Latin and Cyrillic.
 */
const cache = new Map<Locale, Country[]>();

export function getCountries(locale: Locale): Country[] {
  const cached = cache.get(locale);
  if (cached) return cached;

  const tag = intlLocale[locale];
  const names = new Intl.DisplayNames([tag], { type: "region", fallback: "none" });

  const all: Country[] = [];
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      let name: string | undefined;
      try {
        name = names.of(code);
      } catch {
        continue; // Not a well-formed region subtag.
      }
      // fallback:"none" gives undefined for codes the runtime cannot name —
      // which filters out both nonsense pairs and reserved ranges.
      if (name && name !== code) all.push({ code, name });
    }
  }

  const collator = new Intl.Collator(tag);
  const pinned = PINNED.map((code) => all.find((c) => c.code === code)).filter(
    (c): c is Country => Boolean(c)
  );
  const rest = all
    .filter((c) => !PINNED.includes(c.code))
    .sort((x, y) => collator.compare(x.name, y.name));

  const result = [...pinned, ...rest];
  cache.set(locale, result);
  return result;
}
