import Footer from "@/components/Footer";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import { COMPARISON_CRITERIA } from "@/lib/comparisonCriteria";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import HeroVideo from "@/components/HeroVideo";
import HeroSpotlight from "@/components/HeroSpotlight";
import TradingVideo from "@/components/TradingVideo";
import HeroCashbackForm from "@/components/HeroCashbackForm";
import HeroFeatureRow from "@/components/HeroFeatureRow";
import InstallAppButtons from "@/components/InstallAppButtons";
import HeroEcosystemMockups from "@/components/HeroEcosystemMockups";
import ShowcaseGallery from "@/components/ShowcaseGallery";
import RegulatorBadges from "@/components/RegulatorBadges";
import HeroBrokerSearch from "@/components/HeroBrokerSearch";
import { brokers } from "@/data/brokers";
import { lookupBrokers } from "@/data/brokerLookup";
import { faqSchema } from "@/lib/schema";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getBrokerReviewStats } from "@/lib/brokerReviews";

const trackedBrokerCount = lookupBrokers.length;
const trackedRegulatorCount = new Set([
  ...brokers.flatMap((b) => b.regulators),
  ...lookupBrokers.flatMap((b) => b.regulators ?? []),
]).size;
// Read from each broker's real minDeposit string (e.g. "$5", "From $10*")
// rather than a hand-typed number, so this can't go stale if a broker with
// a lower minimum gets added later.
const lowestMinDeposit = Math.min(
  ...brokers.map((b) => {
    const n = parseFloat(b.minDeposit.replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? Infinity : n;
  })
);

const steps = [
  {
    n: "01",
    title: "Regülasyonu kontrol edin",
    body: "FCA, ASIC veya CySEC gibi üst düzey (Tier-1) otoriteler tarafından denetlenen brokerlar, fonlarınızın güvenliği için daha güçlü bir çerçeve sunar.",
  },
  {
    n: "02",
    title: "Maliyet yapısını karşılaştırın",
    body: "Spread, komisyon ve gecelik swap oranlarını birlikte değerlendirin — düşük bir spread bazen daha yüksek bir komisyonla dengelenir.",
  },
  {
    n: "03",
    title: "Platformu ve araçları test edin",
    body: "MT4, MT5 veya cTrader arayüzünün kendi stratejinize uyup uymadığını görmek için bir demo hesap açın.",
  },
  {
    n: "04",
    title: "Para çekme sürecini deneyin",
    body: "Küçük bir depozitle başlayıp ilk para çekme talebinizin hızını ve şeffaflığını izlemek, uzun vadeli güveni test etmenin en iyi yoludur.",
  },
];

const accountSteps = [
  "Yukarıdaki sıralamadan, regülasyonu ve maliyet profili risk toleransınıza uyan bir broker seçin.",
  "Broker'ın KYC formunu kimliğiniz ve adres belgenizle tamamlayın — çoğu Tier-1 regüle broker ilk depozitten önce bunu ister.",
  "Hesabı önce tüm işlem sermayenizle değil, minimum depozit ile fonlayın; böylece riske girmeden işlem kalitesini değerlendirebilirsiniz.",
  "Platformu (MT4, MT5 veya broker'ın kendi uygulaması) demo modunda açın ve spread ile emir gerçekleştirmenin reklamı yapılanla eşleştiğini doğrulayın.",
];

const withdrawalSteps = [
  "Önce küçük bir para çekme talebinde bulunun — tutardan çok broker'ın gerçek işlem süresini gözlemlemek önemlidir.",
  "Depozit yaptığınız aynı ödeme yöntemini kullanın; çoğu regüle broker kara para aklamayı önleme uyumluluğu için bunu şart koşar.",
  "Talepten paranın ulaşmasına kadar geçen süreyi takip edin: güvenilir brokerlarda aynı gün ile 3 iş günü arası tipiktir, daha uzun gecikmeler uyarı işaretidir.",
  "Onay e-postasını veya işlem numarasını saklayın — broker'la veya regülatörünüzle bir gecikmeyi tartışmanız gerekirse referansınız olur.",
];

const faqs = [
  {
    q: "FXPARTNER Endeksi nedir ve nasıl hesaplanır?",
    a: "FXPARTNER Endeksi, aşağıdaki 01-04 rehberindeki dört kriterden (Regülasyon, Maliyet, Platform, Para Çekme) hesaplanan 0-10 arası bileşik bir puandır. Platform ekseni, broker'ın platform verilerinden otomatik olarak hesaplanır. Regülasyon ekseni varsayılan olarak lisans verilerinden türetilir; editör ekibi gerekçeli bir istisna yaptığında bu puanı güncelleyebilir. Maliyet ve Para Çekme eksenleri, incelemede bulunan doğrulanabilir sinyallere dayalı editoryal değerlendirmelerdir — belirli bir sinyali olmayan brokerlar o eksende nötr bir puan alır. Endeks, yıldız puanlamasından ayrı bir ölçüdür; ikisi farklı şeyleri yansıtabilir.",
  },
  {
    q: "Bu sıralama nasıl belirleniyor?",
    a: "Regülasyon kalitesi, maliyet şeffaflığı, platform çeşitliliği ve yatırımcı profiline uygunluk gibi genel kriterlere dayalı bir değerlendirmedir. FXPARTNER, listelenen brokerların bazılarıyla ortaklık/referans ilişkisine sahiptir ve hesap açılışlarından komisyon kazanabilir; bu durum her broker kartında ayrıca belirtilir.",
  },
  {
    q: "Yeni başlayanlar için en iyi broker hangisi?",
    a: "Düşük minimum depozit ve kapsamlı eğitim içeriği için XM genellikle daha kolay bir başlangıç sunar; Lite Finance de düşük giriş bariyeriyle öne çıkar.",
  },
  {
    q: "Kaldıraç oranları ülkeye göre neden değişir?",
    a: "AB ve İngiltere gibi bölgelerde ESMA/FCA regülasyonları perakende yatırımcılar için kaldıracı sınırlarken, offshore lisanslı hesaplar çok daha yüksek oranlar sunabilir. Bu sayfadaki rakamlar bölgeye göre değişebilir.",
  },
  {
    q: "Bu site yatırım tavsiyesi veriyor mu?",
    a: "Hayır. İçerik yalnızca genel bilgilendirme amaçlıdır ve kişisel yatırım tavsiyesi değildir. Karar vermeden önce kendi araştırmanızı yapmalı ve gerekirse bir uzmana danışmalısınız.",
  },
  {
    q: "İşlem sinyalleri nasıl oluşturuluyor ve ne kadar doğru?",
    a: "Sinyaller, önde gelen paritelerde trend, momentum ve volatilite göstergelerini içeren otomatik teknik taramayı, yayından önce yapılan manuel bir incelemeyle birleştirir. Her sinyalde giriş, zarar durdur ve kâr al seviyesi bulunur; böylece sonucu nesnel olarak kontrol edilebilir — kapanan sinyaller, kazanç veya kayıp sonucuyla birlikte sinyaller sayfasında görünür kalır. Geçmiş performans gelecekteki sonuçları garanti etmez ve sinyaller kişiselleştirilmiş tavsiye değil, eğitim amaçlıdır.",
  },
  {
    q: "Forex ticaretinin riskleri nelerdir?",
    a: "Forex ticareti kaldıraç kullanır; bu hem kazançları hem de kayıpları büyütür — hesap türüne ve yargı alanına bağlı olarak ilk depozitinizden daha fazlasını kaybedebilirsiniz. Yüksek volatilite dönemlerinde spread ve swap'lar genişler, offshore regüleli hesaplar Tier-1 regüleli hesaplara göre daha zayıf yatırımcı koruma garantileri taşır. Yalnızca kaybetmeyi göze alabileceğiniz sermayeyle işlem yapın ve gerçek fon yatırmadan önce bir demo hesap kullanın.",
  },
];

export default async function Home() {
  // Prefer the latest still-open trade so the hero card reflects a real
  // signal a visitor could still act on; fall back to the latest closed
  // one so the card isn't empty between open trades.
  const latestSignal =
    (await db.query.tradeSignals.findFirst({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
    })) ??
    (await db.query.tradeSignals.findFirst({
      where: eq(tradeSignals.status, "closed"),
      orderBy: desc(tradeSignals.closedAt),
    })) ??
    null;

  const brokerReviewStats = await getBrokerReviewStats();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
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
          <HeroVideo />
          <HeroSpotlight />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
                <span
                  aria-hidden="true"
                  className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                />
                Öğren · İşlem Yap · Büyü
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                Trading.
                <br />
                <span className="text-signal">Ama daha akıllı...</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
                FXPARTNER, daha akıllı işlem yapmanız için hepsi bir arada
                platformdur. Sinyaller, yapay zeka içgörüleri, ekonomik
                takvim, güvenilir brokerlar ve küresel bir topluluk.
              </p>
            </Reveal>

            <Reveal delay={290}>
              <InstallAppButtons />
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-12 border-t border-hairline pt-10">
                <HeroFeatureRow />
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroEcosystemMockups brokers={brokers} latestSignal={latestSignal} />
          </Reveal>
          </div>
        </section>

        {/* Ranked broker list */}
        <section id="brokers" className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Sıralamalar
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-on-ink md:text-4xl">
                2026&apos;nın en çok tercih edilen {brokers.length} forex brokeri
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                Her broker; regülasyon gücü, maliyet yapısı, platform desteği
                ve farklı yatırımcı profillerine uygunluk açısından
                değerlendirildi.
              </p>
              <div className="mt-6">
                <HeroBrokerSearch />
              </div>
            </Reveal>

            <div className="mt-12">
              <BrokerList brokers={brokers} reviewStats={brokerReviewStats} />
            </div>
          </div>
        </section>

        {/* Cashback lead capture */}
        <section className="bg-ink-soft">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mx-auto max-w-lg">
              <HeroCashbackForm />
            </div>
          </div>
        </section>

        <RegulatorBadges />

        {/* At-a-glance stats */}
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <Reveal>
              <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Takip Edilen Broker
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={trackedBrokerCount} />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Regülasyon Otoritesi
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={trackedRegulatorCount} suffix="+" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    En Düşük Giriş
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={lowestMinDeposit} prefix="$" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Karşılaştırma Kriteri
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={COMPARISON_CRITERIA.length} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        <ShowcaseGallery />

        {/* Comparison table */}
        <section id="comparison" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Yan Yana
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                Karşılaştırma tablosu
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                Karar vermeden önce önemli rakamları tek bakışta görün.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <ComparisonTable />
            </Reveal>
            <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-text-on-ink-muted">
              * Kaldıraç ve minimum depozit rakamları hesap türüne ve
              yatırımcının ülkesine göre değişebilir. İşlem yapmadan önce
              güncel koşulları broker&apos;ın resmi web sitesinden doğrulayın.
            </p>
          </div>
        </section>

        {/* How to choose */}
        <section id="how-to-choose" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
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

        {/* Account opening & withdrawal walkthrough */}
        <section id="guides" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Adım Adım
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                Hesap açma ve ilk para çekme işleminiz
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                Yeni bir brokerla ilgili güven sorunlarının çoğu aynı iki anda
                belirlenir. İşte her birinde nelere dikkat etmeniz gerektiği.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  Hesap açma
                </h3>
                <ol className="mt-4 space-y-4">
                  {accountSteps.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  İlk para çekme işleminiz
                </h3>
                <ol className="mt-4 space-y-4">
                  {withdrawalSteps.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Reveal delay={120} className="mt-12">
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                  Risk uyarısı
                </p>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-text-on-ink-muted">
                  Forex ticareti kaldıraçlıdır ve sermayenizi hızla kaybetme
                  riski taşır. Kaybetmeyi göze alamayacağınızdan fazlasını
                  asla yatırmayın ve yukarıdaki her adımı — KYC, ilk depozit,
                  ilk para çekme — daha fazla fon yatırmadan önce bir test
                  olarak değerlendirin.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <TradingVideo />

        {/* FAQ */}
        <section id="faq" className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal className="text-center">
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
