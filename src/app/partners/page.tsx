import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TiltWrapper from "@/components/TiltWrapper";
import PartnerApplicationForm from "@/components/PartnerApplicationForm";
import PartnerDashboardPreview from "@/components/PartnerDashboardPreview";
import PartnerSmoothScroll from "@/components/partners/PartnerSmoothScroll";
import PartnerHero from "@/components/partners/PartnerHero";
import StepTimeline from "@/components/partners/StepTimeline";
import CommissionCalculator from "@/components/partners/CommissionCalculator";
import PartnerTierCards from "@/components/partners/PartnerTierCards";
import WhyFxPartner from "@/components/partners/WhyFxPartner";
import ContentStudioPreview from "@/components/partners/ContentStudioPreview";
import ContentLibraryTeaser from "@/components/partners/ContentLibraryTeaser";
import GlobalNetworkMap from "@/components/partners/GlobalNetworkMap";
import PartnerFAQ from "@/components/partners/PartnerFAQ";
import { cashbackPrograms } from "@/data/cashback";
import { getBrokerBySlug, brokers } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Partner Ol",
  description:
    "FXPARTNER'ın ana IB anlaşması kapsamında bir Sub-IB partner hesabı açın ve yönlendirdiğiniz müşterilerden elde edilen rev-share'den pay alın.",
  alternates: { canonical: "/partners" },
};

const regulatorCount = new Set(brokers.flatMap((b) => b.regulators)).size;

export default function PartnersPage() {
  const eligibleBrokers = cashbackPrograms
    .map((p) => getBrokerBySlug(p.brokerSlug))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <PartnerSmoothScroll>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Partner Ol", url: `${SITE_URL}/partners` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <PartnerHero brokerCount={brokers.length} regulatorCount={regulatorCount} />

        <section id="how-it-works" className="scroll-mt-20">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Nasıl çalışır
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Başvurudan ömür boyu komisyona
              </h2>
            </Reveal>
            <div className="mt-14">
              <StepTimeline />
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Komisyon hesaplayıcı
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Ağınızın ne kazanabileceğini görün
              </h2>
            </Reveal>
            <div className="mt-12">
              <CommissionCalculator />
            </div>
          </div>
        </section>

        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_460px] lg:items-center">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Partner paneli
              </span>
              <h2 className="mt-3 max-w-lg font-poppins text-3xl font-semibold leading-tight md:text-4xl">
                Her yönlendirmeyi, komisyonu ve ödemeyi tek yerden takip edin
              </h2>
              <p className="mt-5 max-w-md text-text-on-ink-muted">
                Onaylandıktan sonra, bizimkinden ayrı olan kendi partner
                panelinize erişim kazanırsınız — yönlendirme aktivitesini,
                kazanılan komisyonu ve ödeme durumunu buradan görürsünüz.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <TiltWrapper>
                <PartnerDashboardPreview />
              </TiltWrapper>
            </Reveal>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Partner seviyeleri
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Ağınız büyüdükçe daha üst seviyelere yükselin
              </h2>
            </Reveal>
            <div className="mt-12">
              <PartnerTierCards />
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Neden FXPARTNER
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Gerçek kitleler getiren kişiler için tasarlandı
              </h2>
            </Reveal>
            <div className="mt-12">
              <WhyFxPartner />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Sizin için hazırlanan içerikler
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Paylaşacak içeriğiniz hiç bitmesin
              </h2>
            </Reveal>
            <div className="mt-10">
              <ContentStudioPreview />
            </div>
            <div className="mt-14">
              <ContentLibraryTeaser />
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                Küresel ağ
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Her bölgeye yayılmış partnerler
              </h2>
            </Reveal>
            <div className="mt-10">
              <GlobalNetworkMap />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark">
              Aktif partner anlaşması olan brokerlar
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
              Sub-IB ortaklıkları şu anda, FXPARTNER'ın zaten onaylı bir ana
              IB anlaşmasına sahip olduğu aşağıdaki brokerlar için mümkündür.
              Başvuruda tercihinizi belirtin — uygunluğu ve kesin şartları
              doğrudan brokerla teyit edeceğiz.
            </p>
            <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
              {eligibleBrokers.map((broker) => (
                <div
                  key={broker.slug}
                  className="flex flex-wrap items-baseline justify-between gap-3 py-5"
                >
                  <h3 className="font-poppins text-lg font-semibold text-text-dark">
                    {broker.name}
                  </h3>
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text-dark"
                  >
                    Detaylı inceleme →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark">
              Bu kimler için uygun
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-text-muted">
              <li>— Trading ile ilgilenen bir kitlesi olan sosyal medya hesabı, YouTube kanalı veya blog yönetiyorsunuz.</li>
              <li>— Bir trading sinyal grubu, topluluk veya Telegram kanalı yönetiyorsunuz.</li>
              <li>— Zaten gayri resmi olarak trader yönlendiriyorsunuz ve bunun yerine düzgün, izlenebilir bir partner yapısı istiyorsunuz.</li>
              <li>— Forex broker yönlendirmelerinin doğal bir uyum sağladığı bir işletme veya ağ yönetiyorsunuz.</li>
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-text-muted">
              Bu yatırım tavsiyesi değildir ve garantili bir gelir fırsatı
              sunmaz — gerçek kazançlar tamamen yönlendirdiğiniz müşterilerin
              işlem hacmine ve her brokerın nihai onay ve şartlarına bağlıdır.
              FXPARTNER, spam yapmayı, yanıltmayı veya brokerı potansiyel
              müşterilere yanlış tanıtmayı amaçlayan başvuruları kabul etmez.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                SSS
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                Sık sorulan sorular
              </h2>
            </Reveal>
            <div className="mt-10">
              <PartnerFAQ />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-ink text-text-on-ink">
          <div
            aria-hidden="true"
            className="hero-glow-signal pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-signal/25 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="hero-glow-gold pointer-events-none absolute -right-16 bottom-0 h-[360px] w-[360px] rounded-full bg-gold/20 blur-[110px]"
          />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
            <Reveal>
              <div className="relative mx-auto overflow-hidden rounded-3xl border border-hairline bg-ink-soft/60 px-8 py-14 backdrop-blur-sm">
                <div
                  aria-hidden="true"
                  className="glass-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Partner işinizi bugün kurmaya başlayın.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-text-on-ink-muted">
                  Bir kez başvurun, bir brokerın partner masasıyla eşleşin
                  ve getirdiğiniz traderlardan ömür boyu komisyon kazanmaya
                  başlayın.
                </p>
                <a
                  href="#apply"
                  className="lift-on-hover mt-9 inline-block rounded-full bg-signal px-8 py-3.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
                >
                  Partner Ol
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="apply" className="bg-paper scroll-mt-20">
          <div className="mx-auto max-w-2xl px-6 py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark">
              Partner olarak başvurun
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Aşağıdaki formu doldurun, partnerlik ekibimiz e-posta yoluyla
              sizinle iletişime geçecek.
            </p>
            <div className="mt-8">
              <PartnerApplicationForm
                brokers={eligibleBrokers.map((b) => ({ slug: b.slug, name: b.name }))}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PartnerSmoothScroll>
  );
}
