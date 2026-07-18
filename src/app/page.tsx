import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import Highlights from "@/components/Highlights";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import HeroChart from "@/components/HeroChart";
import TradingVideo from "@/components/TradingVideo";
import { brokers } from "@/data/brokers";

const steps = [
  {
    n: "01",
    title: "Düzenlemeyi kontrol edin",
    body: "FCA, ASIC veya CySEC gibi üst düzey (Tier-1) otoriteler tarafından denetlenen brokerlar, fon güvenliği açısından daha güçlü bir çerçeve sunar.",
  },
  {
    n: "02",
    title: "Maliyet yapısını karşılaştırın",
    body: "Spread, komisyon ve gecelik swap oranlarını birlikte değerlendirin — düşük spread bazen yüksek komisyonla dengelenir.",
  },
  {
    n: "03",
    title: "Platform ve araçları test edin",
    body: "Demo hesap açarak MT4, MT5 veya cTrader arayüzünün kendi stratejinize uygun olup olmadığını görün.",
  },
  {
    n: "04",
    title: "Para çekme sürecini deneyin",
    body: "Küçük bir yatırımla başlayıp ilk çekim talebinin hızını ve şeffaflığını gözlemlemek, uzun vadeli güveni test etmenin en iyi yoludur.",
  },
];

const faqs = [
  {
    q: "FXPARTNER Endeksi nedir, nasıl hesaplanıyor?",
    a: "FXPARTNER Endeksi, aşağıdaki 01-04 rehberindeki dört kritere (Düzenleme, Maliyet, Platform, Para Çekme) göre 0-10 arası hesaplanan bileşik bir puandır. Platform ekseni brokerın platform verisinden otomatik hesaplanır. Düzenleme ekseni varsayılan olarak lisans verisinden hesaplanır; editoryal ekip gerekçeli bir istisna kararı aldığında bu puanı güncelleyebilir. Maliyet ve Para Çekme eksenleri incelemede yer alan doğrulanabilir sinyallere dayanan editoryal değerlendirmedir — özel bir sinyal bulunmayan brokerlar bu eksende nötr puan alır. Endeks, yıldız puanından bağımsız ayrı bir ölçümdür; ikisi farklı şeyleri yansıtabilir.",
  },
  {
    q: "Bu sıralama nasıl belirleniyor?",
    a: "Düzenleme kalitesi, maliyet şeffaflığı, platform çeşitliliği ve kullanıcı deneyimine dair genel kriterler esas alınarak oluşturulmuş bir değerlendirmedir. FXPARTNER, listelenen brokerların bir kısmıyla ortaklık/referans ilişkisi içindedir ve hesap açılışlarından komisyon elde edebilir; bu durum sayfadaki her broker kartında ayrıca belirtilir.",
  },
  {
    q: "Hangi broker yeni başlayanlar için en uygun?",
    a: "Düşük minimum yatırım ve geniş eğitim içeriği arayanlar için XM genellikle daha kolay bir başlangıç sunar; Lite Finance de düşük bariyeriyle öne çıkar.",
  },
  {
    q: "Kaldıraç oranları neden ülkeye göre değişiyor?",
    a: "AB ve İngiltere gibi bölgelerde ESMA/FCA düzenlemeleri perakende yatırımcılar için kaldıracı sınırlarken, offshore lisanslı hesaplarda çok daha yüksek oranlar sunulabilir. Bu sayfadaki rakamlar bölgeye göre değişebilir.",
  },
  {
    q: "Bu site yatırım tavsiyesi veriyor mu?",
    a: "Hayır. İçerik yalnızca genel bilgilendirme amaçlıdır; kişisel yatırım tavsiyesi değildir. Karar vermeden önce kendi araştırmanızı yapmanız ve gerekirse bir uzmana danışmanız önerilir.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <Ticker />
      <Highlights />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-text-on-ink">
          <div
            aria-hidden="true"
            className="hero-glow-signal pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/25 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="hero-glow-gold pointer-events-none absolute -right-16 top-10 h-[360px] w-[360px] rounded-full bg-gold/20 blur-[110px]"
          />
          <HeroChart />

          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
                <span
                  aria-hidden="true"
                  className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                />
                2026 Broker Rehberi
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                Forex brokerlarını okumadan önce, aralarındaki farkı öğrenin.
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
                XM, AvaTrade, Lite Finance ve dünyanın önde gelen diğer
                brokerlarını düzenleme, maliyet, platform ve para çekme
                hızına göre tek bir yerde karşılaştırdık.
              </p>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#brokerlar"
                  className="lift-on-hover rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
                >
                  Sıralamayı Gör
                </a>
                <a
                  href="#karsilastirma"
                  className="lift-on-hover rounded-full border border-hairline px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
                >
                  Karşılaştırma Tablosu
                </a>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-hairline pt-8 sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    İncelenen Broker
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={brokers.length} />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Düzenleyici Otorite
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={12} suffix="+" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    En Düşük Giriş
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={5} prefix="$" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Karşılaştırma Kriteri
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={6} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Ranked broker list */}
        <section id="brokerlar" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Sıralama
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                2026&apos;nın en çok tercih edilen {brokers.length} forex brokerı
              </h2>
              <p className="mt-4 text-text-muted">
                Her broker; düzenleme gücü, maliyet yapısı, platform desteği
                ve yatırımcı profiline uygunluğuna göre değerlendirildi.
              </p>
            </Reveal>

            <div className="mt-12">
              <BrokerList brokers={brokers} />
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section id="karsilastirma" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Yan Yana
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                Karşılaştırma tablosu
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                Karar vermeden önce temel rakamları tek bakışta görün.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <ComparisonTable />
            </Reveal>
            <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-text-on-ink-muted">
              * Kaldıraç ve minimum yatırım rakamları hesap tipine ve
              yatırımcının bulunduğu ülkeye göre değişiklik gösterebilir.
              İşlem yapmadan önce brokerin resmi sitesinden güncel şartları
              doğrulayın.
            </p>
          </div>
        </section>

        {/* How to choose */}
        <section id="nasil-secilir" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Rehber
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                Broker nasıl seçilir?
              </h2>
              <p className="mt-4 text-text-muted">
                Bu dört kriter, her broker profilinde{" "}
                <strong className="font-medium text-text-dark">FXPARTNER Endeksi</strong>{" "}
                olarak 0-10 arası puanlanır.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
              {steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 90} className="flex gap-5">
                  <span className="font-display text-3xl font-light text-signal">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-text-dark">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TradingVideo />

        {/* FAQ */}
        <section id="sss" className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                SSS
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                Sıkça sorulan sorular
              </h2>
            </Reveal>
            <div className="mt-10 divide-y divide-hairline-light border-t border-hairline-light">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium text-text-dark transition-colors group-open:text-signal">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
