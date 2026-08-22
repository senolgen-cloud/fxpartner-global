import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Every post in src/data/blog.ts is Turkish and carries lang: "tr", so the
// section's own chrome (heading, dates, link labels) is Turkish too and
// <main> declares it. Leaving English chrome around Turkish articles was
// both a reading-experience mismatch and a wrong language signal to
// crawlers — the same reason each post sets lang individually.
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Forex brokerı seçimi, regülasyonun okunması ve işlem maliyetlerinin hesaplanması üzerine rehberler ve açıklayıcı yazılar.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
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
              Blog
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Broker seçiminde güvenle ilerlemeniz için rehberler
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Pazarlama metni değil; pratik, kendiniz doğrulayabileceğiniz kriterler.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-6 py-8"
                >
                  {post.coverImage && (
                    <div className="relative hidden h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-hairline-light sm:block">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {post.readingMinutes} dk okuma
                    </span>
                    <h2 className="mt-2 font-poppins text-2xl font-semibold text-text-dark transition-colors group-hover:text-signal">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                      {post.excerpt}
                    </p>
                    <span className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal">
                      Rehberi oku →
                    </span>
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
