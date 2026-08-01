import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import TrustGauge from "@/components/TrustGauge";
import {
  brokers,
  getBrokerBySlug,
  getBrokerScores,
  categoryInfo,
  TIER1_REGULATORS,
  type BrokerCategory,
} from "@/data/brokers";
import TrustIndex from "@/components/TrustIndex";
import CommentForm from "@/components/CommentForm";
import { auth } from "@/auth";
import { db } from "@/db";
import { comments as commentsTable, users as usersTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { flagEmoji } from "@/lib/country";
import { brokerReviewSchema, aggregateRatingSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { regulationParagraph, platformParagraph, verdictParagraph, brokerFaqs } from "@/lib/brokerContent";
import { getBlogPostBySlug } from "@/data/blog";

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
      ...(broker.ogImage ? { images: [{ url: `${SITE_URL}${broker.ogImage}` }] } : {}),
    },
    ...(broker.ogImage
      ? { twitter: { card: "summary_large_image" as const, images: [`${SITE_URL}${broker.ogImage}`] } }
      : {}),
  };
}

const SNAPSHOT_ICONS = {
  deposit: (
    <path d="M4 7h16M4 7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M4 7l2-4h12l2 4M12 12v4" />
  ),
  leverage: <path d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6" />,
  founded: (
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  ),
  hq: <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  platforms: <path d="M4 4h16v12H4zM8 20h8M12 16v4" />,
};

