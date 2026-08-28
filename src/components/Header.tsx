import Image from "next/image";
import Link from "@/components/LocaleLink";
import { auth } from "@/auth";
import HeaderNav from "@/components/HeaderNav";
import AppBackButton from "@/components/AppBackButton";
import HeaderQuickActions from "@/components/HeaderQuickActions";

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
        {/* Start edge at every width now. It used to be absolutely centred
            on a phone, and the reason given was that the bar held only the
            logo and a menu button so a left-aligned mark left the middle
            empty. The bar is not empty any more — profile and notifications
            sit at the end — and an absolutely positioned logo does not
            participate in the row, so it cannot be pushed out of their way:
            at 320px the two icons overlapped it by 14px. Start edge, end
            actions, and the row lays itself out. */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
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
        {/* The end of the bar. HeaderNav owns everything from xl up; these
            two only exist below that, where the row was empty on a phone
            and the account was reachable solely through the bottom nav. */}
        {/* ms-auto, not justify-between on the parent. The back button is
            the only thing at the start and it renders nothing outside the
            installed app, so with one flex child left the row put these
            icons where the back button would have been — at the start,
            under the centred logo. */}
        <div className="ms-auto flex shrink-0 items-center gap-1">
          <HeaderQuickActions signedIn={signedIn} accountHref={accountHref} />
          <HeaderNav signedIn={signedIn} accountHref={accountHref} />
        </div>
      </div>
    </header>
  );
}
