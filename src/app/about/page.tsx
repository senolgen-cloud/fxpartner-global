import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "FXPARTNER, şeffaf ve dürüst incelemeler aracılığıyla yatırımcıları regüle forex brokerlarıyla buluşturur — ve brokerların gerçek, etkileşimli kitlelerle güven inşa etmesine yardımcı olur.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Hakkımızda", url: `${SITE_URL}/about` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              FXPARTNER Hakkında
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Yatırımcılar ve brokerlar arasında güvenilir bir köprü
            </h1>
            <p className="mt-5 max-w-xl text-text-on-ink-muted">
              FXPARTNER, forex ve CFD sektörü için hızla büyüyen bir inceleme
              ve ortaklık platformudur; her şeyin üzerinde tuttuğu tek bir
              ilkeye dayanır: her zaman şeffaf, her zaman doğru.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              FXPARTNER&apos;i basit bir sorunu çözmek için kurduk: yatırımcılar
              internetteki broker incelemelerinin hangisinin gerçek, hangisinin
              tavsiye kılığına girmiş ücretli içerik olduğunu ayırt edemiyordu.
              Biz de her seferinde hangisinin hangisi olduğunu açıkça söyleyen
              ve bilgimizin kalitesinin kendi adına konuşmasına izin veren bir
              platform kurduk.
            </p>
            <p className="mt-4">
              Bugün FXPARTNER büyüyen bir ekosistem: broker incelemeleri ve
              karşılaştırmaları, piyasa analizi, alım-satım sinyalleri, bir
              cashback programı ve aktif Telegram toplulukları — hepsi aynı
              dürüstlük standardı üzerine inşa edildi.
            </p>
          </article>
        </section>

        {/* Principles */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              İlkelerimiz
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold md:text-4xl">
              Asla taviz vermeyeceğimiz şeyler
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Her zaman şeffaf
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Bir brokerla ticari bir ilişkimiz olduğunda bunu söyleriz —
                  açıkça, sayfa üzerinde, bir dipnotta gizlemeden. Bağımsız
                  olmayan hiçbir şey bağımsızmış gibi sunulmaz.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Her zaman doğru
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Regülasyon durumu, puanlama ve şikayet verileri gerçek
                  kaynaklara karşı kontrol edilir ve güncel tutulur. Ortaklık
                  anlaşmaları bir broker hakkında yayınladıklarımızı asla
                  değiştirmez.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Bağımsız puanlama
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Platformu reklam ve komisyon gelirleri finanse eder — bu
                  gelir asla daha iyi bir puan satın almaz. Ortaklık
                  kurduğumuz brokerlar, herkesle aynı kriterlere göre
                  değerlendirilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal registration */}
        <section id="legal-registration" className="bg-paper-high">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Yasal Kayıt
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Lisanslı, tescilli bir şirket
            </h2>
            <p className="mt-5 max-w-2xl text-text-muted">
              FXPARTNER GLOBAL LTD., Dubai, Birleşik Arap Emirlikleri
              kanunlarına göre kurulmuş, yasal olarak tescilli bir şirkettir —
              anonim bir web sitesi değildir. Tam Kuruluş Sertifikamız
              aşağıda kamuya açıktır.
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
              <a
                href="/legal/fxpartner-certificate-of-incorporation.jpg"
                target="_blank"
                rel="noopener noreferrer"
                title="FXPARTNER GLOBAL LTD. Kuruluş Sertifikasının tamamını görüntüleyin"
                className="block overflow-hidden rounded-2xl border border-hairline-light shadow-sm transition-opacity hover:opacity-90"
              >
                <Image
                  src="/legal/fxpartner-certificate-of-incorporation.jpg"
                  alt="FXPARTNER GLOBAL LTD. Kuruluş Sertifikası"
                  width={1536}
                  height={1024}
                  className="h-auto w-full"
                />
              </a>

              <dl className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Şirket Adı
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">FXPARTNER GLOBAL LTD.</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Şirket Numarası
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">1497521</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Kuruluş Tarihi
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">24 Mayıs 2024</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Yargı Bölgesi
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">Dubai, Birleşik Arap Emirlikleri</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Şirket Türü
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">Limited Şirket (LLC)</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Direktör ve CEO
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">Erdem Torun</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Kayıtlı Adres
                  </dt>
                  <dd className="mt-1 font-medium text-text-dark">
                    Office 3507, Burlington Tower, Business Bay, Dubai, Birleşik Arap Emirlikleri
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href="/legal/fxpartner-certificate-of-incorporation.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
            >
              Sertifikanın tamamını görüntüle →
            </a>
          </div>
        </section>

        {/* For investors */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Yatırımcılar için
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              FXPARTNER sizin için ne yapar
            </h2>
            <p className="mt-5 max-w-2xl text-text-muted">
              Bir brokerı gözünüz açık seçmenize yardımcı oluyoruz — regülasyon,
              gerçek maliyet, platform kalitesi ve bir sorun çıktığında
              müşterilere gerçekte nasıl davrandıkları üzerinden.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Dürüst broker incelemeleri
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Her broker aynı kriterlere göre puanlanır — regülasyon,
                  maliyetler, platformlar, çekim deneyimi — onlarla bir
                  ortaklığımız olsun ya da olmasın.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Sesinizin duyulduğu bir yer
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Yatırım yapmadan önce bir yorum bırakın, şikayette bulunun
                  veya risk uyarılarımızı kontrol edin — gerçek yatırımcı
                  deneyimi yayınladıklarımızı şekillendirir.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Cashback ve kampanyalar
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Zaten yaptığınız işlem hacminden cashback programımız ve
                  broker kampanyalarıyla daha fazlasını kazanın; her şey kendi
                  ortaklık kayıtlarımıza karşı açıkça takip edilir.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Sinyaller ve piyasa analizi
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Piyasaları neyin hareket ettirdiğine dair bağlam için piyasa
                  analizlerimizi ve Telegram topluluklarımızı takip edin —
                  bunlar asla garanti tavsiye olarak sunulmaz.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/brokers"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Brokerları karşılaştır →
              </Link>
            </div>
          </div>
        </section>

        {/* For brokers */}
        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Brokerlar için
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              FXPARTNER markanız için ne yapar
            </h2>
            <p className="mt-5 max-w-2xl text-text-muted">
              Brokerlarla esnek, şeffaf ortaklık modelleri altında çalışıyoruz
              — aylık reklam, komisyon ve CPA — hedeflerinize göre eşleştirerek.
              Genç, hızla büyüyen bir ekosistem olarak, ortaklarımızın çoğunun
              şu anda tercih ettiği model aylık modeldir: öngörülebilir
              maliyet, tutarlı görünürlük.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Gerçek, etkileşimli kitleler
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  İçerik önce sitede yayınlanır, ardından aktif Telegram
                  gruplarımızda paylaşılır — soğuk trafik değil, zaten bir
                  broker arayan yatırımcılara ulaşır.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Gelir büyümeye yeniden yatırılır
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Kazandığımız reklam ve ürün geliştirmeye geri döner.
                  FXPARTNER büyüdükçe üzerindeki her ortağın görünürlüğü de
                  artar — bu sadece bir ücret değil, bir yatırımdır.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Esnek ortaklık modelleri
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Sabit aylık ücret, komisyon bazlı veya CPA — anlaşmayı
                  müşteri kazanım hedefleriniz için işe yarayacak şekilde
                  yapılandırıyoruz.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Puanlama bağımsız kalır
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Bir ortaklık, bir brokerın nasıl incelendiğini veya
                  puanlandığını asla değiştirmez. Kitlemizin — ve dolayısıyla
                  ortaklarımızın — yayınladıklarımıza güvenmeye devam
                  etmesini sağlayan da budur.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/partners"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Ortak olun →
              </Link>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="rounded-2xl border border-hairline-light bg-paper p-6 text-sm leading-relaxed text-text-muted">
              FXPARTNER, Erdem Torun tarafından kurulan FXPARTNER eğitim ve
              CopyTrade ekosisteminin bir parçasıdır. Bu sitedeki hiçbir şey
              yatırım tavsiyesi değildir — ayrıntılar için{" "}
              <Link href="/terms" className="text-signal hover:text-signal-strong">
                Kullanım Şartları
              </Link>
              {" "}sayfamıza bakın. Sorularınız mı var? E-posta gönderin:{" "}
              <a
                href="mailto:info@fxpartner.global"
                className="text-signal hover:text-signal-strong"
              >
                info@fxpartner.global
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
