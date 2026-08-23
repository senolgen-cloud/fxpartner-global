import { NextRequest, NextResponse } from "next/server";
import { welcomeEmailHtml } from "@/lib/welcomeEmail";
import { defaultLocale, isLocale } from "@/lib/i18n";

// Renders the sign-in email in a browser so it can be looked at without
// sending one. Development only — a route that prints a template is
// harmless, but there is no reason for it to exist in production.
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  const raw = req.nextUrl.searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(raw) ? raw : defaultLocale;
  return new NextResponse(welcomeEmailHtml("https://fxpartner.global/api/auth/callback/resend?token=preview", locale), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
