import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import CopytradeInquiryForm from "@/components/CopytradeInquiryForm";
import UpgradeGate from "@/components/UpgradeGate";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { getViewerAccess, hasTierAccess } from "@/lib/tierAccess";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Copytrade — FXPARTNER Sinyallerini Otomatik Kopyalayın",
  description:
    "FXPARTNER'ın gerçek, takip edilen MT5 hesabındaki işlemleri kendi hesabınıza otomatik kopyalayan Copier EA — hesabınızın kontrolü her zaman sizde kalır.",
  alternates: { canonical: "/copytrade" },
};

const faqs = [
  {
    q: "Copytrade sırasında hesabıma FXPARTNER erişebilir mi?",
    a: "Hayır. Copier EA, sizin kendi MT5 hesabınızda, sizin kontrolünüzde çalışır. FXPARTNER'ın hesabınıza, paranıza veya şifrenize hiçbir zaman erişimi olmaz — sadece EA, hangi işlemlerin açık olduğunu genel bilgilendirme amaçlı yayınlanan sinyal akışından okuyup kendi hesabınızda aynısını açar.",
  },
  {
    q: "İstediğim zaman durdurabilir miyim?",
    a: "Evet, anında. EA'yı grafikten kaldırmanız veya devre dışı bırakmanız yeterli — o andan itibaren hiçbir yeni işlem kopyalanmaz. Zaten açık olan pozisyonlar kendi SL/TP seviyelerinde kapanmaya devam eder, isterseniz onları da manuel kapatabilirsiniz.",
  },
  {
    q: "Kâr garantisi var mı?",
    a: "Hayır, hiçbir zaman olmayacak. Kopyalanan işlemler FXPARTNER'ın gerçek, takip edilen hesabındaki gerçek işlemlerdir — bu hesap kârlı dönemler kadar zararlı işlemler de yapar. Geçmiş performans gelecekteki sonuçları garanti etmez. Yalnızca kaybetmeyi göze alabileceğiniz sermayeyle, önce demo hesapta test ederek kullanın.",
  },
  {
    q: "Lot büyüklüğü nasıl belirleniyor?",
    a: "Copier EA, master hesabın raporladığı lot büyüklüğünü sizin belirlediğiniz bir çarpanla (InpLotMultiplier) ölçekler — örneğin 0.5 çarpanı, master hesabın yarısı kadar lot açar. Küçük bir çarpanla başlamanızı ve sisteme güvendikçe kademeli artırmanızı öneririz.",
  },
];

export default async function CopytradePage() {
  const { signedIn, tier } = await getViewerAccess();
  const canApply = hasTierAccess(tier, "vip");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Copytrade", url: `${SITE_URL}/copytrade` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Copytrade
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              FXPARTNER&apos;ın işlemlerini kendi hesabınıza otomatik kopyalayın
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Copier EA, gerçek ve takip edilen MT5 hesabımızdaki işlemleri
              sizin kendi hesabınıza otomatik olarak yansıtır —{" "}
              <strong className="text-text-on-ink">hesabınızın kontrolü her zaman sizde kalır.</strong>{" "}
              FXPARTNER hiçbir zaman paranıza veya hesabınıza erişemez.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#basvuru"
                className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
              >
                Kurulum İçin Talep Gönder
              </a>
              <Link
                href="/signals"
                className="rounded-full border border-hairline px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                Gerçek performans geçmişini görün →
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Nasıl Çalışır
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Üç adımda kurulum
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">01</p>
                <h3 className="mt-3 font-poppins text-lg font-semibold text-text-dark">
                  Talep gönderin
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Aşağıdaki formu doldurun, ekibimiz size Copier EA dosyasını
                  ve kurulum rehberini e-posta ile iletsin.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">02</p>
                <h3 className="mt-3 font-poppins text-lg font-semibold text-text-dark">
                  Kendi MT5&apos;inize kurun
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  EA&apos;yı kendi MT5 hesabınıza (demo veya gerçek, tercihen
                  önce demo) ekleyin ve lot çarpanınızı kendi risk
                  toleransınıza göre ayarlayın.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">03</p>
                <h3 className="mt-3 font-poppins text-lg font-semibold text-text-dark">
                  Otomatik kopyalama başlasın
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  EA, FXPARTNER&apos;ın takip edilen hesabında yeni bir işlem
                  açıldığında otomatik olarak sizin hesabınızda da orantılı
                  bir pozisyon açar; master işlem kapandığında sizinkini de
                  kapatır.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Kontrol Her Zaman Sizde
            </span>
            <h2 className="mt-3 max-w-xl font-poppins text-3xl font-semibold leading-tight md:text-4xl">
              Bu bir hesap yönetimi hizmeti değildir
            </h2>
            <ul className="mt-8 space-y-4 text-[15px] leading-relaxed text-text-on-ink-muted">
              <li className="flex gap-3">
                <span className="mt-1 text-signal">—</span>
                Hesabınız, şifreniz ve paranız her zaman kendi kontrolünüzde
                kalır; FXPARTNER hiçbir zaman erişemez.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-signal">—</span>
                Copier EA&apos;yı istediğiniz an kaldırarak kopyalamayı
                anında durdurabilirsiniz.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-signal">—</span>
                Kopyalanan işlemler gerçek, takip edilen bir hesaptan gelir —
                simüle edilmiş veya geriye dönük test sonuçları değildir.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-signal">—</span>
                Gerçek işlemleri kopyalamak, gerçek zararları da kopyalamak
                anlamına gelir. Kâr garantisi yoktur ve olmayacaktır.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">SSS</span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Sık sorulan sorular
            </h2>
            <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-dark">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="basvuru" className="bg-paper scroll-mt-20">
          <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark">
              Kurulum için talep gönderin
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Formu doldurun, ekibimiz Copier EA dosyasını ve kurulum
              rehberini size e-posta ile iletsin.
            </p>
            <div className="mt-8">
              {canApply ? (
                <CopytradeInquiryForm />
              ) : (
                <UpgradeGate
                  eyebrow="VIP Üyelere Özel"
                  title="Copytrade kurulumu için VIP paketine katılın"
                  description="FXPARTNER CopyTrade erişimi VIP paketinin bir parçasıdır — kurulum talebi göndermek için önce VIP'e katılın."
                  signedIn={signedIn}
                  dark={false}
                />
              )}
            </div>
            <p className="mt-8 rounded-2xl border border-hairline-light bg-paper-high p-5 text-xs leading-relaxed text-text-muted">
              Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi
              değildir. Forex ve CFD işlemleri kaldıraç içerir ve yatırdığınız
              sermayenin tamamını kaybetmenize yol açabilir. Copytrade,
              FXPARTNER&apos;ın takip edilen hesabındaki gerçek işlemleri
              kopyalar — geçmiş performans gelecekteki sonuçları garanti
              etmez. Yalnızca kaybetmeyi göze alabileceğiniz sermaye ile,
              önce demo hesapta test ederek kullanın.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
