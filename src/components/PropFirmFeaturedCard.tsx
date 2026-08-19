import Link from "next/link";
import { getFeaturedPartner, getPropFirmScores, hasActiveLink } from "@/data/propFirms";

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
  const firm = getFeaturedPartner();
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
          Ortaklık yerleşimi
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
          Sıralama değil — tabloda {composite.toFixed(1)} puanla yer alıyor
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
              Giriş
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.challengeFeeFrom}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              Kâr Payı
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.profitSplit}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              Ödeme
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.payoutCycle}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
              Destek
            </dt>
            <dd className="mt-1 font-poppins text-lg font-semibold text-text-on-ink">
              {firm.backedBy ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Broker desteği iddiasının yanındaki zorunlu açıklama — bkz.
          propFirms.ts → backingNote. "Destekli" ifadesi "regüle" diye
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

      <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-hairline pt-5">
        <Link
          href="/prop-firmalar"
          className="rounded-full bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:bg-signal-strong"
        >
          İncelemeyi gör
        </Link>
        {linkOn && (
          <a
            href={firm.referralUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.1em] text-signal hover:text-signal-strong"
          >
            {firm.name}&apos;a git →
          </a>
        )}

        {discountLive && d.code && (
          <span className="font-mono text-xs text-text-on-ink-muted">
            İndirim kodu:{" "}
            <span className="rounded border border-dashed border-signal/50 bg-signal/10 px-2 py-0.5 uppercase text-signal">
              {d.code}
            </span>
            {typeof d.percent === "number" && (
              <span className="ml-2 font-semibold text-gold">%{d.percent}</span>
            )}
          </span>
        )}

        {/* Link açık olsa bile doğrulama durumu olduğu gibi söylenir. Ticari
            karar, editoryal iddianın yerine geçmez. */}
        {!verified && (
          <span className="w-full font-mono text-[11px] leading-relaxed text-text-on-ink-muted">
            Bağımsız ödeme kanıtı doğrulamamız henüz tamamlanmadı — bu firma
            &ldquo;{firm.payoutProof.status === "monitored" ? "İzleniyor" : "Doğrulanmadı"}&rdquo;
            statüsünde. Hesap açmadan önce kendi araştırmanızı yapın.
          </span>
        )}
      </div>
    </div>
  );
}
