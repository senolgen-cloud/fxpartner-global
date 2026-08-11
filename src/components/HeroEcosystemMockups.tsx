import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";
import type { tradeSignals } from "@/db/schema";

type TradeSignal = typeof tradeSignals.$inferSelect;

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

// Signals don't carry a live intraday price feed for every instrument, so
// this never claims a "live P/L" figure — the headline number is either a
// real closed result (pips/profit, both actually recorded) or, for an
// still-open trade, the real entry price. The sparkline stays purely
// decorative flourish, same as it always was.
function SignalCardBody({ signal }: { signal: TradeSignal }) {
  const isSell = signal.direction === "SELL";
  const directionColor = isSell ? "text-tick-down" : "text-tick-up";
  const directionBg = isSell ? "bg-tick-down/15" : "bg-tick-up/15";
  const isClosed = signal.status === "closed";

  const resultLine = signal.pips
    ? `${parseFloat(signal.pips) > 0 ? "+" : ""}${signal.pips}`
    : signal.profit
      ? `${parseFloat(signal.profit) > 0 ? "+" : ""}$${signal.profit}`
      : null;
  const resultUnit = signal.pips ? "pips" : signal.profit ? "" : null;
  const resultColor =
    signal.outcome === "LOSS" ? "text-tick-down" : signal.outcome === "WIN" ? "text-tick-up" : "text-text-on-ink";

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="notranslate font-display text-sm font-semibold text-text-on-ink">
          {signal.pair}
        </span>
        <span className={`rounded-full ${directionBg} px-2.5 py-0.5 font-mono text-[10px] font-semibold ${directionColor}`}>
          {signal.direction ?? "—"}
        </span>
      </div>
      {isClosed && resultLine ? (
        <p className={`mt-2 font-display text-2xl font-bold tabular-stat ${resultColor}`}>
          {resultLine} {resultUnit && <span className="text-sm font-medium text-text-on-ink-muted">{resultUnit}</span>}
        </p>
      ) : (
        <p className="mt-2 font-display text-2xl font-bold tabular-stat text-text-on-ink">
          {signal.entry}
          <span className="ml-2 text-sm font-medium text-text-on-ink-muted">entry</span>
        </p>
      )}
      <svg viewBox="0 0 200 40" className={`mt-3 h-9 w-full ${isSell ? "text-tick-down" : "text-tick-up"}`} fill="none">
        <path
          d={isSell ? "M0 8 L20 10 L40 6 L60 18 L80 14 L100 26 L120 22 L140 32 L160 28 L180 36 L200 34" : "M0 32 L20 30 L40 34 L60 22 L80 26 L100 14 L120 18 L140 8 L160 12 L180 4 L200 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 font-mono text-[11px]">
        <span className="text-text-on-ink-muted">
          {isClosed ? "Close" : "Entry"} <span className="text-text-on-ink">{isClosed ? signal.closePrice : signal.entry}</span>
        </span>
        {signal.target1 && <span className="text-tick-up">TP {signal.target1}</span>}
        {signal.stop && <span className="text-tick-down">SL {signal.stop}</span>}
      </div>
    </>
  );
}

export default function HeroEcosystemMockups({
  brokers,
  latestSignal,
}: {
  brokers: Broker[];
  latestSignal: TradeSignal | null;
}) {
  const topBrokers = [...brokers].sort((a, b) => a.rank - b.rank).slice(0, 4);

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
      {/* Forex Signals */}
      <Link href="/signals" className="block transition-opacity hover:opacity-90">
        <CardShell
          label="Forex Signals"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="2.2" />
              <path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8" />
            </svg>
          }
        >
          {latestSignal ? (
            <SignalCardBody signal={latestSignal} />
          ) : (
            <p className="py-6 text-center text-xs text-text-on-ink-muted">
              No signals yet — check back soon.
            </p>
          )}
        </CardShell>
      </Link>

      {/* AI Market Assistant */}
      <Link href="/ai-asistan" className="block transition-opacity hover:opacity-90">
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
      </Link>

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
                title={`${broker.name} broker review`}
                className="group flex items-center gap-2.5 rounded-lg transition-colors hover:bg-ink-soft"
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[10px] font-semibold text-text-on-ink">
                  {broker.logo ? (
                    <Image src={broker.logo} alt={`${broker.name} logo`} fill sizes="28px" className="object-contain p-1" />
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
