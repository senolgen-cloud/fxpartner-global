// Should this string be in the catalogue?
//
// The extractors used to answer by looking for ç, ğ, ı, ö, ş or ü. That is a
// fast test and a badly incomplete one: "FX Sinyalleri", "Yapay Zeka
// Analizi", "Spread ve swap, yan yana" and "MT4, MT5, cTrader test edildi"
// are all Turkish and all written entirely in ASCII. They were invisible to
// every extractor, which is how a page could report zero leaks and still
// render Turkish.
//
// The fix is not a better language detector. When a constant is already
// wrapped in trData() or read through tr(), the intent is declared — someone
// decided that table is copy. So take everything in it that reads as copy
// rather than as an identifier, whatever language it happens to be in. A
// string that is already English simply translates to itself.
//
// Language guessing is left to the one place that has to guess: the audit
// that looks for strings nobody has wrapped yet, where a diacritic is a hint
// rather than a verdict.

/** Letters only Turkish uses. A hint, not a test — see the note above. */
export const TURKISH_DIACRITICS = /[çğıöşüÇĞİÖŞÜ]/;

/**
 * True when a string is prose a reader would see, rather than an identifier
 * the code uses.
 *
 * Rejects slugs, keys, class names, hex colours, bare codes and paths. Keeps
 * anything with a space, a capital followed by lowercase, or punctuation
 * that belongs to a sentence.
 */
export function looksLikeCopy(text) {
  if (typeof text !== "string") return false;
  const s = text.trim();
  if (s.length < 2) return false;

  // Identifier shapes: slug-case, snake_case, dotted paths, bare codes.
  if (/^[a-z0-9_.-]+$/.test(s)) return false;
  if (/^[A-Z0-9_]+$/.test(s) && !s.includes(" ")) return false;
  // Colours, URLs, paths, mime types, CSS values.
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return false;
  if (/^(https?:|mailto:|\/|\.\/|\.\.\/)/.test(s)) return false;
  if (/^[\d\s.,:%+\-$€₺/]+$/.test(s)) return false;

  // Prose: has a space, or is a capitalised word longer than three letters.
  return s.includes(" ") || /^[A-ZÇĞİÖŞÜ][a-zçğıöşü]{3,}$/.test(s);
}
