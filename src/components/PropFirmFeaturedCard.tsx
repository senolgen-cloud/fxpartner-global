import { tr, trf } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import ChevronRight from "@/components/ChevronRight";
import { getFeaturedPartner, getPropFirmScores, hasActiveLink } from "@/data/propFirms";
import { trData } from "@/lib/localizeContent";

/**
 * Öne çıkarılan prop ortağı kartı.
 *
 * Tasarımın tek kuralı: bunun bir SIRALAMA değil, bir YERLEŞİM olduğu
 * kartın üzerinde okunabilir olmalı. "Ortaklık yerleşimi" etiketi ve
 * Index puanının kartta olduğu gibi gösterilmesi (yükseltilmeden) bunu
 * sağlıyor — okuyucu firmanın tabloda kaçıncı olduğunu buradan da görebilir.
 *
 * Bkz. data/propFirms.ts → getFeaturedPartner().
 */
export default function PropFirmFeaturedCard() {
  const firm = trData(getFeaturedPartner());
  if (!firm) return null;

  const { composite } = getPropFirmScores(firm);
  // Link ticari karara bağlı; rozet ise editoryal duruma. İkisi ayrı —
  // bkz. propFirms.ts → hasActiveLink() / isPromotable().
  const linkOn = hasActiveLink(firm);
  const verified = firm.payoutProof.status === "verified";
  const d = firm.discount;
  const discountLive = d?.status === "live";

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.07] to-transparent p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          {tr("Ortaklık yerleşimi")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
          {trf("Sıralama değil — tabloda {score} puanla yer alıyor", {
            score: composite.toFixed(1),
          })}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="font-poppins text-2xl font-semibold text-text-on-ink md:text-3xl">
            {firm.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-gold">{firm.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-text-on-ink-muted">
            {firm.summary}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              {tr("Giriş")}
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.challengeFeeFrom}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              {tr("Kâr Payı")}
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.profitSplit}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              {tr("Ödeme")}
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.payoutCycle}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              {tr("Destek")}
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.backedBy ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Broker desteği iddiasının yanındaki zorunlu açıklama — bkz.
          trData(propFirms).ts → backingNote. "Destekli" ifadesi "regüle" diye
          okunmamalı. */}
      {firm.backingNote && (
        <p className="mt-5 rounded-lg border border-hairline bg-ink/40 px-4 py-3 text-xs leading-relaxed text-text-on-ink-muted">
          {firm.backingNote}
          {firm.backedByBrokerSlug && (
            <>
              {" "}
              <Link
                href={`/brokers/${firm.backedByBrokerSlug}`}
                className="text-signal hover:text-signal-strong"
              >
                {firm.backedBy} broker incelemesi →
              </Link>
            </>
          )}
        </p>
      )}

      {/* Same one-row shape as the broker cards: a filled primary and a
          ghost secondary, both 44px, rounded-xl. Was a mono uppercase pill
          beside a mono uppercase text link ending in an arrow — two
          different weights of the same shouting, and the arrow points the
          wrong way once /ar flips the page. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-hairline pt-5">
        {/* The two actions travel together in their own row; the discount
            code and the unverified-payout warning are siblings of that
            pair, not of each button, and still wrap away from it. */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Link
            href="/prop-firmalar"
            className="inline-flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl bg-signal px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-signal-strong sm:flex-none sm:px-5"
          >
            {tr("İncelemeyi gör")}
          </Link>
          {linkOn && (
            <a
              href={firm.referralUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-3 text-[13px] font-medium text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
            >
              {tr("Siteye Git")}
              <ChevronRight />
            </a>
          )}
        </div>

        {discountLive && d.code && (
          <span className="font-mono text-xs text-text-on-ink-muted">
            {tr("İndirim kodu:")}{" "}
            <span className="rounded border border-dashed border-signal/50 bg-signal/10 px-2 py-0.5 uppercase text-signal">
              {d.code}
            </span>
            {typeof d.percent === "number" && (
              <span className="ms-2 font-semibold text-gold">%{d.percent}</span>
            )}
          </span>
        )}

        {/* Link açık olsa bile doğrulama durumu olduğu gibi söylenir. Ticari
            karar, editoryal iddianın yerine geçmez. */}
        {!verified && (
          <span className="w-full font-mono text-[11px] leading-relaxed text-text-on-ink-muted">
            {trf(
              "Bağımsız ödeme kanıtı doğrulamamız henüz tamamlanmadı — bu firma “{status}” statüsünde. Hesap açmadan önce kendi araştırmanızı yapın.",
              {
                status:
                  firm.payoutProof.status === "monitored"
                    ? tr("İzleniyor")
                    : tr("Doğrulanmadı"),
              }
            )}
          </span>
        )}
      </div>
    </div>
  );
}
