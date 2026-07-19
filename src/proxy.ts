import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/account")) return;
  if (request.nextUrl.pathname.startsWith("/account/login")) return;
  if (request.nextUrl.pathname.startsWith("/account/verify")) return;

  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL("/account/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/account/:path*"],
};
