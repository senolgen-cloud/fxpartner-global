import type { Metadata } from "next";
import { tr, trf, trLocale } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import {
  propFirms,
  getPropFirm,
  getPropFirmScores,
  hasActiveLink,
  PAYOUT_STATUS_LABEL,
  formatDrawdown,
  type PropFirm,
} from "@/data/propFirms";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { trData } from "@/lib/localizeContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const YEAR = new Date().getFullYear();

export function generateStaticParams() {
  return trData(propFirms).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const firm = trData(getPropFirm(slug));
  if (!firm) return {};

  const { composite } = getPropFirmScores(firm);
  // Türkçe arama kalıbı: marka adı + "inceleme" / "yorum" / "güvenilir mi".
  // Üçü de başlıkta veya açıklamada geçiyor.
  return {
    title: trf("{firm} İncelemesi {year} — Kurallar, Ücretler ve Ödeme", {
      firm: firm.name,
      year: YEAR,
    }),
    description: trf(
      "{firm} prop firma incelemesi: challenge kuralları, drawdown limitleri, kâr paylaşımı, ücretler ve ödeme sicili. Bağımsız Index puanı {score}/10. {firm} güvenilir mi, artıları ve eksileri neler?",
      { firm: firm.name, score: composite.toFixed(1) }
    ),
    alternates: { canonical: `/prop-firmalar/${firm.slug}` },
    openGraph: {
      title: trf("{firm} İncelemesi — Index {score}/10", {
        firm: firm.name,
        score: composite.toFixed(1),
      }),
      description: firm.tagline,
      url: `${SITE_URL}/prop-firmalar/${firm.slug}`,
    },
  };
}

const COPY_TRADING_NOTE: Record<PropFirm["copyTradingAllowed"], string> = {
  banned: "Yasak — bu hesapta copy trading kullanılamaz.",
  restricted:
    "Koşullu — yalnızca kendi hesaplarınız arasında. Üçüncü taraf kopyalama yasak.",
  allowed: "İzin veriliyor.",
  unknown: "Doğrulanmadı — kullanmadan önce firmaya sorun.",
};

const SIGNAL_NOTE: Record<PropFirm["signalServiceAllowed"], string> = {
  banned: "Yasak — dış sinyal servisiyle işlem yapmak kural ihlali sayılır.",
  allowed: "İzin veriliyor.",
  unknown: "Doğrulanmadı — kullanmadan önce firmaya yazılı olarak sorun.",
};

const EA_NOTE: Record<PropFirm["eaAllowed"], string> = {
  banned: "Yasak.",
  restricted: "Koşullu — kısıtlar için firmanın kural metnine bakın.",
  allowed: "İzin veriliyor.",
  unknown: "Doğrulanmadı.",
};

