import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { cashbackPrograms } from "@/data/cashback";
import { getBrokerBySlug } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";

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
    title: t["page.cashback.title"],
    description: t["page.cashback.description"],
    alternates: {
      canonical: localePath(locale, "/cashback"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/cashback")])
      ),
    },
  };
}

export default function CashbackPage() {
  // Confirmed programs first — they're the ones a visitor can act on today;
  // the estimates sit below them.
  const orderedPrograms = [...cashbackPrograms].sort(
    (a, b) => Number(b.status === "live") - Number(a.status === "live")
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Cashback", url: `${SITE_URL}/cashback` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Cashback
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              İşlem maliyetinizin bir kısmını geri alın
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Partner bağlantımız üzerinden bir aracı kurumda işlem
              yaptığınızda, aracı kurum işlem hacminizden doğan komisyonun
              bir kısmını bize öder. Bunun bir kısmını, aracı kurum
              tarafından doğrudan işlem hesabınıza yatırılmak üzere size
              geri veririz.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              Aşağıdan bir aracı kurum seçin, işlem hesap numaranızı gönderin,
              biz de bunu partner kayıtlarımızla doğrulayalım — hesap
              gerekmez. <strong className="text-text-on-ink">Aktif</strong>{" "}
              işaretli programların koşulları aracı kurumla teyit edilmiştir;{" "}
              <strong className="text-text-on-ink">Tahmini</strong> işaretli
              oranlar nihai koşullar imzalandıkça değişebilir.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {orderedPrograms.map((program) => {
                const broker = getBrokerBySlug(program.brokerSlug);
                if (!broker) return null;
                const live = program.status === "live";
                return (
                  <div key={program.brokerSlug} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h2 className="flex items-center gap-3 font-poppins text-xl font-semibold text-text-dark">
                        {broker.name}
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${
                            live
                              ? "bg-tick-up/12 text-tick-up"
                              : "bg-hairline-light text-text-muted"
                          }`}
                        >
                          {live ? "Aktif" : "Tahmini"}
                        </span>
                      </h2>
                      <span
                        className={`font-mono text-sm font-semibold ${
                          live ? "text-tick-up" : "text-gold"
                        }`}
                      >
                        {program.rateLabel}
                      </span>
                    </div>
                    {program.pitch && (
                      <p className="mt-2 text-[15px] font-medium text-text-dark">
                        {program.pitch}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-text-muted">{program.rateNote}</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <Link
                        href={`/cashback/${broker.slug}/setup`}
                        className="font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                      >
                        Cashback Al →
                      </Link>
                      <Link
                        href={`/brokers/${broker.slug}`}
                        className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text-dark"
                      >
                        Tam inceleme →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-lg font-semibold text-text-dark">
                Hesabınızı bağlamaya hazır mısınız?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                İşlem hesap numaranızı göndermek ve kazanç iade geçmişinizi
                takip etmek için FXPARTNER hesabınızda oturum açın.
              </p>
              <Link
                href="/account/login"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                Giriş Yap / Hesap Bağla
              </Link>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-text-muted">
              Kazanç iadesi, gerçek işlem hacminize göre aracı kurum
              tarafından doğrudan işlem hesabınıza yatırılır. Hesap
              sayfanızda gösterilen tutarlar partner panelimizden manuel
              olarak kaydedilir, otomatik oluşturulmaz ve son işlemleri
              yansıtması zaman alabilir. Bu yatırım tavsiyesi değildir.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
