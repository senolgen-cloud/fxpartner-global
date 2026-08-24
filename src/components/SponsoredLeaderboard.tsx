import Image from "next/image";
import { tr } from "@/lib/chrome";
import { getBrokerBySlug } from "@/data/brokers";

// A broker's own 600x90 creative, carried on our affiliate link rather than
// the one the creative shipped with.
//
// That swap is the entire point. These banners arrive from the affiliate
// network as an <iframe> or an <a> wrapped around clicks.pipaffiliates.com,
// and a click through that URL is not guaranteed to land on our account — a
// signup we sourced could be attributed elsewhere or nowhere. The artwork is
// the broker's to lend us; the destination is ours to control. So the image
// is self-hosted and the href comes from src/data/brokers.ts, the same link
// every broker card on the site already uses.
//
// Self-hosted also means one fewer third-party request: an ad network's
// image tag on every page is a beacon that sees each reader, and it is not a
// beacon anybody here has a reason to grant.
//
// The unit is labelled "Sponsorlu" and carries rel="sponsored", the same
// disclosure convention XmInlineAd uses.
export default function SponsoredLeaderboard({
  brokerSlug,
  image,
  alt,
  width = 600,
  height = 90,
  className = "",
}: {
  brokerSlug: string;
  image: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const broker = getBrokerBySlug(brokerSlug);
  if (!broker) return null;

  return (
    <aside aria-label={tr("Sponsorlu içerik")} className={className}>
      <div className="mb-2 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-on-ink-muted">
          {tr("Sponsorlu")}
        </span>
      </div>
      <a
        href={broker.referralUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mx-auto block w-full max-w-[600px] overflow-hidden rounded-xl border border-hairline transition-colors hover:border-signal"
      >
        <Image
          src={image}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 640px) 600px, 100vw"
          className="h-auto w-full"
        />
      </a>
    </aside>
  );
}
