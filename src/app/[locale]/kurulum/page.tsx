import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

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
    title: t["page.kurulum.title"],
    description: t["page.kurulum.description"],
    alternates: {
      canonical: localePath(locale, "/kurulum"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/kurulum")])
      ),
    },
  };
}

interface Step {
  title: string;
  body: string;
}

const IOS_STEPS: Step[] = [
  {
    title: "Safari'de fxpartner.global'i açın",
    body: "Kurulum yalnızca Safari üzerinden yapılabilir — Chrome, Instagram veya başka bir uygulama içi tarayıcıda \"Ana Ekrana Ekle\" seçeneği görünmez.",
  },
  {
    title: "Alt menüden Paylaş simgesine dokunun",
    body: "Ekranın altındaki, kare içinde yukarı ok bulunan paylaş simgesine dokunun.",
  },
  {
    title: "\"Ana Ekrana Ekle\"yi seçin",
    body: "Açılan listede aşağı kaydırarak \"Ana Ekrana Ekle\" seçeneğini bulun ve dokunun.",
  },
  {
    title: "\"Ekle\"ye dokunun",
    body: "Sağ üstteki \"Ekle\" butonuna dokunun — FXPARTNER simgesi artık ana ekranınızda, diğer uygulamalar gibi görünür.",
  },
  {
    title: "Bildirimleri açın",
    body: "Uygulamayı ana ekrandan açın; birkaç saniye içinde çıkan bildirim isteğini onaylayın. iOS'ta bildirimler yalnızca uygulama ana ekrana eklendikten sonra çalışır — Safari sekmesinden açık kalırsa çalışmaz.",
  },
];

const ANDROID_STEPS: Step[] = [
  {
    title: "Chrome'da fxpartner.global'i açın",
    body: "Android'de Chrome (veya Chrome tabanlı bir tarayıcı) kullanmanız gerekir.",
  },
  {
    title: "Sağ üstteki ⋮ menüsüne dokunun",
    body: "Adres çubuğunun sağındaki üç nokta menüsünü açın.",
  },
  {
    title: "\"Uygulamayı yükle\" veya \"Ana ekrana ekle\"yi seçin",
    body: "Chrome sürümüne göre biri veya diğeri görünür; ikisi de aynı sonucu verir.",
  },
  {
    title: "\"Yükle\"yi onaylayın",
    body: "Çıkan onay penceresinde \"Yükle\"ye dokunun — FXPARTNER uygulama çekmecenize ve ana ekranınıza eklenir.",
  },
  {
    title: "Bildirimlere izin verin",
    body: "Uygulamayı açtığınızda gelen bildirim izni isteğini onaylayın, böylece yeni sinyaller telefonunuza anında düşer.",
  },
];

const WINDOWS_STEPS: Step[] = [
  {
    title: "Chrome veya Edge'de fxpartner.global'i açın",
    body: "Windows'ta kurulum Chrome veya Microsoft Edge üzerinden yapılır.",
  },
  {
    title: "Adres çubuğundaki yükle simgesine tıklayın",
    body: "Adres çubuğunun sağında bir ekran + artı (⊕) simgesi belirir. Görünmüyorsa tarayıcı menüsü (⋮) → \"FXPARTNER'ı Yükle\"yi seçin.",
  },
  {
    title: "\"Yükle\"ye tıklayın",
    body: "Açılan pencerede \"Yükle\" butonuna tıklayın.",
  },
  {
    title: "Görev çubuğuna sabitleyin (opsiyonel)",
    body: "Uygulama kendi penceresinde açılır. Hızlı erişim için simgesine sağ tıklayıp \"Görev çubuğuna sabitle\"yi seçebilirsiniz.",
  },
  {
    title: "Bildirimlere izin verin",
    body: "Windows bildirim izni isteğini onaylayın — yeni sinyaller masaüstü bildirimi olarak gelir.",
  },
];

