import type { Metadata } from "next";
import { tr, trLocale } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { localizeBlogPost, localizeBlogPosts, localizeBrokers } from "@/lib/localizeContent";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Every post in src/data/blog.ts is Turkish and carries lang: "tr", so the
// section's own chrome (heading, dates, link labels) is Turkish too and
// <main> declares it. Leaving English chrome around Turkish articles was
// both a reading-experience mismatch and a wrong language signal to
// crawlers — the same reason each post sets lang individually.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.blog.title"],
    description: t["page.blog.description"],
    alternates: {
      canonical: localePath(locale, "/blog"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/blog")])
      ),
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Blog", url: `${SITE_URL}/blog` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Blog")}
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Broker seçiminde güvenle ilerlemeniz için rehberler")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Pazarlama metni değil; pratik, kendiniz doğrulayabileceğiniz kriterler.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {localizeBlogPosts(blogPosts, locale).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-4 py-5 sm:gap-6 sm:py-7"
                >
                  {post.coverImage && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-hairline-light sm:h-28 sm:w-28 sm:rounded-xl">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(min-width: 640px) 112px, 64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(post.publishedAt).toLocaleDateString(trLocale(), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {post.readingMinutes} dk okuma
                    </span>
                    <h2 className="mt-1.5 font-poppins text-lg font-semibold leading-snug text-text-dark transition-colors group-hover:text-signal sm:text-2xl">
                      {post.title}
                    </h2>
                    {/* Two lines. A list is for choosing what to read, not
                        for reading, and six lines of excerpt per row is the
                        difference between scanning thirty-one posts and
                        scrolling past them. The full excerpt opens with the
                        post. */}
                    <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-text-muted sm:line-clamp-3 sm:text-[15px]">
                      {post.excerpt}
                    </p>
                  </div>
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
