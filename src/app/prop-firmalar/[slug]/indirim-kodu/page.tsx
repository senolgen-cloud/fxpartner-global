import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import DiscountCodeCopy from "@/components/DiscountCodeCopy";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const YEAR = new Date().getFullYear();

/**
 * SADECE teyitli (live) indirimi olan firmalar için sayfa üretilir.
 *
 * Bu bir SEO kararı olduğu kadar dürüstlük kararı: "X indirim kodu" diye
 * arayan birini, indirim olmadığını söyleyen bir sayfaya düşürmek hem kötü
 * bir deneyim hem de Google'ın ince/doorway sayfa olarak değerlendireceği
 * tam olarak bu. Kod teyitlenince firma otomatik olarak buraya dahil olur —
 * `discount.status` "live" yapılması yeterli, başka hiçbir şey gerekmiyor.
 */
function firmsWithLiveDiscount() {
  return propFirms.filter((f) => f.discount?.status === "live" && f.discount.code);
}

export function generateStaticParams() {
  return firmsWithLiveDiscount().map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const firm = getPropFirm(slug);
  if (!firm?.discount || firm.discount.status !== "live") return {};

  const pct = firm.discount.percent;
  return {
    // "X indirim kodu" Türkçe'deki birebir arama kalıbı; "promo kod" ve
    // "kupon" varyantları açıklamada geçiyor.
    title: `${firm.name} İndirim Kodu ${YEAR} — %${pct} İndirim`,
    description: `${firm.name} indirim kodu: ${firm.discount.code} ile challenge ücretinde %${pct} indirim. Kodun nasıl kullanılacağı, hangi hesap boyutlarında geçerli olduğu ve ${firm.name} kuralları. Güncel promosyon kodu ve kupon bilgisi.`,
    alternates: { canonical: `/prop-firmalar/${firm.slug}/indirim-kodu` },
    openGraph: {
      title: `${firm.name} İndirim Kodu — %${pct}`,
      description: `${firm.discount.code} kodu ile ${firm.name} challenge ücretinde %${pct} indirim.`,
      url: `${SITE_URL}/prop-firmalar/${firm.slug}/indirim-kodu`,
    },
  };
}

