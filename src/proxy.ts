import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "senolgen@gmail.com";

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    const session = await auth();
    if (session?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return;
  }

  if (!path.startsWith("/account")) return;
  if (path.startsWith("/account/login")) return;
  if (path.startsWith("/account/verify")) return;

  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL("/account/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
