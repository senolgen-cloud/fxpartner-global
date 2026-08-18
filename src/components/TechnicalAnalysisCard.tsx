import Image from "next/image";
import type { TechnicalAnalysisPost } from "@/data/technicalAnalysis";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Falls back to the coded pivot-ladder card when an instrument has no real
// chart screenshot attached (e.g. Apple below) — every entry always has
// some image, it just isn't always the real Trading Central chart.
function codedCardImageUrl(post: TechnicalAnalysisPost) {
  const params = new URLSearchParams({
    instrument: post.instrument,
    timeframe: post.timeframe,
    pivot: post.pivot,
    bias: post.bias,
    headline: post.headline,
    resistances: post.resistances.map((r) => `${r.price}:${r.strength}`).join(","),
    supports: post.supports.map((s) => `${s.price}:${s.strength}`).join(","),
  });
  if (post.lastPrice) params.set("last", post.lastPrice);
  return `${SITE_URL}/api/og/technical-analysis?${params.toString()}`;
}

// Shared between the /teknik-analiz index (grouped by date) and each date's
// own bulletin page — same dark ink card everywhere so a card never lands
// on a bg-white island that reads illegibly next to the rest of the
// dark-themed site.
export default function TechnicalAnalysisCard({ post }: { post: TechnicalAnalysisPost }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-hairline bg-ink-soft/60 shadow-sm">
      <div className="relative aspect-square w-full max-w-md mx-auto sm:max-w-none sm:aspect-[4/3] bg-ink">
        <Image
          src={post.chartImage ?? codedCardImageUrl(post)}
          alt={post.headline}
          fill
          unoptimized
          className={post.chartImage ? "object-contain" : "object-cover"}
        />
      </div>
      <div className="p-6">
        <span className="font-mono text-xs text-text-on-ink-muted">
          {post.instrument} · {post.timeframe} · {post.source}
        </span>
        <h3 className="mt-2 font-poppins text-2xl font-semibold text-text-on-ink">{post.headline}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-text-on-ink-muted">
          <strong className="text-text-on-ink">Ana senaryo:</strong> {post.preference}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
          <strong className="text-text-on-ink">Alternatif senaryo:</strong> {post.alternative}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
          <strong className="text-text-on-ink">Yorum:</strong> {post.comment}
        </p>
        <p className="mt-4 text-xs text-text-on-ink-muted">
          Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
        </p>
      </div>
    </article>
  );
}
