import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import DiscountCodeCopy from "@/components/DiscountCodeCopy";
import {
  propFirms,
  propFirmsByScore,
  getPropFirmScores,
  hasActiveLink,
  PAYOUT_STATUS_LABEL,
} from "@/data/propFirms";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const YEAR = new Date().getFullYear();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.prop-firmalar.indirim-kodlari.title"].replace("{year}", String(YEAR)),
    description: t["page.prop-firmalar.indirim-kodlari.description"],
    alternates: {
      canonical: localePath(locale, "/prop-firmalar/indirim-kodlari"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/prop-firmalar/indirim-kodlari")])
      ),
    },
    openGraph: {
      url: `${SITE_URL}/prop-firmalar/indirim-kodlari`,
    },
  };
}

const faqs = [
  {
    q: "Prop firma indirim kodu nedir, ne işe yarar?",
    a: "Prop firmalar, değerlendirme (challenge) ücretinde indirim sağlayan promosyon kodları dağıtır. Kod genellikle ödeme ekranındaki 'promo code' veya 'coupon' alanına elle girilir; bazı firmalarda ise indirim doğrudan bağlantıya gömülüdür ve ayrıca kod girmek gerekmez. İndirim yalnızca challenge ücretini etkiler — kâr paylaşımını, drawdown limitlerini veya diğer kuralları değiştirmez.",
  },
  {
    q: "İndirim kodu challenge'ı tekrar alırken de geçerli mi?",
    a: "Bu, prop firma satın alımlarında en çok gözden kaçan maliyet kalemidir. Challenge'ların büyük çoğunluğu ilk denemede geçilemediği için gerçek maliyetiniz genellikle tek bir ücret değil, birkaç denemenin toplamıdır. Kodun yeni satın alımlarda ve reset işlemlerinde geçerli olup olmadığı firmadan firmaya değişir; her satın alımda ödeme ekranında ayrıca kontrol etmeniz gerekir.",
  },
  {
    q: "Neden bazı firmaların indirim kodu yok?",
    a: "Her prop firma indirim kodu dağıtmaz — bazıları fiyatlamasını sabit tutar. Ayrıca bir kodun bize verilmiş olması yetmez; oranın ve nasıl uygulandığının teyit edilmiş olması gerekir. Teyit edilmemiş bir oranı sayı olarak yayımlamıyoruz, çünkü ödeme ekranında uygulanmayan bir indirim vaadi, indirim vermemekten daha kötüdür. Bu yüzden listede 'İndirim yok' ve 'Teyit bekliyor' ayrımı vardır.",
  },
  {
    q: "İndirim oranı yüksek olan firmayı mı seçmeliyim?",
    a: "Hayır. Prop firmada asıl ürün ödemedir; ödemeyi yapmayan bir firmanın indirimi ne kadar yüksek olursa olsun anlamsızdır. 2020-2026 arasında 80'den fazla prop firma kapandı. Firma seçimini ödeme sicili, faaliyet süresi ve kural setinin geçilebilirliği üzerinden yapın; indirim ancak eşit koşullardaki iki firma arasında ayırt edici olmalıdır. Nitekim yüksek komisyon ve agresif indirim, bazen nakit akışı sıkışmış bir firmanın işaretidir.",
  },
];

