import { NextResponse } from "next/server";
import { defaultLocale, isLocale, localePath, splitLocale } from "@/lib/i18n";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { COUNTRY_TO_LANG } from "@/lib/countryLanguages";
import { CONSENT_COOKIE, parseDecision, type Decision } from "@/lib/consent";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

// Auto-selects a translated language on a visitor's first request, based
// on their country (from Vercel's x-vercel-ip-country header). Sets the
// googtrans cookie the Google Translate widget itself reads on load, plus
// fxp_lang so we never override a choice again — including a user
// switching back to Turkish, which is also stored here. The site's own
// content is authored in Turkish, so "tr" (not "en") is the default/source
// language and the fallback for unmatched or missing country headers.
function applyAutoLanguage(request: NextRequest, response: NextResponse) {
  if (request.cookies.has("fxp_lang")) return;

  const country = request.headers.get("x-vercel-ip-country");
  const lang = country ? COUNTRY_TO_LANG[country] : undefined;

  response.cookies.set("fxp_lang", lang || "tr", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  if (lang) {
    response.cookies.set("googtrans", `/tr/${lang}`, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

// What the reader has agreed to. "all" is everything below; "essential"
// is the language cookies and the auth session and nothing else; null
// means they have not been asked yet.
//
// fxp_lang/googtrans keep the site in the language the reader picked and
// the session cookie keeps them logged in — a site cannot function without
// those, so they are not gated. fxp_vid and fxp_attr are ours, for our
// benefit, and under an opt-in reading of ePrivacy they must not be written
// before consent and must be cleared after a refusal. A banner that leaves
// the cookies in place is decoration.
// The cookie carries the decision and the id of the row that recorded it
// (see src/lib/consent.ts and consentRecords in src/db/schema.ts); only
// the decision matters here.
function readConsent(request: NextRequest): Decision | null {
  return parseDecision(request.cookies.get(CONSENT_COOKIE)?.value);
}

/** Removes a cookie the reader has declined, if a past visit set it. */
function revoke(request: NextRequest, response: NextResponse, name: string) {
  if (request.cookies.has(name)) response.cookies.delete(name);
}

// Stable, anonymous per-browser ID — set once on a visitor's first request
// and never rotated after. Pure infrastructure for now (no feature reads it
// yet): future personalization/attribution/push-prompt-dedup work can key
// off it via src/lib/visitor.ts instead of each reinventing its own cookie.
const VISITOR_COOKIE = "fxp_vid";

function applyVisitorId(request: NextRequest, response: NextResponse, consent: Decision | null) {
  if (consent !== "all") {
    revoke(request, response, VISITOR_COOKIE);
    return;
  }
  if (request.cookies.has(VISITOR_COOKIE)) return;
  response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
}

// First-touch attribution — the channel a visitor originally arrived from,
// captured once and never overwritten. Server actions read it back through
// src/lib/visitor.ts and store it on the row they insert, so a signup, lead
// or subscription can be traced to the channel that produced it. UTM params
// win when present; otherwise we classify the referring host, which is how
// organic search and untagged social links still get counted instead of
// silently collapsing into "direct".
const ATTR_COOKIE = "fxp_attr";

const REFERER_SOURCES: [RegExp, string][] = [
  [/(^|\.)t\.me$/, "telegram"],
  [/(^|\.)telegram\.(me|org)$/, "telegram"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(x|twitter)\.com$/, "x"],
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)yandex\./, "yandex"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)youtube\.com$/, "youtube"],
  [/(^|\.)facebook\.com$/, "facebook"],
  [/(^|\.)reddit\.com$/, "reddit"],
];

function classifyReferer(referer: string | null, selfHost: string): string | null {
  if (!referer) return null;
  let host: string;
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
  // Navigation within our own site is not a new arrival.
  if (host === selfHost.toLowerCase()) return null;
  for (const [pattern, name] of REFERER_SOURCES) {
    if (pattern.test(host)) return name;
  }
  // An unrecognised referrer is still worth more than "direct" — the raw
  // host tells us which blog or forum sent them.
  return host.slice(0, 64);
}

function applyAttribution(request: NextRequest, response: NextResponse, consent: Decision | null) {
  if (consent !== "all") {
    revoke(request, response, ATTR_COOKIE);
    return;
  }
  if (request.cookies.has(ATTR_COOKIE)) return;

  const params = request.nextUrl.searchParams;
  const utmSource = params.get("utm_source")?.trim().slice(0, 64);
  const source =
    utmSource ||
    classifyReferer(request.headers.get("referer"), request.nextUrl.hostname) ||
    "direct";
  const campaign = params.get("utm_campaign")?.trim().slice(0, 64) || null;
  // Path only, never the query string — that can carry personal data, and
  // this value is stored on a row that outlives the session.
  const landingPath = request.nextUrl.pathname.slice(0, 255);

  // NextResponse.cookies.set percent-encodes the value itself, so this
  // passes plain JSON — encoding it here too would store it double-encoded
  // and one decode on read would still leave a percent-escaped string.
  response.cookies.set(ATTR_COOKIE, JSON.stringify({ source, campaign, landingPath }), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
}

// Static files under public/ come through this proxy too — /sw.js,
// /manifest.json, /campaigns/*.jpg — and rewriting those into a locale tree
// would 404 every one of them. Anything with an extension in its last
// segment is left alone.
function isStaticFile(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}

// Every tree is prefixed now, Turkish included. An unprefixed path is an old
// URL and gets a permanent redirect to /tr — 308 rather than 307, because
// this move is not coming back and a crawler needs to be told that in order
// to pass the old page’s standing to the new one.
//
// 308 rather than 301 for the same reason Next uses it: 301 lets a client
// turn a POST into a GET on the way, and form posts come through this proxy.
//
// Still no Accept-Language redirect. Choosing a language for a visitor who
// asked for a specific URL takes the choice away from them, and takes it away
// from the crawler too.
function localeRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (isStaticFile(pathname)) return null;

  const first = pathname.split("/")[1];
  if (first && isLocale(first)) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

// Every response leaves through here, so the consent value is read once
// and the three writers agree on it.
function applyCookies(request: NextRequest, response: NextResponse) {
  const consent = readConsent(request);
  applyAutoLanguage(request, response);
  applyVisitorId(request, response, consent);
  applyAttribution(request, response, consent);
}

export default async function proxy(request: NextRequest) {
  // Auth and attribution reason about the path the reader sees, not the
  // internal one, so the locale prefix is stripped first.
  const { locale, path } = splitLocale(request.nextUrl.pathname);

  if (path.startsWith("/admin")) {
    const session = await auth();
    if (session?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL(localePath(locale, "/"), request.url));
    }
    const response = localeRedirect(request) ?? NextResponse.next();
    applyCookies(request, response);
    return response;
  }

  if (
    path.startsWith("/account") &&
    !path.startsWith("/account/login") &&
    !path.startsWith("/account/register") &&
    !path.startsWith("/account/verify")
  ) {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.redirect(new URL(localePath(locale, "/account/login"), request.url));
      applyCookies(request, response);
      return response;
    }
  }

  const response = localeRedirect(request) ?? NextResponse.next();
  applyCookies(request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