function discountFaqs(firm: PropFirm) {
  const d = firm.discount!;
  const cheapestRule = [...firm.rules].sort(
    (a, b) => (a.dailyDrawdown ?? Infinity) - (b.dailyDrawdown ?? Infinity)
  )[0];

  return [
    {
      q: `${firm.name} indirim kodu nedir?`,
      a: `${firm.name} için güncel indirim kodu ${d.code}. Challenge (değerlendirme) ücretinde %${d.percent} indirim sağlıyor. Kod ${d.applies === "manual-code" ? "ödeme ekranında elle girilir" : "bağlantıya gömülüdür"}. ${firm.name}'da challenge ücretleri ${firm.challengeFeeFrom} seviyesinden başlıyor ve hesap büyüklüğüne göre değişiyor.`,
    },
    {
      q: `${firm.name} indirim kodu nasıl kullanılır?`,
      a: `${firm.name} sitesinde istediğiniz hesap büyüklüğünü ve challenge modelini seçin, ödeme ekranına gelin ve indirim kodu (promo code / coupon) alanına ${d.code} yazıp uygulayın. İndirimin toplam tutara yansıdığını ödemeyi tamamlamadan önce kontrol edin — yansımıyorsa ödemeyi tamamlamayın.`,
    },
    {
      q: `İndirim kodu tekrar denemelerde (retry) de geçerli mi?`,
      a: `Bu, prop firma satın alımlarında en çok gözden kaçan maliyet kalemidir: challenge'ların büyük çoğunluğu ilk denemede geçilemez, dolayısıyla gerçek maliyetiniz genellikle tek bir challenge ücreti değildir. Kodun yeni satın alımlarda ve reset işlemlerinde geçerli olup olmadığı firmadan firmaya değişir; ${firm.name} için bunu ödeme ekranında her satın alımda ayrıca kontrol etmenizi öneririz.`,
    },
    {
      q: `${firm.name} güvenilir mi?`,
      a: `${firm.name} ${firm.founded} yılında kurulmuş${firm.backedBy ? ` ve ${firm.backedBy} altyapısını kullanan` : ""} bir prop firmadır; FXPARTNER'ın bağımsız değerlendirmesinde 10 üzerinden ${getPropFirmScores(firm).composite.toFixed(1)} puan alıyor. Ödeme kanıtı durumu: ${PAYOUT_STATUS_LABEL[firm.payoutProof.status]}. ${firm.payoutProof.note} İndirim oranı ne olursa olsun, firma seçimini ödeme siciline göre yapmanız gerekir — indirim iyi bir firmayı daha iyi yapar, kötü bir firmayı kurtarmaz.`,
    },
    ...(cheapestRule
      ? [
          {
            q: `İndirimli challenge satın almadan önce nelere dikkat etmeliyim?`,
            a: `Ücretten önce kural setine bakın. ${firm.name}'ın en sıkı planında günlük zarar limiti ${formatDrawdown(cheapestRule.dailyDrawdown, cheapestRule.drawdownUnit)}, toplam zarar limiti ${formatDrawdown(cheapestRule.maxDrawdown, cheapestRule.drawdownUnit)}. Elenmelerin çoğu kâr hedefine ulaşamamaktan değil, bu limitlerin aşılmasından kaynaklanır. Ayrıca copy trading ve dış sinyal kullanımına dair kuralları mutlaka okuyun; ihlal durumunda birikmiş kâr ödenmeden hesap kapatılabilir.`,
          },
        ]
      : []),
  ];
}