function SnapshotIcon({ name }: { name: keyof typeof SNAPSHOT_ICONS }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-signal">
      {SNAPSHOT_ICONS[name]}
    </svg>
  );
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
  const faqs = brokerFaqs(broker);
  const reviewPost = getBlogPostBySlug(`${broker.slug}-review`);
  const scores = getBrokerScores(broker);

  const tier1Regulators = broker.regulators.filter((r) => TIER1_REGULATORS.has(r));
  const offshoreRegulators = broker.regulators.filter((r) => !TIER1_REGULATORS.has(r));

  const navSections = [
    { id: "regulation", label: "Regulation" },
    { id: "platforms", label: "Platforms" },
    { id: "pros-cons", label: "Pros & Cons" },
    ...(broker.deepDive ? [{ id: "accounts", label: "Accounts" }] : []),
    { id: "verdict", label: "Verdict" },
    { id: "faq", label: "FAQ" },
    { id: "reviews", label: "Reviews" },
  ];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <main className="flex-1">
        {/* Hero + trust gauge */}
        <section className="relative overflow-hidden bg-ink text-text-on-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/10 blur-[110px]"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-20">
            <Link
              href="/#brokers"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← All brokers
            </Link>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                  Ranked #{String(broker.rank).padStart(2, "0")}
                </span>
                <h1 className="notranslate mt-3 font-display text-4xl font-semibold md:text-5xl">
                  {broker.name}
                </h1>
                <p className="mt-3 max-w-lg text-lg text-text-on-ink-muted">
                  {broker.tagline}
                </p>
                <div className="mt-4">
                  <RatingStars rating={broker.rating} />
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={broker.referralUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
                  >
                    Open Account
                  </a>
                  {broker.partnerCode && (
                    <span className="font-mono text-[10px] text-text-on-ink-muted">
                      Code: {broker.partnerCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center rounded-3xl border border-hairline bg-ink-soft/60 p-8 lg:justify-self-end">
                <TrustGauge score={scores.composite} />
              </div>
            </div>

            {/* Quick section nav */}
            <nav className="mt-12 flex flex-wrap gap-2 border-t border-hairline pt-6">
              {navSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:border-text-on-ink hover:text-text-on-ink"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Snapshot strip */}
        <section className="border-b border-hairline-light bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { icon: "deposit" as const, label: "Min. Deposit", value: broker.minDeposit },
                { icon: "leverage" as const, label: "Max. Leverage", value: broker.maxLeverage },
                { icon: "founded" as const, label: "Founded", value: String(broker.founded) },
                { icon: "hq" as const, label: "Headquarters", value: broker.headquarters },
                { icon: "platforms" as const, label: "Platforms", value: String(broker.platforms.length) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-hairline-light bg-paper-high p-4"
                >
                  <SnapshotIcon name={stat.icon} />
                  <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {stat.label}
                  </dt>
                  <dd className="tabular-stat mt-0.5 font-display text-base font-semibold text-text-dark">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="max-w-2xl text-lg leading-relaxed text-text-dark/90">
              {broker.summary}
            </p>

            {/* Regulation */}
            <div id="regulation" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
                <div>
                  <h2 className="font-display text-xl font-semibold text-text-dark">
                    Regulation &amp; Fund Safety
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-text-dark/90">
                    {regulationParagraph(broker)}
                  </p>

                  {tier1Regulators.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-tick-up">
                        Tier-1 Licenses
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tier1Regulators.map((r) => (
                          <span
                            key={r}
                            className="rounded-full border border-tick-up/30 bg-tick-up/10 px-3 py-1.5 font-mono text-xs text-tick-up"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {offshoreRegulators.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                        Offshore / Other Licenses
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {offshoreRegulators.map((r) => (
                          <span
                            key={r}
                            className="rounded-full border border-hairline-light px-3 py-1.5 font-mono text-xs text-text-muted"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                  <TrustIndex broker={broker} tone="light" showDescriptions wide />
                </div>
              </div>
            </div>

            {/* Platforms + categories */}
            <div id="platforms" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
              <h2 className="font-display text-xl font-semibold text-text-dark">
                Trading Platforms
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                {platformParagraph(broker)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {broker.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-signal/30 bg-signal/5 px-3 py-1.5 font-mono text-xs text-signal"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {broker.categories.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                    Categories
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {broker.categories.map((c) => (
                      <Link
                        key={c}
                        href={`/categories/${categoryInfo[c as BrokerCategory].slug}`}
                        className="rounded-full border border-hairline-light px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-text-dark hover:text-text-dark"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pros & cons */}
            <div id="pros-cons" className="mt-14 scroll-mt-8 grid gap-8 border-t border-hairline-light pt-10 sm:grid-cols-2">
              <div className="rounded-2xl border border-tick-up/20 bg-tick-up/5 p-6">
                <h2 className="font-display text-xl font-semibold text-tick-up">
                  Pros
                </h2>
                <ul className="mt-4 space-y-3">
                  {broker.pros.map((pro) => (
                    <li key={pro} className="flex gap-3 text-[15px] text-text-dark/90">
                      <span className="mt-1 text-tick-up">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-alert/20 bg-alert/5 p-6">
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

            {broker.deepDive && (
              <div id="accounts" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
                <h2 className="font-display text-2xl font-semibold text-text-dark">
                  Account Types
                </h2>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-hairline-light">
                  <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-hairline-light bg-paper font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                        <th className="py-3 pl-5 pr-4 font-medium">Account</th>
                        <th className="py-3 pr-4 font-medium">Spread</th>
                        <th className="py-3 pr-4 font-medium">Commission</th>
                        <th className="py-3 pr-5 font-medium">Min. Deposit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light">
                      {broker.deepDive.accountTypes.map((acc) => (
                        <tr key={acc.name} className="transition-colors hover:bg-paper">
                          <td className="py-3 pl-5 pr-4 font-medium text-text-dark">{acc.name}</td>
                          <td className="py-3 pr-4 text-text-dark/90">{acc.spread}</td>
                          <td className="py-3 pr-4 text-text-dark/90">{acc.commission}</td>
                          <td className="py-3 pr-5 text-text-dark/90">{acc.minDeposit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-hairline-light p-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                      Deposits
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                      {broker.deepDive.deposits}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline-light p-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                      Withdrawals
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                      {broker.deepDive.withdrawals}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline-light p-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                      Customer Support
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                      {broker.deepDive.support}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline-light p-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                      Education &amp; Tools
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                      {broker.deepDive.education}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verdict */}
            <div id="verdict" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
              <div className="rounded-2xl border border-gold/25 bg-gold/5 p-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  FXPARTNER Verdict
                </span>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                  {verdictParagraph(broker)}
                </p>
                {reviewPost && (
                  <Link
                    href={`/blog/${reviewPost.slug}`}
                    className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal"
                  >
                    Read the full {broker.name} review →
                  </Link>
                )}
              </div>
            </div>

            {/* FAQ */}
            <div id="faq" className="mt-14 scroll-mt-8 border-t border-hairline-light pt-10">
              <h2 className="font-display text-2xl font-semibold text-text-dark">
                Frequently Asked Questions
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

        {/* Comments */}
        <section id="reviews" className="scroll-mt-8 bg-paper-high">
          <div className="mx-auto max-w-5xl px-6 py-16">
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
          <div className="mx-auto max-w-5xl px-6 py-16">
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
