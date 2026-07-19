import Link from "next/link";
import { auth } from "@/auth";

const navLinks = [
  { href: "/#brokers", label: "Broker Rankings" },
  { href: "/categories", label: "Categories" },
  { href: "/blacklist", label: "Risk Warnings" },
  { href: "/complaint", label: "Complaint" },
  { href: "/#faq", label: "FAQ" },
];

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-text-on-ink">
            FXPARTNER
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted sm:inline">
            Broker Guide
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={session?.user ? "/account" : "/account/login"}
            className="hidden text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink sm:inline"
          >
            {session?.user ? "My Account" : "Sign In"}
          </Link>
          <a
            href="#brokers"
            className="rounded-full bg-signal px-4 py-2 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
          >
            Compare Brokers
          </a>
        </div>
      </div>
    </header>
  );
}
