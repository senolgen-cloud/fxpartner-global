import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";
import { desc } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Haber Bülteni",
  description:
    "Günün öne çıkan finans ve forex piyasası gelişmelerini özgün yorumla derleyen günlük haber bülteni.",
  alternates: { canonical: "/haber-bulteni" },
};

export const revalidate = 900;

export default async function NewsBulletinIndexPage() {
  const bulletins = await db.query.newsBulletins.findMany({
    orderBy: [desc(newsBulletins.publishedAt)],
    limit: 50,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Haber Bülteni", url: `${SITE_URL}/haber-bulteni` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Haber Bülteni
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Günün piyasa gelişmeleri, tek yerde
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Farklı kaynaklardan derlenen haberleri özgün yorumla bir araya
              getiriyoruz. Yatırım tavsiyesi değildir.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            {bulletins.length === 0 ? (
              <p className="text-text-muted">Henüz bülten yayınlanmadı.</p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {bulletins.map((b) => (
                  <Link
                    key={b.id}
                    href={`/haber-bulteni/${b.slug}`}
                    className="group flex flex-col gap-2 py-8"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(b.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h2 className="font-poppins text-2xl font-semibold text-text-dark transition-colors group-hover:text-signal">
                      {b.title}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text-muted">{b.excerpt}</p>
                    <span className="mt-1 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal">
                      Bülteni oku →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
