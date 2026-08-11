import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SignalsBoard from "@/components/SignalsBoard";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import VipCtaBanner from "@/components/VipCtaBanner";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { getSponsoredBroker } from "@/data/brokers";
import { desc, eq } from "drizzle-orm";

const featuredBroker = getSponsoredBroker("signals");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/signals-preview.png`;
const TITLE = "Live Trading Signals | FXPARTNER";
const DESCRIPTION =
  "Real trade signals from our tracked MT5 account — entry, take profit, and stop loss for open trades, plus verified win/loss results once each trade closes.";

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
      </main>
      <Footer />
    </>
  );
}
