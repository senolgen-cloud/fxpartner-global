"use client";

import { useLocalePathname } from "@/components/useLocalePathname";

/**
 * Hides the site furniture on the two screens that have one job.
 *
 * /account/login and /account/register were rendering under the full site:
 * a sticky header, a scrolling broker carousel, the mobile tab bar, a live
 * price tape and a chat bubble that sat on top of the submit button. A
 * reader who arrived to type one email address was being shown eleven other
 * brokers first — on the page whose entire purpose is that they do not
 * leave.
 *
 * A client component because the pathname is only readable from one (see
 * the Next.js layout docs); client components still render on the server,
 * so the chrome never reaches the HTML and there is nothing to flash.
 *
 * The list is explicit and the default is to show everything, so a route
 * this does not know about keeps its furniture.
 */
const BARE_PATHS = ["/account/login", "/account/register"];

export function useIsBareRoute(): boolean {
  const path = useLocalePathname();
  return BARE_PATHS.includes(path.replace(/\/+$/, "") || "/");
}

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  return useIsBareRoute() ? null : <>{children}</>;
}
