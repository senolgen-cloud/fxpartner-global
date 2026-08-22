import { NextResponse } from "next/server";
import { defaultLocale, isLocale, localePath, splitLocale } from "@/lib/i18n";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { COUNTRY_TO_LANG } from "@/lib/countryLanguages";

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

// Stable, anonymous per-browser ID — set once on a visitor's first request
// and never rotated after. Pure infrastructure for now (no feature reads it
// yet): future personalization/attribution/push-prompt-dedup work can key
// off it via src/lib/visitor.ts instead of each reinventing its own cookie.
const VISITOR_COOKIE = "fxp_vid";

function applyVisitorId(request: NextRequest, response: NextResponse) {
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

function applyAttribution(request: NextRequest, response: NextResponse) {
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

// Turkish keeps the bare URL it has always had and is rewritten onto the
// internal /tr tree; the other locales are already prefixed. No
// Accept-Language redirect: every existing link, share and indexed URL
// points at the unprefixed path, and silently moving a visitor (or a
// crawler) off it would break more than it fixes. The language switcher is
// the way across.
function localeRewrite(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (isStaticFile(pathname)) return null;

  const first = pathname.split("/")[1];
  if (first && isLocale(first)) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
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
    const response = localeRewrite(request) ?? NextResponse.next();
    applyAutoLanguage(request, response);
    applyVisitorId(request, response);
    applyAttribution(request, response);
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
      applyAutoLanguage(request, response);
      applyVisitorId(request, response);
      applyAttribution(request, response);
      return response;
    }
  }

  const response = localeRewrite(request) ?? NextResponse.next();
  applyAutoLanguage(request, response);
  applyVisitorId(request, response);
  applyAttribution(request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
