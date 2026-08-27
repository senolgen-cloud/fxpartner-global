import Image from "next/image";
import Link from "@/components/LocaleLink";
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
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-16 [@media(max-height:520px)]:h-11">
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
        <HeaderNav signedIn={signedIn} accountHref={accountHref} />
      </div>
    </header>
  );
}
