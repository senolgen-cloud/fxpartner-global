// Copy and destinations for the sponsored slots rendered *inside* blog post
// bodies (see src/components/XmInlineAd.tsx).
//
// The links here are deliberately separate from the `referralUrl` values in
// src/data/brokers.ts: those are attached to the broker cards and review
// pages, so keeping the in-article slots on their own tracking links lets
// content-driven signups be attributed separately from directory-driven ones.
// Change one string here to re-point every in-article slot for that broker.

// XM affiliate destination used by the in-article ad slots on /blog/[slug].
export const XM_AFFILIATE_URL = "https://affs.click/hbk5p";

// Short, checkable claims only — each one is sourced from the XM entry in
// src/data/brokers.ts. Anything that changes there should change here too.
export const XM_AD_POINTS = [
  "ASIC, CySEC ve DFSA dahil dört lisans",
  "5 dolardan başlayan minimum yatırım",
  "Yatırma ve çekmede broker ücreti yok",
  "MT4, MT5 ve XM App desteği",
] as const;

export interface InlineAdCopy {
  /** Tracking link for in-article slots; separate from the broker's referralUrl. */
  affiliateUrl: string;
  /** One line under the broker name in the compact between-sections slot. */
  pitch: string;
  /** Paragraph in the full-width slot after the last section. */
  finalPitch: string;
  /** Short, checkable claims — each sourced from the broker's entry in brokers.ts. */
  points: readonly string[];
  ctaLabel: string;
}

// Keyed by broker slug, matching src/data/brokers.ts. A post pins its slot
// via `adBrokerSlug` (src/data/blog.ts); anything without an entry here falls
// back to XM, which is the standing advertiser for these slots.
export const INLINE_AD_COPY: Record<string, InlineAdCopy> = {
  xm: {
    affiliateUrl: XM_AFFILIATE_URL,
    pitch:
      "FXPARTNER ortak kodu ile açılan hesaplar nakit iadesi ve VIP ayrıcalıklara erişir.",
    finalPitch:
      "Bu yazıdaki maliyet, marjin ve platform hesaplarını kendi hesabınızda denemek isterseniz — XM demo hesabı ücretsizdir ve gerçek para yatırmadan platformu test etmenizi sağlar.",
    points: XM_AD_POINTS,
    ctaLabel: "XM - Resmi Sitesi →",
  },
  "lite-finance": {
    // No dedicated in-article tracking link exists for Lite Finance yet, so
    // this reuses the directory link. Swap it for a separate one when there
    // is one, or content-driven signups stay indistinguishable from
    // directory-driven ones in the partner panel.
    affiliateUrl: "https://litefinance-tr.org/?uid=667827970",
    pitch:
      "FXPARTNER üzerinden açılan hesaplara %20 koşulsuz teminat bonusu tanımlanır.",
    finalPitch:
      "Bu yazıdaki maliyet ve teminat hesaplarını kendi hesabınızda denemek isterseniz — Lite Finance'te cent hesap 10 dolardan başlar, yani gerçek piyasa koşullarında ama 100 kat küçük risk ölçeğinde test edebilirsiniz.",
    points: [
      "Cent hesapta 10, ECN hesapta 50 dolardan başlama",
      "ECN'de 0.0 pipten spread, lot başına 0,25 dolardan komisyon",
      "Doğrulanmış hesapta anlık para çekme",
      "MT4, MT5, cTrader ve WebTerminal desteği",
    ],
    ctaLabel: "Lite Finance - Resmi Sitesi →",
  },
};

export const DEFAULT_INLINE_AD_SLUG = "xm";

export function getInlineAdCopy(slug?: string): { slug: string; copy: InlineAdCopy } {
  const key = slug && INLINE_AD_COPY[slug] ? slug : DEFAULT_INLINE_AD_SLUG;
  return { slug: key, copy: INLINE_AD_COPY[key] };
}
