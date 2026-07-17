import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import { brokers, getBrokerBySlug, categoryInfo, type BrokerCategory } from "@/data/brokers";
import TrustIndex from "@/components/TrustIndex";

export function generateStaticParams() {
  return brokers.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);
  if (!broker) return {};
  return {
    title: `${broker.name} İncelemesi | FXPARTNER`,
    description: broker.summary,
  };
}

export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);
  if (!broker) notFound();

  const otherBrokers = brokers.filter((b) => b.slug !== broker.slug).slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <Link
              href="/#brokerlar"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← Tüm brokerlar
            </Link>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                  #{String(broker.rank).padStart(2, "0")} sırada
                </span>
                <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
                  {broker.name}
                </h1>
                <p className="mt-3 text-lg text-text-on-ink-muted">
                  {broker.tagline}
                </p>
                <div className="mt-4">
                  <RatingStars rating={broker.rating} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <a
                  href={broker.referralUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
                >
                  Hesap Aç
                </a>
                <span className="font-mono text-[10px] text-text-on-ink-muted">
                  Ortaklık linki{broker.partnerCode ? ` · Kod: ${broker.partnerCode}` : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-hairline-light bg-paper">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="rounded-2xl border border-hairline-light bg-paper-high p-6 md:p-8">
              <TrustIndex broker={broker} tone="light" showDescriptions wide />
            </div>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="max-w-2xl text-lg leading-relaxed text-text-dark/90">
              {broker.summary}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-hairline-light py-6 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Min. Yatırım
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.minDeposit}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Maks. Kaldıraç
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.maxLeverage}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Kuruluş
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.founded}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Merkez
                </dt>
                <dd className="mt-1 font-mono text-lg text-text-dark">
                  {broker.headquarters}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Platformlar
                </dt>
                <dd className="mt-1 font-mono text-lg text-text-dark">
                  {broker.platforms.join(" / ")}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  En Uygun
                </dt>
                <dd className="mt-1 text-sm text-text-dark">{broker.bestFor}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                Düzenleyici Kurumlar
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {broker.regulators.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-hairline-light px-3 py-1.5 font-mono text-xs text-text-muted"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                Kategoriler
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {broker.categories.map((c) => (
                  <Link
                    key={c}
                    href={`/kategoriler/${categoryInfo[c as BrokerCategory].slug}`}
                    className="rounded-full border border-signal/30 px-3 py-1.5 font-mono text-xs text-signal transition-colors hover:border-signal hover:bg-signal/10"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-signal">
                  Artıları
                </h2>
                <ul className="mt-4 space-y-3">
                  {broker.pros.map((pro) => (
                    <li key={pro} className="flex gap-3 text-[15px] text-text-dark/90">
                      <span className="mt-1 text-signal">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-alert">
                  Eksileri
                </h2>
                <ul className="mt-4 space-y-3">
                  {broker.cons.map((con) => (
                    <li key={con} className="flex gap-3 text-[15px] text-text-dark/90">
                      <span className="mt-1 text-alert">–</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">Not:</strong> Yukarıdaki
                bilgiler genel bilgilendirme amaçlıdır; hesap tipine ve
                bulunduğunuz ülkeye göre şartlar değişebilir. İşlem yapmadan
                önce {broker.name} resmi sitesinden güncel koşulları
                doğrulamanızı öneririz.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-text-dark">
              Diğer brokerlara göz atın
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {otherBrokers.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brokerlar/${b.slug}`}
                  className="rounded-xl border border-hairline-light p-5 transition-colors hover:border-text-dark"
                >
                  <span className="font-mono text-xs text-signal">
                    #{String(b.rank).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-text-dark">
                    {b.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{b.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
