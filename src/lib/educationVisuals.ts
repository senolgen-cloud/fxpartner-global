/**
 * The diagrams that go with a lesson.
 *
 * The Akademi lessons are prose, and prose is the wrong shape for about a
 * dozen of the subjects on the list. "Kaybın telafisi orantılı değildir" is
 * four sentences to write and one picture to understand; the same is true of
 * where a pending order sits relative to price, and of which hours two
 * sessions share. Those are the ones that get a figure.
 *
 * Three decisions worth stating, because each one had an obvious-looking
 * alternative:
 *
 * 1. The figures are drawn in markup, not shipped as images. This site
 *    renders in four languages and one of them is right-to-left, so every
 *    label baked into a PNG would be Turkish to three quarters of the
 *    readership. Drawn in markup, the labels go through tr() like everything
 *    else, the figure inherits the theme's own colours rather than a
 *    screenshot of them, and it stays sharp on a phone.
 *
 * 2. A figure belongs to a *topic*, not to a post. A lesson's slug and body
 *    come out of the generator and can be rewritten; `topic` is the stable
 *    key that the queue in lib/educationTopics.ts is built on, so a lesson
 *    keeps its figure across a regeneration.
 *
 * 3. Several topics share one figure. The break-even table under a
 *    risk/reward ratio is the same picture whether the lesson is about the
 *    ratio, about expectancy, or about where to put a take profit — and
 *    drawing three near-identical versions of it would be three things to
 *    keep in sync for no reader's benefit.
 *
 * Everything here is mechanics: a formula, an arithmetic identity, where an
 * order type sits, what hours a session covers. Same boundary as the topic
 * list — nothing on this page is a market call, a forecast, or a reason to
 * open a position.
 */

export type EducationVisualId =
  | "position-sizing"
  | "risk-reward"
  | "drawdown-recovery"
  | "pending-orders"
  | "trading-sessions"
  | "leverage-margin";

export type EducationVisual = {
  id: EducationVisualId;
  /** Anchor on the gallery page; also what a lesson links back to. */
  slug: string;
  /** Heading over the figure. Turkish source, translated at render. */
  title: string;
  /** One sentence under the figure, saying what it is showing. */
  caption: string;
  /**
   * The figure in words, for a reader who cannot see it.
   *
   * Not a description of the drawing ("three bars of increasing length") but
   * of what the drawing says, because that is what the sighted reader takes
   * away and the only thing worth reading aloud.
   */
  alt: string;
  /** Topic ids from lib/educationTopics.ts that this figure belongs on. */
  topics: string[];
};

