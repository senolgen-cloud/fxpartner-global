"use client";
import { useLocalizedData } from "@/components/useLocalizedData";
import { useTr } from "@/components/useTr";

import React, { useState } from "react";
import Link from "@/components/LocaleLink";
import ChevronRight from "@/components/ChevronRight";
import {
  propFirmsByScore,
  getPropFirmScores,
  PAYOUT_STATUS_LABEL,
  formatDrawdown,
  type PropFirm,
} from "@/data/propFirms";

// Karşılaştırma tablosunda hangi kriterler var. ComparisonTable.tsx'teki
// COMPARISON_CRITERIA deseninin prop karşılığı — kriter listesi tek yerde
// dursun ki başlıklarla hücreler birbirinden ayrılmasın.
const PROP_CRITERIA = [
  "Index",
  "İndirim",
  "Kâr Payı",
  "Giriş Ücreti",
  "Günlük DD",
  "Maks. DD",
  "Min. Gün",
  "Ödeme Kanıtı",
] as const;

// Segment, model filtresinin ÜSTÜNDE ve ondan görsel olarak ayrı duruyor:
// CFD ve futures firmaları karşılaştırılabilir ürünler değil (dolar vs yüzde
// drawdown, NinjaTrader vs MT5), o yüzden bu bir filtre değil bir sekme gibi
// davranmalı. Varsayılan CFD — sitenin kitlesi ağırlıklı olarak orada.
type SegmentFilter = "cfd" | "futures";
const SEGMENT_LABEL: Record<SegmentFilter, string> = {
  cfd: "Forex / CFD",
  futures: "Futures",
};

type ModelFilter = "Tümü" | "1-step" | "2-step" | "instant";
const MODEL_FILTERS: ModelFilter[] = ["Tümü", "1-step", "2-step", "instant"];

const MODEL_LABEL: Record<Exclude<ModelFilter, "Tümü">, string> = {
  "1-step": "1 Aşamalı",
  "2-step": "2 Aşamalı",
  instant: "Anında Fonlama",
};

// Ödeme kanıtı rozetinin rengi. "verified" dışındaki her şey kasıtlı olarak
// sessiz renkte — bir firmayı doğrulanmadan önce görsel olarak öne çıkarmak,
// isPromotable() kuralını tasarım üzerinden delmek olurdu.
const PAYOUT_BADGE: Record<PropFirm["payoutProof"]["status"], string> = {
  verified: "border-signal/40 bg-signal/15 text-signal",
  monitored: "border-hairline bg-ink-soft text-text-on-ink-muted",
  warning: "border-red-500/40 bg-red-500/10 text-red-400",
  none: "border-hairline bg-ink-soft text-text-on-ink-muted",
};

// Ürün uyumu metinleri. Kullanıcının fonlanmış hesabını kaybetmesine yol
// açabilecek tek bilgi bu olduğu için ifadeler kasıtlı olarak net: "belirsiz"
// durumda bile eylem önerisi veriliyor ("firmaya sorun"), çünkü sessiz
// bırakmak izin varmış gibi okunuyor.
const COPY_TRADING_NOTE: Record<PropFirm["copyTradingAllowed"], string> = {
  banned: "Yasak — bu hesapta copy trading kullanılamaz.",
  restricted:
    "Koşullu — yalnızca kendi hesaplarınız arasında. FXPARTNER CopyTrade gibi üçüncü taraf kopyalama yasak.",
  allowed: "İzin veriliyor.",
  unknown: "Doğrulanmadı — kullanmadan önce firmaya sorun.",
};

const SIGNAL_NOTE: Record<PropFirm["signalServiceAllowed"], string> = {
  banned: "Yasak — dış sinyal servisiyle işlem yapmak kural ihlali sayılır.",
  allowed: "İzin veriliyor.",
  unknown: "Doğrulanmadı — kullanmadan önce firmaya yazılı olarak sorun.",
};

/**
 * İndirim hücresi.
 *
 * Üç durum var ve üçü de açıkça yazılır — best2traders'ın "No discount code"
 * yaklaşımının doğru kısmı bu (bkz. docs/competitor-best2traders-analysis.md
 * Bölüm 2.2): indirimi olmayan firmayı boş bırakmak, okuyucuya indirim varmış
 * gibi arattırıyor. Teyit edilmemiş oran ise sayı olarak HİÇ gösterilmiyor.
 */
