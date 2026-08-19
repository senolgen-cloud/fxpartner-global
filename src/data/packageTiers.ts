import type { AccessTier, PackageTier } from "@/lib/vip";

// Single source of truth for what each tier includes — used by the pricing
// page itself and by /account (to show a member exactly what their current
// package unlocks, and what upgrading adds). Keeping this in one place
// means the two pages can't silently drift out of sync the way
// /ai-asistan's "free, no signup" FAQ once drifted from reality.

// The free tier is not in PACKAGE_TIER_INFO because it cannot be bought —
// it has no price and no checkout button.
//
// Careful with this list: FX signals and their levels are PUBLIC, not
// account-gated (see lib/signalAccess.ts — a signed-out guest sees them in
// full, and they also go out openly on Telegram/X). Listing them as things
// registration unlocks would be a straight-up false claim on a pricing
// page. What an account actually adds is flagged inline.
export const FREE_TIER_INFO: {
  name: string;
  blurb: string;
  features: string[];
} = {
  name: "Ücretsiz",
  blurb: "Forex sinyalleri herkese açık — üyelik gerekmez. Hesap, bildirim ve cashback ekler.",
  features: [
    "Forex Sinyalleri (EURUSD, GBPUSD, USDJPY…)",
    "Entry / Stop Loss / Take Profit",
    "Tüm Kapanmış İşlem Geçmişi",
    "Broker Karşılaştırmaları",
    "Anlık Push Bildirimleri — üyelikle",
    "Cashback Hesap Bağlama — üyelikle",
  ],
};

export const PACKAGE_TIER_INFO: Record<
  PackageTier,
  { name: string; price: number; blurb: string; features: string[] }
> = {
  pro: {
    name: "Pro",
    price: 59,
    blurb: "Sinyal hacminin büyük kısmı burada: GOLD, gümüş ve endeksler.",
    features: [
      "Ücretsiz katmandaki tüm özellikler",
      "GOLD / XAUUSD Sinyalleri",
      "Gümüş / XAGUSD Sinyalleri",
      "Endeks Sinyalleri (US100, US30, GER40…)",
      "Günlük Teknik Analiz",
      "Haftalık Piyasa Görünümü",
      "Ekonomik Takvim Değerlendirmeleri",
      "AI Piyasa Asistanı",
      "Gelişmiş Risk Yönetimi",
      "İşlem Yönetimi Rehberliği",
      "Telegram VIP Kanal Erişimi",
      "MT5 & Broker Kurulum Desteği",
      "Öncelikli Destek",
    ],
  },
  vip: {
    name: "VIP",
    price: 99,
    blurb: "FXPARTNER'ın en kapsamlı profesyonel deneyimi.",
    features: [
      "Pro paketindeki tüm özellikler",
      "Kripto Sinyalleri (BTCUSD, ETHUSD)",
      "Enerji Sinyalleri (OIL, BRENT)",
      "FXPARTNER CopyTrade Erişimi",
      "Premium İşlem Stratejileri",
      "Özel VIP Analizler",
      "Profesyonel Risk Yönetimi",
      "Özel İşlem Yönetimi Desteği",
      "VIP Piyasa Değerlendirmeleri",
      "Öncelikli VIP Destek",
      "VIP Eğitim İçerikleri",
      "Yeni Sistemlere Erken Erişim",
      "Birebir MT5 & Teknik Destek",
    ],
  },
};

export const PACKAGE_TIER_ORDER: PackageTier[] = ["pro", "vip"];

// Display name for any access level, including the unbuyable free one.
export const ACCESS_TIER_LABEL: Record<AccessTier, string> = {
  free: "Ücretsiz",
  pro: "Pro",
  vip: "VIP",
};
