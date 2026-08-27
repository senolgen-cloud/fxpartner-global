import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import ChevronRight from "@/components/ChevronRight";
import Footer from "@/components/Footer";
import { cashbackPrograms } from "@/data/cashback";
import { getBrokerBySlug } from "@/data/brokers";
import { getMonogram } from "@/lib/monogram";
import { breadcrumbSchema } from "@/lib/schema";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

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

export default async function CashbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  // Confirmed programs first — they're the ones a visitor can act on today;
  // the estimates sit below them.
  const orderedPrograms = [...trData(cashbackPrograms)].sort(
    (a, b) => Number(b.status === "live") - Number(a.status === "live")
  );

  // Resolved once for the hero strip and the list below, so the two can
  // never show a different set of brokers. A program whose broker record
  // has gone missing drops out of both rather than rendering half a row.
  const programBrokers = orderedPrograms.flatMap((program) => {
    const broker = getBrokerBySlug(program.brokerSlug);
    return broker ? [{ program, broker }] : [];
  });

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
              {tr("Cashback")}
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("İşlem maliyetinizin bir kısmını geri alın")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Partner bağlantımız üzerinden bir aracı kurumda işlem yaptığınızda, aracı kurum işlem hacminizden doğan komisyonun bir kısmını bize öder. Bunun bir kısmını, aracı kurum tarafından doğrudan işlem hesabınıza yatırılmak üzere size geri veririz.")}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              {tr("Aşağıdan bir aracı kurum seçin, işlem hesap numaranızı gönderin, biz de bunu partner kayıtlarımızla doğrulayalım — hesap gerekmez.")}{" "}
              <strong className="text-text-on-ink">{tr("Aktif")}</strong>{" "}
              {tr("işaretli programların koşulları aracı kurumla teyit edilmiştir;")}{" "}
              <strong className="text-text-on-ink">{tr("Tahmini")}</strong>{" "}
              {tr("işaretli oranlar nihai koşullar imzalandıkça değişebilir.")}
            </p>

            {/* Logo strip. Deliberately the brokers we actually have a
                cashback agreement with — four — and not the nineteen the
                site reviews. A strip under this headline reads as "these
                pay you back", and putting a broker in it that owes us no
                rebate would be a claim we cannot honour.

                Each tile is the BrokerCard treatment (dark tile, contained
                logo, monogram fallback) rather than the flat white-on-dark
                marks the category uses: those need artwork redrawn for a
                dark background, and ours are colour files with their own
                backgrounds — dropped straight onto the hero, half of them
                would show a white box. */}
            <ul className="mt-8 flex flex-wrap items-center gap-2.5">
              {programBrokers.map(({ broker }) => (
                <li key={broker.slug}>
                  <Link
                    href={`/cashback/${broker.slug}/setup`}
                    title={broker.name}
                    className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-soft p-2.5 transition-colors hover:border-white/25 md:h-16 md:w-16"
                  >
                    {broker.logo ? (
                      <Image
                        src={broker.logo}
                        alt={broker.name}
                        fill
                        sizes="64px"
                        className="object-contain p-2.5"
                      />
                    ) : (
                      <span className="font-display text-sm font-semibold text-text-on-ink">
                        {getMonogram(broker.name)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* "Nasıl çalışır" — three steps, because the mechanism is the part
            a reader has to believe before the rate means anything to them.
            The page explained it in one dense paragraph up in the hero and
            then went straight to numbers. */}
        <section className="border-b border-hairline-light bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-14 md:py-16">
            <h2 className="font-poppins text-2xl font-semibold text-text-dark md:text-3xl">
              {tr("Nasıl çalışır?")}
            </h2>
            {/* tr() wraps the literals here rather than at the point of
                render. tr(step.t) would translate correctly at runtime but
                the string extractor only sees literal arguments, so the
                catalogue would never learn these keys and all three steps
                would stay Turkish on /en, /ua and /ar — the exact bug the
                unwrapped-JSX sweep just cleared out of 67 other places.
                Inside the component, not at module scope, so each request
                resolves in its own reader's language. */}
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: tr("Hesabınızı bağlayın"),
                  d: tr("Partner bağlantımızdan yeni bir hesap açın ya da mevcut hesap numaranızı gönderin."),
                },
                {
                  n: "02",
                  t: tr("Her zamanki gibi işlem yapın"),
                  d: tr("Spreadleriniz, kaldıracınız ve koşullarınız değişmez — doğrudan aracı kurumda açmışsınız gibi."),
                },
                {
                  n: "03",
                  t: tr("İadenizi alın"),
                  d: tr("Aracı kurum hacminizden doğan komisyonun payını öder; biz de bunun çoğunu hesabınıza geri veririz."),
                },
              ].map((step) => (
                <li key={step.n}>
                  {/* The step number is a numeral in every language. */}
                  <span className="font-mono text-xs tracking-[0.2em] text-gold">{step.n}</span>
                  <h3 className="mt-2 font-poppins text-base font-semibold text-text-dark">
                    {step.t}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{step.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {programBrokers.map(({ program, broker }) => {
                const live = program.status === "live";
                return (
                  <div key={program.brokerSlug} className="py-5 md:py-6">
                    {/* Logo leads the row. On a phone this is the only thing
                        a reader can scan by — four near-identical blocks of
                        text are four decisions, four marks are one glance. */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink p-2 md:h-12 md:w-12">
                        {broker.logo ? (
                          <Image
                            src={broker.logo}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <span
                            className="font-display text-sm font-semibold text-text-on-ink"
                            aria-hidden="true"
                          >
                            {getMonogram(broker.name)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* The rate wraps under the name on a phone instead
                            of fighting it for the same line — at 375px a
                            long "Lot başına 5 dolara kadar (tahmini)" was
                            squeezing the broker name to a couple of words. */}
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <h2 className="flex items-center gap-2.5 font-poppins text-lg font-semibold text-text-dark md:text-xl">
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
                        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                          {program.rateNote}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          {/* The primary action is a button, not one of two
                              identical mono-uppercase links — on a phone the
                              action that matters had to be found rather than
                              seen. It costs the row height rather than saving
                              it: at 375px the whole list grew 836px to 980px
                              across four rows. That is a trade taken, not a
                              saving.
                              The old link was a 20px target, under half the
                              44px a thumb needs, on the one page whose entire
                              job is this tap. Four rows is a screen and a bit
                              either way, so density was never what was
                              scarce here. */}
                          <Link
                            href={`/cashback/${broker.slug}/setup`}
                            className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl bg-ink px-5 text-[13px] font-semibold text-text-on-ink transition-colors hover:bg-ink-soft"
                          >
                            {tr("Cashback Al")}
                          </Link>
                          <Link
                            href={`/brokers/${broker.slug}`}
                            className="inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-xl px-3 text-[13px] font-medium text-text-muted transition-colors hover:bg-hairline-light/60 hover:text-text-dark"
                          >
                            {tr("İnceleme")}
                            <ChevronRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-lg font-semibold text-text-dark">
                {tr("Hesabınızı bağlamaya hazır mısınız?")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {tr("İşlem hesap numaranızı göndermek ve kazanç iade geçmişinizi takip etmek için FXPARTNER hesabınızda oturum açın.")}
              </p>
              <Link
                href="/account/login"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                {tr("Giriş Yap / Hesap Bağla")}
              </Link>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-text-muted">
              {tr("Kazanç iadesi, gerçek işlem hacminize göre aracı kurum tarafından doğrudan işlem hesabınıza yatırılır. Hesap sayfanızda gösterilen tutarlar partner panelimizden manuel olarak kaydedilir, otomatik oluşturulmaz ve son işlemleri yansıtması zaman alabilir. Bu yatırım tavsiyesi değildir.")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