function DiscountCell({ firm }: { firm: PropFirm }) {
  const [copied, setCopied] = useState(false);
  const tr = useTr();
  const d = firm.discount;

  if (!d) {
    return (
      <span className="font-mono text-[11px] text-text-on-ink-muted">{tr("İndirim yok")}</span>
    );
  }

  if (d.status !== "live") {
    return (
      <span
        title={d.note}
        className="font-mono text-[11px] text-text-on-ink-muted underline decoration-dotted underline-offset-2"
      >
        {tr("Teyit bekliyor")}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {d.code ? (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(d.code!).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              },
              () => {} // pano erişimi reddedilirse sessizce geç
            );
          }}
          aria-label={`${d.code} indirim kodunu kopyala`}
          className="rounded border border-dashed border-signal/50 bg-signal/10 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.05em] text-signal transition-colors hover:bg-signal/20"
        >
          {copied ? "Kopyalandı" : d.code}
        </button>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-signal">
          Linkte otomatik
        </span>
      )}
      {typeof d.percent === "number" && (
        <span className="font-mono text-[11px] font-semibold text-gold">
          %{d.percent}
        </span>
      )}
    </div>
  );
}

/** Giriş ücreti hücresi — indirim teyitliyse üstü çizili liste fiyatı + indirimli fiyat. */
function PriceCell({ firm }: { firm: PropFirm }) {
  const d = firm.discount;
  const showBoth =
    d?.status === "live" && d.priceFrom && d.priceFromDiscounted;

  if (!showBoth) {
    return (
      <span className="font-mono text-sm text-text-on-ink">{firm.challengeFeeFrom}</span>
    );
  }

  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="font-mono text-[11px] text-text-on-ink-muted line-through">
        {d.priceFrom}
      </span>
      <span className="font-mono text-sm font-semibold text-signal">
        {d.priceFromDiscounted}
      </span>
    </div>
  );
}

/** Bir firmanın en geniş (en gevşek) kural setini özetler — tabloda tek satır gösterebilmek için. */
function headlineRules(firm: PropFirm) {
  if (firm.rules.length === 0) return null;
  // En yüksek maksimum drawdown'a sahip kural seti, trader için en yönetilebilir
  // olanıdır; tabloda "en iyi durum"u göstermek, satır başına tek sayı vermenin
  // en dürüst yolu. Detaylı hâli açılır satırda listeleniyor.
  return [...firm.rules].sort((a, b) => b.maxDrawdown - a.maxDrawdown)[0];
}

// Ranked once at module scope, not per render: the ordering is derived from
// static data and a fresh array on every render would defeat the memo in
// useLocalizedData, re-walking the whole set for a value that never moves.
const RANKED_FIRMS = propFirmsByScore();

