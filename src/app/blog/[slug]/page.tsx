import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import { blogPosts, getBlogPostBySlug } from "@/data/blog";
import { getSponsoredBroker } from "@/data/brokers";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  const featuredBroker = getSponsoredBroker(post.slug);

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
              { name: "Home", url: SITE_URL },
              { name: "Blog", url: `${SITE_URL}/blog` },
              { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← All guides
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {post.readingMinutes} min read
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
          <article className="mx-auto max-w-3xl px-6 py-16">
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
              <div key={i} className={i > 0 ? "mt-10" : ""}>
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

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-lg font-semibold text-text-dark">
                Ready to compare brokers?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                See how real brokers score on regulation, cost, platform, and
                withdrawals using the exact framework above.
              </p>
              <Link
                href="/#brokers"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                View Broker Rankings
              </Link>
            </div>

            <div className="mt-10">
              <ShareButtons title={post.title} text={post.excerpt} locale="en" />
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
