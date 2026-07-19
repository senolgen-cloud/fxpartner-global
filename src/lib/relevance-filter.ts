import type { NewsItem } from "./news";

// Keyword-based relevance filter. MarketWatch/CNBC/Investing.com cover
// general business news; we only want the subset that actually matters
// to a forex/CFD trading audience (rates, central banks, currencies,
// commodities, macro data). No LLM judgment call here on purpose — a
// fixed keyword list is deterministic and auditable.
const KEYWORDS = [
  "dollar", "usd", "fed", "federal reserve", "fomc", "ecb",
  "european central bank", "boj", "bank of japan", "boe", "bank of england",
  "interest rate", "rate cut", "rate hike", "inflation", "cpi", "ppi",
  "gold", "silver", "oil", "crude", "opec", "currency", "currencies",
  "forex", "fx ", "euro", "pound", "sterling", "yen", "yuan", "lira",
  "franc", "bitcoin", "crypto", "treasury", "bond yield", "yields",
  "jobless", "payroll", "unemployment", "gdp", "recession", "central bank",
  "powell", "lagarde", "trade deficit", "tariff", "stimulus", "rate decision",
];

export function isForexRelevant(item: Pick<NewsItem, "title" | "description">): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return KEYWORDS.some((k) => text.includes(k));
}

export function filterRelevantNews(items: NewsItem[]): NewsItem[] {
  return items.filter(isForexRelevant);
}
