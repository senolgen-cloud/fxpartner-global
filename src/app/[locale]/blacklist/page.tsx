import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { brokers } from "@/data/brokers";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Aracı Kurum Risk Uyarıları",
  description:
    "Düşük bağımsız güven puanları veya yayınlanan incelemelerde tekrarlayan şikayet örüntüleri nedeniyle işaretlenmiş aracı kurumlar.",
  alternates: { canonical: "/blacklist" },
};

// Curated, not automatic: only brokers whose `cons` already cite a specific,
// sourced complaint pattern or independent trust-score reference. Adding a
// broker here requires real, checkable evidence — never an unverified claim.
const WATCHLIST_SLUGS = ["exclusive-markets", "lhfx", "versus-trade", "tradingpro"];

const faqs = [
  {
    q: "Bu listede olmak, bir aracı kurumun dolandırıcı olduğu anlamına mı gelir?",
    a: "Hayır. Bu, hukuki bir dolandırıcılık tespiti değildir — aracı kurumun bağımsız güven endekslerinde düşük puan aldığı veya (çoğunlukla para çekme ile ilgili) tekrarlayan, kaynaklı bir şikayet örüntüsüne sahip olduğu, bir hesap açmadan önce ek durum tespiti (due diligence) yapmaya değer olduğu anlamına gelir. Somut kanıtlar her aracı kurumun tam incelemesinde belirtilir.",
  },
  {
    q: "Bir aracı kurum bu listeye nasıl eklenir?",
    a: "Yalnızca incelemesinde zaten somut, kaynaklı bir şikayet örüntüsü veya bağımsız güven puanı referansı bulunan aracı kurumlar eklenir — doğrulanmamış bir iddia asla eklenmez. Aynı kanıt, o aracı kurumun kendi inceleme sayfasında da yer alır.",
  },
  {
    q: "İşaretlenmiş bir aracı kurumda zaten hesabım varsa ne yapmalıyım?",
    a: "O aracı kurumun inceleme sayfasında belirtilen özel endişeleri okuyun ve sürecin beklendiği gibi çalıştığını doğrulamak için küçük bir para çekme işlemini test etmeyi düşünün. Kendiniz belgelenmiş bir sorun yaşadıysanız, FXPARTNER'a şikayet bildirebilirsiniz.",
  },
];

export default function BlacklistPage() {
  const flagged = WATCHLIST_SLUGS.map((slug) => brokers.find((b) => b.slug === slug)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Risk Uyarıları", url: `${SITE_URL}/blacklist` },
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
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-alert">
              Risk Uyarıları
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Kaydolmadan önce dikkatlice araştırılması gereken aracı kurumlar
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              Bu aracı kurumlar bağımsız güven endekslerinde düşük puan
              alıyor veya yayınlanan incelemelerde tekrarlayan şikayet
              örüntülerine sahip. Bu hukuki bir dolandırıcılık tespiti
              değildir — ek durum tespiti yapılması gerektiğine dair bir
              sinyaldir. Kaynaklar her aracı kurumun tam incelemesinde
              belirtilir.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {flagged.map((broker) => (
                <div key={broker.slug} className="py-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="notranslate font-display text-2xl font-semibold text-text-dark">
                      {broker.name}
                    </h2>
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-alert">
                      Puan {broker.rating.toFixed(1)}/5
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                    {broker.summary}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {broker.cons.map((con) => (
                      <li key={con} className="flex gap-3 text-[15px] text-text-dark/90">
                        <span className="mt-1 text-alert">–</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                  >
                    Tam inceleme →
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-display text-lg font-semibold text-text-dark">
                Bir aracı kurumla kötü bir deneyim mi yaşadınız?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Şikayet bildirin, doğrulanmış ve tekrarlayan örüntüleri bu
                sayfaya ve puanlamamıza yansıtalım.
              </p>
              <Link
                href="/complaint"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                Şikayet Gönder
              </Link>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-text-dark">
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
