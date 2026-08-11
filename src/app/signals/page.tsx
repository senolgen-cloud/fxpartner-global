import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SignalsBoard from "@/components/SignalsBoard";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import VipCtaBanner from "@/components/VipCtaBanner";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { getSponsoredBroker } from "@/data/brokers";
import { desc, eq } from "drizzle-orm";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const featuredBroker = getSponsoredBroker("signals");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/signals-preview.png`;
const TITLE = "Live Trading Signals | FXPARTNER";
const DESCRIPTION =
  "Real trade signals from our tracked MT5 account — entry, take profit, and stop loss for open trades, plus verified win/loss results once each trade closes.";

const faqs = [
  {
    q: "Are these real trades?",
    a: "Yes. Every signal reflects a real position opened on FXPARTNER's own tracked MT5 account — entry, stop loss, and take profit levels are captured automatically the moment the trade is opened, and never edited afterward.",
  },
  {
    q: "Is this investment advice?",
    a: "No. These signals are shared for informational purposes only. Past results don't guarantee future ones — always size positions and set stops according to your own risk tolerance, not based on a single signal alone.",
  },
  {
    q: "How do I see the results of closed signals?",
    a: "Every signal on this page moves to a closed section once the trade exits, showing the verified win/loss outcome — nothing is removed or cherry-picked after the fact.",
  },
];

export const metadata: Metadata = {
  title: "Live Trading Signals",
  description: DESCRIPTION,
  alternates: { canonical: "/signals" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/signals`,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1448, height: 1086 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// Client-side polling (SignalsBoard) keeps the page fresh after load, but
// the initial server render still needs to be a live DB read every request
// rather than a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const [active, closed] = await Promise.all([
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
      limit: 30,
    }),
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "closed"),
      orderBy: desc(tradeSignals.closedAt),
      limit: 30,
    }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Live Trading Signals", url: `${SITE_URL}/signals` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <main className="flex-1 bg-ink text-text-on-ink">
        <SignalsBoard initialActive={active} initialClosed={closed} />

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <VipCtaBanner variant="dark" />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <BrokerAdBanner broker={featuredBroker} />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="font-mono text-xs leading-relaxed text-text-on-ink-muted">
              These are real trades taken on FXPARTNER&apos;s own tracked MT5 account, shared for informational
              purposes only — not investment advice. Past results don&apos;t guarantee future ones; always size
              positions and set stops according to your own risk tolerance.
            </p>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="font-display text-2xl font-semibold text-text-on-ink">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 divide-y divide-hairline border-t border-hairline">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-on-ink">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-on-ink-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-on-ink-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
