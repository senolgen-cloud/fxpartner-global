// [timestamp, open, high, low, close]
export type Candle = [number, number, number, number, number];

export type SymbolConfig = {
  id: string;
  label: string;
  timeframeLabel: string;
  decimals: number;
};

// Only BTC/USD has a verified free, key-free source for real intraday
// OHLC candles (CoinGecko). EUR/USD, XAU/USD etc. need a real intraday
// data source before they can be added here honestly — daily-only rates
// (Frankfurter) don't make a convincing "30 min chart" and gold has no
// free historical endpoint we've found yet. Extend SYMBOLS + getCandles
// together once that's picked.
export const SYMBOLS: Record<string, SymbolConfig> = {
  BTCUSD: { id: "BTCUSD", label: "BTC/USD", timeframeLabel: "30 DK", decimals: 0 },
};

/** How old the newest candle may be before the data is not worth using. */
export const MAX_CANDLE_AGE_MS = 90 * 60 * 1000;

async function getBtcCandles(): Promise<Candle[]> {
  // No revalidate window. It was 1800s, and the failure it produced was
  // not a half-hour-old price: when revalidation keeps failing against a
  // rate-limited free endpoint, Next goes on serving the last good
  // response indefinitely. A chart went to the channel showing $64,688
  // beside a caption saying $79,598 — the cache was weeks stale and
  // nothing in the pipeline could tell.
  //
  // no-store means a failed fetch throws, which the caller can see and
  // act on, instead of quietly succeeding with old numbers.
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=1",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`CoinGecko OHLC fetch failed: ${res.status}`);
  const data: number[][] = await res.json();
  return data.map((c) => [c[0], c[1], c[2], c[3], c[4]] as Candle);
}

export async function getCandles(symbolId: string): Promise<Candle[]> {
  switch (symbolId) {
    case "BTCUSD":
      return getBtcCandles();
    default:
      throw new Error(`Unsupported symbol: ${symbolId}`);
  }
}
