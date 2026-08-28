import Image from "next/image";
import Link from "@/components/LocaleLink";
import { auth } from "@/auth";
import HeaderNav from "@/components/HeaderNav";
import AppBackButton from "@/components/AppBackButton";

export default async function Header({ standalone = true }: { standalone?: boolean } = {}) {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";

  return (
    <header
      /* pt for the status bar. appleWebApp.statusBarStyle is
         "black-translucent", so an installed iOS app draws its content
         underneath the status bar and this row sat behind the clock and the
         notch. The inset is 0 in a browser tab, so it costs nothing. */
      className={`relative z-20 border-b border-hairline bg-ink/95 pt-[env(safe-area-inset-top)] backdrop-blur ${
        standalone ? "sticky top-0 z-40" : ""
      }`}
    >
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-16 [@media(max-height:520px)]:h-11">
        {/* Start edge, which on a phone is empty — the logo is absolutely
            centred and the nav sits at the end. Renders nothing at all
            outside the installed app. */}
        <AppBackButton />
        {/* Centred on a phone, where the bar holds only the logo and the
            menu button and a left-aligned mark leaves the middle empty.
            Absolute rather than a three-column grid so the nav on the right
            keeps its own width — from md up the bar has real navigation in
            it and the logo goes back to the start edge. */}
        <Link
          href="/"
          className="absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-2 md:static md:translate-x-0"
        >
          <Image
            src="/fxpartner-logo.png"
            alt="FXPARTNER"
            width={900}
            height={232}
            priority
            className="h-8 w-auto md:h-10 [@media(max-height:520px)]:h-6"
          />
          <span className="hidden rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted 2xl:inline">
            Global
          </span>
        </Link>
        <HeaderNav signedIn={signedIn} accountHref={accountHref} />
      </div>
    </header>
  );
}
