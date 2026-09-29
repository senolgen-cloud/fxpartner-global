import { localePath, type Locale } from "@/lib/i18n";

// Every signal has its own page, addressed by its MT5 position ticket:
// /signals/73844512. The ticket is the trade's number everywhere — on the
// card, in the Telegram post and in the URL — because it is the one id the
// trade already has. It is unique per position, the EA sends it with both
// the open and the close, and a follower can match it against the account
// statement, which a number we minted ourselves could never be.
//
// Digits only. The route treats anything else as not found rather than
// passing it to the database.
export const TICKET_PATTERN = /^\d{1,20}$/;

export function isTicket(value: string | null | undefined): value is string {
  return !!value && TICKET_PATTERN.test(value);
}

export function signalPath(ticket: string): string {
  return `/signals/${ticket}`;
}

export function signalUrl(ticket: string, locale: Locale = "tr"): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  return `${siteUrl}${localePath(locale, signalPath(ticket))}`;
}
