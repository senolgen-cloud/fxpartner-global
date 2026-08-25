import { tr, trLocale } from "@/lib/chrome";
import { getServerLocale } from "@/lib/serverLocale";
import type { PackageTier } from "@/lib/vip";
import { intlLocale } from "@/lib/i18n";
import StatementFigure from "@/components/account/StatementFigure";
import { accentHex } from "@/lib/accents";

// The panel's opening move.
//
// A member panel usually opens with a greeting and an email address, which
// tells the member something they already know. This opens with what their
// membership is doing right now — positions open on the tracked account, the
// hit rate those trades actually produced, and the cashback sitting in their
// name. Facts they own rather than a welcome.
//
// The form is borrowed from the thing being sold. This site's vernacular is
// an MT5 account statement: tabular monospace figures, hairline rules, the
// tick colours, the pulsing dot from the live board. So the numbers are not
// in cards — cards are the SaaS answer and would read like any other
// dashboard. They sit in a ruled strip, the way a statement footer does.
//
// The tier seal is the one loud element and everything else stays quiet
// around it: a ring in gold for VIP, signal for Pro, hairline for free. A
// member who upgrades should be able to see it changed without reading a
// word.

const TIER_RING: Record<PackageTier | "free", string> = {
  free: "border-hairline-light text-text-on-ink-muted",
  pro: "border-signal/60 text-signal",
  vip: "border-gold/70 text-gold",
};

const TIER_NAME: Record<PackageTier | "free", string> = {
  free: "ÜCRETSİZ",
  pro: "PRO",
  vip: "VIP",
};

export default function MemberStatement({
  action,
  bell,
  accent,
  name,
  email,
  memberSince,
  tier,
  openPositions,
  hitRate,
  hitRateTrades,
  cashbackUsd,
}: {
  /** Sign-out lives in the header rather than under it — a secondary action
   *  parked on its own line below the account summary reads like an orphan. */
  action?: React.ReactNode;
  /** The notification bell, rendered beside the sign-out control. */
  bell?: React.ReactNode;
  /** The colour the member picked in their profile. Null falls back to signal. */
  accent?: string | null;
  name: string | null;
  email: string | null;
  memberSince: Date;
  tier: PackageTier | "free";
  openPositions: number;
  hitRate: number | null;
  hitRateTrades: number;
  cashbackUsd: number;
}) {
  const locale = getServerLocale();
  const displayName = name?.trim() || email?.split("@")[0] || tr("Üye");
  const initial = displayName[0]?.toLocaleUpperCase("tr-TR") ?? "?";
  const hex = accentHex(accent);
  const intl = intlLocale[locale];

  return (
    <section className="overflow-hidden rounded-3xl border border-hairline-light/70 bg-gradient-to-b from-ink-soft to-ink">
      <div className="flex flex-col items-center gap-5 px-6 pt-8 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:text-left">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold"
          style={{ backgroundColor: `${hex}22`, color: hex, border: `2px solid ${hex}66` }}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-semibold text-text-on-ink sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted sm:justify-start">
            <span className={`rounded-full border px-2 py-0.5 ${TIER_RING[tier]}`}>
              {TIER_NAME[tier]}
            </span>
            {/* Stranded at the end of a line once the header centres and wraps on a
                phone, so it shows only where the two halves share a line. */}
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>
              {memberSince.toLocaleDateString(trLocale(), { month: "long", year: "numeric" })}
              {tr("'dan beri üye")}
            </span>
          </p>
        </div>
        {(bell || action) && (
          <div className="flex shrink-0 items-center gap-3">
            {bell && <div data-tour="bell">{bell}</div>}
            {action}
          </div>
        )}
      </div>

      {/* The statement strip. Ruled, not carded — see the note above. */}
      <div
        data-tour="figures"
        className="mt-7 flex flex-col divide-y divide-hairline-light/60 border-t border-hairline-light/60 sm:flex-row sm:divide-x sm:divide-y-0"
      >
        <StatementFigure
          label={tr("Şu an açık")}
          value={openPositions}
          hint={tr("takip edilen hesapta")}
          live={openPositions > 0}
          locale={intl}
        />
        <StatementFigure
          label={tr("30 gün isabet")}
          value={hitRate ?? 0}
          suffix={hitRate === null ? "" : "%"}
          hint={
            hitRate === null
              ? tr("henüz yeterli işlem yok")
              : `${hitRateTrades} ${tr("kapanan işlem")}`
          }
          locale={intl}
        />
        <StatementFigure
          label={tr("Biriken iade")}
          value={cashbackUsd}
          prefix="$"
          decimals={2}
          hint={cashbackUsd > 0 ? tr("hesabınıza işlendi") : tr("broker hesabı bağlayın")}
          tone={cashbackUsd > 0 ? "up" : "default"}
          locale={intl}
        />
      </div>
    </section>
  );
}