export default async function IndirimKoduPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firm = getPropFirm(slug);
  const d = firm?.discount;
  // Tek koşulda toplanıyor ki TS `d` ve `d.code` daraltmasını buradan
  // itibaren taşıyabilsin — parçalara bölündüğünde daraltma kayboluyor.
  if (!firm || !d || d.status !== "live" || !d.code) notFound();

  const code = d.code;
  const faqs = discountFaqs(firm);
  const linkOn = hasActiveLink(firm);
  const scores = getPropFirmScores(firm);
  const otherWithCodes = firmsWithLiveDiscount().filter((f) => f.slug !== firm.slug);

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
              {
                name: "İndirim Kodu",
                url: `${SITE_URL}/prop-firmalar/${firm.slug}/indirim-kodu`,
              },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <nav className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              <Link href="/prop-firmalar" className="hover:text-signal">
                Prop Firmalar
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/prop-firmalar/${firm.slug}`}
                className="hover:text-signal"
              >
                {firm.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-text-on-ink">İndirim Kodu</span>
            </nav>

            <h1 className="mt-6 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {firm.name} indirim kodu
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {firm.name} challenge ücretinde{" "}
              <strong className="text-gold">%{d.percent} indirim</strong>. Kod ödeme
              ekranında elle giriliyor.
            </p>

            <div className="mt-8 rounded-2xl border border-signal/30 bg-signal/[0.06] p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                İndirim Kodu
              </span>
              <DiscountCodeCopy code={code} percent={d.percent} />
              {linkOn && (
                <a
                  href={firm.referralUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="mt-5 inline-block rounded-full bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:bg-signal-strong"
                >
                  {firm.name}&apos;a git →
                </a>
              )}
            </div>

            <p className="mt-5 max-w-xl font-mono text-[11px] leading-relaxed text-text-on-ink-muted">
              FXPARTNER bu bağlantı üzerinden komisyon kazanır. Bu, ödediğiniz tutarı
              artırmaz ve {firm.name}&apos;ın sitedeki puanını{" "}
              <Link
                href={`/prop-firmalar/${firm.slug}`}
                className="text-signal hover:text-signal-strong"
              >
                ({scores.composite.toFixed(1)}/10)
              </Link>{" "}
              etkilemez.
            </p>
          </div>
        </section>

        {/* Nasıl kullanılır */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
              Kod nasıl kullanılır
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                `${firm.name} sitesinde hesap büyüklüğünü ve challenge modelini seçin.`,
                "Ödeme ekranına gelin ve indirim kodu (promo code / coupon) alanını bulun.",
                `${code} kodunu girip uygulayın.`,
                "Toplam tutarın düştüğünü doğrulayın — yansımıyorsa ödemeyi tamamlamayın.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 font-mono text-xs text-signal">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-[15px] leading-relaxed text-text-dark/90">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-base font-semibold text-text-dark">
                Hangi hesap boyutlarında geçerli?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {firm.name} şu hesap büyüklüklerini sunuyor:{" "}
                {firm.accountSizes.join(", ")}. Challenge ücretleri{" "}
                {firm.challengeFeeFrom} seviyesinden başlıyor. İndirimin hangi
                boyutlarda ve hangi modellerde geçerli olduğunu ödeme ekranında
                doğrulayın — firmalar indirimi hesap boyutuna göre farklı
                uygulayabiliyor.
              </p>
            </div>
          </div>
        </section>

        {/* Asıl maliyet uyarısı — bu sayfanın en dürüst ve en faydalı kısmı */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              İndirimden önce
            </span>
            <h2 className="mt-3 font-poppins text-2xl font-semibold md:text-3xl">
              Asıl maliyet challenge ücreti değil
            </h2>
            <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-text-on-ink-muted">
              <p>
                Challenge&apos;ların büyük çoğunluğu ilk denemede geçilemez. Yani
                gerçek maliyetiniz genellikle tek bir ücret değil, birkaç denemenin
                toplamıdır. <strong className="text-text-on-ink">%{d.percent} indirim,
                bu toplam üzerinde anlamlıdır</strong> — tek bir satın alma üzerinde
                düşündüğünüzden daha az.
              </p>
              <p>
                Bu yüzden firma seçimini indirim oranına göre yapmayın. Sıralamamızda{" "}
                {firm.name} <strong className="text-text-on-ink">{scores.composite.toFixed(1)}/10</strong>{" "}
                puanla{" "}
                {[...propFirms]
                  .sort(
                    (a, b) =>
                      getPropFirmScores(b).composite - getPropFirmScores(a).composite
                  )
                  .findIndex((f) => f.slug === firm.slug) + 1}
                . sırada — ve o sıralama bu indirimden bağımsız olarak belirlendi.
              </p>
              {firm.payoutProof.status !== "verified" && (
                <p className="rounded-xl border border-hairline bg-ink-soft/60 p-4 text-sm">
                  <strong className="text-text-on-ink">Dikkat:</strong> Bu firma için
                  bağımsız ödeme kanıtı doğrulamamız henüz tamamlanmadı (durum:{" "}
                  {PAYOUT_STATUS_LABEL[firm.payoutProof.status]}). İndirim oranı ne
                  olursa olsun, hesap açmadan önce kendi araştırmanızı yapın.
                </p>
              )}
            </div>
            <div className="mt-8">
              <Link
                href={`/prop-firmalar/${firm.slug}`}
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {firm.name} tam incelemesi →
              </Link>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
              Sıkça sorulanlar
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

            {otherWithCodes.length > 0 && (
              <div className="mt-10">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Diğer indirim kodları
                </h3>
                <div className="mt-3 flex flex-wrap gap-4">
                  {otherWithCodes.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/prop-firmalar/${f.slug}/indirim-kodu`}
                      className="font-mono text-xs uppercase tracking-[0.1em] text-signal hover:text-signal-strong"
                    >
                      {f.name} %{f.discount!.percent} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <Link
                href="/prop-firmalar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Tüm prop firmaları karşılaştır →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
