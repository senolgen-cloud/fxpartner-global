import Link from "next/link";
import { auth } from "@/auth";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink/95 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-16">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-text-on-ink md:text-xl">
            FXPARTNER
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted sm:inline">
            Broker Guide
          </span>
        </Link>
        <HeaderNav signedIn={signedIn} accountHref={accountHref} />
      </div>
    </header>
  );
}