export const educationVisuals: EducationVisual[] = [
  {
    id: "position-sizing",
    slug: "pozisyon-buyuklugu",
    title: "Pozisyon büyüklüğü nasıl çıkar",
    caption:
      "Lot, karar verilecek bir sayı değil, üç girdinin sonucudur: ne kadar riske girdiğiniz, stop'unuzun kaç pip uzakta olduğu ve o enstrümanda bir pip'in ne ettiği.",
    alt: "Pozisyon büyüklüğü formülü: risk tutarı, stop mesafesi ile pip değerinin çarpımına bölünür ve sonuç lot olarak çıkar. Örnekte 10.000 bakiyede işlem başına %1 risk 100 birim eder; 20 pip stop ve lot başına 10 birim pip değeriyle sonuç 0,50 lottur.",
    topics: ["position-sizing", "risk-per-trade", "fixed-vs-percent-risk", "lot-sizes-explained"],
  },
  {
    id: "risk-reward",
    slug: "risk-odul-orani",
    title: "Risk/ödül oranı ve başabaş kazanma oranı",
    caption:
      "Bir oran tek başına iyi ya da kötü değildir. Söylediği tek şey, o oranda başabaş kalmak için kaç işlemin kazanması gerektiğidir — kazanma oranınız o eşiğin altındaysa oran sizi kurtarmaz.",
    alt: "Üç risk/ödül oranı yan yana: 1'e 1 oranında başabaş kalmak için işlemlerin %50'sinin, 1'e 2'de %33'ünün, 1'e 3'te %25'inin kazanması gerekir. Ödül tarafı büyüdükçe gereken kazanma oranı düşer.",
    topics: ["risk-reward-ratio", "expectancy", "take-profit-placement", "scaling-out"],
  },
  {
    id: "drawdown-recovery",
    slug: "dusus-telafisi",
    title: "Düşüşün telafisi neden orantısız",
    caption:
      "Kayıp yüzdesi küçülen bakiyeden, telafi yüzdesi ise o küçülmüş bakiyeden hesaplanır. İkisi aynı sayı değildir ve aradaki fark düşüş derinleştikçe açılır.",
    alt: "Dört kayıp seviyesi ve telafisi: %10 kayıp için %11, %20 için %25, %30 için %43, %50 kayıp için %100 kazanç gerekir. Gereken kazanç, kayıp derinleştikçe kayıptan çok daha hızlı büyür.",
    topics: ["drawdown", "risk-of-ruin", "equity-curve-reading", "max-consecutive-losses"],
  },
  {
    id: "pending-orders",
    slug: "bekleyen-emirler",
    title: "Bekleyen emirler fiyatın neresine konur",
    caption:
      "Dört emir türünün tamamı güncel fiyata göre tanımlıdır. Hangisinin nereye konacağını karıştırmak, emri istediğinizin tam tersi tarafta bekletir.",
    alt: "Güncel fiyatın üstünde buy stop ve sell limit, altında buy limit ve sell stop bulunur. Üsttekiler fiyat yukarı giderse, alttakiler fiyat aşağı giderse tetiklenir.",
    topics: ["pending-orders", "market-orders-vs-limit", "order-execution-types", "order-modification"],
  },
  {
    id: "trading-sessions",
    slug: "islem-seanslari",
    title: "Seanslar ve kesişen saatler",
    caption:
      "Üç seans günün farklı saatlerini kaplar ve ikisinin üst üste bindiği aralık günün en likit bölümüdür. Likidite yön değil, işlem koşulu anlamına gelir.",
    alt: "24 saatlik bir zaman çizelgesinde Asya seansı 03:00-12:00, Londra 10:00-19:00, New York 15:00-24:00 arasını kaplar. Londra ile New York'un kesiştiği 15:00-19:00 aralığı günün en yoğun saatleridir. Saatler Türkiye saatiyledir.",
    topics: ["trading-sessions", "liquidity-and-volatility", "spread-behaviour"],
  },
  {
    id: "leverage-margin",
    slug: "kaldirac-ve-teminat",
    title: "Kaldıraç neyi değiştirir, neyi değiştirmez",
    caption:
      "Kaldıraç pozisyonun bloke ettiği teminatı değiştirir. Aynı pozisyonun bir pip'lik hareketten kazandığı ya da kaybettiği tutarı değiştirmez.",
    alt: "100.000 birimlik aynı pozisyon için 1:30 kaldıraçta 3.333, 1:100'de 1.000, 1:500'de 200 birim teminat bloke olur. Üç satırın hepsinde 20 pip'lik hareketin karşılığı aynı tutardır; değişen tek şey bloke edilen teminattır.",
    topics: ["leverage-explained", "margin-call", "contract-size", "account-currency-effect"],
  },
];

/** The figure a lesson carries, if it has one. */
export function getVisualForTopic(topicId: string | null | undefined): EducationVisual | undefined {
  if (!topicId) return undefined;
  return educationVisuals.find((v) => v.topics.includes(topicId));
}

/** Every topic id that has a figure, for the "görsel anlatım" badge on the index. */
export function topicsWithVisual(): Set<string> {
  return new Set(educationVisuals.flatMap((v) => v.topics));
}

export function getVisualBySlug(slug: string): EducationVisual | undefined {
  return educationVisuals.find((v) => v.slug === slug);
}
