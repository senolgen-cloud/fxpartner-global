export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  coverImage?: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-a-forex-broker",
    title: "How to Choose a Forex Broker in 2026: A Complete Guide",
    excerpt:
      "Regulation, cost structure, platform quality, and withdrawal reliability — a practical, step-by-step framework for evaluating any forex broker before you deposit a dollar.",
    publishedAt: "2026-07-21",
    readingMinutes: 11,
    sections: [
      {
        paragraphs: [
          "Every forex broker's homepage says roughly the same thing: tight spreads, fast execution, award-winning platforms. That makes brokers hard to compare on marketing copy alone. The good news is that the things that actually determine whether a broker is safe to trust with your money are checkable — regulation, cost structure, platform quality, and how the broker behaves when you try to withdraw funds. This guide walks through each one, in the order we'd actually check them.",
          "This isn't investment advice, and nothing here tells you which specific broker to pick. It's a framework you can apply to any broker — the four criteria map directly to how we score every broker in our own rankings, so you can use this guide to sanity-check our numbers too, not just take them on faith.",
        ],
      },
      {
        heading: "1. Start with regulation, not spreads",
        paragraphs: [
          "Regulation is the single most important filter, because it determines what happens if something goes wrong — a platform outage during a volatile move, a dispute over an executed price, or in the worst case, the broker itself running into financial trouble.",
          "Not all regulators offer the same protection. Tier-1 regulators — the UK's FCA, Australia's ASIC, Cyprus's CySEC (an EU regulator), and a handful of others — require brokers to segregate client funds from company funds, carry minimum capital reserves, and in some jurisdictions participate in a compensation scheme that reimburses clients if the broker fails. Offshore regulators (common jurisdictions include Mauritius, Seychelles, Belize, and the BVI) have real licensing processes too, but the capital requirements and enforcement are typically lighter, and there's usually no investor compensation scheme behind them.",
          "This doesn't mean an offshore-regulated broker is automatically a scam — plenty operate honestly for years. It means the regulatory safety net under you is thinner, so problems (a slow withdrawal, a disputed trade) are more likely to become your problem to resolve alone rather than something a regulator will step in on.",
        ],
        list: [
          "Check how many regulators a broker holds licenses under, and in which countries — one Tier-1 license is meaningfully different from zero.",
          "A broker regulated in your own country's jurisdiction (or a Tier-1 one) gives you a realistic complaint path if something goes wrong.",
          "Multiple offshore licenses and zero Tier-1 coverage is a pattern worth weighing carefully, not a disqualifier on its own — pair it with the other three checks below.",
        ],
      },
      {
        heading: "2. Work out the real cost of trading, not just the advertised spread",
        paragraphs: [
          "\"Low spreads\" is the most common marketing claim in this industry, and it's also the easiest one to present misleadingly. A broker advertising a 0.0-pip EUR/USD spread on its raw/ECN account almost always charges a separate commission per lot — the all-in cost can end up higher than a \"standard\" account with a wider spread and no commission. You have to add spread and commission together to compare accounts honestly.",
          "Beyond spread and commission, check: overnight swap/rollover rates if you hold positions past the daily cutoff, inactivity fees if you don't trade for a stretch, and any deposit or withdrawal fees (many reputable brokers don't charge these, which is itself a useful signal).",
          "Minimum deposit matters less for cost and more for how much room you have to manage risk properly. A $5 minimum deposit sounds appealing, but trading with too little capital relative to position sizing is one of the more common ways new traders get wiped out — it's rarely the broker's fault when that happens, but a broker that only offers products suited to over-leveraged micro accounts isn't doing you any favors either.",
        ],
      },
      {
        heading: "3. Test the platform before you fund a live account",
        paragraphs: [
          "MetaTrader 4 and MetaTrader 5 remain the most widely used retail platforms because they're broker-agnostic — your charting setups, indicators, and expert advisors carry over if you ever switch brokers. cTrader is a common second option favored by some ECN-focused brokers. Many brokers also build a proprietary web or mobile platform on top of one of these, which can be more polished but ties your workflow to that one broker.",
          "The only way to actually evaluate a platform is to open a demo account and use it: check order execution speed during normal and volatile conditions, whether one-click trading and stop-loss placement feel reliable, and whether the charting and indicator set covers what your strategy needs. A broker's platform is something you'll interact with every trading day — it's worth the twenty minutes it takes to actually try it before committing real funds.",
        ],
      },
      {
        heading: "4. Withdrawal speed is the most honest signal a broker gives you",
        paragraphs: [
          "Deposits are always fast — every broker wants your money to arrive quickly. Withdrawals are where the real test happens, because a broker with cash-flow problems or a deliberate strategy to discourage withdrawals will slow-walk them, add unexpected verification hurdles, or bury the process in fine print.",
          "You don't have to guess. Independent review sites collect real user reports, and recurring withdrawal complaints are one of the clearest red flags a broker can have — much clearer than a marketing page can tell you. If you're evaluating a broker we haven't reviewed, search our own Broker Lookup tool first, then check its name alongside \"withdrawal\" on an independent review site before funding a live account.",
          "This is exactly why we maintain a dedicated risk-warnings page for brokers whose independent trust scores or complaint patterns stand out — it's built from the same review data, not a separate opinion.",
        ],
      },
      {
        heading: "How this maps to the FXPARTNER Index",
        paragraphs: [
          "Every broker we review gets a score from 0–10 on exactly these four axes — Regulation, Cost, Platform, and Withdrawals — averaged into a single FXPARTNER Index. The Regulation axis is calculated directly from the number and tier of licenses a broker holds; Cost and Platform are editorial assessments based on the criteria above; Withdrawals is scored from verifiable signals in independent reviews, the same sources mentioned above. A broker with no negative withdrawal signal gets a neutral score on that axis rather than an assumed positive one — we don't guess in a broker's favor.",
          "You can see the full breakdown, including the reasoning behind each score, on any broker's review page — we show the axis scores, not just the final number, specifically so you can check our work.",
        ],
      },
      {
        heading: "A practical checklist before you open an account",
        paragraphs: [],
        list: [
          "Confirm at least one regulator relevant to your own country, ideally Tier-1.",
          "Add up spread + commission on the account type you'd actually use, not the cheapest one advertised.",
          "Open a demo account and place a few trades to test execution and platform fit.",
          "Search the broker's name plus \"withdrawal\" on an independent review site before funding a live account.",
          "Start with an amount you're fully prepared to lose while you verify the broker's real-world behavior — this applies even to well-regulated brokers.",
        ],
      },
      {
        heading: "Where to go from here",
        paragraphs: [
          "If you want the short version of all this pre-applied to real brokers, our broker rankings page runs every listed broker through this exact framework, and our category pages group brokers by what matters most to you specifically — low spreads, high leverage, or brokers with the strongest regulatory coverage. If you're evaluating a broker not listed here, the checklist above works the same way on its own.",
        ],
      },
    ],
  },
  {
    // Title deliberately avoids leading with "XM Review" — /brokers/xm
    // already owns that primary keyword in its own <title>/<h1> (it's the
    // higher-authority, more-linked pillar page for XM), and this post is
    // the deep-dive companion piece it links out to. Duplicating "XM
    // Review 2026" as the head phrase on both pages would have both
    // competing for the same query instead of each owning a distinct one.
    slug: "xm-review",
    title: "XM Accounts, Fees & Regulation Explained (2026 Breakdown)",
    excerpt:
      "A full breakdown of XM's five account types, deposit/withdrawal speed, regulatory licenses, and education tools — the same research behind XM's #1 spot in the FXPARTNER Index.",
    publishedAt: "2026-07-27",
    readingMinutes: 9,
    sections: [
      {
        paragraphs: [
          "XM (XM Global) is the most-chosen broker in the FXPARTNER community, and the #1-ranked broker in the FXPARTNER Index. Founded in 2009 and headquartered across Cyprus and Australia, it has built that position on a genuinely low barrier to entry — a $5 minimum deposit — combined with regulatory coverage and an education program that's unusually extensive for a broker at that price point.",
          "This review walks through exactly what you get at each account tier, how deposits and withdrawals actually work, and who XM fits best — using the same criteria (regulation, cost, platform, withdrawals) as our broader broker-evaluation framework, so you can check our ranking against the details yourself.",
        ],
      },
      {
        heading: "Regulation and fund safety",
        paragraphs: [
          "XM holds four regulatory licenses: ASIC (Australia), CySEC (Cyprus), and DFSA (Dubai) are Tier-1 authorities, requiring client-fund segregation and minimum capital reserves; FSC (Belize) is its offshore license. Three Tier-1 licenses alongside an offshore one is a stronger safety net than most brokers in this price range offer.",
          "Accounts also come with negative balance protection, meaning you can't lose more than you've deposited even during a volatile move that gaps through your stop-loss — a standard feature at regulated brokers, but worth confirming before you fund any account.",
        ],
      },
      {
        heading: "Account types and trading costs",
        paragraphs: [
          "XM offers five account types, and the right one depends mostly on how much you trade and how sensitive you are to spread versus commission:",
        ],
        list: [
          "Micro — spreads from 1.0 pips, no commission, $5 minimum deposit. Trades in micro lots (1,000 units), which makes position sizing easier while you're still learning.",
          "Standard — the same 1.0-pip-from spread and no-commission structure as Micro, but in full-size lots (100,000 units). Also a $5 minimum deposit.",
          "XM Ultra Low — built for more active trading, with spreads from 0.6 pips and no added commission. $100 minimum deposit.",
          "Zero — spreads from 0.0 pips on major pairs, offset by a $3.50-per-lot-per-side commission. This is the account that suits scalpers and high-frequency strategies where the tightest possible spread matters more than a flat no-commission structure. $100 minimum deposit.",
          "Shares — direct share trading with a per-share commission and no leverage, separate from the CFD-style accounts above.",
        ],
      },
      {
        heading: "Platforms",
        paragraphs: [
          "XM runs on MetaTrader 4 and MetaTrader 5 — both broker-agnostic, so your indicators, expert advisors, and chart setups carry over if you ever open an account elsewhere — plus its own XM App for trading and account management from a phone. There's no proprietary desktop platform beyond MetaTrader, which is a deliberate tradeoff: MT4/MT5 have the largest available library of third-party tools and EAs of any retail platform, at the cost of the more modern interface some brokers build on top of them.",
        ],
      },
      {
        heading: "Deposits and withdrawals",
        paragraphs: [
          "Deposits by card or e-wallet (Skrill, Neteller, WebMoney) are typically credited instantly; bank wire transfers take 1-3 business days. XM doesn't charge a deposit fee on any method.",
          "Withdrawal requests are generally processed within 24 hours on XM's side: e-wallet payouts often land the same day, while card and bank withdrawals take roughly 2-5 business days depending on the provider — the delay at that point is usually the bank's processing time, not XM's. There's no withdrawal fee from XM, though your card issuer or e-wallet provider may apply its own. Withdrawal speed and transparency are exactly the kind of signal we weight most heavily in the FXPARTNER Index's Withdrawals axis, precisely because it's the point where a broker's real behavior — not its marketing page — shows up.",
        ],
      },
      {
        heading: "Education and research",
        paragraphs: [
          "This is where XM separates itself from most brokers at a $5 minimum deposit. It runs live webinars daily, delivered in multiple languages, covering everything from basic candlestick patterns to more advanced technical strategies, plus a recorded video library through a Tradepedia partnership that's available on-demand. An in-house analyst team also publishes daily technical outlooks and a live economic calendar.",
          "XM also runs a loyalty program, the XM Traders Club, with five membership tiers (Bronze through Elite) that earn XM Coins on closed positions — a structure that rewards trading volume over time rather than a one-off signup bonus.",
        ],
      },
      {
        heading: "Who XM is best for",
        paragraphs: [
          "XM's combination of a $5 entry point, no-commission Micro/Standard accounts, and daily education makes it a natural fit for beginners who want to learn while trading small size. Its Zero account also gives more active traders a genuine low-spread option once they're ready to scale up, without having to switch brokers.",
          "If your priority is the absolute tightest raw spread regardless of account minimums, it's worth comparing XM's Zero account against dedicated low-spread brokers in our rankings — XM's strength is the combination of accessibility and education, not necessarily having the single lowest cost on the market.",
        ],
      },
      {
        heading: "The bottom line",
        paragraphs: [
          "XM earns its #1 FXPARTNER Index ranking on the combination of two Tier-1 regulators, a five-tier account structure that scales from a $5 beginner account to a genuine low-spread Zero account, consistently fast withdrawal processing, and an education program most competitors don't match at this price point.",
          "As with any broker, confirm current spreads, leverage limits for your country, and account terms on XM's official site before funding a live account — this review is a research aid, not investment advice.",
        ],
      },
    ],
  },
  {
    slug: "fomc-faiz-karari-fed-baskani-konusmasi",
    title: "FOMC Faiz Kararı ve FED Başkanı'nın Konuşması: Bugün Piyasaları Neler Bekliyor?",
    excerpt:
      "FOMC faiz kararı ve FED Başkanı'nın basın toplantısı bugün altın, döviz, hisse senedi ve kripto para piyasalarının odağında. Beklentiler, olası senaryolar ve yatırımcıların dikkat etmesi gerekenler.",
    publishedAt: "2026-07-29",
    readingMinutes: 6,
    coverImage: "/blog/fomc-faiz-karari-cover.webp",
    sections: [
      {
        heading: "Küresel Piyasaların Gözü FED'de",
        paragraphs: [
          "Bugün finansal piyasaların odak noktasında ABD Merkez Bankası'nın (FOMC) açıklayacağı faiz kararı ve ardından gerçekleşecek FED Başkanı'nın basın toplantısı bulunuyor.",
          "Bu iki gelişme yalnızca ABD ekonomisi için değil, aynı zamanda altın, döviz, hisse senetleri ve kripto para piyasaları açısından da büyük önem taşıyor. Karar sonrasında piyasalarda sert fiyat hareketleri yaşanabileceği için yatırımcıların risk yönetimine ekstra dikkat etmeleri gerekiyor.",
        ],
      },
      {
        heading: "FOMC Faiz Kararı Saat Kaçta Açıklanacak?",
        paragraphs: [
          "Faiz oranının yanı sıra karar metninde kullanılacak ifadeler ve FED Başkanı'nın vereceği mesajlar, piyasaların yönü üzerinde belirleyici olacaktır.",
        ],
        list: ["FOMC Faiz Kararı: 21:00 (TSİ)", "FED Başkanı Basın Toplantısı: 21:30 (TSİ)"],
      },
      {
        heading: "Piyasaların Beklentisi Nedir?",
        paragraphs: [
          "Ekonomistlerin büyük çoğunluğu, FED'in politika faizini mevcut seviyesinde sabit bırakmasını bekliyor.",
          "Ancak yatırımcılar için asıl önemli konu faiz kararından çok, FED'in önümüzdeki toplantılar için vereceği sinyaller olacak. Özellikle şu soruların cevapları yakından takip edilecek:",
        ],
        list: [
          "Yılın geri kalanında faiz indirimi ihtimali var mı?",
          "Enflasyon konusunda FED nasıl bir değerlendirme yapacak?",
          "İş gücü piyasası hakkında yeni mesajlar verilecek mi?",
          "Ekonomik büyüme beklentileri değişti mi?",
        ],
      },
      {
        heading: "Altın (XAU/USD) Nasıl Etkilenebilir?",
        paragraphs: [
          "Bu soruların cevapları, doların yönünü ve küresel risk iştahını doğrudan etkileyebilir.",
          "Güvercin (Dovish) Mesajlar Gelirse — FED'in gelecekte faiz indirimine açık kapı bırakması durumunda:",
        ],
        list: [
          "Altında yükseliş görülebilir.",
          "ABD Doları değer kaybedebilir.",
          "Tahvil faizleri geri çekilebilir.",
          "Riskli varlıklara talep artabilir.",
        ],
      },
      {
        paragraphs: [
          "Şahin (Hawkish) Mesajlar Gelirse — FED enflasyonla mücadelede kararlı olduğunu vurgular ve faizlerin uzun süre yüksek kalabileceğini belirtirse:",
        ],
        list: [
          "Altında satış baskısı oluşabilir.",
          "ABD Doları güç kazanabilir.",
          "Tahvil faizleri yükselebilir.",
          "Hisse senedi piyasalarında baskı görülebilir.",
        ],
      },
      {
        heading: "Forex Piyasasında Hangi Pariteler Hareketlenebilir?",
        paragraphs: [
          "FOMC kararının ardından özellikle şu ürünlerde yüksek volatilite beklenebilir:",
        ],
        list: ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD (Altın)", "Gümüş (XAG/USD)"],
      },
      {
        paragraphs: [
          "Kısa süre içerisinde geniş spreadler ve ani fiyat hareketleri oluşabileceğinden, yüksek kaldıraç kullanan yatırımcıların dikkatli olması önemlidir.",
        ],
      },
      {
        heading: "Kripto Para Piyasası Etkilenir mi?",
        paragraphs: [
          "Evet. Bitcoin ve diğer büyük kripto varlıklar son yıllarda FED kararlarına karşı oldukça hassas hale geldi.",
          "Faizlerin uzun süre yüksek kalacağı yönündeki mesajlar riskli varlıklar üzerinde baskı oluşturabilir. Buna karşılık daha yumuşak (güvercin) açıklamalar kripto piyasasında olumlu fiyatlamalara neden olabilir.",
        ],
      },
      {
        heading: "Yatırımcılar Nelere Dikkat Etmeli?",
        paragraphs: ["FOMC günlerinde işlem yaparken şu noktalara dikkat edilmesi önerilir:"],
        list: [
          "İşlem hacmini normalden düşük tutun.",
          "Stop-loss kullanmayı ihmal etmeyin.",
          "İlk birkaç dakikadaki sert hareketlere karşı temkinli olun.",
          "Basın toplantısını da mutlaka takip edin; asıl yön çoğu zaman burada oluşur.",
          "Tek bir açıklamaya göre işlem yapmak yerine piyasanın ilk tepkisinin oturmasını beklemek daha sağlıklı olabilir.",
        ],
      },
      {
        heading: "Sonuç",
        paragraphs: [
          "Bugünkü FOMC faiz kararı ve FED Başkanı'nın açıklamaları, haftanın hatta ayın en önemli ekonomik gelişmeleri arasında yer alıyor.",
          "Faiz oranının değişip değişmemesinden çok, FED'in geleceğe yönelik mesajları küresel piyasalarda fiyatlamaların yönünü belirleyecek. Özellikle altın, dolar, forex pariteleri, hisse senetleri ve kripto para piyasalarında işlem yapan yatırımcıların açıklama saatlerinde yüksek volatiliteye karşı hazırlıklı olmaları gerekiyor.",
          "FXPARTNER olarak gelişmeleri yakından takip ediyor ve önemli ekonomik olayların piyasalara etkilerini düzenli olarak sizlerle paylaşmaya devam edeceğiz.",
        ],
      },
    ],
  },
  {
    slug: "forex-risk-yonetimi-pozisyon-buyuklugu-stop-loss",
    title: "Forex'te Risk Yönetimi: Pozisyon Büyüklüğü ve Stop-Loss Stratejileri",
    excerpt:
      "Kazançlı bir stratejinin bile hesabı sıfırlayabilmesinin tek nedeni kötü pozisyon büyüklüğüdür. Sermayenizi korumak için pratik risk yönetimi çerçevesi.",
    publishedAt: "2026-08-05",
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          "Forex'te yeni başlayanların çoğu zaman analizine değil, risk yönetimine yenilir. Doğru yönü tahmin etmiş olsanız bile, pozisyonunuz hesabınıza göre çok büyükse tek bir ters hareket sizi piyasadan tamamen çıkarabilir. Bu yazı, deneyimli yatırımcıların neredeyse otomatik olarak uyguladığı, ama yeni başlayanların çoğunlukla atladığı temel risk yönetimi kurallarını ele alıyor.",
          "Bu bir kazanma garantisi değil — hiçbir risk yönetimi tekniği kayıpları ortadan kaldırmaz. Amaç, tek bir kötü işlemin veya art arda gelen birkaç kaybın hesabınızı kalıcı olarak zedelememesini sağlamak.",
        ],
      },
      {
        heading: "1. İşlem başına riski, hesap büyüklüğünün yüzdesi olarak düşünün",
        paragraphs: [
          "Deneyimli yatırımcıların çoğu, tek bir işlemde hesap bakiyesinin %1-2'sinden fazlasını riske atmaz. Bu, lot büyüklüğü değil, stop-loss'a kadar olan mesafenin dolar/TL cinsinden karşılığıdır. 10.000$'lık bir hesapta %1 risk kuralı, herhangi bir işlemde en fazla 100$ kaybetmeyi kabul etmek demektir — stop-loss ister 20 pip ister 80 pip uzaklıkta olsun, pozisyon büyüklüğü buna göre ayarlanır.",
          "Bu yaklaşımın gücü matematikte gizli: %1 kuralıyla art arda 10 kayıp yaşasanız bile hesabınızın yaklaşık %10'unu kaybedersiniz — geri dönülebilir bir seviye. Pozisyon büyüklüğünü sabit tutup stop-loss'a göre ayarlamazsanız, birkaç geniş-stoplu işlem hesabı çok daha hızlı eritebilir.",
        ],
      },
      {
        heading: "2. Stop-loss'u piyasaya göre yerleştirin, keyfi bir sayıya göre değil",
        paragraphs: [
          "Yaygın bir hata, stop-loss'u \"50 pip\" gibi sabit bir sayıya göre koymaktır — oysa doğru mesafe, işlem yapılan enstrümanın volatilitesine ve son destek/direnç seviyelerine göre değişir. Sakin bir majör paritede 15 pip'lik stop mantıklıyken, aynı mesafe altın veya yüksek volatiliteli bir kripto paritesinde piyasanın normal gürültüsü içinde anında tetiklenebilir.",
          "Pratik bir yöntem: son swing high/low'un veya belirgin bir destek/direnç bölgesinin biraz ötesine stop koymak — yani fiyatın normal seyrinde \"nefes almasına\" izin verip, gerçekten senaryonun geçersiz olduğu noktada çıkmak. Stop mesafesi belirlendikten sonra pozisyon büyüklüğü, adım 1'deki risk yüzdesine uyacak şekilde hesaplanır — sıra bu şekilde işler, tam tersi değil.",
        ],
      },
      {
        heading: "3. Kaldıraç, risk değil — sadece bir çarpandır",
        paragraphs: [
          "Yüksek kaldıraç kendi başına tehlikeli değildir; tehlikeli olan, kaldıracın izin verdiği maksimum pozisyon büyüklüğünü kullanmaktır. 1:500 kaldıraçlı bir hesap, sizi büyük pozisyon açmaya zorlamaz — sadece küçük bir teminatla büyük pozisyon açmanıza izin verir. Risk yönetimi disiplini olmadan bu, kayıpları hızlandırmanın bir yoludur.",
          "Kaldıraç konusunu daha ayrıntılı ele aldığımız yazımızda bu farkı ve broker/ülkeye göre değişen kaldıraç limitlerini daha detaylı işliyoruz.",
        ],
      },
      {
        heading: "4. Korelasyona dikkat edin",
        paragraphs: [
          "Aynı anda EUR/USD, GBP/USD ve EUR/GBP'de long pozisyon açmak, üç ayrı bağımsız işlem gibi hissettirebilir — ama bu pariteler yüksek oranda korele hareket eder. Piyasa aleyhinize döndüğünde, üçü de aynı anda zarar etmeye başlar; gerçek riskiniz, tek işlem başına hesapladığınızdan çok daha yüksektir. Açık pozisyonlarınızın toplam yönlü maruziyetini (net exposure) değerlendirmek, tek tek işlemleri değerlendirmek kadar önemlidir.",
        ],
      },
      {
        heading: "Pratik bir kontrol listesi",
        paragraphs: [],
        list: [
          "İşlem açmadan önce riske atacağınız dolar/TL tutarını (hesabın %1-2'si) belirleyin.",
          "Stop-loss'u piyasa yapısına göre yerleştirin, ardından pozisyon büyüklüğünü buna göre hesaplayın.",
          "Yüksek korelasyonlu paritelerde aynı anda birden fazla pozisyon açmadan önce toplam maruziyeti göz önünde bulundurun.",
          "Bir günde veya haftada ulaşınca işlem yapmayı bırakacağınız bir maksimum kayıp seviyesi belirleyin.",
          "Hiçbir kural, kayıpları garanti altına almaz — bu bir sermaye koruma çerçevesidir, kâr garantisi değildir.",
        ],
      },
    ],
  },
  {
    slug: "teknik-analiz-vs-temel-analiz",
    title: "Teknik Analiz mi, Temel Analiz mi? İkisini Bir Arada Kullanmak",
    excerpt:
      "İki yöntem de tek başına eksik. Teknik analiz size 'ne zaman', temel analiz 'neden' sorusuna cevap verir — birlikte nasıl kullanılır?",
    publishedAt: "2026-08-05",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Forex forumlarında sık karşılaşılan bir tartışma: \"Teknik analiz mi işe yarar, temel analiz mi?\" Aslında bu, yanlış kurulmuş bir soru. İki yöntem farklı sorulara cevap verir ve birçok deneyimli yatırımcı ikisini birlikte kullanır — biri fiyatın nereye gidebileceğini, diğeri neden gidebileceğini açıklamaya çalışır.",
        ],
      },
      {
        heading: "Teknik analiz: fiyatın kendisi neyi anlatıyor?",
        paragraphs: [
          "Teknik analiz, geçmiş fiyat hareketlerinin ve işlem hacminin gelecekteki fiyat davranışı hakkında ipucu verdiği varsayımına dayanır. Destek/direnç seviyeleri, trend çizgileri, hareketli ortalamalar (SMA/EMA) ve RSI gibi göstergeler bu yaklaşımın temel araçlarıdır.",
          "Teknik analizin güçlü yanı, giriş/çıkış zamanlamasında ve risk yönetiminde (stop-loss'u nereye koyacağınızı belirlemede) somut, ölçülebilir seviyeler sunmasıdır. Zayıf yanı ise, beklenmedik bir haber akışının (örneğin bir merkez bankası kararı) teknik seviyeleri bir anda geçersiz kılabilmesidir.",
        ],
      },
      {
        heading: "Temel analiz: fiyatı ne hareket ettiriyor?",
        paragraphs: [
          "Temel analiz, bir para biriminin değerini faiz oranları, enflasyon, istihdam verileri, büyüme rakamları ve merkez bankası politikaları üzerinden değerlendirir. Örneğin bir merkez bankasının faiz artırması, genellikle o para birimine olan talebi artırır — çünkü o para biriminde tutulan varlıklar daha yüksek getiri sunar.",
          "Temel analizin gücü, büyük ve sürdürülebilir trendlerin arkasındaki mantığı anlamanızı sağlamasıdır. Zayıf yanı ise, \"faiz kararı piyasayı nasıl etkiler\" sorusuna cevap verse de, \"bugün, saat kaçta, hangi seviyeden\" sorusuna aynı netlikte cevap vermemesidir.",
        ],
      },
      {
        heading: "İkisini birlikte kullanmanın pratik yolu",
        paragraphs: [
          "Yaygın bir yaklaşım şudur: temel analizle genel yönü (bias) belirlemek, teknik analizle bu yönde giriş/çıkış zamanlaması yapmak. Örneğin merkez bankası politikaları bir para birimi için genel olarak güçlenme sinyali veriyorsa, teknik olarak geri çekilme (pullback) noktalarını giriş fırsatı olarak değerlendirmek, sadece göstergeye bakıp yön tahmini yapmaktan daha tutarlı bir çerçeve sunar.",
          "Ekonomik takvimi (faiz kararları, enflasyon verileri, istihdam raporları gibi) takip etmek bu sürecin ayrılmaz bir parçasıdır — bu konuyu ayrı bir yazıda daha detaylı ele alıyoruz.",
        ],
      },
      {
        heading: "Hangi yöntem kime uygun?",
        paragraphs: [
          "Kısa vadeli (gün içi veya scalping) işlem yapanlar genellikle teknik analize ağırlık verir, çünkü karar süreleri saatler hatta dakikalar içinde gerçekleşir. Pozisyon büyüklüğünü haftalar/aylar boyunca taşıyan yatırımcılar için temel analiz genellikle daha belirleyicidir. Çoğu yatırımcı için ideal olan, tamamen birini seçmek değil, kendi zaman ufkuna göre ikisine de belirli bir ağırlık vermektir.",
        ],
      },
    ],
  },
  {
    slug: "kaldirac-leverage-nedir-riskleri",
    title: "Kaldıraç (Leverage) Nedir? Fırsatlar ve Riskler",
    excerpt:
      "Kaldıraç kazançları büyütebildiği kadar kayıpları da büyütür. Kaldıracın gerçekte nasıl çalıştığını ve neden dikkatli kullanılması gerektiğini anlatıyoruz.",
    publishedAt: "2026-08-05",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Kaldıraç, forex brokerlarının pazarlama materyallerinde en çok öne çıkarılan özelliklerden biri — \"1:500 kaldıraç\" gibi ifadeler cazip görünür. Ama kaldıracın gerçekte ne anlama geldiğini ve neden dikkatli kullanılması gerektiğini anlamadan bir hesap açmak, sermayenizi olması gerekenden çok daha hızlı kaybetmenin en yaygın yollarından biridir.",
        ],
      },
      {
        heading: "Kaldıraç nasıl çalışır?",
        paragraphs: [
          "Kaldıraç, brokerin sağladığı bir \"borç\" değil, teminat (margin) karşılığında piyasada tuttuğunuz pozisyon büyüklüğünü çarpan bir mekanizmadır. 1:100 kaldıraçla 1.000$'lık teminatla 100.000$ değerinde pozisyon açabilirsiniz. Bu, kâr da zarar da 100.000$'lık pozisyon üzerinden hesaplanır demektir — teminatınız sadece pozisyonu açmak için gereken minimum tutardır.",
          "Bu nokta kritik: kaldıraç kâr/zararınızın büyüklüğünü değiştirmez, sadece aynı büyüklükteki pozisyonu açmak için gereken teminatı azaltır. Yani asıl belirleyici olan pozisyon büyüklüğüdür, kaldıraç oranının kendisi değil.",
        ],
      },
      {
        heading: "Yüksek kaldıraç neden risklidir?",
        paragraphs: [
          "Yüksek kaldıraç, düşük teminatla büyük pozisyon açmayı mümkün kıldığı için, disiplinsiz kullanıldığında hesabı çok hızlı eritebilir. Örneğin 1:500 kaldıraçla hesabınızın tamamına yakınını tek bir pozisyona teminat olarak koyarsanız, fiyatın küçük bir yüzde hareketi bile marjinizi tüketip pozisyonunuzun otomatik kapanmasına (margin call/stop-out) yol açabilir.",
          "Bu, kaldıracın \"kötü\" olduğu anlamına gelmez — profesyonel yatırımcılar da yüksek kaldıraçlı hesaplar kullanır. Fark, kaldıracın izin verdiği maksimum pozisyonu değil, önceki yazımızda ele aldığımız risk yönetimi kurallarına (işlem başına %1-2 risk gibi) göre belirlenen pozisyonu açmalarıdır.",
        ],
      },
      {
        heading: "Ülkeye ve brokera göre kaldıraç limitleri",
        paragraphs: [
          "Tier-1 regülatörler (İngiltere FCA, Avrupa ESMA/CySEC gibi) perakende yatırımcılar için kaldıraç üst sınırlarını yasal olarak sınırlar — genellikle majör paritelerde 1:30 civarında. Offshore lisanslı brokerlar ise çok daha yüksek kaldıraç (1:500, hatta 1:1000) sunabilir. Yüksek kaldıraç imkânı başlı başına bir kırmızı bayrak değildir, ama genellikle daha hafif regüle edilmiş bir yapının işaretidir — bu dengeyi broker seçim rehberimizde daha detaylı ele alıyoruz.",
        ],
      },
      {
        heading: "Pratik yaklaşım",
        paragraphs: [],
        list: [
          "Kaldıracı \"ne kadar büyük pozisyon açabilirim\" olarak değil, \"ne kadar az teminatla işlem açabilirim\" olarak düşünün.",
          "Pozisyon büyüklüğünüzü kaldıracın izin verdiği maksimuma göre değil, risk yönetimi kurallarınıza göre belirleyin.",
          "Yeni başlıyorsanız, düşük-orta kaldıraçlı bir hesapla başlamak, marj çağrısı riskini azaltır ve öğrenme sürecini daha az stresli hale getirir.",
        ],
      },
    ],
  },
  {
    slug: "trading-psikolojisi-duygusal-kararlar",
    title: "Trading Psikolojisi: Duygusal Kararlardan Nasıl Kaçınılır?",
    excerpt:
      "Çoğu yatırımcı stratejisi yüzünden değil, korku ve açgözlülük anındaki dürtüsel kararları yüzünden kaybeder. Disiplini korumanın pratik yolları.",
    publishedAt: "2026-08-05",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Deneyimli yatırımcılar arasında sık tekrarlanan bir söz vardır: \"Trading'in yüzde 80'i psikoloji, yüzde 20'si stratejidir.\" Rakam tartışmaya açık olsa da fikir doğru — iyi bir strateji bile, onu uygulayan kişi panikle, açgözlülükle veya intikam almak ister gibi işlem yaptığında işe yaramaz hale gelir.",
        ],
      },
      {
        heading: "En yaygın duygusal tuzaklar",
        paragraphs: [
          "Kayıptan sonra \"intikam işlemi\" (revenge trading) — bir kaybı hemen telafi etmek için plansız, büyük bir pozisyon açmak — belki de en yıkıcı davranış kalıbıdır. Bunu genellikle FOMO (kaçırma korkusu) izler: fiyat hızla yükselirken \"trene binmek\" için analiz yapmadan pozisyon açmak.",
          "Bir diğer yaygın hata, kazançtaki bir pozisyonu çok erken kapatmak (korku nedeniyle) ama zarardaki bir pozisyonu \"geri dönür\" umuduyla çok uzun süre açık tutmaktır — psikolojik olarak kayıpları kabul etmek kazançlardan vazgeçmekten daha zordur, ve bu asimetri genellikle kayıp işlemlerin kazanç işlemlerinden daha büyük kalmasına yol açar.",
        ],
      },
      {
        heading: "Neden bu kadar zor?",
        paragraphs: [
          "Gerçek para riske girdiğinde beyin, rasyonel analiz değil, hayatta kalma tepkileriyle çalışmaya başlar. Bu, bir zayıflık değil, insan biyolojisinin bir parçasıdır. Çözüm \"daha güçlü irade\" değil, duygusal anda karar vermeyi gerektirmeyecek bir sistem kurmaktır.",
        ],
      },
      {
        heading: "Pratik önlemler",
        paragraphs: [
          "Aşağıdaki alışkanlıklar, duygusal kararların önüne geçmek için deneyimli yatırımcıların yaygın olarak kullandığı yöntemlerdir:",
        ],
        list: [
          "Her işlem öncesi giriş, stop-loss ve hedef seviyeyi yazılı olarak belirleyin — pozisyon açıkken karar değiştirmek, kararı önceden vermekten çok daha zordur.",
          "Bir gün/hafta için maksimum kayıp limiti belirleyin ve bu limite ulaştığınızda ekranı kapatın.",
          "Kayıptan hemen sonra yeni bir işlem açmadan önce belirli bir süre (örneğin bir gün) bekleyin — bu, intikam işlemlerinin büyük kısmını engeller.",
          "İşlemlerinizi bir günlükte (trading journal) kaydedin: hangi kararların plana göre, hangilerinin duygusal olarak alındığını görmek, zamanla en büyük öğretmeninizdir.",
          "Demo hesapta strateji test etmekle gerçek hesapta küçük pozisyonlarla işlem yapmak arasında büyük bir psikolojik fark vardır — bu geçişi ayrı bir yazımızda ele alıyoruz.",
        ],
      },
      {
        heading: "Sonuç",
        paragraphs: [
          "Trading psikolojisi, bir kez öğrenilip unutulacak bir konu değil, sürekli çalışılması gereken bir disiplindir. En iyi teknik analiz veya en iyi risk yönetimi kuralları bile, onları duygusal anda terk eden bir yatırımcıyı korumaz.",
        ],
      },
    ],
  },
  {
    slug: "ecn-vs-market-maker-broker-farki",
    title: "ECN ve Market Maker Broker Arasındaki Fark",
    excerpt:
      "İki farklı yürütme modeli, iki farklı maliyet yapısı. Broker seçerken bu farkı bilmek, spread rakamlarına bakmaktan daha önemli.",
    publishedAt: "2026-08-05",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Bir broker seçerken karşınıza çıkan \"ECN\", \"STP\" ve \"Market Maker\" gibi terimler, çoğu zaman yeterince açıklanmadan geçiştirilir. Ama bu terimler, emirlerinizin gerçekte nasıl işlendiğini ve maliyet yapınızı doğrudan etkiler.",
        ],
      },
      {
        heading: "Market Maker (Dealing Desk) nasıl çalışır?",
        paragraphs: [
          "Market Maker brokerlar, müşteri emirlerini doğrudan piyasaya göndermek yerine kendi iç sistemlerinde eşleştirir veya karşı taraf olarak üstlenir. Bu model, sabit spreadler ve genellikle komisyonsuz işlem sunabilir — küçük hesaplar ve yeni başlayanlar için erişilebilir bir yapı sağlar.",
          "Bu modelin eleştirilen yönü, teorik olarak brokerin müşteri kaybından kâr edebilecek bir konumda olmasıdır. Regüle edilmiş, saygın brokerlarda bu bir sorun yaratmaz — ama fiyatlandırmanın ham piyasa fiyatı yerine brokerin kendi iç fiyatlandırmasına dayandığını bilmek önemlidir.",
        ],
      },
      {
        heading: "ECN/STP nasıl çalışır?",
        paragraphs: [
          "ECN (Electronic Communication Network) ve STP (Straight Through Processing) brokerlar, emirleri doğrudan bir likidite havuzuna (bankalar, diğer yatırımcılar) yönlendirir. Fiyatlar ham piyasa fiyatlarıdır ve broker genellikle spread yerine (veya spread'e ek olarak) lot başına sabit bir komisyon alır.",
          "Bu modelin avantajı şeffaflıktır — özellikle piyasa yoğun hareket ederken spread'ler daralıp genişleyebilir (değişken spread), ama fiyat gerçek piyasa arz-talebini yansıtır. Dezavantajı, toplam maliyeti (spread + komisyon) hesaplamanın Market Maker'ın \"tek sabit spread\" fiyatlandırmasına göre biraz daha fazla dikkat gerektirmesidir.",
        ],
      },
      {
        heading: "Hangi model kime uygun?",
        paragraphs: [
          "Küçük hesapla başlayan, basitlik isteyen ve sık işlem yapmayan yatırımcılar için Market Maker'ın sabit spread + komisyonsuz yapısı genellikle daha öngörülebilirdir. Scalping veya yüksek frekanslı stratejiler uygulayan, ham spread'in komisyondan daha değerli olduğu aktif yatırımcılar için ECN/STP hesaplar genellikle daha uygun maliyetlidir.",
          "Birçok broker artık her iki modeli de farklı hesap tipleri (örneğin \"Standard\" ve \"Zero/Raw\") altında sunuyor — bu da doğru soruyu \"hangi broker daha iyi\" değil, \"hangi hesap tipi benim trading tarzıma uygun\" olarak sormayı gerektiriyor. Bu konuyu, broker seçim çerçevemizde daha geniş ele alıyoruz.",
        ],
      },
    ],
  },
  {
    slug: "ekonomik-takvim-nasil-okunur",
    title: "Ekonomik Takvim Nasıl Okunur? Piyasayı Hareket Ettiren Veriler",
    excerpt:
      "Faiz kararları, enflasyon verileri, istihdam raporları — ekonomik takvimdeki hangi veriler önemli, hangileri gürültü? Pratik bir okuma rehberi.",
    publishedAt: "2026-08-05",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Ekonomik takvim, forex piyasasında fiyat hareketlerinin büyük kısmının arkasındaki nedeni gösteren en pratik araçlardan biridir. Ama takvimdeki onlarca veri arasında hangisinin gerçekten önemli olduğunu bilmeden bakmak, çoğu zaman kafa karıştırıcı bir gürültü yığınına dönüşür.",
        ],
      },
      {
        heading: "Etki seviyelerini anlamak",
        paragraphs: [
          "Çoğu ekonomik takvim, verileri düşük/orta/yüksek etki olarak sınıflandırır (genellikle sarı/turuncu/kırmızı renk kodlarıyla). Yüksek etkili veriler arasında merkez bankası faiz kararları, enflasyon raporları (CPI) ve ABD tarım dışı istihdam verisi (NFP) yer alır — bunlar genellikle yayınlandıkları anda ani ve keskin fiyat hareketlerine neden olur.",
        ],
      },
      {
        heading: "En çok takip edilen veriler",
        paragraphs: [
          "Aşağıdaki veriler, çoğu para birimi çifti için en belirleyici olanlardır:",
        ],
        list: [
          "Faiz kararları — merkez bankalarının politika faizini artırıp artırmadığı, para biriminin cazibesini doğrudan etkiler.",
          "Enflasyon verileri (CPI/PCE) — merkez bankasının gelecekteki faiz kararlarına dair en güçlü sinyallerden biridir.",
          "İstihdam raporları — özellikle ABD'de NFP, ekonominin genel sağlığına dair güçlü bir gösterge olarak kabul edilir.",
          "GSYH büyüme rakamları — ekonominin genel yönünü gösterir, genellikle daha yavaş ama sürdürülebilir trendlerin arkasındaki nedendir.",
          "Merkez bankası başkanlarının konuşmaları — rakamın kendisi kadar, gelecekteki politikaya dair verilen sinyaller de piyasayı hareket ettirir.",
        ],
      },
      {
        heading: "Beklenti ile gerçekleşen arasındaki fark önemli",
        paragraphs: [
          "Piyasa, verinin kendisinden çok, beklentiden ne kadar saptığına tepki verir. Enflasyon beklenenden yüksek gelirse (piyasa daha düşük bekliyorsa), bu genellikle o para biriminde güçlenmeye yol açabilir — çünkü merkez bankasının faizleri daha uzun süre yüksek tutması ihtimali artar. Beklenen ile gerçekleşen arasındaki fark, sayının mutlak değerinden daha belirleyicidir.",
        ],
      },
      {
        heading: "Yüksek etkili veriler etrafında dikkat edilmesi gerekenler",
        paragraphs: [],
        list: [
          "Veri açıklamasından hemen önce ve sonra spreadler genişleyebilir — bu dönemde işlem açmak ekstra maliyetli olabilir.",
          "İlk birkaç dakikadaki keskin hareket, genellikle gerçek yönü değil, piyasanın ilk tepkisini yansıtır; oturmasını beklemek daha sağlıklı olabilir.",
          "Yüksek etkili bir veri öncesinde pozisyon büyüklüğünü küçültmek veya stop-loss'u gözden geçirmek, beklenmedik volatiliteye karşı makul bir önlemdir.",
        ],
      },
    ],
  },
  {
    slug: "demo-hesaptan-gercek-hesaba-gecis",
    title: "Demo Hesaptan Gerçek Hesaba Geçiş: Ne Zaman ve Nasıl?",
    excerpt:
      "Demo hesapta kârlı olmak, gerçek hesapta başarılı olacağınız anlamına gelmez. Geçişi doğru zamanlamanın ve psikolojik farkı yönetmenin yolları.",
    publishedAt: "2026-08-05",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Demo hesap, bir platformu ve stratejiyi risksiz test etmenin en iyi yoludur — ama demo hesapta aylarca kârlı olan birçok yatırımcı, gerçek hesaba geçtiğinde beklenmedik bir performans düşüşü yaşar. Bunun nedeni genellikle strateji değil, gerçek para riskinin getirdiği psikolojik farktır.",
        ],
      },
      {
        heading: "Demo ile gerçek hesap arasındaki asıl fark: para değil, duygu",
        paragraphs: [
          "Demo hesapta bir kayıp sadece bir sayıdır. Gerçek hesapta aynı kayıp, kaygı, pişmanlık ve dürtüsel tepki verme isteği yaratır — trading psikolojisi yazımızda ele aldığımız tam olarak bu dinamik. Bu fark, sanılandan çok daha büyük bir performans etkisi yaratabilir; strateji aynı kalsa bile, onu uygulayan kişinin davranışı değişir.",
        ],
      },
      {
        heading: "Geçiş için hazır olduğunuzu gösteren işaretler",
        paragraphs: [],
        list: [
          "Stratejinizi demo hesapta yeterince uzun süre (birkaç hafta-ay, sadece birkaç gün değil) ve farklı piyasa koşullarında test ettiniz.",
          "Risk yönetimi kurallarınızı (pozisyon büyüklüğü, stop-loss yerleşimi) düşünmeden, otomatik olarak uygulayabiliyorsunuz.",
          "İşlem günlüğünüzde tutarlı bir düzen görüyorsunuz — rastgele kazanç/kayıplar değil, tekrarlanabilir bir süreç.",
        ],
      },
      {
        heading: "Geçişi yumuşatmanın pratik yolu",
        paragraphs: [
          "Doğrudan normal boyutta işlem yapmak yerine, gerçek hesaba çok küçük bir pozisyon büyüklüğüyle başlamak (örneğin planladığınızın onda biri) makul bir ara adımdır. Bu, gerçek para riskinin psikolojik etkisini yaşarken, potansiyel kaybı sınırlı tutar. Zamanla, sonuçlar demo performansınızla tutarlı kaldıkça, pozisyon büyüklüğü kademeli olarak artırılabilir.",
          "Bir broker seçerken, düşük minimum yatırım tutarı sunan hesap tiplerinin bu kademeli geçiş için özellikle uygun olduğunu unutmayın — bu kriterleri broker karşılaştırma sayfamızda daha detaylı inceleyebilirsiniz.",
        ],
      },
      {
        heading: "Gerçekçi beklenti kurmak",
        paragraphs: [
          "Demo hesapta elde edilen sonuçlar, gerçek hesapta bire bir tekrarlanacağının garantisi değildir — ne yönde olursa olsun. Amaç, mükemmel bir tahmin değil, gerçek para riskiyle karşılaştığınızda kendi davranışınızı gözlemlemek ve gerektiğinde ayarlamaktır.",
        ],
      },
    ],
  },
  {
    slug: "swap-gecelik-faiz-nedir",
    title: "Swap (Gecelik Faiz) Nedir? Maliyetlerinizi Nasıl Azaltırsınız?",
    excerpt:
      "Pozisyonunuzu gece boyunca açık tutmanın gizli bir maliyeti var: swap. Nasıl hesaplandığını ve stratejinize göre nasıl yönetileceğini anlatıyoruz.",
    publishedAt: "2026-08-05",
    readingMinutes: 5,
    sections: [
      {
        paragraphs: [
          "Spread ve komisyon, forex maliyetleri konuşulduğunda akla ilk gelenlerdir — ama pozisyonunuzu bir günden fazla açık tutan yatırımcılar için swap (gecelik faiz) da hesaba katılması gereken, sık gözden kaçan bir maliyet kalemidir.",
        ],
      },
      {
        heading: "Swap nedir, neden var?",
        paragraphs: [
          "Forex'te her işlem, aslında bir para birimini alıp diğerini satmaktır. İki para biriminin faiz oranları arasındaki farktan dolayı, pozisyonunuzu gece yarısını (broker'ın belirlediği kesim saatini) geçirecek şekilde açık tutarsanız, bu faiz farkı hesabınıza yansıtılır — pozitif (kazanç) veya negatif (maliyet) olarak.",
          "Örneğin faiz oranı düşük bir para birimini alıp faiz oranı yüksek bir para birimini satıyorsanız, genellikle negatif swap ödersiniz; tam tersi durumda pozitif swap kazanabilirsiniz. Bu, parite ve pozisyon yönüne (long/short) göre değişir.",
        ],
      },
      {
        heading: "Swap kimin için önemli, kimin için değil?",
        paragraphs: [
          "Gün içi (intraday) işlem yapıp pozisyonları kesim saatinden önce kapatan yatırımcılar için swap neredeyse hiç önemli değildir. Ama pozisyonları günler, haftalar hatta aylar boyunca taşıyan (swing veya pozisyon trading) yatırımcılar için swap, toplam maliyetin/kazancın önemli bir parçası haline gelebilir — özellikle yüksek faiz farkı olan paritelerde.",
        ],
      },
      {
        heading: "Swap'ı nasıl kontrol edebilirsiniz?",
        paragraphs: [],
        list: [
          "Pozisyon açmadan önce brokerinizin swap tablosuna bakın — swap oranları paritenin yönüne göre farklıdır ve broker'dan brokera değişir.",
          "Uzun vadeli bir pozisyon planlıyorsanız, swap'ın toplam maliyete etkisini önceden hesaba katın; küçük görünen günlük bir oran, haftalar boyunca birikebilir.",
          "İslami/faizsiz hesap seçeneği sunan brokerlar, swap yerine sabit bir idari ücret uygulayabilir — dini gerekçelerle faiz içeren işlemlerden kaçınmak isteyen yatırımcılar için bu seçeneği kontrol etmek faydalıdır.",
          "Çarşamba günleri swap genellikle 3 katına çıkar (hafta sonu tatilinin telafisi olarak) — bu günü pozisyon taşıma maliyetinizi hesaplarken unutmayın.",
        ],
      },
    ],
  },
  {
    slug: "kendi-ai-piyasa-takip-sisteminizi-kurun",
    title: "Kendi AI Destekli Piyasa Takip Sisteminizi Nasıl Kurarsınız?",
    excerpt:
      "Bloomberg terminali yıllık binlerce dolar tutar. Ücretsiz araçları ve bir yapay zeka asistanını doğru şekilde birleştirerek kendi izleme, haber filtreleme ve risk disiplini sisteminizi nasıl kurabileceğinizi anlatıyoruz.",
    publishedAt: "2026-08-11",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Profesyonel bir Bloomberg terminali yılda on binlerce dolara mal olabilir. Ama çoğu bireysel yatırımcının ihtiyacı olan şey aslında o kadar karmaşık değil: güvenilir bir izleme listesi, gelen haberi anlamlandıracak bir filtre, ve kendi kurallarına sadık kalmasını sağlayacak bir disiplin. Bunların üçü de — doğru kurgulandığında — ücretsiz araçlar ve bir yapay zeka asistanıyla kurulabilir.",
          "Burada anlatılanlar bir yatırım tavsiyesi değil; kendi karar verme sürecinizi daha düzenli hale getirecek bir sistem kurma yöntemidir. Yapay zeka size ne alıp satacağınızı söylemez — siz kararı verirsiniz, o yalnızca elinizdeki veriyi düzenler ve kendi kurallarınızı size hatırlatır.",
        ],
      },
      {
        heading: "1. İzleme panonuzu kurun",
        paragraphs: [
          "İlk katman, piyasanın genel nabzını görebileceğiniz basit bir kurulumdur. Bunun için karmaşık bir yazılıma gerek yok:",
        ],
        list: [
          "Grafik ve endeksler için ücretsiz bir grafik platformu — ana endeksleri ve kendi izleme listenizi buradan takip edebilirsiniz.",
          "Sektör ve hisse hareketleri için bir tarayıcı/heatmap aracı — günün kazanan ve kaybedenlerini hızlıca görmenizi sağlar.",
          "Haber akışı için broker'ınızın haber sekmesi veya güvendiğiniz birkaç kaynağın RSS akışı — sadece kendi takip ettiğiniz enstrümanlarla ilgili başlıklar.",
          "Ekonomik takvim — merkez bankası kararları, enflasyon ve istihdam verileri gibi piyasayı gerçekten hareket ettiren tarihleri önceden görmek için. FXPARTNER'ın kendi ekonomik takvim sayfası bu amaçla kullanılabilir.",
        ],
      },
      {
        heading: "2. Haberi analiz etmeden işlem yapmayın",
        paragraphs: [
          "Bir haberi ilk gören siz olmayacaksınız — algoritmalar milisaniyeler içinde tepki veriyor. Sizin avantajınız hızda değil, haberi daha iyi anlamakta olabilir. Yeni bir başlıkla karşılaştığınızda kendinize dört soru sormak, tepkisel işlemlerin çoğunu önler:",
        ],
        list: [
          "Bu gerçekten yeni bir bilgi mi, yoksa daha önce bilinen bir haberin tekrarı mı?",
          "Haberin fiyatı etkileme mekanizması nedir — geliri mi, maliyeti mi, yoksa genel risk iştahını mı etkiliyor?",
          "Fiyat hareketinin büyüklüğü, haberin önemiyle orantılı mı, yoksa aşırı bir tepki mi?",
          "Bu haberden ikincil olarak kim etkilenir? (İlk tepki genellikle ilgili enstrümanda anında gerçekleşir; tedarikçiler, rakipler ve müşteriler biraz daha yavaş fiyatlanır.)",
        ],
      },
      {
        heading: "3. İzleme listenizi disiplinli tutun",
        paragraphs: [
          "40 enstrümanlık bir izleme listesi, pratikte 0 enstrümanlık bir izleme listesiyle aynı işi görür — hiçbirine gerçekten odaklanamazsınız. Listenizi üç kademeye ayırmak işe yarar:",
        ],
        list: [
          "Aktif (3-5 enstrüman): Şu anda net bir tetikleyici seviyesi yazılı olan, gerçekten takip ettiğiniz kurulumlar.",
          "Gelişmekte olan (yaklaşık 10): İlginç ama henüz bir koşulu tetiklememiş isimler (\"X seviyesini tutarsa değerlendiririm\" gibi).",
          "Evren (yaklaşık 25): Anladığınız ve doğru fiyattan işlem yapabileceğiniz, ama şu an aktif olarak izlemediğiniz isimler.",
        ],
      },
      {
        heading: "4. Yapay zeka asistanını doğru rolde kullanın",
        paragraphs: [
          "Burada en kritik nokta, yapay zekanın rolünü doğru tanımlamaktır: analist, sizsiniz karar verici. Bir yapay zeka asistanına yaptırabileceğiniz işler somuttur — kendi verdiğiniz veriyi düzenlemek, kendi yazdığınız kuralları size hatırlatmak, kendi geçmiş işlemlerinizdeki örüntüleri bulmak. Yapamayacağı (ve yapmaması gereken) şey ise fiyat tahmini yapmak veya \"al/sat\" demektir.",
          "Pratikte işe yarayan birkaç kullanım alanı: günün başında elinizdeki verileri (endeks vadelileri, izleme listenizdeki hareketler, günün takvimi) özetleyip size kısa bir durum raporu çıkarmasını istemek; bir haberi yukarıdaki dört soru filtresinden geçirmesini istemek; kapanan işlemlerinizin dökümünü verip hangi kurulumların gerçekten işe yaradığını, hangilerinde sürekli aynı hatayı tekrarladığınızı sormak.",
          "FXPARTNER'ın kendi AI Market Assistant'ı da benzer bir mantıkla çalışır — piyasa senaryolarını ve strateji sorularınızı yanıtlar, ama size hangi brokerde hangi pozisyonu açmanız gerektiğini söylemez. Onu kendi araştırmanızı hızlandıran bir araç olarak görün, kararı veren bir otorite olarak değil.",
        ],
      },
      {
        heading: "5. Risk kurallarınızı yazılı hale getirin",
        paragraphs: [
          "Sistemin en çok göz ardı edilen parçası budur, ama en önemlisidir. Yazılı olmayan bir risk kuralı, piyasa geriliminde neredeyse her zaman esnetilir. Kağıda (veya bir not dosyasına) dökülmesi gereken birkaç temel kural:",
        ],
        list: [
          "İşlem başına maksimum risk yüzdesi — pozisyon büyüklüğünü her zaman stop mesafesinden hesaplayın.",
          "Aynı anda açık pozisyon sayısı için bir üst sınır, özellikle yeni öğreniyorsanız.",
          "Günlük kayıp limiti (\"circuit breaker\") — bu limite ulaştığınızda gün için işlemi bırakma kuralı.",
          "Her pozisyon için işlemi açmadan önce yazılan bir geçersizlik koşulu: \"Şu seviyeyi kaybedersem yanılmışım demektir.\"",
          "Yeni bir strateji için gerçek parayla başlamadan önce demo hesapta yeterli sayıda işlem test etme kuralı.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "Böyle bir sistem kurmak sizi kârlı bir yatırımcı yapmaz — hiçbir sistem bunu garanti edemez. Yaptığı şey, kararlarınızı daha az dürtüsel ve daha izlenebilir hale getirmektir: hangi kuralın hangi sinyali ürettiğini, o sinyale göre ne yaptığınızı ve sonucun ne olduğunu geriye dönüp görebilmenizdir. Yeni kurduğunuz her kuralı gerçek parayla değil, önce demo hesapta test edin; hiçbir sistem kâr garantisi vermez ve burada anlatılanlar yatırım tavsiyesi değildir.",
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
