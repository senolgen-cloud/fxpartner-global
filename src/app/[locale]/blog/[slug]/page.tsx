import type { Metadata } from "next";
import { tr, trLocale } from "@/lib/chrome";
import { localizeBlogPost, localizeBlogPosts, localizeBrokers } from "@/lib/localizeContent";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import BrokerSkyscraperAd from "@/components/BrokerSkyscraperAd";
import XmInlineAd from "@/components/XmInlineAd";
import TopBrokersStrip from "@/components/TopBrokersStrip";
import { blogPosts, getBlogPostBySlug } from "@/data/blog";
import { getBrokerBySlug, getSponsoredBroker, getSkyscraperBroker } from "@/data/brokers";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Which section boundaries get an inline XM ad slot. Positions are derived
// from the section count rather than hard-coded so a 6-section post and a
// 12-section post both end up with ad breaks at roughly the same reading
// depth (~1/3 and ~2/3 of the way down) instead of the short one being
// front-loaded. Short posts get one break; very short ones get none, since
// the banner above the first section and the final slot already cover them.
function inlineAdPositions(sectionCount: number): Set<number> {
  if (sectionCount < 4) return new Set();
  if (sectionCount < 7) return new Set([Math.round(sectionCount / 2)]);
  return new Set([Math.round(sectionCount / 3), Math.round((sectionCount * 2) / 3)]);
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const source = getBlogPostBySlug(slug);
  const post = source ? localizeBlogPost(source, locale) : source;
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: `${SITE_URL}${post.coverImage}` }] : undefined,
    },
    twitter: post.coverImage
      ? { card: "summary_large_image", images: [`${SITE_URL}${post.coverImage}`] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const { slug, locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const source = getBlogPostBySlug(slug);
  if (!source) notFound();
  const post = localizeBlogPost(source, locale);
  // A post that argues for one broker pins its own ad slot (adBrokerSlug);
  // everything else keeps the hashed rotation across the sponsor pool.
  const featuredBroker =
    (post.adBrokerSlug ? getBrokerBySlug(post.adBrokerSlug) : undefined) ??
    getSponsoredBroker(post.slug);
  const adPositions = inlineAdPositions(post.sections.length);
  // Right rail, wide screens only, and only when there is a skyscraper to
  // put in it — otherwise the column is dropped entirely rather than left
  // empty. adBrokerSlug is passed raw, not defaulted to featuredBroker:
  // a post that pins a broker is that broker's page and the rail follows
  // it, while a post that pins nobody keeps the rotation. Defaulting here
  // would make a rotated sponsor look pinned. See getSkyscraperBroker.
  const railBroker = getSkyscraperBroker(post.slug, post.adBrokerSlug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Blog", url: `${SITE_URL}/blog` },
              { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
            ])
          ),
        }}
      />
      <main lang={post.lang ?? "en"} className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              {tr("← Tüm rehberler")}
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {new Date(post.publishedAt).toLocaleDateString(trLocale(), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {post.readingMinutes} dk okuma
            </p>
            <h1 className="mt-3 font-poppins text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {post.excerpt}
            </p>
          </div>
        </section>

        <section>
          {/* The article keeps its own max-w-3xl and centring; the rail is a
              sibling that only exists at xl, so nothing about the reading
              column changes on any narrower screen. justify-center keeps the
              pair centred as a unit once the rail appears. */}
          <div className="mx-auto flex max-w-[68rem] justify-center gap-8">
            <article className="w-full max-w-3xl px-6 py-16">
              {post.coverImage && (
                <div className="relative mb-12 aspect-square w-full overflow-hidden rounded-2xl border border-hairline-light">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="mb-12">
                <BrokerAdBanner broker={featuredBroker} />
              </div>
              {post.sections.map((section, i) => (
                <div key={i} className={i > 0 && !adPositions.has(i) ? "mt-10" : ""}>
                  {adPositions.has(i) && <XmInlineAd brokerSlug={post.adBrokerSlug} />}
                  {section.heading && (
                    <h2 className="font-poppins text-2xl font-semibold text-text-dark">
                      {section.heading}
                    </h2>
                  )}
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className={`text-[16px] leading-relaxed text-text-dark/90 ${
                        section.heading || j > 0 ? "mt-4" : ""
                      }`}
                    >
                      {p}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="mt-4 space-y-2">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-3 text-[16px] text-text-dark/90">
                          <span className="mt-1 text-signal">–</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <XmInlineAd variant="final" brokerSlug={post.adBrokerSlug} />

              {/* The top-five strip replaces the card that used to sit here
                  inviting the reader to go and look at broker rankings. It
                  is the same invitation with the brokers actually in it, and
                  it deliberately does not add a block: a post already
                  carries a banner at the top, an inline unit mid-body and a
                  final one, and a sixth promotional slot would be the point
                  where the article is mostly advertising. */}
              <div className="mt-14">
                <TopBrokersStrip />
              </div>
            </article>
            {railBroker && <BrokerSkyscraperAd broker={railBroker} />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