/** Firma bazlı SSS — gerçek Türkçe arama kalıplarıyla, AEO için düz metin. */
function firmFaqs(firm: PropFirm) {
  const { composite } = getPropFirmScores(firm);
  const cheapest = [...firm.rules].sort(
    (a, b) => (a.dailyDrawdown ?? Infinity) - (b.dailyDrawdown ?? Infinity)
  )[0];

  const faqs = [
    {
      q: trf("{firm} güvenilir mi?", { firm: firm.name }),
      a: [
        // Two variants rather than a spliced clause: the "backed by" phrase
        // is a relative clause in Turkish and a translator has to be able to
        // move it, which they cannot do if it arrives as an opaque hole.
        firm.backedBy
          ? trf("{firm}, {year} yılında kurulmuş ve {backer} altyapısını kullanan bir prop firmadır.", {
              firm: firm.name,
              year: firm.founded,
              backer: firm.backedBy,
            })
          : trf("{firm}, {year} yılında kurulmuş bir prop firmadır.", {
              firm: firm.name,
              year: firm.founded,
            }),
        trf("FXPARTNER’ın bağımsız değerlendirmesinde 10 üzerinden {score} puan alıyor.", {
          score: composite.toFixed(1),
        }),
        trf("Ödeme kanıtı durumu şu an “{status}”.", {
          status: trData(PAYOUT_STATUS_LABEL)[firm.payoutProof.status],
        }),
        firm.payoutProof.note,
        tr("Prop firma sektöründe 2020-2026 arasında 80’den fazla firma kapandığı için, hangi firma olursa olsun challenge ücretini kaybetmeyi göze alabileceğiniz bir tutar olarak değerlendirmelisiniz."),
      ].join(" "),
    },
    {
      q: trf("{firm} challenge ücreti ne kadar?", { firm: firm.name }),
      a: [
        trf("{firm}’da challenge ücretleri {fee} seviyesinden başlıyor.", {
          firm: firm.name,
          fee: firm.challengeFeeFrom,
        }),
        trf("Hesap büyüklükleri: {sizes}.", { sizes: firm.accountSizes.join(", ") }),
        firm.discount?.status === "live" && firm.discount.code
          ? trf("FXPARTNER okuyucuları için {code} kodu ile %{percent} indirim geçerli.", {
              code: firm.discount.code,
              percent: firm.discount.percent ?? 0,
            })
          : tr("Şu anda doğrulanmış bir indirim kodumuz bulunmuyor."),
      ].join(" "),
    },
    {
      q: trf("{firm} kuralları neler?", { firm: firm.name }),
      a:
        firm.rules
          .map((r) => {
            const target =
              r.profitTargets.length === 0
                ? tr("kâr hedefi yok (doğrudan fonlanmış hesap)")
                : trf("kâr hedefi %{targets}", {
                    targets: r.profitTargets.join(tr(", ardından %")),
                  });
            const limits = trf(
              "{plan}: {target}, günlük zarar limiti {daily}, toplam zarar limiti {max}",
              {
                plan: r.name,
                target,
                daily: formatDrawdown(r.dailyDrawdown, r.drawdownUnit, trLocale()),
                max: formatDrawdown(r.maxDrawdown, r.drawdownUnit, trLocale()),
              }
            );
            return (
              limits +
              (r.minTradingDays !== null
                ? trf(", minimum {days} işlem günü", { days: r.minTradingDays })
                : tr(", minimum işlem günü şartı yok"))
            );
          })
          .join(". ") +
        trf(". Kâr paylaşımı: {split}. Ödeme döngüsü: {cycle}.", {
          split: firm.profitSplit,
          cycle: firm.payoutCycle,
        }),
    },
    {
      q: trf("{firm}’da copy trading ve sinyal kullanılabilir mi?", { firm: firm.name }),
      a: [
        trf("Copy trading: {note}", { note: trData(COPY_TRADING_NOTE)[firm.copyTradingAllowed] }),
        trf("Sinyal servisi: {note}", { note: trData(SIGNAL_NOTE)[firm.signalServiceAllowed] }),
        trf("EA (otomatik sistem): {note}", { note: trData(EA_NOTE)[firm.eaAllowed] }),
        tr("Kural ihlali, birikmiş kâr ödenmeden hesabın kapatılmasıyla sonuçlanabilir; bu yüzden herhangi bir otomatik araç veya dış sinyal kullanmadan önce firmadan yazılı teyit almanız önerilir."),
      ].join(" "),
    },
  ];

  if (cheapest) {
    faqs.push({
      q: trf("{firm} challenge’ı nasıl geçilir?", { firm: firm.name }),
      a:
        trf(
          "{firm}’da elenmelerin büyük çoğunluğu kâr hedefine ulaşamamaktan değil, zarar limitinin aşılmasından kaynaklanır. En sıkı planda",
          { firm: firm.name }
        ) +
        " " +
        (cheapest.dailyDrawdown === null
          ? trf("ayrı bir günlük zarar limiti yok; hesabı yöneten tek sınır {max} toplam limit", {
              max: formatDrawdown(cheapest.maxDrawdown, cheapest.drawdownUnit, trLocale()),
            })
          : trf("günlük limit {daily}, toplam limit {max}", {
              daily: formatDrawdown(cheapest.dailyDrawdown, cheapest.drawdownUnit, trLocale()),
              max: formatDrawdown(cheapest.maxDrawdown, cheapest.drawdownUnit, trLocale()),
            })) +
        tr(
          ". Bu, hesap büyüklüğüne göre işlem başına riskinizi önceden hesaplamanız gerektiği anlamına gelir — tek bir aşırı pozisyon her iki limiti de tetikleyebilir. Pozisyon büyüklüğü hesaplamak için pozisyon hesaplayıcımızı kullanabilirsiniz."
        ),
    });
  }

  return faqs;
}