const faqs = [
  {
    q: "Uygulamayı kurmak ücretsiz mi?",
    a: "Evet. FXPARTNER'ı ana ekranınıza/masaüstünüze eklemek tamamen ücretsizdir ve App Store veya Play Store üzerinden bir kurulum gerektirmez.",
  },
  {
    q: "Bildirimler neden gelmiyor?",
    a: "iOS'ta bildirimler yalnızca uygulama ana ekrana eklendikten sonra çalışır — Safari sekmesinden asla çalışmaz. Android ve Windows'ta ise tarayıcı veya işletim sistemi ayarlarından FXPARTNER için bildirim izninin engellenmediğinden emin olun.",
  },
  {
    q: "\"Ana Ekrana Ekle\" seçeneğini göremiyorum, ne yapmalıyım?",
    a: "iPhone'da bu seçenek yalnızca Safari'de görünür — Instagram, Chrome veya başka bir uygulama içi tarayıcıdaysanız önce sayfayı Safari'de açın. Android'de Chrome kullandığınızdan emin olun.",
  },
  {
    q: "Kurulum için depolama alanı gerekir mi?",
    a: "Hayır. FXPARTNER bir web uygulaması olarak eklenir, birkaç megabayttan daha az yer kaplar ve cihazınızda ayrı bir dosya indirmez.",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-6 space-y-5">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/15 font-mono text-sm font-semibold text-signal">
            {i + 1}
          </span>
          <div>
            <h3 className="font-medium text-text-dark">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PlatformSection({
  id,
  icon,
  eyebrow,
  title,
  steps,
}: {
  id: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  steps: Step[];
}) {
  return (
    <div id={id} className="scroll-mt-24 rounded-3xl border border-hairline-light bg-paper p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-text-on-ink">
          {icon}
        </span>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">{eyebrow}</span>
          <h2 className="font-poppins text-xl font-semibold text-text-dark">{title}</h2>
        </div>
      </div>
      <StepList steps={steps} />
    </div>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};

function AppleIcon() {
  return (
    <svg {...iconProps}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg {...iconProps}>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 7h6M11 17h2" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="12" rx="1.8" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export default function KurulumPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Kurulum Rehberi", url: `${SITE_URL}/kurulum` },
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
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Kurulum Rehberi
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              FXPARTNER&apos;ı telefonunuza veya bilgisayarınıza kurun
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              App Store veya Play Store gerekmez. FXPARTNER, tarayıcınız
              üzerinden birkaç dokunuşla telefonunuzun veya bilgisayarınızın
              ana ekranına eklenir ve gerçek bir uygulama gibi çalışır — yeni
              sinyaller de doğrudan bildirim olarak gelir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#ios"
                className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                iOS
              </a>
              <a
                href="#android"
                className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                Android
              </a>
              <a
                href="#windows"
                className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                Windows
              </a>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="flex flex-col gap-8">
              <PlatformSection
                id="ios"
                icon={<AppleIcon />}
                eyebrow="iPhone / iPad"
                title="iOS'ta kurulum (Safari)"
                steps={IOS_STEPS}
              />
              <PlatformSection
                id="android"
                icon={<AndroidIcon />}
                eyebrow="Telefon / Tablet"
                title="Android'de kurulum (Chrome)"
                steps={ANDROID_STEPS}
              />
              <PlatformSection
                id="windows"
                icon={<WindowsIcon />}
                eyebrow="Masaüstü"
                title="Windows'ta kurulum (Chrome / Edge)"
                steps={WINDOWS_STEPS}
              />
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-lg font-semibold text-text-dark">
                Sinyalleri kaçırmayın
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Kurulumdan sonra bildirimlere izin verirseniz, yeni bir işlem
                sinyali yayınlandığı anda telefonunuza veya bilgisayarınıza
                sesli bir bildirim düşer.
              </p>
              <Link
                href="/signals"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                Canlı Sinyallere Git
              </Link>
            </div>

            <div id="faq" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
              <h2 className="font-poppins text-2xl font-semibold text-text-dark">
                Sıkça Sorulan Sorular
              </h2>
              <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