export default async function IndirimKodlariPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const ranked = trData(propFirmsByScore());
  const withLive = ranked.filter((f) => f.discount?.status === "live" && f.discount.code);
  const pending = ranked.filter((f) => f.discount?.status === "pending");
  const none = ranked.filter((f) => !f.discount);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Prop Firmalar", url: `${SITE_URL}/prop-firmalar` },
              {
                name: "İndirim Kodları",
                url: `${SITE_URL}/prop-firmalar/indirim-kodlari`,
              },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(faqs))) }}
      />

      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <nav className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              <Link href="/prop-firmalar" className="hover:text-signal">
                Prop Firmalar
              </Link>
              <span className="mx-2">/</span>
              <span className="text-text-on-ink">{tr("İndirim Kodları")}</span>
            </nav>

            <h1 className="mt-6 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Prop firma indirim kodları")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              İzlediğimiz {trData(propFirms).length} firmanın güncel kupon durumu. Yalnızca
              oranı ve uygulanma şekli teyit edilmiş kodlar sayı olarak yayımlanır.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              <strong className="text-text-on-ink">İndirim, firma seçme kriteri
              değildir.</strong> Prop firmada asıl ürün ödemedir — ödeme sicili zayıf
              bir firmanın kuponu ne kadar yüksek olursa olsun bu riski karşılamaz.
            </p>
          </div>
        </section>

        {/* Aktif kodlar */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
              Aktif kodlar
            </h2>

            {withLive.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-hairline-light bg-paper p-6 text-sm leading-relaxed text-text-muted">
                {tr("Şu anda koşulları teyit edilmiş aktif bir indirim kodumuz bulunmuyor. Teyit edilmemiş oranları burada yayımlamıyoruz.")}
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {withLive.map((firm) => {
                  const d = firm.discount!;
                  const scores = getPropFirmScores(firm);
                  return (
                    <div
                      key={firm.slug}
                      className="rounded-2xl border border-hairline-light bg-paper p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="flex items-center gap-2 font-poppins text-lg font-semibold text-text-dark">
                            <Link
                              href={`/prop-firmalar/${firm.slug}`}
                              className="hover:text-signal"
                            >
                              {firm.name}
                            </Link>
                            {firm.isPartner && (
                              <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gold">
                                Ortak
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 font-mono text-[11px] text-text-muted">
                            Index {scores.composite.toFixed(1)} ·{" "}
                            {trData(PAYOUT_STATUS_LABEL)[firm.payoutProof.status]} · challenge{" "}
                            {firm.challengeFeeFrom}&apos;den başlıyor
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <DiscountCodeCopy code={d.code!} percent={d.percent} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-hairline-light pt-4">
                        <Link
                          href={`/prop-firmalar/${firm.slug}/indirim-kodu`}
                          className="font-mono text-xs uppercase tracking-[0.12em] text-signal hover:text-signal-strong"
                        >
                          {tr("Nasıl kullanılır →")}
                        </Link>
                        {hasActiveLink(firm) && (
                          <a
                            href={firm.referralUrl}
                            target="_blank"
                            rel="nofollow sponsored noopener noreferrer"
                            className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted hover:text-signal"
                          >
                            {firm.name}&apos;a git →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Diğer firmaların durumu — "İndirim yok" da bir cevaptır */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold md:text-3xl">
              {tr("Diğer firmaların durumu")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              {tr("Boş bırakmak yerine açıkça yazıyoruz — indirim aramak için başka yere bakmanız gerekip gerekmediğini bilin.")}
            </p>

            <div className="mt-8 divide-y divide-hairline border-t border-hairline">
              {[...pending, ...none].map((firm) => (
                <div
                  key={firm.slug}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <Link
                    href={`/prop-firmalar/${firm.slug}`}
                    className="font-poppins text-sm font-semibold text-text-on-ink hover:text-signal"
                  >
                    {firm.name}
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                      {firm.segment === "futures" ? "Futures" : "CFD"}
                    </span>
                  </Link>
                  <span
                    className="font-mono text-[11px] text-text-on-ink-muted"
                    title={firm.discount?.note}
                  >
                    {firm.discount ? "Teyit bekliyor" : "İndirim yok"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SSS */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
              {tr("Sıkça sorulanlar")}
            </h2>
            <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
              {trData(faqs).map((f) => (
                <div key={f.q} className="py-6">
                  <h3 className="font-poppins text-base font-semibold text-text-dark">
                    {f.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/prop-firmalar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("Tüm prop firmaları karşılaştır →")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
