import Link from "next/link";
import { auth } from "@/auth";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-text-on-ink">
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
