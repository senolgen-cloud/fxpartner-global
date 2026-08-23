import { tr } from "@/lib/chrome";
import { partnerTiers } from "@/data/partnerProgram";
import { trData } from "@/lib/localizeContent";

// Illustrative preview data only — this is a mock of what a partner's own
// dashboard looks like, not a live feed of real referral activity.
const recentActivity = [
  { client: "Partner Müşterisi #041", country: "AE", lots: 6.2, commission: 31 },
  { client: "Partner Müşterisi #037", country: "DE", lots: 3.4, commission: 17 },
  { client: "Partner Müşterisi #052", country: "SG", lots: 9.1, commission: 46 },
  { client: "Partner Müşterisi #029", country: "TR", lots: 4.8, commission: 24 },
  { client: "Partner Müşterisi #063", country: "ZA", lots: 2.1, commission: 11 },
  { client: "Partner Müşterisi #018", country: "BR", lots: 7.6, commission: 38 },
  { client: "Partner Müşterisi #044", country: "GB", lots: 5.0, commission: 25 },
];

const currentTierIndex = 2; // "Gold" — illustrative example partner
// Untranslated here on purpose: tierProgress below is arithmetic over the
// thresholds, which do not change with language. The names are translated
// where they are rendered instead.
const currentTier = partnerTiers[currentTierIndex];
const nextTier = partnerTiers[currentTierIndex + 1];
const referredClients = 34;
const tierProgress = nextTier
  ? Math.min(
      100,
      Math.round(
        ((referredClients - currentTier.minReferred) /
          (nextTier.minReferred - currentTier.minReferred)) *
          100
      )
    )
  : 100;

export default function PartnerDashboardPreview() {
  return (
    <div className="relative rounded-3xl border border-gold/25 bg-gradient-to-b from-ink-soft to-ink p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-poppins text-lg font-bold tracking-tight text-text-on-ink">
            FXPARTNER
          </span>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            {tr("Partner Paneli · Örnek önizleme")}
          </p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-right">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-gold">
            Bu Ay
          </p>
          <p className="font-poppins text-xl font-bold text-gold">$1,240</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
          {tr("Son Referans Etkinliği")}
        </p>
        <div className="relative mt-2 h-[220px] overflow-hidden rounded-xl border border-hairline bg-ink/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-ink-soft to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-ink-soft to-transparent"
          />
          <div className="ticker-track-vertical">
            {[...trData(recentActivity), ...trData(recentActivity)].map((row, i) => (
              <div
                key={`${row.client}-${i}`}
                className="flex items-center justify-between gap-3 border-b border-hairline/60 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-text-on-ink-muted">
                    {row.country}
                  </span>
                  <span className="font-poppins text-[13px] font-medium text-text-on-ink">
                    {row.client}
                  </span>
                </div>
                <span className="tabular-stat font-mono text-[12px] font-semibold text-gold">
                  +${row.commission}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-hairline pt-5">
        <div>
          <p className="font-poppins text-2xl font-bold text-text-on-ink">
            {referredClients}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            {tr("Referans Edilen Müşteri")}
          </p>
        </div>
        <div>
          <p className="font-poppins text-2xl font-bold text-text-on-ink">
            $340
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            {tr("Bekleyen Ödeme")}
          </p>
        </div>
        <div>
          <p className="font-poppins text-2xl font-bold text-gold">
            {trData(currentTier).name}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            Mevcut Seviye
          </p>
        </div>
      </div>

      {nextTier && (
        <div className="mt-5">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            <span>{trData(currentTier).name}</span>
            <span>{trData(nextTier).name}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal to-gold"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
