export interface CashbackProgram {
  brokerSlug: string;
  rateLabel: string;
  rateNote: string;
  // "live"    — terms confirmed with the broker; the rate is a commitment we
  //             advertise and the program is promoted across the site.
  // "pending" — the agreement exists but the final rate hasn't been signed
  //             off, so the number is shown as an estimate and never pushed
  //             from a broker page or a campaign.
  // Anything promoted anywhere outside /cashback must be "live".
  status: "live" | "pending";
  // Live programs only: the one-line promise used on the broker review page
  // and in campaign copy. Kept next to the rate so the number and the claim
  // can never drift apart.
  pitch?: string;
}

// Only brokers with a real, confirmed volume-based rev-share/IB agreement
// belong here — never add a broker just because it's on the site. Keep the
// rates easy to update in one place, and flip `status` to "live" only once
// the final terms are confirmed with that broker.
export const cashbackPrograms: CashbackProgram[] = [
  {
    brokerSlug: "xm",
    rateLabel: "Lot başına 5 dolara kadar (tahmini)",
    rateNote: "Nihai oran XM ile teyit edilmeyi bekliyor.",
    status: "pending",
  },
  {
    brokerSlug: "avatrade",
    rateLabel: "Spreadin %20'sine kadar (tahmini)",
    rateNote: "Nihai oran AvaTrade ile teyit edilmeyi bekliyor.",
    status: "pending",
  },
  {
    brokerSlug: "exness",
    rateLabel: "Lot başına 4 dolara kadar (tahmini)",
    rateNote: "Nihai oran Exness ile teyit edilmeyi bekliyor.",
    status: "pending",
  },
  {
    brokerSlug: "lite-finance",
    rateLabel: "%50'ye kadar nakit iade",
    // The note keeps every condition on the rate and nothing else. It used
    // to close with "İade, Lite Finance tarafından doğrudan işlem hesabınıza
    // yatırılır" — the same sentence the pitch directly above it already
    // ends on, so the row said it twice and ran to six lines of grey text on
    // a phone. The qualifying half is what a reader needs next to a number.
    rateNote:
      "Oran hesap türüne ve aylık işlem hacmine göre değişir; ECN hesaplarda komisyon üzerinden, Classic ve Cent hesaplarda spread üzerinden hesaplanır.",
    status: "live",
    pitch:
      "Mevcut hesabınızı kapatmanıza gerek yok; iade, işlem hacminize göre Lite Finance tarafından doğrudan işlem hesabınıza yatırılır.",
  },
];

export function getCashbackProgram(brokerSlug: string) {
  return cashbackPrograms.find((p) => p.brokerSlug === brokerSlug);
}

// The subset that's safe to promote off the /cashback page — broker reviews,
// campaigns, the partner page, digests.
export function getLiveCashbackProgram(brokerSlug: string) {
  const program = getCashbackProgram(brokerSlug);
  return program?.status === "live" ? program : undefined;
}
