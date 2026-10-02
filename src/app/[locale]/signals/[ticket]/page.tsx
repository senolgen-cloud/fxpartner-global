import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import Footer from "@/components/Footer";
import Link from "@/components/LocaleLink";
import JoinSteps from "@/components/JoinSteps";
import VipCtaBanner from "@/components/VipCtaBanner";
import SignalDetail from "@/components/SignalDetail";
import SignalStatsStrip from "@/components/SignalStatsStrip";
import { getRecentSignalStats } from "@/lib/trackRecord";
import { db } from "@/db";
import { tradeSignals, vipSubscriptions } from "@/db/schema";
import type { SignalJson } from "@/lib/cachedReads";
import { optionalSession } from "@/lib/optionalSession";
import { type AccessTier } from "@/lib/vip";
import { maskLockedActiveSignal, requiredTierForPair } from "@/lib/signalAccess";
import { SIGNALS_EPOCH } from "@/lib/signalPeriods";
import { isTicket, signalPath } from "@/lib/signalLink";
import { tr, trf } from "@/lib/chrome";
import { defaultLocale, isLocale, localePath, type Locale } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";

// One trade, on its own page: /signals/<MT5 ticket>. This is where every
// Telegram post about the trade points — the opening call and the result
// both link here — so the page has one job: show that trade, and give a
// reader who arrived from the group a reason to stay on the site.
//
// Live on every request, like /signals: the page someone opens a minute
// after the call has to show the trade as it is now, closed or not.
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

// Metadata and the page both need the row; cache() makes that one query.
const loadSignal = cache(async (ticket: string) => {
  const row = await db.query.tradeSignals.findFirst({
    where: eq(tradeSignals.ticket, ticket),
  });
  // Trades from before the record's reset date are not on the board and
  // not in the published win rate; they do not get a page either.
  if (!row || row.createdAt < SIGNALS_EPOCH) return null;
  return row;
});

function prettyPair(pair: string): string {
  return /^[A-Z]{6}$/.test(pair) ? `${pair.slice(0, 3)}/${pair.slice(3)}` : pair;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; ticket: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, ticket } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  if (!isTicket(ticket)) return {};
  const row = await loadSignal(ticket).catch(() => null);
  if (!row) return {};
  setServerLocale(locale);

  const name = `${row.pair}${row.direction ? ` ${row.direction}` : ""}`;
  const closed = row.status === "closed";

  // The share image never carries levels for an open trade: a link preview
  // is public, and the entry, stop and target of a paid instrument are what
  // the package sells. Once closed, the result is public like the rest of
  // the record — the same rule the board follows.
  const og = new URLSearchParams({ pair: row.pair });
  if (row.direction) og.set("direction", row.direction);
  let image = `${SITE_URL}/api/og/trade-signal?${og.toString()}`;
  if (closed && row.closePrice) {
    og.set("entry", row.entry);
    og.set("close", row.closePrice);
    if (row.profit) og.set("profit", row.profit);
    if (row.outcome) og.set("outcome", row.outcome);
    image = `${SITE_URL}/api/og/trade-result?${og.toString()}`;
  }

  const title = `${name} · ${trf("İşlem #{no}", { no: ticket })} | FXPARTNER`;
  const description = closed
    ? trf("{name} işlemi kapandı. Giriş, kapanış ve gerçekleşen sonuç, takip edilen FXPARTNER MT5 hesabından.", { name })
    : trf("{name} işlemi açık. Seviyeleri ve canlı fiyatı FXPARTNER'da takip et.", { name });

  return {
    title,
    description,
    // One page per trade adds up to thousands of near-identical pages, and
    // the board at /signals is the page worth ranking. These exist to be
    // linked to, not found — so crawlers follow them but do not index them.
    robots: { index: false, follow: true },
    alternates: { canonical: localePath(locale, signalPath(ticket)) },
    openGraph: { url: `${SITE_URL}${localePath(locale, signalPath(ticket))}`, type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ locale: string; ticket: string }>;
}) {
  const { locale: pageLocale, ticket } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);
  if (!isTicket(ticket)) notFound();

  const session = await optionalSession();
  const [row, subscriptionRow] = await Promise.all([
    loadSignal(ticket),
    // Same rule as /signals: a failed subscription read masks as free.
    // Failing open would hand a paid signal's levels to everybody.
    session?.user?.id
      ? db.query.vipSubscriptions
          .findFirst({
            where: and(
              eq(vipSubscriptions.userId, session.user.id),
              eq(vipSubscriptions.status, "active")
            ),
          })
          .catch((err) => {
            console.error("signal page: subscription unavailable, masking as free —", err);
            return null;
          })
      : Promise.resolve(null),
  ]);
  if (!row) notFound();

  // The record of this trade's own tier — the same line its Telegram post
  // carried. Optional: a failed count loses the strip, never the page.
  const stats = await getRecentSignalStats(requiredTierForPair(row.pair)).catch((err) => {
    console.error("signal page: stats unavailable —", err);
    return null;
  });

  const viewerTier: AccessTier | null = session?.user?.id
    ? ((subscriptionRow?.tier as AccessTier | null) ?? "free")
    : null;

  // Real masking, as on the board: a locked trade's levels never leave the
  // server, whatever the card then draws.
  const masked = maskLockedActiveSignal(row, viewerTier);
  const signal: SignalJson = {
    ...masked,
    createdAt: masked.createdAt.toISOString(),
    closedAt: masked.closedAt ? masked.closedAt.toISOString() : null,
  };
  const closed = row.status === "closed";

  return (
    <>
      <main className="flex-1 bg-ink text-text-on-ink">
        <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 md:pt-14">
          <Link
            href="/signals"
            className="inline-flex items-center gap-1.5 text-sm text-text-on-ink-muted transition-colors hover:text-signal"
          >
            <span aria-hidden="true">←</span>
            {tr("Tüm sinyaller")}
          </Link>

          <div className="mt-6 flex flex-col gap-2">
            <span className="notranslate font-mono text-xs uppercase tracking-[0.2em] text-signal">
              {trf("İşlem #{no}", { no: ticket })}
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              <span className="notranslate">{prettyPair(row.pair)}</span>
              {row.direction ? ` ${row.direction}` : ""}
              <span className="text-text-on-ink-muted">
                {" · "}
                {closed ? tr("Kapandı") : tr("Açık işlem")}
              </span>
            </h1>
          </div>

          {stats && (
            <div className="mt-6">
              <SignalStatsStrip stats={stats} />
            </div>
          )}

          <div className="mt-4">
            <SignalDetail signal={signal} viewerTier={viewerTier} />
          </div>

          <p className="mt-4 text-center text-[13px] leading-relaxed text-text-on-ink-muted">
            {tr("Bu işlem, takip edilen FXPARTNER MT5 hesabında açıldı ve siteye otomatik olarak kaydedildi. İşlem numarası, hesaptaki pozisyon numarasının aynısıdır. Yatırım tavsiyesi değildir.")}
          </p>

          {/* The reason a Telegram reader is here at all: the rest of the
              board is one tap away. */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-strong"
            >
              {tr("Tüm canlı sinyalleri gör")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <JoinSteps packagesHref="/paketler" />
        </div>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <VipCtaBanner variant="dark" />
          </div>
        </section>
      </main>
      <Footer showSignalsPromo={false} />
    </>
  );
}
