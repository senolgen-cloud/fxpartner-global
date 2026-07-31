import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { COUNTRY_TO_LANG } from "@/lib/countryLanguages";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

// Auto-selects a translated language on a visitor's first request, based
// on their country (from Vercel's x-vercel-ip-country header). Sets the
// googtrans cookie the Google Translate widget itself reads on load, plus
// fxp_lang so we never override a choice again — including a user
// switching back to English, which is also stored here.
function applyAutoLanguage(request: NextRequest, response: NextResponse) {
  if (request.cookies.has("fxp_lang")) return;

  const country = request.headers.get("x-vercel-ip-country");
  const lang = country ? COUNTRY_TO_LANG[country] : undefined;

  response.cookies.set("fxp_lang", lang || "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  if (lang) {
    response.cookies.set("googtrans", `/en/${lang}`, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    const session = await auth();
    if (session?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const response = NextResponse.next();
    applyAutoLanguage(request, response);
    return response;
  }

  if (path.startsWith("/account") && !path.startsWith("/account/login") && !path.startsWith("/account/verify")) {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.redirect(new URL("/account/login", request.url));
      applyAutoLanguage(request, response);
      return response;
    }
  }

  const response = NextResponse.next();
  applyAutoLanguage(request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
