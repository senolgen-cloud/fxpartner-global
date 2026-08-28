import Link from "@/components/LocaleLink";
import { tr } from "@/lib/chrome";
import HeaderBell from "@/components/HeaderBell";
import LocaleMenu from "@/components/LocaleMenu";

// Profile and notifications at the end of the header bar, where a phone's
// header was otherwise empty: the hamburger only appears from sm up, so
// below that the account was reachable only through the bottom nav.
//
// The bell is HeaderBell: it polls a count-only endpoint for the unread
// badge, and while the app is open it shows an in-app card and chimes when
// something arrives. Tapping it still goes to /account, where the full
// panel lives — the header carries the number, not the list.
//
// Hidden from xl up, where the desktop bar already carries "Hesabım" and
// the rest of the account links.
//
// No bell at all when signed out. A reader with no account has no
// notifications, and an icon that only ever leads to a login prompt is a
// promise of something that is not there.
export default function HeaderQuickActions({
  signedIn,
  accountHref,
}: {
  signedIn: boolean;
  accountHref: string;
}) {
  return (
    <div className="flex items-center gap-0.5 xl:hidden">
      {/* Language first, then notifications, then the account — the same
          order as the desktop cluster, so the two headers do not disagree
          about where a control lives. It was reachable only from inside the
          More menu on a phone before this. */}
      <LocaleMenu />
      {signedIn && <HeaderBell />}
      <Link
        href={accountHref}
        aria-label={signedIn ? tr("Hesabım") : tr("Giriş Yap")}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-on-ink transition-colors hover:bg-ink-soft"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </svg>
      </Link>
    </div>
  );
}
