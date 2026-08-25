/**
 * The subjects the education generator is allowed to write about, in order.
 *
 * A fixed list rather than an open prompt, for two reasons. Left to invent
 * its own subject a model converges: ask it for "a trading education post"
 * sixty times and you get risk management eleven ways, each convinced it is
 * the first. And a site whose product is judgement cannot afford the same
 * article twice under two titles.
 *
 * The list is also a scope boundary. Every entry here is process, psychology
 * or mechanics — things that are true regardless of where price goes. None of
 * them is a market call, a forecast, or a reason to open a position, because
 * this site does not give investment advice and a generated post is the last
 * place to start.
 *
 * Order is publication order. The generator takes the earliest topic that has
 * no row in education_post, so adding to the end extends the queue and
 * nothing is ever written twice.
 */
export type EducationTopic = {
  /** Stable identifier — also the uniqueness key in education_post.topic. */
  id: string;
  /** What the post is about, in the words the prompt will use. */
  brief: string;
};

export const educationTopics: EducationTopic[] = [
  // --- psychology and discipline ---
  { id: "impulsive-trading", brief: "Dürtüsel işlem yapmak: neden olur, nasıl fark edilir, nasıl durdurulur" },
  { id: "fomo", brief: "Fırsatı kaçırma korkusu (FOMO) ve piyasa koştuktan sonra geç girme refleksi" },
  { id: "revenge-trading", brief: "Zarardan sonra 'geri alma' işlemi: kaybı kovalamanın mekaniği" },
  { id: "overconfidence-after-win", brief: "Kazanç sonrası aşırı özgüven ve pozisyon büyüklüğünün sessizce artması" },
  { id: "trading-journal", brief: "İşlem günlüğü tutmak: ne kaydedilir, hangi örüntüler ortaya çıkar" },
  { id: "screen-fatigue", brief: "Ekran yorgunluğu, işlem saatleri belirlemek ve ara vermenin karar kalitesine etkisi" },
  { id: "loss-aversion", brief: "Kayıptan kaçınma: zararı kesmemek, kârı erken almak" },
  { id: "patience-vs-boredom", brief: "Sıkıntıdan işlem açmak ile fırsat beklemek arasındaki fark" },

  // --- risk and position sizing ---
  { id: "position-sizing", brief: "Pozisyon büyüklüğü nasıl hesaplanır: risk yüzdesi, stop mesafesi, lot" },
  { id: "risk-per-trade", brief: "İşlem başına risk yüzdesi ve arka arkaya zararın hesaba etkisi" },
  { id: "leverage-explained", brief: "Kaldıraç gerçekte neyi değiştirir: teminat, pozisyon büyüklüğü ve zarar hızı" },
  { id: "margin-call", brief: "Teminat tamamlama ve zorunlu kapanış (stop out) nasıl işler" },
  { id: "drawdown", brief: "Düşüş (drawdown) nedir, yüzde kaybın telafisi neden orantısızdır" },
  { id: "correlation-risk", brief: "Korelasyon riski: farklı sanılan pozisyonların aynı bahis olması" },
  { id: "risk-reward-ratio", brief: "Risk/ödül oranı ve kazanma oranıyla birlikte nasıl okunur" },
  { id: "overnight-and-weekend-risk", brief: "Gecelik ve hafta sonu riski: boşluklu açılış (gap) ve swap" },

  // --- orders and execution mechanics ---
  { id: "stop-loss-types", brief: "Zarar durdur türleri: sabit, yapısal, takip eden (trailing)" },
  { id: "take-profit-placement", brief: "Kâr al seviyesini belirlemek ve kısmi kapanış" },
  { id: "pending-orders", brief: "Bekleyen emirler: limit ve stop emirleri ne zaman kullanılır" },
  { id: "slippage", brief: "Kayma (slippage) neden olur, hangi anlarda artar" },
  { id: "spread-behaviour", brief: "Spread nedir, veri açıklamalarında neden açılır" },
  { id: "order-execution-types", brief: "Emir gerçekleştirme modelleri: market, instant, ECN farkı" },
  { id: "requote-and-rejection", brief: "Yeniden fiyatlama ve emir reddi: sebepleri ve azaltma yolları" },

  // --- market mechanics ---
  { id: "trading-sessions", brief: "İşlem seansları: Asya, Londra, New York ve likidite farkları" },
  { id: "economic-calendar", brief: "Ekonomik takvimi okumak: hangi veri neden önemli" },
  { id: "swap-and-rollover", brief: "Swap ve gecelik taşıma maliyeti nasıl hesaplanır" },
  { id: "liquidity-and-volatility", brief: "Likidite ile oynaklık arasındaki fark ve ikisinin işleme etkisi" },
  { id: "market-orders-vs-limit", brief: "Piyasa emri ile limit emri arasında maliyet farkı" },

  // --- method and review ---
  { id: "trading-plan", brief: "İşlem planı yazmak: giriş, çıkış, risk ve geçersizlik kuralları" },
  { id: "backtesting-basics", brief: "Geriye dönük test: ne söyler, ne söylemez" },
  { id: "demo-to-live", brief: "Demo hesaptan gerçek hesaba geçiş ve değişen tek şey" },
  { id: "reviewing-losing-trades", brief: "Zararla kapanan işlemi incelemek: hata mı, olasılık mı" },
  { id: "expectancy", brief: "Beklenen değer (expectancy): kazanma oranının tek başına neden yetmediği" },
  { id: "sample-size", brief: "Örneklem büyüklüğü: on işlemle bir stratejiye karar verilemez" },

  // --- account and platform hygiene ---
  { id: "choosing-account-type", brief: "Hesap türü seçimi: spread mi komisyon mu, hangisi kime uygun" },
  { id: "withdrawal-process", brief: "Para çekme süreci, KYC ve sürelerin neye bağlı olduğu" },
  { id: "broker-entity-check", brief: "Hesabınız hangi tüzel kişiliğe bağlı: lisans ile koruma arasındaki fark" },
  { id: "platform-security", brief: "Hesap güvenliği: iki adımlı doğrulama, cihaz hijyeni, oltalama" },
  { id: "vps-and-connection", brief: "Bağlantı kopması, VPS kullanımı ve otomatik sistemlerde süreklilik" },
  { id: "reading-a-statement", brief: "Hesap ekstresini okumak: komisyon, swap, net sonuç" },
];

/** Topic lookup by id, for rendering a stored post's subject. */
export function getEducationTopic(id: string): EducationTopic | undefined {
  return educationTopics.find((t) => t.id === id);
}
