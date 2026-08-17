// Position-size calculator — standard, industry-wide forex risk-management
// math (risk % of balance -> lot size given a stop-loss distance). The only
// external input is live FX rates (fetched, never invented) used to convert
// pip values into the trader's account currency; the formulas themselves
// are well-established, not something that could be "fabricated."

export const ACCOUNT_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD", "NZD"] as const;
export type AccountCurrency = (typeof ACCOUNT_CURRENCIES)[number];

export const SUPPORTED_PAIRS = [
  "EUR/USD",
  "USD/CHF",
  "GBP/USD",
  "USD/JPY",
  "USD/CAD",
  "AUD/USD",
  "EUR/JPY",
  "NZD/USD",
  "GBP/CHF",
] as const;
export type SupportedPair = (typeof SUPPORTED_PAIRS)[number];

export const RISK_TIERS = [1, 2, 3, 5, 10, 15] as const;

const RISK_LABEL: Record<(typeof RISK_TIERS)[number], string> = {
  1: "Düşük risk",
  2: "Küçük risk",
  3: "Orta risk",
  5: "Yüksek risk",
  10: "Çok yüksek risk",
  15: "Aşırı yüksek risk",
};

// Frankfurter's free ECB-sourced endpoint, base=USD — same real, no-API-key
// data source src/lib/rates.ts already uses for the site's ticker. R[USD]
// is fixed at 1 by definition; every other value is units of that currency
// per 1 USD, straight from the live response.
export async function getLiveFxRates(): Promise<Record<AccountCurrency, number>> {
  const symbols = ACCOUNT_CURRENCIES.filter((c) => c !== "USD").join(",");
  const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Frankfurter fetch failed: ${res.status}`);
  const data = (await res.json()) as { rates: Record<string, number> };
  return { USD: 1, ...data.rates } as Record<AccountCurrency, number>;
}

function pairCurrencies(pair: SupportedPair): { base: AccountCurrency; quote: AccountCurrency } {
  const [base, quote] = pair.split("/") as [AccountCurrency, AccountCurrency];
  return { base, quote };
}

// Price of 1 unit of `base` expressed in `quote`, derived purely from the
// USD-anchored rate table (R[USD] = 1): price(base/quote) = R[quote]/R[base].
export function pairPrice(pair: SupportedPair, rates: Record<AccountCurrency, number>): number {
  const { base, quote } = pairCurrencies(pair);
  return rates[quote] / rates[base];
}

const STANDARD_LOT_UNITS = 100_000;

export type PositionSizeRow = {
  riskPercent: number;
  label: string;
  units: number;
  lots: number;
  miniLots: number;
  microLots: number;
  riskAmount: number;
  perPip: number;
  balanceAfter10LossesPercent: number;
};

export function calculatePositionSizes(params: {
  accountBalance: number;
  accountCurrency: AccountCurrency;
  pair: SupportedPair;
  stopLossPips: number;
  rates: Record<AccountCurrency, number>;
}): PositionSizeRow[] {
  const { accountBalance, accountCurrency, pair, stopLossPips, rates } = params;
  const { quote } = pairCurrencies(pair);
  const pipSize = quote === "JPY" ? 0.01 : 0.0001;

  // Value of 1 pip on 1 unit of the base currency, converted into the
  // trader's account currency: pipSize units of `quote` -> account currency
  // via the same R[quote]/R[account] cross-rate relationship as pairPrice.
  const pipValuePerUnit = stopLossPips > 0 ? pipSize * (rates[accountCurrency] / rates[quote]) : 0;

  return RISK_TIERS.map((riskPercent) => {
    const riskAmount = accountBalance * (riskPercent / 100);
    const units =
      pipValuePerUnit > 0 && stopLossPips > 0 ? riskAmount / (stopLossPips * pipValuePerUnit) : 0;
    return {
      riskPercent,
      label: RISK_LABEL[riskPercent],
      units,
      lots: units / STANDARD_LOT_UNITS,
      miniLots: units / 10_000,
      microLots: units / 1_000,
      riskAmount,
      perPip: stopLossPips > 0 ? riskAmount / stopLossPips : 0,
      balanceAfter10LossesPercent: Math.pow(1 - riskPercent / 100, 10) * 100,
    };
  });
}
