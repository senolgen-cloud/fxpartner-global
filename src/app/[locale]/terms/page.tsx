import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.terms.title"],
    description: t["page.terms.description"],
    alternates: {
      canonical: localePath(locale, "/terms"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/terms")])
      ),
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Kullanım Şartları", url: `${SITE_URL}/terms` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Yasal
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Kullanım Şartları")}
            </h1>
            <p className="mt-4 font-mono text-xs text-text-on-ink-muted">
              {tr("Son güncelleme: Temmuz 2026")}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              {tr("Bu şartlar fxpartner.global'i kullandığınızda geçerlidir. Siteyi kullanarak bunları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen siteyi kullanmayın.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Yatırım tavsiyesi değildir")}
            </h2>
            <p className="mt-4">
              {tr("FXPARTNER; broker incelemeleri, sıralamaları, karşılaştırmaları ve forex ile CFD ticareti hakkında genel eğitim içeriği yayınlar. Bunların hiçbiri kişisel yatırım, finansal veya hukuki tavsiye niteliği taşımaz. Kaldıraçlı forex ve türev ürünlerle işlem yapmak yüksek düzeyde risk taşır ve yatırdığınız sermayenin tamamının kaybına yol açabilir. Herhangi bir brokerla işlem yapmadan önce kendi araştırmanızı yapın ve gerekirse lisanslı bir uzmana danışın.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Ortaklık (affiliate) ilişkileri")}
            </h2>
            <p className="mt-4">
              {tr("FXPARTNER, bu sitede listelenen bazı brokerlarla ortaklık/yönlendirme ilişkisi içindedir ve bağlantılarımız üzerinden hesap açtığınızda, size ek bir maliyet çıkmadan komisyon kazanabilir. Bu durum puanlama kriterlerimizi etkilemez — ortaklık kurduğumuz brokerlar dahil.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Hesaplar
            </h2>
            <p className="mt-4">
              {tr("Hesap oluştururken, şikayet bildirirken veya cashback için kaydolurken gönderdiğiniz bilgilerin doğruluğundan ve giriş yapmak için kullandığınız e-posta gelen kutunuzun güvenliğini sağlamaktan siz sorumlusunuz.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Yorumlar
            </h2>
            <p className="mt-4">
              {tr("Bir broker incelemesine yorum bıraktığınızda, bunun gerçek deneyiminizi veya görüşünüzü yansıttığını onaylamış olursunuz. Yanlış, kötüye kullanım içeren, spam niteliğinde veya incelenen brokerla ilgisi olmayan yorumları kaldırabiliriz.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Şikayetler ve cashback")}
            </h2>
            <p className="mt-4">
              {tr("Şikayet göndermek bir çözüm veya tazminat garantisi vermez — FXPARTNER bir regülatör değildir ve bir brokerı harekete geçmeye zorlayamaz. Cashback, gerçek işlem hacminize dayalı olarak ilgili broker tarafından doğrudan işlem hesabınıza ödenir; yayınlanan oranlar tahminidir ve değişebilir. Cashback'i kendi ortaklık kayıtlarımıza karşı manuel olarak takip ederiz ve brokerdan kaynaklanan gecikmelerden sorumlu değiliz.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Risk uyarıları sayfası")}
            </h2>
            <p className="mt-4">
              {tr("Risk uyarıları sayfamız, yayınlanan incelemelerde bulunan bağımsız güven puanlarına ve şikayet örüntülerine dayanarak brokerları işaretler. Bu, daha fazla araştırma için bir sinyaldir, yasal bir suistimal tespiti değildir.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Değişiklikler")}
            </h2>
            <p className="mt-4">
              {tr("Yeni bilgiler edindikçe bu şartları veya broker sıralamalarımızı, puanlamamızı ya da içeriğimizi herhangi bir zamanda güncelleyebiliriz.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("İletişim")}
            </h2>
            <p className="mt-4">
              {tr("Bu şartlarla ilgili sorularınız mı var? E-posta gönderin:")}{" "}
              <a href="mailto:info@fxpartner.global" className="text-signal hover:text-signal-strong">
                info@fxpartner.global
              </a>
              .
            </p>

            <p className="mt-10 rounded-2xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
              {tr("Bu şartlar, sitenin fiilen nasıl işlediğini sade bir dille açıklar. Resmi bir hukuki incelemenin yerini tutmaz — bulunduğunuz yargı bölgesi için özel regülasyon veya sorumluluk korumalarına ihtiyacınız varsa, şartları yetkili bir avukata inceletin.")}
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
