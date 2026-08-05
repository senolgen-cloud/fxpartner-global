import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function CardShell({
  label,
  icon,
  children,
  className = "",
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`dashboard-glass rounded-2xl border border-hairline bg-gradient-to-b from-ink-soft to-ink p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex items-center gap-2 text-signal">
        {icon}
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function HeroEcosystemMockups({ brokers }: { brokers: Broker[] }) {
  const topBrokers = [...brokers].sort((a, b) => a.rank - b.rank).slice(0, 4);

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
      {/* Forex Signals */}
      <CardShell
        label="Forex Signals"
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="2.2" />
            <path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <span className="notranslate font-display text-sm font-semibold text-text-on-ink">
            EURUSD
          </span>
          <span className="rounded-full bg-tick-up/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-tick-up">
            BUY
          </span>
        </div>
        <p className="mt-2 font-display text-2xl font-bold tabular-stat text-tick-up">
          +126 <span className="text-sm font-medium text-text-on-ink-muted">pips</span>
        </p>
        <svg viewBox="0 0 200 40" className="mt-3 h-9 w-full text-tick-up" fill="none">
          <path
            d="M0 32 L20 30 L40 34 L60 22 L80 26 L100 14 L120 18 L140 8 L160 12 L180 4 L200 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 font-mono text-[11px]">
          <span className="text-text-on-ink-muted">
            Entry <span className="text-text-on-ink">1.08245</span>
          </span>
          <span className="text-tick-up">TP 1.09580</span>
          <span className="text-tick-down">SL 1.07620</span>
        </div>
      </CardShell>

      {/* AI Market Assistant */}
      <CardShell
        label="AI Market Assistant"
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="11" rx="2.5" />
            <path d="M8 20h8M12 16v4" />
          </svg>
        }
      >
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-xl rounded-tr-sm bg-ink px-3 py-2 text-[11px] leading-relaxed text-text-on-ink">
            What happens if CPI comes lower?
          </p>
        </div>
        <p className="mt-2 max-w-[90%] rounded-xl rounded-tl-sm bg-signal/10 px-3 py-2 text-[11px] leading-relaxed text-text-on-ink-muted">
          Lower CPI usually weakens the USD and may lead to bullish momentum
          in EURUSD, Gold and other risk assets.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-hairline-light px-3 py-2">
          <span className="flex-1 truncate text-[11px] text-text-on-ink-muted">
            Ask anything about the markets…
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </CardShell>

      {/* Trusted Brokers */}
      <CardShell
        label="Trusted Brokers"
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        }
      >
        <ul className="flex flex-col gap-2.5">
          {topBrokers.map((broker) => (
            <li key={broker.slug}>
              <Link
                href={`/brokers/${broker.slug}`}
                className="group flex items-center gap-2.5 rounded-lg transition-colors hover:bg-ink-soft"
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[10px] font-semibold text-text-on-ink">
                  {broker.logo ? (
                    <Image src={broker.logo} alt="" fill sizes="28px" className="object-contain p-1" />
                  ) : (
                    getMonogram(broker.name)
                  )}
                </span>
                <span className="notranslate min-w-0 flex-1 truncate text-[12px] font-medium text-text-on-ink">
                  {broker.name}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-text-on-ink-muted">
                  Verified
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-signal" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/broker-lookup"
          className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[11px] font-medium text-signal transition-colors hover:text-signal-strong"
        >
          View All Brokers
          <span aria-hidden="true">→</span>
        </Link>
      </CardShell>
    </div>
  );
}
