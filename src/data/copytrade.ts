// The copy-trading partner link, in one place.
//
// Not in brokers.ts: that file holds a broker's own referralUrl, and this is
// not one — it is the copy programme the tracked account is published
// through, which is a different offer with a different destination. Kept
// here so the signal cards, the /copytrade page and anything else that
// offers it all point at the same URL. TradeNowButton's header explains what
// happens when a CTA keeps its own duplicate of a link: the day one is
// updated the other quietly stops paying, and nothing breaks visibly enough
// to notice.
export const COPYTRADE_URL = "https://bit.ly/copy-fxpartner";
