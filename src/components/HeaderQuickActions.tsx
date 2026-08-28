import Link from "@/components/LocaleLink";
import { tr } from "@/lib/chrome";

// Profile and notifications at the end of the header bar, where a phone's
// header was otherwise empty: the logo is absolutely centred and the
// hamburger only appears from sm up.
//
// THE BELL IS A LINK, NOT THE BELL. The real one lives on /account and
// needs getMemberNotifications, which is two database round trips. Putting
// that in the header would run them on every page a signed-in reader opens,
// to render a badge most of those pages never needed. So this navigates to
// where the notifications actually are, and carries no unread count rather
// than a number that would have to be either stale or expensive.
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
      {signedIn && (
        <Link
          href="/account"
          aria-label={tr("Bildirimler")}
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </Link>
      )}
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
