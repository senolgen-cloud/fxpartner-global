export interface CashbackProgram {
  brokerSlug: string;
  rateLabel: string;
  rateNote: string;
}

// Only brokers with a real, confirmed volume-based rev-share/IB agreement
// belong here — never add a broker just because it's on the site. Rates
// are estimates pending final terms; keep them easy to update in one place.
export const cashbackPrograms: CashbackProgram[] = [
  {
    brokerSlug: "xm",
    rateLabel: "Up to $5 per lot (estimated)",
    rateNote: "Final rate pending confirmation with XM.",
  },
  {
    brokerSlug: "avatrade",
    rateLabel: "Up to 20% of spread (estimated)",
    rateNote: "Final rate pending confirmation with AvaTrade.",
  },
  {
    brokerSlug: "exness",
    rateLabel: "Up to $4 per lot (estimated)",
    rateNote: "Final rate pending confirmation with Exness.",
  },
];

export function getCashbackProgram(brokerSlug: string) {
  return cashbackPrograms.find((p) => p.brokerSlug === brokerSlug);
}