export default async function PropFirmDetailPage({
  params,
}: {
  params: Promise<{ slug: string ; locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const { slug } = await params;
  const firm = trData(getPropFirm(slug));
  if (!firm) notFound();

  const scores = getPropFirmScores(firm);
  const faqs = firmFaqs(firm);
  const linkOn = hasActiveLink(firm);
  const d = firm.discount;
  const discountLive = d?.status === "live";
  const rankInList = [...propFirms]
    .sort((a, b) => getPropFirmScores(b).composite - getPropFirmScores(a).composite)
    .findIndex((f) => f.slug === firm.slug) + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Prop Firmalar", url: `${SITE_URL}/prop-firmalar` },
              { name: firm.name, url: `${SITE_URL}/prop-firmalar/${firm.slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      {/* Review şeması: puanlama makine tarafından okunabilir olsun. bestRating
          10 çünkü Index 10'luk skalada. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
              "@type": "Organization",
              name: firm.name,
              foundingDate: String(firm.founded),
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: scores.composite,
              bestRating: 10,
              worstRating: 0,
            },
            author: { "@type": "Organization", name: "FXPARTNER" },
            reviewBody: firm.summary,
          }),
        }}
      />

      <main className="flex-1 bg-paper-high">
        {/* Hero */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <nav className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              <Link href="/prop-firmalar" className="hover:text-signal">
                Prop Firmalar
              </Link>
              <span className="mx-2">/</span>
              <span className="text-text-on-ink">{firm.name}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {firm.isPartner && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Ortak
                </span>
              )}
              <span className="rounded-full border border-hairline bg-ink-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
                {trData(PAYOUT_STATUS_LABEL)[firm.payoutProof.status]}
              </span>
            </div>

            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {firm.name} incelemesi
            </h1>
            <p className="mt-3 font-mono text-sm text-gold">{firm.tagline}</p>

            <div className="mt-8 flex flex-wrap items-end gap-10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Index Puanı")}
                </span>
                <p className="mt-1 font-poppins text-5xl font-semibold text-gold">
                  {scores.composite.toFixed(1)}
                </p>
                <p className="font-mono text-[11px] text-text-on-ink-muted">
                  {trf("{total} firma içinde {rank}. sırada", {
                    total: propFirms.length,
                    rank: rankInList,
                  })}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
                {[
                  [tr("Kural Seti"), scores.rules],
                  [tr("Maliyet"), scores.cost],
                  [tr("Ödeme"), scores.payout],
                  [tr("Şeffaflık"), scores.transparency],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                      {label}
                    </dt>
                    <dd className="mt-1 font-poppins font-semibold text-text-on-ink">
                      {val}/5
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-text-on-ink-muted">
              {firm.summary}
            </p>

            {(linkOn || discountLive) && (
              <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-hairline pt-6">
                {linkOn && (
                  <a
                    href={firm.referralUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="rounded-full bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:bg-signal-strong"
                  >
                    {firm.name}&apos;a git →
                  </a>
                )}
                {discountLive && d.code && (
                  <Link
                    href={`/prop-firmalar/${firm.slug}/indirim-kodu`}
                    className="font-mono text-xs text-text-on-ink-muted hover:text-text-on-ink"
                  >
                    {tr("İndirim kodu:")}{" "}
                    <span className="rounded border border-dashed border-signal/50 bg-signal/10 px-2 py-0.5 uppercase text-signal">
                      {d.code}
                    </span>
                    {typeof d.percent === "number" && (
                      <span className="ml-2 font-semibold text-gold">%{d.percent}</span>
                    )}
                  </Link>
                )}
              </div>
            )}

            {firm.payoutProof.status !== "verified" && (
              <p className="mt-4 max-w-2xl font-mono text-[11px] leading-relaxed text-text-on-ink-muted">
                {tr("Bağımsız ödeme kanıtı doğrulamamız henüz tamamlanmadı. Hesap açmadan önce kendi araştırmanızı yapın.")}
              </p>
            )}
          </div>
        </section>

        {/* Künye */}
        <section className="border-b border-hairline-light bg-paper">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {[
                [tr("Kuruluş"), String(firm.founded)],
                [tr("Merkez"), firm.headquarters],
                [tr("Kâr Payı"), firm.profitSplit],
                [tr("Maks. Tahsis"), firm.maxAllocation],
                [tr("Ödeme Döngüsü"), firm.payoutCycle],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-text-dark">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-4xl px-6 py-16">
            {/* Kural setleri */}
            <div>
              <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
                {trf("{firm} challenge kuralları", { firm: firm.name })}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                {tr("Elenmelerin büyük çoğunluğu kâr hedefine ulaşamamaktan değil, zarar limitinin aşılmasından kaynaklanır. Aşağıdaki limitler, işlem başına riskinizi belirlemeniz gereken sınırlardır.")}
              </p>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline-light">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline-light bg-paper">
                      {["Plan", "Kâr Hedefi", "Günlük Zarar", "Toplam Zarar", "Min. Gün", "Ücret"]
                        .map((h) => tr(h))
                        .map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-text-muted"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {firm.rules.map((r) => (
                      <tr key={r.name} className="border-b border-hairline-light/60">
                        <td className="px-4 py-3 font-semibold text-text-dark">{r.name}</td>
                        <td className="px-4 py-3 text-text-muted">
                          {r.profitTargets.length === 0
                            ? "Yok"
                            : `%${r.profitTargets.join(" → %")}`}
                        </td>
                        <td className="px-4 py-3 text-text-muted">{formatDrawdown(r.dailyDrawdown, r.drawdownUnit)}</td>
                        <td className="px-4 py-3 text-text-muted">{formatDrawdown(r.maxDrawdown, r.drawdownUnit)}</td>
                        <td className="px-4 py-3 text-text-muted">
                          {r.minTradingDays ?? "Yok"}
                        </td>
                        <td className="px-4 py-3 text-text-muted">{r.feeFrom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Dolar bazlı limitlerin hangi hesap boyutuna ait olduğu
                  yazılmazsa sayılar anlamsız — futures firmalarında limit
                  hesap büyüklüğüyle ölçekleniyor. */}
              {firm.rules.some((r) => r.refAccountSize) && (
                <p className="mt-3 font-mono text-[11px] text-text-muted">
                  Dolar cinsinden limitler{" "}
                  {firm.rules.find((r) => r.refAccountSize)?.refAccountSize} hesap
                  içindir ve hesap büyüklüğüne göre ölçeklenir.
                </p>
              )}

              {/* Tutarlılık kuralı gibi ek kısıtlar: tabloya sığmıyor ama
                  elenme sebebi olarak drawdown kadar önemli. */}
              {firm.rules.some((r) => r.extraRule) && (
                <div className="mt-5 space-y-3">
                  {firm.rules
                    .filter((r) => r.extraRule)
                    .map((r) => (
                      <div
                        key={r.name}
                        className="rounded-xl border border-hairline-light bg-paper p-4"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                          {r.name} — ek kurallar
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-dark/90">
                          {r.extraRule}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              <p className="mt-3 font-mono text-[11px] text-text-muted">
                {trf("Platformlar: {platforms} · Hesap boyutları: {sizes}", {
                  platforms: firm.platforms.join(", "),
                  sizes: firm.accountSizes.join(", "),
                })}
              </p>
            </div>

            {/* Ürün uyumu */}
            <div className="mt-14 border-t border-hairline-light pt-10">
              <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
                {tr("Copy trading, sinyal ve EA kullanımı")}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                {tr("Fonlanmış hesabınızı kaybettirebilecek en yaygın sebep budur. Kural ihlali durumunda birikmiş kâr ödenmeden hesap kapatılabilir.")}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Copy Trading", trData(COPY_TRADING_NOTE)[firm.copyTradingAllowed]],
                  ["Sinyal Servisi", trData(SIGNAL_NOTE)[firm.signalServiceAllowed]],
                  ["EA / Otomatik Sistem", trData(EA_NOTE)[firm.eaAllowed]],
                ].map(([label, note]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-hairline-light bg-paper p-5"
                  >
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                      {label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-dark">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Artı / eksi */}
            <div className="mt-14 grid gap-8 border-t border-hairline-light pt-10 md:grid-cols-2">
              <div>
                <h2 className="font-poppins text-xl font-semibold text-text-dark">
                  {tr("Artıları")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {firm.pros.map((p) => (
                    <li key={p} className="text-sm leading-relaxed text-text-muted">
                      <span className="text-signal">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-poppins text-xl font-semibold text-text-dark">
                  Eksileri
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {firm.cons.map((c) => (
                    <li key={c} className="text-sm leading-relaxed text-text-muted">
                      <span className="text-text-dark">−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Kimin için */}
            <div className="mt-14 border-t border-hairline-light pt-10">
              <div className="rounded-2xl border border-gold/25 bg-gold/5 p-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  {tr("FXPARTNER Değerlendirmesi")}
                </span>
                <p className="mt-4 text-[15px] leading-relaxed text-text-dark/90">
                  {firm.bestFor}
                </p>
              </div>
            </div>

            {/* Ödeme kanıtı */}
            <div className="mt-14 border-t border-hairline-light pt-10">
              <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
                {tr("Ödeme sicili")}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                Durum:{" "}
                <strong className="text-text-dark">
                  {trData(PAYOUT_STATUS_LABEL)[firm.payoutProof.status]}
                </strong>{" "}
                (son kontrol: {firm.payoutProof.lastCheckedAt})
              </p>
              <ul className="mt-4 space-y-2">
                {firm.payoutProof.sources.map((s) => (
                  <li key={s} className="text-sm leading-relaxed text-text-muted">
                    · {s}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-hairline-light bg-paper p-4 text-sm leading-relaxed text-text-muted">
                {firm.payoutProof.note}
              </p>
              {firm.backingNote && (
                <p className="mt-3 rounded-xl border border-hairline-light bg-paper p-4 text-sm leading-relaxed text-text-muted">
                  <strong className="text-text-dark">{firm.backedBy} desteği:</strong>{" "}
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
            </div>

            {/* SSS */}
            <div className="mt-14 border-t border-hairline-light pt-10">
              <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
                {trf("{firm} hakkında sıkça sorulanlar", { firm: firm.name })}
              </h2>
              <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
                {faqs.map((f) => (
                  <div key={f.q} className="py-6">
                    <h3 className="font-poppins text-base font-semibold text-text-dark">
                      {f.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-5">
              <Link
                href="/prop-firmalar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("Tüm prop firmaları karşılaştır →")}
              </Link>
              <Link
                href="/pozisyon-hesaplayici"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("Pozisyon hesaplayıcı →")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
