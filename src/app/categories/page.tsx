import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brokerCategories, categoryInfo, brokers } from "@/data/brokers";

export const metadata: Metadata = {
  title: "Broker Categories",
  description:
    "Beginners, low spread, high leverage, and more — explore forex brokers by category, based on what you need.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Categories
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Find a broker that fits what you need
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Each category groups brokers around a single standout trait.
              Start your comparison here.
            </p>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brokerCategories.map((category) => {
                const info = categoryInfo[category];
                const count = brokers.filter((b) =>
                  b.categories.includes(category)
                ).length;
                return (
                  <Link
                    key={category}
                    href={`/categories/${info.slug}`}
                    className="group flex flex-col rounded-2xl border border-hairline-light p-6 transition-colors hover:border-text-dark"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-display text-xl font-semibold text-text-dark">
                        {category}
                      </h2>
                      <span className="tabular-stat shrink-0 font-mono text-xs text-text-muted">
                        {count} brokers
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                      {info.description}
                    </p>
                    <span className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors group-hover:text-signal-strong">
                      View →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
