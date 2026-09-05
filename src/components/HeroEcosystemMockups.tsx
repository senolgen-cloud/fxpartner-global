import { tr, trf } from "@/lib/chrome";
import { requiredTierForPair } from "@/lib/signalAccess";
import Link from "@/components/LocaleLink";
import type { SignalJson } from "@/lib/cachedReads";

// The cached shape, with its dates as ISO strings — this card shows the
// pair, the direction and the levels, and never reads a date, so there is
// nothing here that wants them revived.
type TradeSignal = SignalJson;

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
      className={`dashboard-glass flex h-full flex-col rounded-2xl border border-hairline bg-gradient-to-b from-ink-soft to-ink p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ${className}`}
    >
      {/* The label is two words in Turkish and one in English, so it is
          given a fixed two-line box rather than being allowed to push its
          card down: "Yapay Zeka Piyasa Asistanı" wrapped and every card
          beside it started 14px lower than its own heading. */}
      <div className="flex min-h-[2.4rem] items-start gap-2 text-signal">
        <span className="mt-px shrink-0">{icon}</span>
        <span className="font-mono text-[10px] font-medium uppercase leading-[1.35] tracking-[0.15em]">
          {label}
        </span>
      </div>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
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

  // An empty entry on a live trade is what maskLockedActiveSignal leaves
  // behind — the page hands this card the masked signal (see the comment
  // where it is masked). Rendering it as an empty price would look like the
  // card had failed to load; a locked state says what is actually true.
  const locked = !isClosed && signal.entry === "";
  const dots = "••••••";

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
          <span className={locked ? "text-text-on-ink-muted" : ""}>{locked ? dots : signal.entry}</span>
          <span className="ms-2 text-sm font-medium text-text-on-ink-muted">{tr("giriş")}</span>
        </p>
      )}
      {/* Decorative, and grows to take up whatever slack the card has —
          see the note above SignalCardBody: this is not a price series and
          must never be read as one. */}
      <svg viewBox="0 0 200 40" preserveAspectRatio="none" className={`mt-3 min-h-9 w-full flex-1 ${isSell ? "text-tick-down" : "text-tick-up"}`} fill="none" aria-hidden="true">
        <path
          d={isSell ? "M0 8 L20 10 L40 6 L60 18 L80 14 L100 26 L120 22 L140 32 L160 28 L180 36 L200 34" : "M0 32 L20 30 L40 34 L60 22 L80 26 L100 14 L120 18 L140 8 L160 12 L180 4 L200 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-auto border-t border-hairline pt-3">
        {locked ? (
          <p className="text-center font-mono text-[11px] text-gold">
            🔒{" "}
            {trf("{tier} ile aç", {
              tier: requiredTierForPair(signal.pair) === "vip" ? "VIP" : "Pro",
            })}
          </p>
        ) : (
          <dl className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                {isClosed ? tr("Kapanış") : tr("Giriş")}
              </dt>
              <dd className="mt-0.5 tabular-stat text-text-on-ink">
                {isClosed ? signal.closePrice : signal.entry}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">TP</dt>
              <dd className="mt-0.5 tabular-stat text-tick-up">{signal.target1 ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">SL</dt>
              <dd className="mt-0.5 tabular-stat text-tick-down">{signal.stop ?? "—"}</dd>
            </div>
          </dl>
        )}
      </div>
    </>
  );
}

export default function HeroEcosystemMockups({
  latestSignal,
}: {
  latestSignal: TradeSignal | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
      {/* Forex Signals */}
      <Link href="/signals" className="block h-full transition-opacity hover:opacity-90">
        <CardShell
          label="Forex Sinyalleri"
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
              {tr("Henüz sinyal yok — yakında tekrar kontrol edin.")}
            </p>
          )}
        </CardShell>
      </Link>

      {/* AI Market Assistant */}
      <Link href="/ai-asistan" className="block h-full transition-opacity hover:opacity-90">
        <CardShell
          label={tr("Yapay Zeka Piyasa Asistanı")}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="11" rx="2.5" />
              <path d="M8 20h8M12 16v4" />
            </svg>
          }
        >
          <div className="flex justify-end">
            <p className="max-w-[90%] rounded-xl rounded-tr-sm bg-ink px-3 py-2 text-[11px] leading-relaxed text-text-on-ink">
              {tr("CPI daha düşük gelirse ne olur?")}
            </p>
          </div>
          <p className="mt-2 rounded-xl rounded-tl-sm bg-signal/10 px-3 py-2 text-[11px] leading-relaxed text-text-on-ink-muted">
            {tr("Düşük CPI genellikle USD'yi zayıflatır; EURUSD ve altında yükseliş momentumuna yol açabilir.")}
          </p>
          <div className="mt-auto flex items-center gap-2 rounded-full border border-hairline-light px-3 py-2">
            <span className="flex-1 truncate text-[11px] text-text-on-ink-muted">
              {tr("Piyasalar hakkında ne isterseniz sorun…")}
            </span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </CardShell>
      </Link>

    </div>
  );
}
