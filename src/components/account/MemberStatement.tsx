import { tr, trLocale } from "@/lib/chrome";
import { formatPercent } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import type { PackageTier } from "@/lib/vip";

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

function Figure({
  label,
  value,
  hint,
  live = false,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  live?: boolean;
  tone?: "default" | "up";
}) {
  return (
    <div className="flex-1 px-5 py-4 text-center sm:text-left">
      <div className="flex items-center justify-center gap-1.5 sm:justify-start">
        {live && (
          <span
            aria-hidden="true"
            className="signal-dot h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
          />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-on-ink-muted">
          {label}
        </span>
      </div>
      <div
        className={`mt-1.5 font-display text-2xl font-semibold tabular-stat ${
          tone === "up" ? "text-tick-up" : "text-text-on-ink"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[11px] leading-snug text-text-on-ink-muted">{hint}</div>
      )}
    </div>
  );
}

export default function MemberStatement({
  action,
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

  return (
    <section className="overflow-hidden rounded-3xl border border-hairline-light/70 bg-gradient-to-b from-ink-soft to-ink">
      <div className="flex flex-col items-center gap-5 px-6 pt-8 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:text-left">
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[10px] font-semibold tracking-[0.1em] ${TIER_RING[tier]}`}
        >
          {TIER_NAME[tier]}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-semibold text-text-on-ink sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            {memberSince.toLocaleDateString(trLocale(), {
              month: "long",
              year: "numeric",
            })}
            {tr("'dan beri üye")}
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* The statement strip. Ruled, not carded — see the note above. */}
      <div className="mt-7 flex flex-col divide-y divide-hairline-light/60 border-t border-hairline-light/60 sm:flex-row sm:divide-x sm:divide-y-0">
        <Figure
          label={tr("Şu an açık")}
          value={String(openPositions)}
          hint={tr("takip edilen hesapta")}
          live={openPositions > 0}
        />
        <Figure
          label={tr("30 gün isabet")}
          value={hitRate === null ? "—" : formatPercent(hitRate, locale)}
          hint={
            hitRate === null
              ? tr("henüz yeterli işlem yok")
              : `${hitRateTrades} ${tr("kapanan işlem")}`
          }
        />
        <Figure
          label={tr("Biriken iade")}
          value={
            cashbackUsd > 0
              ? `$${cashbackUsd.toLocaleString(trLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "$0.00"
          }
          hint={cashbackUsd > 0 ? tr("hesabınıza işlendi") : tr("broker hesabı bağlayın")}
          tone={cashbackUsd > 0 ? "up" : "default"}
        />
      </div>
    </section>
  );
}
