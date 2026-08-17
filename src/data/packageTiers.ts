import type { PackageTier } from "@/lib/vip";

// Single source of truth for what each /paketler tier includes — used by
// the pricing page itself and by /account (to show a member exactly what
// their current package unlocks, and what upgrading adds). Keeping this
// in one place means the two pages can't silently drift out of sync the
// way /ai-asistan's "free, no signup" FAQ once drifted from reality.
export const PACKAGE_TIER_INFO: Record<
  PackageTier,
  { name: string; price: number; blurb: string; features: string[] }
> = {
  starter: {
    name: "Starter",
    price: 29,
    blurb: "Forex'e güçlü bir başlangıç yapmak isteyenler için.",
    features: [
      "Forex Sinyalleri",
      "Entry / Stop Loss / Take Profit",
      "İşlem Açılış & Kapanış Bildirimleri",
      "İşlem Güncellemeleri",
      "Telegram VIP Kanal Erişimi",
      "Temel Risk Yönetimi",
    ],
  },
  pro: {
    name: "Pro",
    price: 59,
    blurb: "Daha fazla piyasa, daha fazla analiz ve daha profesyonel yaklaşım.",
    features: [
      "Starter paketindeki tüm özellikler",
      "GOLD / XAUUSD Sinyalleri",
      "Endeks Sinyalleri",
      "Günlük Teknik Analiz",
      "Haftalık Piyasa Görünümü",
      "Ekonomik Takvim Değerlendirmeleri",
      "AI Piyasa Asistanı",
      "Gelişmiş Risk Yönetimi",
      "İşlem Yönetimi Rehberliği",
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

export const PACKAGE_TIER_ORDER: PackageTier[] = ["starter", "pro", "vip"];