export default function PropFirmComparisonTable() {
  const tr = useTr();
  const firms = useLocalizedData(RANKED_FIRMS);
  const criteria = PROP_CRITERIA.map((c) => tr(c));
  const [activeSegment, setActiveSegment] = useState<SegmentFilter>("cfd");
  const [activeModel, setActiveModel] = useState<ModelFilter>("Tümü");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const ranked = firms.filter((f) => f.segment === activeSegment);
  const filtered =
    activeModel === "Tümü"
      ? ranked
      : ranked.filter((f) => f.models.includes(activeModel));

  return (
    <div>
      <div
        role="tablist"
        aria-label={tr("Enstrüman segmenti")}
        className="mb-4 inline-flex rounded-full border border-hairline p-1"
      >
        {(Object.keys(SEGMENT_LABEL) as SegmentFilter[]).map((seg) => {
          const active = activeSegment === seg;
          const count = firms.filter((f) => f.segment === seg).length;
          return (
            <button
              key={seg}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveSegment(seg);
                // Segment değişince model filtresi sıfırlanmalı: futures'ta
                // 2 aşamalı model neredeyse yok, seçili kalırsa boş tablo çıkar.
                setActiveModel("Tümü");
                setExpandedSlug(null);
              }}
              className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                active
                  ? "bg-signal text-ink"
                  : "text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {tr(SEGMENT_LABEL[seg])} ({count})
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {MODEL_FILTERS.map((model) => (
          <button
            key={model}
            type="button"
            onClick={() => setActiveModel(model)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              activeModel === model
                ? "border-signal bg-signal/15 text-signal"
                : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
            }`}
          >
            {model === "Tümü" ? tr("Tümü") : tr(MODEL_LABEL[model])}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-hairline">
        <table className="w-full min-w-[1020px] border-collapse text-start">
          <thead>
            <tr className="border-b border-hairline bg-ink-soft">
              <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
                Prop Firma
              </th>
              {criteria.map((label) => (
                <th
                  key={label}
                  className={`px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] ${
                    label === "Index" ? "text-gold" : "text-text-on-ink-muted"
                  }`}
                >
                  {label}
                </th>
              ))}
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((firm) => {
              const { composite } = getPropFirmScores(firm);
              const rule = headlineRules(firm);
              const open = expandedSlug === firm.slug;

              return (
                <React.Fragment key={firm.slug}>
                  <tr className="border-b border-hairline/60 align-middle">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/prop-firmalar/${firm.slug}`}
                          className="font-poppins text-sm font-semibold text-text-on-ink hover:text-signal"
                        >
                          {firm.name}
                        </Link>
                        {/* Ortaklık ilişkisi gizlenmez — ama sıralamayı da
                            değiştirmez. Bkz. propFirms.ts dosya başı notu. */}
                        {firm.isPartner && (
                          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
                            Ortak
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-text-on-ink-muted">
                        {firm.backedBy ? `${firm.backedBy} destekli` : `${firm.founded}`}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-sm font-semibold text-gold">
                      {composite.toFixed(1)}
                    </td>
                    <td className="px-5 py-4">
                      <DiscountCell firm={firm} />
                    </td>
                    <td className="px-5 py-4 text-sm text-text-on-ink">
                      {firm.profitSplit}
                    </td>
                    <td className="px-5 py-4">
                      <PriceCell firm={firm} />
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-text-on-ink">
                      {rule ? formatDrawdown(rule.dailyDrawdown, rule.drawdownUnit) : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-text-on-ink">
                      {rule ? formatDrawdown(rule.maxDrawdown, rule.drawdownUnit) : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-text-on-ink">
                      {rule?.minTradingDays === null || rule?.minTradingDays === undefined
                        ? "Yok"
                        : rule.minTradingDays}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                          PAYOUT_BADGE[firm.payoutProof.status]
                        }`}
                      >
                        {tr(PAYOUT_STATUS_LABEL[firm.payoutProof.status])}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-end">
                      {/* Row actions, same vocabulary as the cards: no mono
                          uppercase, no arrow glyph, and a 44px target
                          instead of an 11px line of text that a thumb has
                          to hunt for inside a table cell. */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setExpandedSlug(open ? null : firm.slug)}
                          aria-expanded={open}
                          className="inline-flex h-11 items-center whitespace-nowrap rounded-xl px-3 text-[13px] font-medium text-signal transition-colors hover:bg-ink-soft"
                        >
                          {open ? tr("Kapat") : tr("Detay")}
                        </button>
                        <Link
                          href={`/prop-firmalar/${firm.slug}`}
                          className="inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-xl px-3 text-[13px] font-medium text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
                        >
                          {tr("İnceleme")}
                          <ChevronRight />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {open && (
                    <tr className="border-b border-hairline/60 bg-ink-soft/40">
                      <td colSpan={PROP_CRITERIA.length + 2} className="px-5 py-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <p className="text-sm leading-relaxed text-text-on-ink-muted">
                              {firm.summary}
                            </p>

                            <h4 className="mt-5 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                              Challenge Modelleri
                            </h4>
                            <ul className="mt-2 space-y-2">
                              {firm.rules.map((r) => (
                                <li
                                  key={r.name}
                                  className="rounded-lg border border-hairline bg-ink/40 px-3 py-2 text-xs text-text-on-ink-muted"
                                >
                                  <span className="font-semibold text-text-on-ink">
                                    {r.name}
                                  </span>
                                  {" — "}
                                  hedef %{r.profitTargets.join(" → %")}, günlük %
                                  {r.dailyDrawdown}, maks. %{r.maxDrawdown}
                                  {r.minTradingDays !== null &&
                                    `, min. ${r.minTradingDays} gün`}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-signal">
                              {tr("Artılar")}
                            </h4>
                            <ul className="mt-2 space-y-1.5">
                              {firm.pros.map((p) => (
                                <li key={p} className="text-xs text-text-on-ink-muted">
                                  + {p}
                                </li>
                              ))}
                            </ul>

                            <h4 className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                              Eksiler
                            </h4>
                            <ul className="mt-2 space-y-1.5">
                              {firm.cons.map((c) => (
                                <li key={c} className="text-xs text-text-on-ink-muted">
                                  − {c}
                                </li>
                              ))}
                            </ul>

                            {/* Ürün uyumu — kullanıcının hesabını kaybetmesine
                                yol açabilecek tek bilgi bu, o yüzden her zaman
                                gösteriliyor. İki alan ayrı: copy trading ve
                                sinyal kullanımı farklı kurallara tabi olabiliyor. */}
                            <div className="mt-4 space-y-2">
                              <div className="rounded-lg border border-hairline bg-ink/40 px-3 py-2.5">
                                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                                  Copy Trading
                                </p>
                                <p className="mt-1 text-xs text-text-on-ink">
                                  {COPY_TRADING_NOTE[firm.copyTradingAllowed]}
                                </p>
                              </div>
                              <div className="rounded-lg border border-hairline bg-ink/40 px-3 py-2.5">
                                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                                  {tr("Sinyal Servisi Kullanımı")}
                                </p>
                                <p className="mt-1 text-xs text-text-on-ink">
                                  {SIGNAL_NOTE[firm.signalServiceAllowed]}
                                </p>
                              </div>
                            </div>

                            {/* Broker desteği iddiasının yanındaki zorunlu
                                açıklama — "destekli" ≠ "regüle". */}
                            {firm.backingNote && (
                              <p className="mt-3 text-[11px] leading-relaxed text-text-on-ink-muted">
                                <span className="text-text-on-ink">
                                  {firm.backedBy} desteği:
                                </span>{" "}
                                {firm.backingNote}
                                {firm.backedByBrokerSlug && (
                                  <>
                                    {" "}
                                    <Link
                                      href={`/brokers/${firm.backedByBrokerSlug}`}
                                      className="text-signal hover:text-signal-strong"
                                    >
                                      Broker incelemesi →
                                    </Link>
                                  </>
                                )}
                              </p>
                            )}

                            <p className="mt-3 text-[11px] leading-relaxed text-text-on-ink-muted">
                              <span className="text-text-on-ink">{tr("Ödeme kanıtı:")}</span>{" "}
                              {firm.payoutProof.note}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-on-ink-muted">
        {tr("Index puanı dört eksenin ortalamasıdır: kural seti, maliyet, ödeme sicili ve şeffaflık.")}{" "}
        <strong className="text-text-on-ink">{tr("Ortaklık, puanlamayı değiştirmez")}</strong>{" "}
        {tr("— ticari ilişkimiz olan firmalar “Ortak” etiketiyle işaretlenir ve diğerleriyle aynı kriterlere göre değerlendirilir. Günlük DD / Maks. DD, firmanın en geniş kural setini gösterir; sıkı planlar detay satırında listelenmiştir.")}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-text-on-ink-muted">
        <strong className="text-text-on-ink">{tr("İndirim sütunu:")}</strong>{" "}
        {tr("Yalnızca koşulları teyit edilmiş indirimler oran ve kodla gösterilir.")}{" "}
        <span className="text-text-on-ink">{tr("Teyit bekliyor")}</span>
        {tr(", anlaşmanın var ama oranın veya nasıl uygulandığının henüz doğrulanmadığı anlamına gelir — doğrulanana kadar sayı yayımlamıyoruz.")}{" "}
        <span className="text-text-on-ink">{tr("İndirim yok")}</span>{" "}
        {tr("ise o firmayla indirim anlaşmamız olmadığını açıkça belirtir; boş bırakıp aratmıyoruz.")}
      </p>
    </div>
  );
}
