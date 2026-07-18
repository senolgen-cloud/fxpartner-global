export type TickerPair = {
  symbol: string;
  value: string;
  delta: string | null;
  up: boolean | null;
};

const FX_SYMBOLS = ["EUR", "GBP", "JPY", "TRY", "CHF", "AUD"] as const;
const SYMBOL_ORDER = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/TRY",
  "XAU/USD",
  "USD/CHF",
  "AUD/USD",
  "BTC/USD",
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pctChange(curr: number, prior: number) {
  if (!prior) return 0;
  return ((curr - prior) / prior) * 100;
}

function formatDelta(change: number) {
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return res.json();
}

// Real ECB-sourced FX reference rates (Frankfurter, no API key required).
async function getFxPairs(): Promise<TickerPair[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  const url = `https://api.frankfurter.dev/v1/${isoDate(start)}..${isoDate(end)}?base=USD&symbols=${FX_SYMBOLS.join(",")}`;
  const data = await fetchJson(url);

  const dates = Object.keys(data.rates).sort();
  const latestDate = dates[dates.length - 1];
  const prevDate = dates.length > 1 ? dates[dates.length - 2] : latestDate;
  const latest = data.rates[latestDate];
  const prev = data.rates[prevDate];

  const inverse = [
    { symbol: "EUR/USD", key: "EUR", decimals: 4 },
    { symbol: "GBP/USD", key: "GBP", decimals: 4 },
    { symbol: "AUD/USD", key: "AUD", decimals: 4 },
  ];
  const direct = [
    { symbol: "USD/JPY", key: "JPY", decimals: 2 },
    { symbol: "USD/TRY", key: "TRY", decimals: 3 },
    { symbol: "USD/CHF", key: "CHF", decimals: 4 },
  ];

  const results: TickerPair[] = [];
  for (const { symbol, key, decimals } of inverse) {
    const curr = 1 / latest[key];
    const change = pctChange(curr, 1 / prev[key]);
    results.push({ symbol, value: curr.toFixed(decimals), delta: formatDelta(change), up: change >= 0 });
  }
  for (const { symbol, key, decimals } of direct) {
    const curr = latest[key];
    const change = pctChange(curr, prev[key]);
    results.push({ symbol, value: curr.toFixed(decimals), delta: formatDelta(change), up: change >= 0 });
  }
  return results;
}

// Real-time spot gold price (gold-api.com, no API key required). No
// historical endpoint is available on the free tier, so no delta.
async function getGold(): Promise<TickerPair> {
  const data = await fetchJson("https://api.gold-api.com/price/XAU");
  return {
    symbol: "XAU/USD",
    value: Number(data.price).toFixed(1),
    delta: null,
    up: null,
  };
}

// Real-time BTC/USD with real 24h change (CoinGecko public API, no API key required).
async function getBtc(): Promise<TickerPair> {
  const data = await fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
  );
  const change = data.bitcoin.usd_24h_change as number;
  return {
    symbol: "BTC/USD",
    value: Number(data.bitcoin.usd).toLocaleString("en-US", { maximumFractionDigits: 0 }),
    delta: formatDelta(change),
    up: change >= 0,
  };
}

export async function getTickerPairs(): Promise<TickerPair[]> {
  const [fx, gold, btc] = await Promise.allSettled([getFxPairs(), getGold(), getBtc()]);

  const bySymbol = new Map<string, TickerPair>();
  if (fx.status === "fulfilled") for (const p of fx.value) bySymbol.set(p.symbol, p);
  if (gold.status === "fulfilled") bySymbol.set(gold.value.symbol, gold.value);
  if (btc.status === "fulfilled") bySymbol.set(btc.value.symbol, btc.value);

  return SYMBOL_ORDER.map((s) => bySymbol.get(s)).filter((p): p is TickerPair => Boolean(p));
}
