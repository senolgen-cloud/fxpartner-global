import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import AiMarketAssistant from "@/components/AiMarketAssistant";
import UpgradeGate from "@/components/UpgradeGate";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { getViewerAccess, hasTierAccess } from "@/lib/tierAccess";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/ai-asistan-preview.jpg`;
const TITLE = "AI Piyasa Asistanı | FXPARTNER";
const DESCRIPTION =
  "Yatırımcıların tercih ettiği FXPARTNER Piyasa Asistanı — forex, altın, CPI/NFP gibi makro veriler ve teknik/temel analiz stratejileri hakkında sorularınızı yanıtlar.";

const features = [
  {
    icon: "📊",
    title: "Piyasa Analizi",
    body: "Forex, altın (XAU/USD) ve endekslerdeki trendleri, kritik destek/direnç seviyelerini ve güncel piyasa gelişmelerini saniyeler içinde keşfedin — teknik ve temel analiz bir arada.",
  },
  {
    icon: "🧠",
    title: "Akıllı Yönlendirme",
    body: "Sorularınızı doğal dilde sorun, aldığınız analizleri inceleyin ve yatırım süreçlerinizi daha bilinçli, adım adım yönetin.",
  },
  {
    icon: "⚡",
    title: "Anında Yanıtlar",
    body: "CPI, NFP gibi makroekonomik verilerden strateji ve hesap yönetimine kadar piyasayla ilgili sorularınıza saniyeler içinde net yanıtlar alın.",
  },
  {
    icon: "🛡️",
    title: "Güncel Bilgi",
    body: "Doğru, güncel ve güvenilir bilgilerle piyasayı daha yakından takip edin — asistan sürekli güncellenen verilerle çalışır.",
  },
  {
    icon: "📈",
    title: "Strateji & Risk Yönetimi",
    body: "Karar sürecinizi daha sistematik hale getirin; pozisyon büyüklüğü, risk/ödül oranı ve strateji değerlendirmesi konularında yönlendirme alın.",
  },
];

const aiAssistantFaqs = [
  {
    q: "FXPARTNER AI Asistanı nedir?",
    a: "FXPARTNER AI Asistanı, forex, altın, kripto ve endeks piyasalarını analiz eden, sorularınızı yanıtlayan ve yatırım kararlarınızı daha bilinçli almanıza yardımcı olan yeni nesil bir yapay zeka deneyimidir. 7/24 erişilebilir, Pro ve VIP paket üyelerine özeldir.",
  },
  {
    q: "FXPARTNER AI Asistanı ücretsiz mi?",
    a: "Hayır. FXPARTNER AI Asistanı, Pro ve VIP paketlerinin bir parçasıdır — erişmek için bu paketlerden birine üye olmanız gerekir. Ücretsiz üyelikte AI Asistan yer almaz.",
  },
  {
    q: "FXPARTNER AI Asistanı hangi konularda yardımcı olur?",
    a: "Piyasa analizi (forex, altın, endeksler), CPI/NFP gibi makroekonomik veri yorumları, teknik ve temel analiz stratejileri, risk yönetimi kavramları ve genel hesap/platform sorularında yardımcı olur.",
  },
  {
    q: "FXPARTNER AI Asistanı yatırım tavsiyesi verir mi?",
    a: "Hayır. FXPARTNER AI Asistanı bilgilendirme ve eğitim amaçlıdır; yatırım tavsiyesi niteliği taşımaz. Verilen bilgiler genel piyasa analizi ve eğitim içeriğidir — yatırım kararlarınızı kendi risk toleransınıza göre almalısınız.",
  },
  {
    q: "FXPARTNER AI Asistanı'na nasıl ulaşabilirim?",
    a: "fxpartner.global/ai-asistan adresinden, Pro veya VIP paketinizle giriş yaparak sohbete başlayabilirsiniz. Asistan Türkçe ve İngilizce dahil birden fazla dilde hizmet verir.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.ai-asistan.title"],
    description: t["page.ai-asistan.description"],
    alternates: {
      canonical: localePath(locale, "/ai-asistan"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/ai-asistan")])
      ),
    },
    openGraph: {
      url: `${SITE_URL}/ai-asistan`,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1448, height: 1086 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE],
    },
  };
}

export default async function AiAssistantPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const { signedIn, tier } = await getViewerAccess();
  const canUse = hasTierAccess(tier, "pro");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "AI Market Assistant", url: `${SITE_URL}/ai-asistan` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(aiAssistantFaqs))) }}
      />
      <main lang="tr" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mb-10 text-center">
          <a
            href="https://t.me/fxpartnerglobal"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-ink-soft px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-signal transition-colors hover:border-signal hover:text-text-on-ink"
          >
            {tr("📣 Telegram Kanalımıza Katılın")}
          </a>
          <h1 className="mb-4 text-3xl font-semibold text-text-on-ink sm:text-4xl md:text-5xl">
            {tr("Daha Akıllı Analiz.")}{" "}
            <span className="text-signal">{tr("Daha Güçlü Yatırımlar.")}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-text-on-ink-muted">
            {tr("Piyasalar her saniye değişiyor. FXPARTNER AI Asistanı, yatırım yolculuğunuzda ihtiyaç duyduğunuz bilgiye saniyeler içinde ulaşmanızı sağlayan, modern ve akıllı bir yardımcınızdır.")}
          </p>
        </div>

        <div className="mb-14 overflow-hidden rounded-2xl border border-hairline shadow-sm">
          <Image
            src="/ai-asistan/ai-asistan-banner.png"
            alt={tr("FXPARTNER AI Asistanı — daha akıllı analiz, daha güçlü yatırımlar")}
            width={1672}
            height={941}
            className="h-auto w-full"
            priority
          />
        </div>

        {canUse ? (
          <AiMarketAssistant />
        ) : (
          <UpgradeGate
            eyebrow="Pro & VIP Üyelere Özel"
            title={tr("AI Piyasa Asistanı'na erişmek için Pro veya VIP paketine katılın")}
            description="Sınırsız soru, anlık piyasa analizi ve strateji desteği — Pro paketinden itibaren açılır."
            signedIn={signedIn}
          />
        )}

        {/* Rich SEO/AEO content — real crawlable text answering "what is
            FXPARTNER AI", not just the banner image above. */}
        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              {tr("FXPARTNER AI Asistanı")}
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-text-on-ink sm:text-3xl">
              {tr("Yatırım yolculuğunuzda akıllı rehberiniz")}
            </h2>
            <p className="mt-4 leading-relaxed text-text-on-ink-muted">
              {tr("FXPARTNER AI Asistanı sadece bir sohbet aracı değil; piyasayı anlamanıza, bilgiye daha hızlı ulaşmanıza ve yatırım yolculuğunuzda daha güçlü hareket etmenize yardımcı olan yeni nesil bir AI deneyimidir. Forex, altın, kripto ve endeksler dahil geniş bir enstrüman yelpazesinde; CPI, NFP gibi makroekonomik verilerden teknik/temel analiz stratejilerine kadar sorularınızı saniyeler içinde yanıtlar.")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trData(features).map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-hairline bg-ink-soft/40 p-6 transition-colors hover:border-signal/40"
              >
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-text-on-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-hairline bg-ink-soft/40 p-8 text-center">
            <p className="text-lg font-semibold text-text-on-ink">
              {tr("✨ Sorun. Öğrenin. Analiz Edin. Daha bilinçli hareket edin.")}
            </p>
            <p className="mt-2 text-sm text-text-on-ink-muted">
              {tr("FXPARTNER AI Asistanı, 7/24 hızlı, güvenilir ve akıllı yanıtlarla yanınızda.")}
            </p>
          </div>

          {/* Global / English availability */}
          <div className="mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Also Available Worldwide
              </span>
              <h2 className="mt-3 text-xl font-semibold text-text-on-ink sm:text-2xl">
                FXPARTNER AI Assistant — now serving traders globally in English
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                Smarter analysis, stronger investments. Ask, analyze, and learn — FXPARTNER AI
                Assistant gives international traders the same instant, 24/7 access to market
                analysis, strategy guidance, and risk management support.
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-hairline shadow-sm">
              <Image
                src="/ai-asistan/ai-asistan-eng-banner.png"
                alt="FXPARTNER AI Assistant — smarter analysis, stronger investments"
                width={1672}
                height={941}
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* FAQ — structured for AI answer engines (AEO) as well as classic
              search snippets. */}
          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-2xl font-semibold text-text-on-ink text-center">
              {tr("Sıkça Sorulan Sorular")}
            </h2>
            <div className="mt-8 divide-y divide-hairline border-t border-hairline">
              {trData(aiAssistantFaqs).map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-on-ink">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-on-ink-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-on-ink-muted">
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
