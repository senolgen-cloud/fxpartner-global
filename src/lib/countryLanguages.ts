// Country -> language mapping for auto-translation (Google Translate widget)
// and the language switcher UI. ISO 3166-1 alpha-2 country codes as keys,
// matching what Vercel sends in the `x-vercel-ip-country` request header.
//
// Language codes are Google Translate's own codes (mostly ISO 639-1;
// "zh-CN" is Google's specific code for Simplified Chinese).

export interface CountryOption {
  code: string; // ISO 3166-1 alpha-2
  name: string; // English display name
  flag: string; // flag emoji
  lang: string; // Google Translate language code
}

// The switcher's visible list — one entry per country, several countries
// can point at the same language (e.g. every Spanish-speaking country).
export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", name: "United States", flag: "🇺🇸", lang: "en" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lang: "en" },
  { code: "AU", name: "Australia", flag: "🇦🇺", lang: "en" },
  { code: "CA", name: "Canada", flag: "🇨🇦", lang: "en" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", lang: "en" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", lang: "en" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", lang: "en" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", lang: "en" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", lang: "en" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", lang: "en" },
  { code: "IN", name: "India", flag: "🇮🇳", lang: "en" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", lang: "en" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lang: "en" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", lang: "tr" },
  { code: "DE", name: "Germany", flag: "🇩🇪", lang: "de" },
  { code: "FR", name: "France", flag: "🇫🇷", lang: "fr" },
  { code: "ES", name: "Spain", flag: "🇪🇸", lang: "es" },
  { code: "IT", name: "Italy", flag: "🇮🇹", lang: "it" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", lang: "nl" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", lang: "pt" },
  { code: "RU", name: "Russia", flag: "🇷🇺", lang: "ru" },
  { code: "PL", name: "Poland", flag: "🇵🇱", lang: "pl" },
  { code: "GR", name: "Greece", flag: "🇬🇷", lang: "el" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", lang: "es" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", lang: "es" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", lang: "es" },
  { code: "PE", name: "Peru", flag: "🇵🇪", lang: "es" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", lang: "es" },
  { code: "CL", name: "Chile", flag: "🇨🇱", lang: "es" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lang: "pt" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", lang: "ar" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", lang: "ar" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", lang: "ar" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", lang: "ar" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", lang: "ar" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", lang: "ar" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", lang: "id" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", lang: "ms" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", lang: "vi" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", lang: "th" },
  { code: "JP", name: "Japan", flag: "🇯🇵", lang: "ja" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", lang: "ko" },
  { code: "CN", name: "China", flag: "🇨🇳", lang: "zh-CN" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", lang: "zh-TW" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", lang: "zh-TW" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", lang: "bn" },
];

// Countries whose visitors get auto-switched on first visit. Keyed by
// ISO country code (from Vercel's x-vercel-ip-country header), value is
// the Google Translate language code. Countries not listed here (or
// mapped to "en") are left on the original English content.
export const COUNTRY_TO_LANG: Record<string, string> = Object.fromEntries(
  COUNTRY_OPTIONS.filter((c) => c.lang !== "en").map((c) => [c.code, c.lang])
);

export function getCountryOption(lang: string): CountryOption | undefined {
  return COUNTRY_OPTIONS.find((c) => c.lang === lang);
}
