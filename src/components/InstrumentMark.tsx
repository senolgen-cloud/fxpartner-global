import type { ReactNode } from "react";

/**
 * The disc that sits in front of an instrument's name on a signal card.
 *
 * Drawn here rather than sourced, for two reasons. Every flag emoji this
 * used to rely on renders as a pair of letters on Windows — Chrome there
 * has no flag glyphs at all — so "EU"/"US" is what a large share of readers
 * actually saw. And the obvious place to get instrument icons is a
 * competitor's markets page, whose index and share marks (Nasdaq, S&P 500,
 * DAX, FTSE, and every company logo) are other people's trademarks.
 *
 * So nothing here needs a licence. Metals use their chemical symbols, which
 * is chemistry's notation and not anyone's brand. Crypto uses the Unicode
 * currency characters. Indices use a flag and the number already in their
 * own name, never the index owner's logo. Currencies get a drawn flag where
 * the flag is legible at 36px, and their three-letter code where it is not
 * — a squashed Australian flag at this size is a smudge, and the code is
 * the honest fallback rather than a worse picture.
 */

const SIZE = "h-9 w-9";

function Disc({
  children,
  overlap,
  title,
  background = "var(--ink)",
}: {
  children: ReactNode;
  overlap?: boolean;
  title: string;
  background?: string;
}) {
  return (
    <span
      className={`${SIZE} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline ${
        overlap ? "-ms-3" : ""
      }`}
      style={{ background }}
      aria-hidden="true"
      title={title}
    >
      {children}
    </span>
  );
}

