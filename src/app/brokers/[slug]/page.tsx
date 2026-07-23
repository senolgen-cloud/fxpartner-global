import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import { brokers, getBrokerBySlug, categoryInfo, type BrokerCategory } from "@/data/brokers";
import TrustIndex from "@/components/TrustIndex";
import CommentForm from "@/components/CommentForm";
import { auth } from "@/auth";
import { db } from "@/db";
import { comments as commentsTable, users as usersTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { flagEmoji } from "@/lib/country";
import { brokerReviewSchema, aggregateRatingSchema, breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

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
    title: `${broker.name} Review`,
    description: broker.summary,
    alternates: { canonical: `/brokers/${broker.slug}` },
    openGraph: {
      title: `${broker.name} Review | FXPARTNER`,
      description: broker.summary,
      url: `${SITE_URL}/brokers/${broker.slug}`,
      type: "article",
    },
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

  const session = await auth();
  const brokerComments = await db
    .select({
      id: commentsTable.id,
      body: commentsTable.body,
      rating: commentsTable.rating,
      createdAt: commentsTable.createdAt,
      userName: usersTable.name,
      userCountry: usersTable.country,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.brokerSlug, broker.slug))
    .orderBy(desc(commentsTable.createdAt));

  const ratedComments = brokerComments.filter((c) => c.rating != null);
  const aggregate =
    ratedComments.length > 0
      ? aggregateRatingSchema({
          brokerName: broker.name,
          brokerSlug: broker.slug,
          ratingValue:
            Math.round(
              (ratedComments.reduce((sum, c) => sum + (c.rating ?? 0), 0) /
                ratedComments.length) *
                10
            ) / 10,
          ratingCount: ratedComments.length,
        })
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brokerReviewSchema(broker)) }}
      />
      {aggregate && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregate) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Brokers", url: `${SITE_URL}/#brokers` },
              { name: broker.name, url: `${SITE_URL}/brokers/${broker.slug}` },
            ])
          ),
        }}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <Link
              href="/#brokers"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← All brokers
            </Link>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                  Ranked #{String(broker.rank).padStart(2, "0")}
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
                  Open Account
                </a>
                <span className="font-mono text-[10px] text-text-on-ink-muted">
                  Affiliate link{broker.partnerCode ? ` · Code: ${broker.partnerCode}` : ""}
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
                  Min. Deposit
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.minDeposit}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Max. Leverage
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.maxLeverage}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Founded
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-lg text-text-dark">
                  {broker.founded}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Headquarters
                </dt>
                <dd className="mt-1 font-mono text-lg text-text-dark">
                  {broker.headquarters}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Platforms
                </dt>
                <dd className="mt-1 font-mono text-lg text-text-dark">
                  {broker.platforms.join(" / ")}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Best For
                </dt>
                <dd className="mt-1 text-sm text-text-dark">{broker.bestFor}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                Regulators
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

            {broker.categories.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  Categories
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {broker.categories.map((c) => (
                    <Link
                      key={c}
                      href={`/categories/${categoryInfo[c as BrokerCategory].slug}`}
                      className="rounded-full border border-signal/30 px-3 py-1.5 font-mono text-xs text-signal transition-colors hover:border-signal hover:bg-signal/10"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-signal">
                  Pros
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
                  Cons
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

            {broker.promotion && (
              <Link
                href={`/campaigns#${broker.slug}`}
                className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/10 px-6 py-4 transition-colors hover:border-gold/50"
              >
                <span className="text-sm font-medium text-text-dark">
                  🎁 {broker.promotion.title}
                </span>
                <span className="shrink-0 font-mono text-xs uppercase tracking-[0.15em] text-gold">
                  Click for {broker.name} Campaigns →
                </span>
              </Link>
            )}

            <div
              className={`${broker.promotion ? "mt-6" : "mt-14"} rounded-2xl border border-hairline-light bg-paper p-6`}
            >
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">Note:</strong> The
                information above is for general informational purposes;
                terms may vary by account type and your country. We
                recommend verifying current conditions on {broker.name}&apos;s
                official website before trading.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-text-dark">
              Comments ({brokerComments.length})
            </h2>

            <div className="mt-6">
              <CommentForm brokerSlug={broker.slug} signedIn={Boolean(session?.user)} />
            </div>

            {brokerComments.length > 0 && (
              <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
                {brokerComments.map((c) => (
                  <div key={c.id} className="py-5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-dark">
                        {c.userName || "FXPARTNER user"}
                      </span>
                      {c.userCountry && <span aria-hidden="true">{flagEmoji(c.userCountry)}</span>}
                      {c.rating && (
                        <span className="font-mono text-xs text-gold">{c.rating}/5</span>
                      )}
                      <span className="font-mono text-xs text-text-muted">
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-text-dark/90">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-text-dark">
              Explore other brokers
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {otherBrokers.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brokers/${b.slug}`}
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
