import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import HeaderNav from "@/components/HeaderNav";

export default async function Header({ standalone = true }: { standalone?: boolean } = {}) {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";

  return (
    <header
      className={`relative z-20 border-b border-hairline bg-ink/95 backdrop-blur ${
        standalone ? "sticky top-0 z-40" : ""
      }`}
    >
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/fxpartner-logo.png"
            alt="FXPARTNER"
            width={900}
            height={232}
            priority
            className="h-8 w-auto md:h-10"
          />
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted sm:inline">
            Broker Guide
          </span>
        </Link>
        <HeaderNav signedIn={signedIn} accountHref={accountHref} />
      </div>
    </header>
  );
}