/** Flags are drawn into a circle, so each one fills a 24x24 viewBox. */
const FLAG: Record<string, ReactNode> = {
  USD: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#b22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * (24 / 13)} width="24" height={24 / 13} fill="#fff" />
      ))}
      <rect width="11" height={(24 / 13) * 7} fill="#3c3b6e" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}-${c}`} cx={2 + c * 3.5} cy={2.2 + r * 3.6} r="0.9" fill="#fff" />
        ))
      )}
    </svg>
  ),
  EUR: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={12 + Math.sin(a) * 6.6}
            cy={12 - Math.cos(a) * 6.6}
            r="1.15"
            fill="#ffcc00"
          />
        );
      })}
    </svg>
  ),
  GBP: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#c8102e" strokeWidth="2.5" />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="8" />
      <path d="M12 0v24M0 12h24" stroke="#c8102e" strokeWidth="4.5" />
    </svg>
  ),
  JPY: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#fff" />
      <circle cx="12" cy="12" r="6.4" fill="#bc002d" />
    </svg>
  ),
  CHF: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect width="24" height="24" fill="#d52b1e" />
      <path d="M12 5.5v13M5.5 12h13" stroke="#fff" strokeWidth="3.6" strokeLinecap="butt" />
    </svg>
  ),
};

/** A currency with no drawn flag: its code, which is never ambiguous. */
function CodeDisc({ code, overlap }: { code: string; overlap?: boolean }) {
  return (
    <Disc overlap={overlap} title={code}>
      <span className="font-mono text-[9px] font-semibold tracking-tight text-text-on-ink-muted">
        {code}
      </span>
    </Disc>
  );
}

function CurrencyDisc({ code, overlap }: { code: string; overlap?: boolean }) {
  const flag = FLAG[code];
  if (!flag) return <CodeDisc code={code} overlap={overlap} />;
  return (
    <Disc overlap={overlap} title={code} background="transparent">
      {flag}
    </Disc>
  );
}

/** Metals, by the symbol every periodic table uses. */
function ElementDisc({ symbol, tint, ink }: { symbol: string; tint: string; ink: string }) {
  return (
    <Disc title={symbol} background={tint}>
      <span className="font-display text-[13px] font-bold leading-none" style={{ color: ink }}>
        {symbol}
      </span>
    </Disc>
  );
}

function OilDisc() {
  return (
    <Disc title="Oil" background="#1c2226">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 3c3.6 4.3 6 7.5 6 10.3A6 6 0 0 1 6 13.3C6 10.5 8.4 7.3 12 3z"
          fill="#8ab4c8"
        />
      </svg>
    </Disc>
  );
}

function GlyphDisc({ glyph, tint, ink }: { glyph: string; tint: string; ink: string }) {
  return (
    <Disc title={glyph} background={tint}>
      <span className="text-[15px] font-bold leading-none" style={{ color: ink }}>
        {glyph}
      </span>
    </Disc>
  );
}

/** An index: the country it belongs to, and the number in its own name. */
function IndexDisc({ country, number }: { country: string; number: string }) {
  return (
    <>
      <Disc title={country} background="transparent">
        {FLAG[country] ?? <span className="font-mono text-[9px]">{country}</span>}
      </Disc>
      <Disc overlap title={number}>
        <span className="font-mono text-[10px] font-bold text-text-on-ink">{number}</span>
      </Disc>
    </>
  );
}

const GERMANY = (
  <svg viewBox="0 0 24 24" className="h-full w-full">
    <rect width="24" height="8" fill="#000" />
    <rect y="8" width="24" height="8" fill="#dd0000" />
    <rect y="16" width="24" height="8" fill="#ffce00" />
  </svg>
);

/** EURUSD -> ["EUR","USD"]; anything else stays whole. */
function splitPair(pair: string): [string, string | null] {
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (p.length === 6 && /^[A-Z]{6}$/.test(p)) return [p.slice(0, 3), p.slice(3)];
  return [p, null];
}

export default function InstrumentMark({ pair }: { pair: string }) {
  const raw = pair.toUpperCase();
  const wrap = (children: ReactNode) => (
    <span className="flex shrink-0 items-center">{children}</span>
  );

  // Metals. GOLD24-7 is the same metal on a different session.
  if (/^(GOLD|XAUUSD)/.test(raw)) return wrap(<ElementDisc symbol="Au" tint="#3a2f12" ink="#f5c451" />);
  if (/^(SILVER|XAGUSD)/.test(raw)) return wrap(<ElementDisc symbol="Ag" tint="#2a2f33" ink="#d7dee3" />);

  // Energy.
  if (/^(OIL|BRENT|WTI|USCRUDE)/.test(raw)) return wrap(<OilDisc />);

  // Crypto, by the currency characters Unicode already has.
  if (/^BTC/.test(raw)) return wrap(<GlyphDisc glyph="₿" tint="#3a2a0c" ink="#f7931a" />);
  if (/^ETH/.test(raw)) return wrap(<GlyphDisc glyph="Ξ" tint="#20243a" ink="#8c92e8" />);

  // Indices: never the index owner's logo, only where it trades and the
  // number that is already in the instrument's name.
  if (/^US100/.test(raw)) return wrap(<IndexDisc country="USD" number="100" />);
  if (/^US500/.test(raw)) return wrap(<IndexDisc country="USD" number="500" />);
  if (/^US30/.test(raw)) return wrap(<IndexDisc country="USD" number="30" />);
  if (/^GER40|^DE40|^GER30/.test(raw)) {
    return wrap(
      <>
        <Disc title="DE" background="transparent">
          {GERMANY}
        </Disc>
        <Disc overlap title="40">
          <span className="font-mono text-[10px] font-bold text-text-on-ink">40</span>
        </Disc>
      </>
    );
  }

  const [base, quote] = splitPair(raw);
  if (quote) {
    return wrap(
      <>
        <CurrencyDisc code={base} />
        <CurrencyDisc code={quote} overlap />
      </>
    );
  }

  // Anything else — a single share, a new instrument — keeps the monogram.
  // One initial reads as a mark; three characters read as a word that got
  // cut off, which is what "GOL" for GOLD used to look like.
  return wrap(
    <Disc title={raw}>
      <span className="font-display text-[13px] font-semibold text-text-on-ink-muted">
        {raw.slice(0, 1)}
      </span>
    </Disc>
  );
}
