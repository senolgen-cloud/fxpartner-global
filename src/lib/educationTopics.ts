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

  // --- more psychology, added when the first batch was ten days from
  //     running out. Same boundary as everything above: nothing here is a
  //     market view, a forecast, or a reason to open a position. ---
  { id: "confirmation-bias", brief: "Doğrulama yanlılığı: kararınızı destekleyen veriyi arayıp aksini görmezden gelmek" },
  { id: "anchoring-to-entry", brief: "Giriş fiyatına demirlemek: pozisyonu fiyat değil, maliyet üzerinden değerlendirmek" },
  { id: "recency-bias", brief: "Son birkaç işlemin bütün stratejiye dair yargıyı gölgelemesi" },
  { id: "comparing-with-others", brief: "Başkasının sonuçlarıyla kıyaslamanın kendi risk kurallarınıza etkisi" },
  { id: "overtrading-frequency", brief: "İşlem sıklığı: çok işlem açmanın maliyet ve karar kalitesi üzerindeki etkisi" },
  { id: "news-reaction-reflex", brief: "Haber sonrası ilk harekete tepki verme refleksi ve veri anındaki koşullar" },
  { id: "following-a-signal", brief: "Herhangi bir sinyal kaynağını takip ederken kendi risk kurallarınızı korumak" },
  { id: "missed-trade-regret", brief: "Kaçırılan işlem pişmanlığı ve bunun bir sonraki karara taşınması" },

  // --- risk, continued ---
  { id: "adding-to-a-loser", brief: "Zarardaki pozisyona eklemek: ortalama düşürmenin mekaniği ve risk üzerindeki etkisi" },
  { id: "portfolio-heat", brief: "Aynı anda açık toplam risk: tek tek küçük, toplamda büyük pozisyonlar" },
  { id: "risk-of-ruin", brief: "Hesabı tüketme riski kavramı: risk yüzdesi ile arka arkaya zarar arasındaki ilişki" },
  { id: "fixed-vs-percent-risk", brief: "Sabit tutarla risk almak ile bakiyenin yüzdesiyle risk almak arasındaki fark" },
  { id: "account-currency-effect", brief: "Hesap para biriminin kâr/zarar ve teminat hesabına etkisi" },
  { id: "scaling-out", brief: "Pozisyonu kademeli kapatmanın mekaniği: kalan hacim, stop ve risk nasıl değişir" },

  // --- orders and execution, continued ---
  { id: "lot-sizes-explained", brief: "Standart, mini ve mikro lot: hacim birimlerinin gerçekte ne ifade ettiği" },
  { id: "pip-and-point", brief: "Pip ve puan farkı, sembole göre değişen ondalık hane sayısı" },
  { id: "contract-size", brief: "Sözleşme büyüklüğü: aynı lotun farklı enstrümanlarda neden farklı risk taşıdığı" },
  { id: "trailing-stop-mechanics", brief: "İz süren stop nasıl çalışır, hangi koşullarda tetiklenir ve sınırları nelerdir" },
  { id: "break-even-stop", brief: "Stop'u başabaşa çekmenin mekaniği ve pozisyonun risk profiline etkisi" },
  { id: "order-modification", brief: "Açık pozisyonda seviye değiştirmek: nasıl işler, nelere dikkat edilir" },
  { id: "gap-openings", brief: "Hafta başı ve haber sonrası fiyat boşlukları: emirlerin nasıl etkilendiği" },
  { id: "symbol-specifications", brief: "Sembol özellikleri penceresi nasıl okunur: teminat, adım, minimum hacim" },

  // --- instrument mechanics (mechanics only, never a view on the market) ---
  { id: "metals-mechanics", brief: "Metal sembollerinin işleyiş farkları: sözleşme büyüklüğü, seans, teminat" },
  { id: "indices-cfd-mechanics", brief: "Endeks CFD'lerinin mekaniği: dayanak, seans saatleri ve fiyatlama" },
  { id: "crypto-cfd-mechanics", brief: "Kripto CFD'lerinde 7/24 işleyiş, hafta sonu ve teminat farkları" },
  { id: "volume-on-cfds", brief: "CFD platformlarında görünen hacmin ne olduğu ve neden brokera özgü olduğu" },

  // --- statistics and review, continued ---
  { id: "max-consecutive-losses", brief: "Arka arkaya en fazla kaç zarar: bir stratejiyi değerlendirirken bakılan ölçü" },
  { id: "equity-curve-reading", brief: "Bakiye eğrisi nasıl okunur: eğim, düşüş dönemleri ve toparlanma" },
  { id: "benchmarking-your-results", brief: "Kendi sonuçlarınızı neye göre ölçmek: dönem, örneklem ve karşılaştırma sorunu" },
  { id: "strategy-change-discipline", brief: "Stratejiyi ne zaman değiştirmeli: birkaç zarardan sonra mı, veriye bakarak mı" },

  // --- account, safety and paperwork ---
  { id: "kyc-process", brief: "Kimlik doğrulama (KYC) süreci: hangi belgeler istenir, neden istenir" },
  { id: "two-factor-authentication", brief: "İki adımlı doğrulama ve işlem hesabı için hesap güvenliği alışkanlıkları" },
  { id: "scam-red-flags", brief: "Dolandırıcılık işaretleri: garanti getiri vaadi, baskı, doğrulanamayan kimlik" },
  { id: "record-keeping", brief: "İşlem kayıtlarını saklamak: ekstre, dekont ve neden birikmesi gerektiği" },
  { id: "support-escalation", brief: "Broker desteğine sorun bildirmek: ne yazılır, hangi kayıtlar eklenir" },
  { id: "chart-timeframes", brief: "Zaman dilimlerinin mekaniği: aynı verinin farklı periyotlarda nasıl göründüğü" },
  { id: "indicator-lag", brief: "Göstergelerde gecikme kavramı: hesaplama geçmiş veriye dayandığında ne olur" }
];

/** Topic lookup by id, for rendering a stored post's subject. */
export function getEducationTopic(id: string): EducationTopic | undefined {
  return educationTopics.find((t) => t.id === id);
}
