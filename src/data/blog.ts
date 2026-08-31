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
  // A genuine language signal for crawlers/screen readers/translate
  // tooling — used to set <main lang="..."> on the post page, since the
  // rest of the site (and the <html> default) is English. Omit for
  // English posts; every Turkish-language post below must set "tr", or
  // it renders inside lang="en" and misrepresents its actual language to
  // search/AI crawlers (see src/app/piyasa-analizi/page.tsx for the same
  // pattern applied site-wide).
  lang?: "tr" | "en";
  // Pins the ad slot above the article to one broker instead of letting
  // getSponsoredBroker() hash the slug into the sponsor pool. Rotation is
  // fine for general guides, but a post written about one broker's campaign
  // must not open with a competitor's banner — set this on any post that
  // names a broker in its title or argues for a specific broker's product.
  // Unknown slugs fall back to the normal rotation.
  adBrokerSlug?: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    // Second signed piece on the site, and the same rule applies as on the
    // TIO one: this is one trader's opinion, not a checked figure, and the
    // reader has to be able to tell which is which. Signed by Nilüfer
    // Altundağ, spelled as the cover art spells it — the article and the
    // picture at the top of it have to agree on the writer's name. Everything attributed to
    // LiteFinance below is what their own ECN account page states — cited
    // once, in prose, rather than after every sentence.
    //
    // The source text arrived with a citation marker glued to the end of
    // almost every claim, each carrying utm_source=chatgpt.com. Those are
    // stripped: a reader does not need to be told eleven times where one
    // page came from, and shipping a tracking parameter that says the copy
    // was drafted by a chatbot is not something to publish under a byline.
    //
    // Q&A headings are the point of the piece — they are what a
    // question-shaped search actually matches, and they render as h2.
    slug: "fxpartner-nilufer-altundag-roportaj",
    title: "Nilüfer Hoca Anlatıyor: LiteFinance ile Scalping ve ECN Deneyimi",
    excerpt:
      "FXPARTNER'dan profesyonel trader Nilüfer Altundağ'la röportaj: scalping yapan bir trader broker seçerken neye bakmalı, LiteFinance'ın ECN koşulları neden dikkat çekiyor ve \"0.0 spread\" gerçekte ne anlama geliyor.",
    publishedAt: "2026-08-26",
    readingMinutes: 9,
    coverImage: "/blog/nilufer-litefinance.png",
    lang: "tr",
    adBrokerSlug: "lite-finance",
    sections: [
      {
        paragraphs: [
          "Bu yazı bir röportaj. Aşağıdaki görüşler FXPARTNER'dan profesyonel trader Nilüfer Altundağ'a ait; sitedeki broker sayfaları gibi lisans numarasıyla doğrulanabilir bir inceleme değil. LiteFinance'ın hesap koşullarına dair aktarılan bilgiler ise brokerin kendi ECN hesap sayfasındaki güncel beyanlarına dayanıyor — hesap açmadan önce o sayfadan teyit edin, koşullar ülkeye ve döneme göre değişebiliyor.",
          "Forex piyasasında işlem yapan herkesin bir noktada kendine sorduğu bir soru var: benim işlem tarzıma uygun broker hangisi? Özellikle kısa vadeli işlem yapan, scalping stratejileri kullanan ve maliyetleri düşük tutmak isteyen traderlar için spread, emir gerçekleştirme kalitesi ve işlem koşulları çok daha belirleyici hale geliyor.",
        ],
      },
      {
        heading: "Bir trader broker seçerken ilk olarak neye bakmalı?",
        paragraphs: [
          "Benim için tek bir kriter yok. Spread, işlem maliyetleri, emir gerçekleştirme, platform, likidite, stratejilere getirilen kısıtlamalar ve para yönetimi — bunların hepsine birlikte bakmak gerekiyor.",
          "Ama scalping yapan bir trader için spread çok daha önemli. Çünkü scalping mantığında bazen çok küçük fiyat hareketlerinden işlem alınır; dolayısıyla işlem maliyeti stratejinin genel performansını doğrudan etkiler.",
          "LiteFinance tarafında dikkatimi çeken noktalardan biri ECN hesaplardaki düşük değişken spread yapısı. Brokerin kendi ECN sayfasında spreadlerin 0.0 puandan başlayabildiği ve ayrıca lot başına komisyon uygulandığı belirtiliyor.",
        ],
      },
      {
        heading: "LiteFinance neden özellikle scalping yapan traderların ilgisini çekiyor?",
        paragraphs: [
          "Çünkü scalping yapan traderın ihtiyacı farklı. Ben bir işlem açtığımda \"bu pozisyonu mutlaka birkaç saat taşımalıyım\" düşüncesinde değilim. Bazen birkaç dakikada kapatırım, bazen piyasanın verdiği fırsata göre daha uzun beklerim.",
          "Burada benim için önemli olan, stratejimin broker tarafından gereksiz şekilde sınırlandırılmaması. LiteFinance'ın ECN hesabında scalping ve haber işlemlerine izin verildiği, işlemlerin sınırsız süreyle açık tutulabildiği belirtiliyor. Bu bir özgürlük; çünkü işlem süresini stratejinin kendisi belirlemeli.",
        ],
      },
      {
        heading: "\"Sınırsız işlem süresi\" tam olarak ne demek?",
        paragraphs: [
          "Bir traderın açtığı pozisyonu, sırf kısa sürede açıp kapattığı için broker tarafından bir süre kısıtlamasına tabi tutulmaması demek.",
          "Scalping yapan biri için işlem bazen 30 saniye, bazen 3 dakika, bazen 15 dakika sürer. Başka bir trader aynı pozisyonu birkaç saat taşıyabilir. Önemli olan kararı stratejinin vermesi — brokerin kuralının değil.",
        ],
      },
      {
        heading: "Spread neden bu kadar önemli?",
        paragraphs: [
          "Çünkü spread, traderın işlem maliyetlerinden biri. Gün içinde çok sayıda pozisyon açıp kapatan bir scalper için bu maliyet zaman içinde ciddi bir fark oluşturur.",
          "Bu yüzden scalping yapan traderlara sadece \"spread kaç?\" diye sormayın diyorum. Şunlara birlikte bakın:",
        ],
        list: [
          "Spread yapısı nasıl — sabit mi, değişken mi?",
          "Komisyon var mı, varsa lot başına ne kadar?",
          "Emir gerçekleştirme nasıl?",
          "İşlem stratejiniz destekleniyor mu?",
          "Haber saatlerinde işlem koşulları nasıl değişiyor?",
          "Pozisyonu istediğiniz süre taşıyabiliyor musunuz?",
        ],
      },
      {
        heading: "LiteFinance ile sadece scalping mi yapılır?",
        paragraphs: [
          "Hayır, ve bu önemli. Bir brokerı tek bir strateji üzerinden değerlendirmemek gerekiyor. Piyasada scalping de var, day trading de, swing de, daha uzun vadeli yaklaşımlar da.",
          "Benim LiteFinance tarafında öne çıkardığım nokta, ECN altyapısının düşük spread isteyen traderlara hitap etmesi. Bugün scalping yaparsınız, yarın intraday işlem yaparsınız, başka bir dönemde swing stratejisine geçersiniz. Önemli olan seçtiğiniz hesabın o anki işlem tarzınıza uygun olması.",
        ],
      },
      {
        heading: "\"0.0 spread\" gerçekten sıfır maliyet mi?",
        paragraphs: [
          "Hayır, ve burada önemli bir ayrım var. LiteFinance'ın ECN sayfasında değişken spreadin 0.0 puandan başlayabildiği belirtiliyor; ama aynı sayfada lot başına komisyon uygulandığı da yazıyor.",
          "\"0.0 spread\" demek işlemin ücretsiz olduğu anlamına gelmez. ECN hesaplarda spreadin yanında komisyonu da hesaba katmak zorundasınız.",
          "Ben traderlara her zaman toplam maliyete bakmalarını öneriyorum: spread + komisyon + olası kayma. Bu hesabı yapmadan sadece \"spread sıfır\" demek doğru bir değerlendirme olmaz.",
        ],
      },
      {
        heading: "Yeni başlayan bir trader LiteFinance'ta scalping yapabilir mi?",
        paragraphs: [
          "Yapabilir, ama yeni başlayan birinin doğrudan gerçek parayla scalping yapmasını önermiyorum. Scalping hızlı karar vermeyi gerektirir ve düşük zaman dilimlerinde fiyat hareketleri çok daha gürültülüdür.",
          "Önce demo hesapta stratejiyi test edin. LiteFinance'ın demo ECN hesabında gerçek piyasa koşullarına yakın fiyatlar, market execution ve scalping desteği bulunduğu belirtiliyor.",
          "Önce sistemi test edin, sonra küçük hacimlerle başlayın, sonra performansınızı ölçün. Hacmi ancak gerçekten disiplinli olduğunuzu gördüğünüzde artırın.",
        ],
      },
      {
        heading: "FXPARTNER burada nerede devreye giriyor?",
        paragraphs: [
          "Biz traderlara sadece \"şu brokerı kullanın\" demek istemiyoruz. Amacımız, traderın o brokerı ve o hesap türünü neden seçtiğini anlaması.",
          "LiteFinance tarafında FXPARTNER üzerinden ilerleyen traderlara özel %20 bonus avantajı sunuyoruz. Ama bonusların hesap türüne, ülkeye ve dönemsel kampanya şartlarına bağlı olabileceğini özellikle belirtmek isterim — kayıt ve yatırım öncesinde güncel koşulları LiteFinance üzerinden kontrol edin.",
        ],
      },
      {
        heading: "Düşük spread mi önemli, bonus mu?",
        paragraphs: [
          "Kesinlikle tek başına bonus değil. Bonus \"risksiz kazanç\" anlamına gelmez; forex ve CFD işlemlerinde risk her zaman vardır.",
          "Ben bir trader olarak önce işlem koşullarına bakarım. Scalping yapan biri için düşük spread ve işlem maliyetleri çok daha belirleyicidir. Bonusu bunun üzerine gelen ek bir avantaj olarak değerlendiririm.",
          "Sıralama benim için net: önce altyapı, sonra işlem koşulları, sonra maliyetler. Bonus en sonda gelir.",
        ],
      },
      {
        heading: "LiteFinance deneyiminizi tek cümleyle özetlerseniz?",
        paragraphs: [
          "\"Traderın stratejisine müdahale etmeyen, düşük spread odaklı ECN koşulları ve scalping özgürlüğü sunan bir broker alternatifi arıyorsanız, LiteFinance inceleme listenizde olmalı.\"",
          "Kısa vadeli işlem yapan traderlar için düşük spreadin ne kadar önemli olduğunu bilen biri olarak LiteFinance'ın ECN tarafını bu yüzden değerli buluyorum.",
        ],
      },
      {
        heading: "LiteFinance ECN hesabı: öne çıkan koşullar",
        paragraphs: [
          "Brokerin kendi ECN hesap sayfasında belirtilen başlıklar şunlar. Hepsi LiteFinance'ın beyanıdır ve değişebilir; işlem öncesinde teyit edin.",
        ],
        list: [
          "0.0 puandan başlayabilen değişken spread, ayrıca lot başına komisyon",
          "Scalping ve haber işlemlerine izin",
          "İşlemlerde sınırsız süre",
          "Market execution",
          "MT4, MT5 ve cTrader desteği",
          "Minimum depozito 50 USD, minimum işlem hacmi 0.01 lot",
          "FXPARTNER üzerinden başvuranlara özel %20 bonus avantajı (kampanya şartlarına tabi)",
        ],
      },
      {
        heading: "Nilüfer Hoca'dan son bir not",
        paragraphs: [
          "Yıllardır piyasada şunu görüyorum: traderların büyük bölümü strateji arıyor, yeni indikatör arıyor, yeni sinyal arıyor. Ama bazen çok daha temel bir şeyi gözden kaçırıyor — işlem yaptığı koşulları.",
          "Spread, komisyon, emir gerçekleştirme ve işlem özgürlüğü; kullandığınız strateji kadar önemli olabilir. Özellikle scalping yapıyorsanız küçük maliyetler zaman içinde büyür.",
          "Bu yüzden broker seçimini sadece \"güvenilir mi?\" sorusuyla sınırlamayın. \"Benim işlem tarzıma uygun mu?\" diye sorun.",
          "— Nilüfer Altundağ, FXPARTNER",
        ],
      },
      {
        heading: "Sık sorulan sorular",
        paragraphs: [
          "LiteFinance scalping'e izin veriyor mu? Evet — brokerin güncel ECN hesap bilgilerinde scalping ve haber işlemlerine izin verildiği belirtiliyor.",
          "LiteFinance ECN spread kaç? ECN sayfasında değişken spreadlerin 0.0 puandan başlayabildiği belirtiliyor; ayrıca lot başına işlem komisyonu uygulanıyor.",
          "İşlemler ne kadar süre açık kalabilir? ECN hesabın güncel koşullarında işlem süresi için sınırsız süre belirtiliyor.",
          "LiteFinance'ta MT5 kullanılabilir mi? ECN hesabı için MT4, MT5 ve cTrader listeleniyor.",
          "Minimum yatırım ne kadar? ECN hesap bilgilerinde minimum depozito 50 USD olarak belirtiliyor; hesap türüne ve güncel koşullara göre değişebilir.",
          "FXPARTNER ile %20 bonus var mı? FXPARTNER üzerinden sunulan kampanya kapsamında %20 bonus avantajı bulunuyor. Şartlar ve uygunluk koşulları değişebileceğinden kayıt ve yatırım öncesinde güncel şartları kontrol edin.",
          "LiteFinance güvenilir mi? Bir brokerı değerlendirirken marka bilinirliği tek başına yeterli değil. Şirketin güncel hukuki yapısını, faaliyet gösterdiği kuruluşları, düzenleyici bilgilerini, ücretlerini ve risk açıklamalarını kendi ülkeniz açısından ayrıca inceleyin.",
        ],
      },
      {
        heading: "Risk uyarısı",
        paragraphs: [
          "Forex ve CFD işlemleri yüksek risk içerir ve yatırılan sermayenin tamamının kaybedilmesi mümkündür. Kaldıraç, kazanç kadar kayıpları da büyütür. Buradaki bilgiler yatırım tavsiyesi değildir; FXPARTNER bir aracı kurum değildir ve yatırım hizmeti sunmaz.",
          "Bonuslar, spreadler, komisyonlar, hesap türleri ve kampanya koşulları zaman içinde veya ülkeye göre değişebilir. İşlem öncesinde LiteFinance'ın güncel resmî koşullarını kontrol edin.",
        ],
      },
    ],
  },
  {
    // A signed, first-person piece, and the only kind of content on this site
    // that is one person's experience rather than a checked figure. That
    // difference has to be visible from the title down, or it borrows the
    // authority of the broker pages — which carry licence numbers a reader
    // can verify — for observations that nobody can verify but me. Hence the
    // byline in the title, the first paragraph saying plainly what this is,
    // and the closing section handing the reader back to the reviewed entry.
    //
    // adBrokerSlug pins the slot to TIO: a post arguing for one broker must
    // not open with a competitor's banner.
    slug: "tio-markets-trader-notlari",
    title: "TIO Markets'te Altı Ay: Bir Trader'ın Notları — Erdem Torun",
    excerpt:
      "FXPARTNER'ın kurucusu Erdem Torun'un kendi hesabından TIO Markets izlenimleri: panel, kripto çekim hızı, spread davranışı ve sınırsız kaldıracın gerçekte ne anlama geldiği.",
    publishedAt: "2026-08-25",
    readingMinutes: 6,
    lang: "tr",
    adBrokerSlug: "tio-markets",
    sections: [
      {
        paragraphs: [
          "Bu yazı bir inceleme değil, bir kullanım notu. Sitedeki broker sayfaları lisans numaralarıyla, doğrulanabilir rakamlarla yazılır; burada anlattıklarım ise kendi hesabımda gördüklerim. İkisini karıştırmayın: aşağıdakiler benim deneyimim, sizinki farklı olabilir.",
          "TIO Markets'i bir süredir kullanıyorum ve genel izlenimim olumlu. Neyi neden beğendiğimi, bir de hesap açmadan önce mutlaka bilmeniz gerekeni yazayım.",
        ],
      },
      {
        heading: "Panel, işini görüyor",
        paragraphs: [
          "Yatırımcı paneli bu işte çoğu kişinin küçümsediği ama günlük olarak en çok temas ettiği yer. TIO'nunki sade ve hızlı: para yatırma, çekme, hesap geçişi ve doküman yükleme birkaç tıkla bitiyor. Menülerde kaybolmuyorsunuz, işlem geçmişi anlaşılır duruyor.",
          "Bunu ayrıca yazma sebebim şu: sektörde paneli hâlâ 2010'lardan kalma, çekim talebini üç ayrı sayfaya bölen kurumlar var. Modern bir panel lüks değil, kurumun yazılım tarafına bakıp bakmadığının göstergesi.",
        ],
      },
      {
        heading: "Kripto ile çekim dakikalar sürüyor",
        paragraphs: [
          "Benim için en belirleyici tarafı bu oldu. Kripto ile yaptığım yatırma ve çekme işlemleri dakikalar içinde tamamlandı. Talebi giriyorsunuz, işlem geçiyor.",
          "Para çekme hızı bir brokerde ölçebileceğiniz en dürüst metriktir; çünkü pazarlama yapılamaz, ya olur ya olmaz. Bir kurumu değerlendirirken spreadden önce buraya bakarım.",
          "Banka ve kart tarafındaki süreler için aynı şeyi söyleyemem — orada aracı bankalar devreye giriyor ve deneyimim kripto kadar net değil. O yüzden o tarafa dair bir süre vermiyorum.",
        ],
      },
      {
        heading: "Spreadler veri saatlerinde saçmalamıyor",
        paragraphs: [
          "Normal piyasa koşullarında spreadlerin makul olması beklenen bir şey. Asıl test, önemli veri açıklamalarında ne olduğu: tarım dışı istihdam, faiz kararı, enflasyon verisi. Bazı kurumlarda spread o dakikalarda öyle açılır ki stopunuz sizi piyasa hareket etmeden vurur.",
          "TIO'da veri saatlerinde tabii ki genişleme oluyor — bu her yerde olur, likidite çekilir. Ama absürt bir açılma görmedim. Bu, haber saatlerinde pozisyon taşıyorsanız somut bir fark demektir.",
        ],
      },
      {
        heading: "Sınırsız kaldıraç: ne olduğunu bilerek kullanın",
        paragraphs: [
          "TIO'nun Standard hesabında sınırsız kaldıraç var. Sektörde az rastlanan bir imkân ve bunu bir artı olarak yazıyorum — ama ne olduğunu net söylemeden yazmam.",
          "Sınırsız kaldıraç, teminat gereksinimini pratikte ortadan kaldırır. Yani pozisyon büyüklüğünüzü sınırlayan doğal fren kalkar. Kârı büyüttüğü kadar zararı da büyütür; küçük bir hesapta tek bir ters hareket bakiyeyi sıfırlayabilir.",
          "Ben bunu pozisyon büyüklüğünü artırmak için değil, aynı pozisyonu daha az teminat bloke ederek taşımak için kullanışlı buluyorum. Aradaki fark her şeydir. Kaldıraç bir imkândır, bir strateji değildir — pozisyon büyüklüğünü kaldıracın izin verdiğine göre değil, kaybetmeyi göze alabileceğiniz tutara göre belirleyin.",
          "Not: sınırsız kaldıraç yalnızca Standard hesapta geçerli. Nano, Raw ve VIP Black hesaplarında üst sınır 1:500.",
        ],
      },
      {
        heading: "Hesap açmadan önce bilmeniz gereken",
        paragraphs: [
          "Burada tonu değiştirmeden ama açıkça söylemem gereken bir şey var, çünkü yazının başında \"benim deneyimim\" dedim ve bu kısım deneyim değil, yapısal bir gerçek.",
          "TIO Markets üç ayrı şirket üzerinden çalışıyor: İngiltere'de FCA lisanslı TIO Markets UK Ltd, Kıbrıs'ta CySEC lisanslı TIO Markets CY Ltd ve Komorlar'da MISA lisanslı TIO Markets Ltd. Türkiye hem Birleşik Krallık hem Avrupa Ekonomik Alanı dışında olduğu için buradan açtığınız hesap üçüncüsüne bağlanır.",
          "Pratikte anlamı şu: FCA'in FSCS koruması ve CySEC'in tazmin fonu sizin hesabınız için devreye girmez. Bu TIO'ya özgü bir durum değil — listedeki uluslararası brokerların neredeyse tamamı aynı yapıyla çalışıyor. Ama bilmek ile bilmemek arasında fark var, ve sözleşmeyi imzalarken hangi şirketle imzaladığınızı görmek sizin hakkınız.",
          "Bir de şu: FCA, TIO adını taklit eden tiomarkets-trading.com ve tiopremarkets.com adreslerini klon firma uyarısı olarak yayınladı. Bunlar TIO'nun kendi siteleri değil. Hesap açarken adresi kontrol edin.",
        ],
      },
      {
        heading: "Özetle",
        paragraphs: [
          "TIO Markets temiz çalışan bir kurum. Panel modern, kripto çekim gerçekten hızlı, spreadler veri saatlerinde kontrolden çıkmıyor ve global bir firmadan beklenen özelliklerin çoğu yerinde. Küçük sermayeyle MT4/MT5 üzerinde başlamak isteyen biri için makul bir tercih.",
          "Karşılığında bilerek kabul ettiğiniz şey, hesabınızın offshore tarafa bağlı olması. Bu takas size uygunsa sorun yok; uygun değilse tier-1 lisanslı bir alternatif aramanız gerekir.",
          "Lisans numaraları, hesap türleri ve puanlamanın tamamı için TIO Markets inceleme sayfasına bakabilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-forex-broker",
    coverImage: "/blog/how-to-choose-a-forex-broker-cover.png",
    title: "2026'da Forex Brokerı Nasıl Seçilir: Eksiksiz Rehber",
    excerpt:
      "Regülasyon, maliyet yapısı, platform kalitesi ve para çekme güvenilirliği — bir dolar bile yatırmadan önce herhangi bir forex brokerını değerlendirmek için pratik, adım adım bir çerçeve.",
    publishedAt: "2026-07-21",
    readingMinutes: 11,
    lang: "tr",
    sections: [
      {
        paragraphs: [
          "Her forex brokerının ana sayfası aşağı yukarı aynı şeyi söyler: dar spreadler, hızlı emir gerçekleştirme, ödüllü platformlar. Bu da brokerları sadece pazarlama metniyle karşılaştırmayı zorlaştırır. İyi haber şu ki, bir brokerın paranıza güvenilip güvenilemeyeceğini gerçekten belirleyen şeyler kontrol edilebilir — regülasyon, maliyet yapısı, platform kalitesi ve brokerın para çekme talebinde nasıl davrandığı. Bu rehber, bunların her birini gerçekte kontrol edeceğimiz sırayla ele alıyor.",
          "Bu bir yatırım tavsiyesi değildir ve burada hiçbir şey size hangi belirli brokerı seçmeniz gerektiğini söylemez. Herhangi bir brokera uygulayabileceğiniz bir çerçevedir — dört kriter, kendi sıralamalarımızda her brokerı nasıl puanladığımızla doğrudan örtüşür, yani bu rehberi sadece bize güvenmek için değil, rakamlarımızı kendiniz kontrol etmek için de kullanabilirsiniz.",
        ],
      },
      {
        heading: "1. Spreadlerle değil, regülasyonla başlayın",
        paragraphs: [
          "Regülasyon en önemli filtredir, çünkü bir şeyler ters gittiğinde ne olacağını belirler — volatil bir hareket sırasında platform kesintisi, gerçekleşen bir fiyatla ilgili anlaşmazlık veya en kötü durumda brokerın kendisinin finansal sıkıntıya girmesi.",
          "Tüm regülatörler aynı korumayı sunmaz. Tier-1 regülatörler — İngiltere'nin FCA'sı, Avustralya'nın ASIC'i, Kıbrıs'ın CySEC'i (bir AB regülatörü) ve birkaç diğeri — brokerların müşteri fonlarını şirket fonlarından ayrı tutmasını, minimum sermaye rezervi taşımasını ve bazı ülkelerde broker iflas ederse müşterilere geri ödeme yapan bir tazminat şemasına katılmasını şart koşar. Offshore regülatörlerin de (yaygın ülkeler arasında Mauritius, Seyşeller, Belize ve BVI sayılabilir) gerçek lisanslama süreçleri vardır, ancak sermaye şartları ve denetim genellikle daha hafiftir ve arkalarında genelde bir yatırımcı tazminat şeması bulunmaz.",
          "Bu, offshore regüleli bir brokerın otomatik olarak dolandırıcı olduğu anlamına gelmez — pek çoğu yıllarca dürüstçe faaliyet gösterir. Anlamı, altınızdaki regülasyon güvenlik ağının daha ince olduğu, dolayısıyla sorunların (yavaş bir para çekme, tartışmalı bir işlem) bir regülatörün müdahale edeceği bir şey yerine sizin tek başınıza çözmeniz gereken bir soruna dönüşme ihtimalinin daha yüksek olduğudur.",
        ],
        list: [
          "Bir brokerın kaç regülatör altında lisans taşıdığını ve hangi ülkelerde olduğunu kontrol edin — bir Tier-1 lisans, sıfır lisanstan anlamlı ölçüde farklıdır.",
          "Kendi ülkenizin yetki alanında (veya bir Tier-1 ülkede) regüle olan bir broker, bir şeyler ters giderse size gerçekçi bir şikayet yolu sağlar.",
          "Birden fazla offshore lisans ve sıfır Tier-1 kapsamı, tek başına diskalifiye eden bir durum değil ama dikkatle tartılması gereken bir örüntüdür — aşağıdaki diğer üç kontrolle birlikte değerlendirin.",
        ],
      },
      {
        heading: "2. Sadece reklamdaki spreadi değil, işlemin gerçek maliyetini hesaplayın",
        paragraphs: [
          "\"Düşük spread\" bu sektördeki en yaygın pazarlama iddiasıdır ve aynı zamanda yanıltıcı şekilde sunulması en kolay olanıdır. Raw/ECN hesabında 0.0 pip EUR/USD spread reklamı yapan bir broker, neredeyse her zaman lot başına ayrı bir komisyon alır — toplam maliyet, daha geniş spreadli ve komisyonsuz bir \"standart\" hesaptan daha yüksek olabilir. Hesapları dürüstçe karşılaştırmak için spread ve komisyonu toplamanız gerekir.",
          "Spread ve komisyonun ötesinde şunları kontrol edin: pozisyonları günlük kesim saatinden sonra tutarsanız gecelik swap/rollover oranları, bir süre işlem yapmazsanız hareketsizlik ücretleri ve varsa yatırma veya çekme ücretleri (saygın brokerların çoğu bunları almaz, bu da başlı başına faydalı bir sinyaldir).",
          "Minimum yatırım tutarı maliyet açısından değil, riski düzgün yönetmek için ne kadar alanınız olduğu açısından önemlidir. 5 dolarlık bir minimum yatırım cazip görünür, ancak pozisyon büyüklüğüne göre çok az sermayeyle işlem yapmak, yeni yatırımcıların hesabının sıfırlanmasının en yaygın yollarından biridir — bu genelde brokerın suçu değildir, ama sadece aşırı kaldıraçlı mikro hesaplara uygun ürünler sunan bir broker de size iyilik yapmıyor demektir.",
        ],
      },
      {
        heading: "3. Canlı hesaba para yatırmadan önce platformu test edin",
        paragraphs: [
          "MetaTrader 4 ve MetaTrader 5, broker bağımsız olmaları nedeniyle en yaygın kullanılan perakende platformlar olmaya devam ediyor — broker değiştirseniz bile grafik ayarlarınız, indikatörleriniz ve uzman danışmanlarınız (EA) sizinle taşınır. cTrader, bazı ECN odaklı brokerların tercih ettiği yaygın bir ikinci seçenektir. Pek çok broker da bunların üzerine kendi web veya mobil platformunu inşa eder; bu daha cilalı olabilir ama iş akışınızı o tek brokera bağlar.",
          "Bir platformu gerçekten değerlendirmenin tek yolu bir demo hesap açıp kullanmaktır: normal ve volatil koşullarda emir gerçekleştirme hızını, tek tıkla işlem ve zarar durdur yerleştirmenin güvenilir hissedip hissetmediğini, grafik ve indikatör setinin stratejinizin ihtiyacını karşılayıp karşılamadığını kontrol edin. Bir brokerın platformu her işlem gününde etkileşime gireceğiniz bir şeydir — gerçek para yatırmadan önce denemek için harcayacağınız yirmi dakikaya değer.",
        ],
      },
      {
        heading: "4. Para çekme hızı, bir brokerın size verdiği en dürüst sinyaldir",
        paragraphs: [
          "Yatırımlar her zaman hızlıdır — her broker paranızın hızlıca gelmesini ister. Gerçek sınav para çekmede yaşanır, çünkü nakit akışı sorunu olan veya para çekmeyi caydırmayı amaçlayan bir broker, süreci yavaşlatır, beklenmedik doğrulama engelleri ekler veya süreci küçük yazılarda gizler.",
          "Tahmin etmenize gerek yok. Bağımsız inceleme siteleri gerçek kullanıcı raporları toplar ve tekrarlayan para çekme şikayetleri, bir brokerın sahip olabileceği en net kırmızı bayraklardan biridir — bir pazarlama sayfasının size söyleyebileceğinden çok daha netdir. İncelemediğimiz bir brokerı değerlendiriyorsanız, önce kendi Broker Sorgulama aracımızda arayın, ardından canlı bir hesaba para yatırmadan önce adını bağımsız bir inceleme sitesinde \"para çekme\" ile birlikte kontrol edin.",
          "Bağımsız güven puanları veya şikayet örüntüleri öne çıkan brokerlar için özel bir risk uyarıları sayfası tutmamızın tam nedeni de budur — bu sayfa ayrı bir görüşten değil, aynı inceleme verisinden oluşturulur.",
        ],
      },
      {
        heading: "Bu, FXPARTNER Endeksi'yle nasıl örtüşür",
        paragraphs: [
          "İncelediğimiz her broker, tam olarak bu dört eksende — Regülasyon, Maliyet, Platform ve Para Çekme — 0-10 arası bir puan alır ve bunlar tek bir FXPARTNER Endeksi'nde ortalanır. Regülasyon ekseni doğrudan brokerın taşıdığı lisans sayısı ve seviyesinden hesaplanır; Maliyet ve Platform yukarıdaki kriterlere dayalı editoryal değerlendirmelerdir; Para Çekme, yukarıda bahsedilen aynı kaynaklardan, bağımsız incelemelerdeki doğrulanabilir sinyallerden puanlanır. Olumsuz bir para çekme sinyali olmayan bir broker, o eksende varsayılan bir olumlu puan değil, nötr bir puan alır — bir brokerın lehine tahmin yürütmeyiz.",
          "Her puanın arkasındaki gerekçe dahil tüm dökümü, herhangi bir brokerın inceleme sayfasında görebilirsiniz — çalışmamızı kontrol edebilmeniz için özellikle sadece nihai sayıyı değil, eksen puanlarını da gösteriyoruz.",
        ],
      },
      {
        heading: "Hesap açmadan önce pratik bir kontrol listesi",
        paragraphs: [],
        list: [
          "Kendi ülkenizle ilgili en az bir regülatörü, tercihen Tier-1 seviyesinde olanı doğrulayın.",
          "Reklamı yapılan en ucuz hesap türünü değil, gerçekte kullanacağınız hesap türündeki spread + komisyonu toplayın.",
          "Bir demo hesap açın ve emir gerçekleştirmeyi ve platform uyumunu test etmek için birkaç işlem yapın.",
          "Canlı bir hesaba para yatırmadan önce brokerın adını \"para çekme\" ile birlikte bağımsız bir inceleme sitesinde arayın.",
          "Brokerın gerçek dünyadaki davranışını doğrularken, kaybetmeye tamamen hazır olduğunuz bir miktarla başlayın — bu, iyi regüle brokerlar için bile geçerlidir.",
        ],
      },
      {
        heading: "Buradan sonra nereye bakmalı",
        paragraphs: [
          "Tüm bunların gerçek brokerlara önceden uygulanmış kısa halini istiyorsanız, broker sıralamalarımız sayfası listelenen her brokerı tam olarak bu çerçeveden geçirir ve kategori sayfalarımız brokerları sizin için en önemli olan şeye göre gruplar — düşük spread, yüksek kaldıraç veya en güçlü regülasyon kapsamına sahip brokerlar. Burada listelenmeyen bir brokerı değerlendiriyorsanız, yukarıdaki kontrol listesi tek başına da aynı şekilde işe yarar.",
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
    adBrokerSlug: "xm",
    coverImage: "/blog/xm-review-cover.png",
    title: "XM Hesapları, Ücretleri ve Regülasyonu Açıklandı (2026 Detaylı İnceleme)",
    excerpt:
      "XM'in beş hesap türü, yatırma/çekme hızı, regülasyon lisansları ve eğitim araçlarının tam dökümü — XM'in FXPARTNER Endeksi'nde 1. sırada yer almasının arkasındaki aynı araştırma.",
    publishedAt: "2026-07-27",
    readingMinutes: 9,
    lang: "tr",
    sections: [
      {
        paragraphs: [
          "XM (XM Global), FXPARTNER topluluğunda en çok tercih edilen ve FXPARTNER Endeksi'nde 1. sırada yer alan brokerdir. 2009'da kurulan ve Kıbrıs ile Avustralya'da merkezlere sahip olan şirket, bu konumu gerçekten düşük bir giriş bariyeri — 5 dolarlık minimum yatırım — ile bu fiyat noktasındaki bir broker için alışılmadık derecede kapsamlı bir regülasyon kapsamı ve eğitim programını birleştirerek inşa etti.",
          "Bu inceleme, her hesap seviyesinde tam olarak ne aldığınızı, yatırma ve çekme işlemlerinin gerçekte nasıl çalıştığını ve XM'in kime en uygun olduğunu — daha geniş broker değerlendirme çerçevemizle aynı kriterleri (regülasyon, maliyet, platform, para çekme) kullanarak — ele alıyor, böylece sıralamamızı detaylarla kendiniz karşılaştırabilirsiniz.",
        ],
      },
      {
        heading: "Regülasyon ve fon güvenliği",
        paragraphs: [
          "XM dört regülasyon lisansı taşıyor: ASIC (Avustralya), CySEC (Kıbrıs) ve DFSA (Dubai) müşteri fonlarının ayrılmasını ve minimum sermaye rezervini şart koşan Tier-1 otoritelerdir; FSC (Belize) ise offshore lisansıdır. Bir offshore lisansın yanında üç Tier-1 lisans, bu fiyat aralığındaki brokerların çoğunun sunduğundan daha güçlü bir güvenlik ağıdır.",
          "Hesaplar ayrıca negatif bakiye koruması ile gelir; bu, zarar durdur seviyenizi aşan volatil bir hareket sırasında bile yatırdığınızdan fazlasını kaybedemeyeceğiniz anlamına gelir — regüle brokerlarda standart bir özelliktir, ama herhangi bir hesaba para yatırmadan önce doğrulanmaya değer.",
        ],
      },
      {
        heading: "Hesap türleri ve işlem maliyetleri",
        paragraphs: [
          "XM beş hesap türü sunar ve doğru olanı büyük ölçüde ne kadar işlem yaptığınıza ve spread ile komisyona ne kadar duyarlı olduğunuza bağlıdır:",
        ],
        list: [
          "Micro — 1.0 pipten başlayan spreadler, komisyon yok, 5 dolar minimum yatırım. Mikro lotlarla (1.000 birim) işlem yapılır, bu da henüz öğrenirken pozisyon büyüklüğü ayarlamayı kolaylaştırır.",
          "Standard — Micro ile aynı 1.0 pipten başlayan spread ve komisyonsuz yapı, ancak tam boy lotlarla (100.000 birim). Yine 5 dolar minimum yatırım.",
          "XM Ultra Low — daha aktif işlem için tasarlanmış, 0.6 pipten başlayan spreadler ve ek komisyon yok. 100 dolar minimum yatırım.",
          "Zero — majör paritelerde 0.0 pipten başlayan spreadler, lot başına ve taraf başına 3,50 dolarlık komisyonla dengelenir. Bu hesap, en dar spreadin sabit komisyonsuz bir yapıdan daha önemli olduğu scalper'lar ve yüksek frekanslı stratejiler için uygundur. 100 dolar minimum yatırım.",
          "Shares — yukarıdaki CFD tarzı hesaplardan ayrı olarak, hisse başına komisyonlu ve kaldıraçsız doğrudan hisse senedi işlemi.",
        ],
      },
      {
        heading: "Platformlar",
        paragraphs: [
          "XM, MetaTrader 4 ve MetaTrader 5 üzerinde çalışır — ikisi de broker bağımsızdır, yani başka bir yerde hesap açsanız bile indikatörleriniz, uzman danışmanlarınız ve grafik ayarlarınız sizinle taşınır — ayrıca telefondan işlem yapmak ve hesap yönetmek için kendi XM App'i vardır. MetaTrader'ın ötesinde özel bir masaüstü platformu yoktur, bu da bilinçli bir tercihtir: MT4/MT5, bazı brokerların üzerlerine inşa ettiği daha modern arayüzden ödün vererek, perakende platformlar arasında en büyük üçüncü taraf araç ve EA kütüphanesine sahiptir.",
        ],
      },
      {
        heading: "Yatırma ve çekme işlemleri",
        paragraphs: [
          "Kart veya e-cüzdan (Skrill, Neteller, WebMoney) ile yatırımlar genellikle anında hesaba geçer; banka havaleleri 1-3 iş günü sürer. XM hiçbir yöntemde yatırma ücreti almaz.",
          "Para çekme talepleri genellikle XM tarafında 24 saat içinde işlenir: e-cüzdan ödemeleri çoğu zaman aynı gün ulaşır, kart ve banka çekimleri ise sağlayıcıya bağlı olarak yaklaşık 2-5 iş günü sürer — bu noktadaki gecikme genellikle XM'in değil, bankanın işlem süresidir. XM'den para çekme ücreti alınmaz, ancak kart sağlayıcınız veya e-cüzdan sağlayıcınız kendi ücretini uygulayabilir. Para çekme hızı ve şeffaflığı, tam olarak FXPARTNER Endeksi'nin Para Çekme ekseninde en ağırlıklı değerlendirdiğimiz sinyal türüdür, çünkü bir brokerın pazarlama sayfasının değil gerçek davranışının ortaya çıktığı nokta tam olarak burasıdır.",
        ],
      },
      {
        heading: "Eğitim ve araştırma",
        paragraphs: [
          "XM'in 5 dolarlık minimum yatırımla brokerların çoğundan ayrıldığı nokta burasıdır. Temel mum formasyonlarından daha ileri teknik stratejilere kadar her şeyi kapsayan, birden fazla dilde sunulan günlük canlı webinarlar düzenler, ayrıca Tradepedia ortaklığı üzerinden talep üzerine erişilebilen kayıtlı bir video kütüphanesi sunar. Bünyesindeki analist ekibi de günlük teknik görünümler ve canlı bir ekonomik takvim yayınlar.",
          "XM ayrıca kapalı pozisyonlarda XM Coin kazandıran, beş üyelik seviyesine (Bronz'dan Elite'e) sahip bir sadakat programı olan XM Traders Club'ı işletir — bu, tek seferlik bir kayıt bonusu yerine zaman içindeki işlem hacmini ödüllendiren bir yapıdır.",
        ],
      },
      {
        heading: "XM kimler için en uygun",
        paragraphs: [
          "XM'in 5 dolarlık giriş noktası, komisyonsuz Micro/Standard hesapları ve günlük eğitiminin birleşimi, küçük hacimlerle işlem yaparken öğrenmek isteyen yeni başlayanlar için doğal bir uyum sağlıyor. Zero hesabı da daha aktif yatırımcılara, broker değiştirmek zorunda kalmadan büyümeye hazır olduklarında gerçek bir düşük spread seçeneği sunuyor.",
          "Önceliğiniz hesap minimumlarından bağımsız olarak mutlak en dar ham spread ise, XM'in Zero hesabını sıralamalarımızdaki düşük spread odaklı brokerlarla karşılaştırmaya değer — XM'in gücü mutlaka piyasadaki en düşük maliyete sahip olmak değil, erişilebilirlik ve eğitimin birleşimidir.",
        ],
      },
      {
        heading: "Sonuç",
        paragraphs: [
          "XM, FXPARTNER Endeksi'ndeki 1. sıra konumunu iki Tier-1 regülatörün, 5 dolarlık başlangıç hesabından gerçek bir düşük spread Zero hesabına kadar ölçeklenen beş seviyeli hesap yapısının, sürekli hızlı para çekme işlemesinin ve bu fiyat noktasında rakiplerin çoğunun eşleşemediği bir eğitim programının birleşimiyle kazanıyor.",
          "Herhangi bir brokerda olduğu gibi, canlı bir hesaba para yatırmadan önce güncel spreadleri, ülkeniz için kaldıraç limitlerini ve hesap şartlarını XM'in resmi sitesinde doğrulayın — bu inceleme bir araştırma yardımcısıdır, yatırım tavsiyesi değildir.",
        ],
      },
    ],
  },
  {
    slug: "fomc-faiz-karari-fed-baskani-konusmasi",
    lang: "tr",
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
    coverImage: "/blog/forex-risk-yonetimi-cover.png",
    lang: "tr",
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
    coverImage: "/blog/teknik-analiz-vs-temel-analiz-cover.png",
    lang: "tr",
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
    coverImage: "/blog/kaldirac-leverage-nedir-riskleri-cover.png",
    lang: "tr",
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
    coverImage: "/blog/trading-psikolojisi-duygusal-kararlar-cover.png",
    lang: "tr",
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
    coverImage: "/blog/ecn-vs-market-maker-broker-farki-cover.png",
    lang: "tr",
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
    coverImage: "/blog/ekonomik-takvim-nasil-okunur-cover.png",
    lang: "tr",
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
    coverImage: "/blog/demo-hesaptan-gercek-hesaba-gecis-cover.png",
    lang: "tr",
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
    coverImage: "/blog/swap-gecelik-faiz-nedir-cover.png",
    lang: "tr",
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
    lang: "tr",
    title: "Kendi AI Destekli Piyasa Takip Sisteminizi Nasıl Kurarsınız?",
    excerpt:
      "Bloomberg terminali yıllık binlerce dolar tutar. Ücretsiz araçları ve bir yapay zeka asistanını doğru şekilde birleştirerek kendi izleme, haber filtreleme ve risk disiplini sisteminizi nasıl kurabileceğinizi anlatıyoruz.",
    publishedAt: "2026-08-11",
    readingMinutes: 7,
    coverImage: "/blog/kendi-ai-piyasa-takip-sisteminizi-kurun-cover.png",
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
  {
    slug: "sikayet-orani-dusuk-kaliteli-forex-firmasi",
    coverImage: "/blog/sikayet-orani-dusuk-kaliteli-forex-firmasi-cover.png",
    lang: "tr",
    title: "Şikayet Oranı Düşük, Müşteri Desteği Güçlü ve Kaliteli Forex Firması Hangisi?",
    excerpt:
      "Kaliteli bir forex firmasını pazarlama metninden değil, şikayet geçmişinden ve destek hızından anlarsınız. Bunu nasıl kontrol edeceğinizi ve hangi sinyallere bakmanız gerektiğini anlatıyoruz.",
    publishedAt: "2026-08-12",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: \"şikayet oranı düşük\" iddiasını hiçbir brokerin kendi sitesinden doğrulayamazsınız — bu bilgi bağımsız şikayet kayıtlarından ve gerçek kullanıcı yorumlarından gelir. Kaliteli bir forex firmasını ayıran şey pazarlama dili değil, tekrar eden şikayet örüntüsünün olmaması, destek taleplerine makul sürede dönüş yapılması ve para çekim süreçlerinin şeffaf işlemesidir.",
          "Bu bir yatırım tavsiyesi değildir; hangi kriterlere bakarak kendi araştırmanızı yapabileceğinizi anlatan pratik bir rehberdir.",
        ],
      },
      {
        heading: "Şikayet oranını nasıl kontrol edersiniz?",
        paragraphs: [
          "Bir brokerin \"şikayeti yok\" demesi anlamlı değildir — her büyüklükteki brokerde zaman zaman anlaşmazlık yaşanır. Önemli olan, şikayetlerin türü ve sıklığıdır.",
        ],
        list: [
          "Broker adını bağımsız inceleme sitelerinde \"şikayet\" veya \"withdrawal complaint\" gibi terimlerle arayın — tek bir olumsuz yorum değil, tekrar eden bir örüntü olup olmadığına bakın.",
          "Şikayetlerin konusuna dikkat edin: gecikmeli çekim ve iletişim kopukluğu ile ilgili tekrarlayan şikayetler, tek seferlik teknik bir aksaklıktan çok daha ciddi bir sinyaldir.",
          "FXPARTNER'ın risk uyarıları sayfası, bağımsız güven skorları ve şikayet örüntülerine göre öne çıkan brokerleri listeler — bu tür bir kontrolü tek tek aramak yerine hızlıca yapmak isteyenler için bir başlangıç noktasıdır.",
        ],
      },
      {
        heading: "Müşteri desteğini test etmenin tek gerçek yolu: gerçekten sormak",
        paragraphs: [
          "Bir brokerin \"7/24 destek\" vaadi, gerçek yanıt hızını göstermez. Hesap açmadan önce canlı sohbet veya e-posta üzerinden basit bir soru sorup yanıt süresini ve kalitesini gözlemlemek, sayfadaki iddiadan çok daha güvenilir bir testtir.",
        ],
        list: [
          "Yanıt makul bir sürede (dakikalar, saatler içinde) geliyor mu, yoksa günler mi sürüyor?",
          "Verilen cevap sorunuza gerçekten cevap veriyor mu, yoksa genel bir şablon metin mi?",
          "Destek ekibi, çekim süreleri veya hesap doğrulama gibi somut sorulara net rakamlarla cevap verebiliyor mu?",
        ],
      },
      {
        heading: "Kalite sinyalleri: lisans, şeffaflık, tutarlılık",
        paragraphs: [
          "Şikayet oranı ve destek kalitesi, tek başına yeterli değildir — bunları düzenleyici durumla birlikte değerlendirmek gerekir. Tier-1 bir düzenleyici (FCA, ASIC, CySEC, DFSA gibi) altında faaliyet gösteren bir broker, anlaşmazlık durumunda başvurabileceğiniz bağımsız bir mercii sunar; bu da şikayetlerin havada kalma ihtimalini azaltır.",
          "Ayrıca brokerin kendi sitesinde spread, komisyon ve çekim sürelerini net biçimde yayınlaması da bir şeffaflık sinyalidir — bu bilgileri gizleyen veya sürekli değiştiren bir firma, destek kalitesi ne kadar iyi görünürse görünsün dikkatli değerlendirilmelidir.",
        ],
      },
      {
        heading: "Pratik kontrol listesi",
        paragraphs: [],
        list: [
          "Broker adı + \"şikayet\" aramasını bağımsız bir inceleme sitesinde yapın, tekil değil tekrar eden örüntülere bakın.",
          "Hesap açmadan önce destek ekibine gerçek bir soru sorup yanıt hızını test edin.",
          "Düzenleyici lisansı ve varsa tier'ini kontrol edin — anlaşmazlık durumunda başvurabileceğiniz bir mercii olup olmadığını gösterir.",
          "FXPARTNER'ın broker karşılaştırma sayfasında her firmanın düzenleme, maliyet, platform ve çekim performansına göre ayrı ayrı puanlandığı FXPARTNER Index'e bakın — tek bir genel puan yerine, hangi alanda güçlü hangi alanda zayıf olduğunu görebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "dusuk-spread-hizli-cekim-avantajli-forex-sirketi",
    coverImage: "/blog/dusuk-spread-hizli-cekim-avantajli-forex-sirketi-cover.png",
    lang: "tr",
    title: "Düşük Spread ve Hızlı Çekim Sunan En Avantajlı Forex Şirketi Hangisi?",
    excerpt:
      "Düşük spread reklamı ile gerçek işlem maliyeti aynı şey değildir. Spread ve çekim hızını birlikte, doğru şekilde nasıl karşılaştıracağınızı anlatıyoruz.",
    publishedAt: "2026-08-12",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: \"en avantajlı\" tek bir firma yoktur — spread ve çekim hızı, hesap türüne, yatırdığınız enstrümana ve seçtiğiniz brokerin komisyon yapısına göre değişir. Ama ikisini birlikte doğru karşılaştırmanın net bir yöntemi var, ve bu yöntem reklam metnine değil gerçek sayılara dayanır.",
        ],
      },
      {
        heading: "\"Düşük spread\" reklamının tuzağı",
        paragraphs: [
          "0.0 pip spread vaat eden bir raw/ECN hesap, neredeyse her zaman lot başına ayrı bir komisyon uygular — toplam maliyet, komisyonsuz ama daha geniş spread'li bir standart hesaptan daha yüksek çıkabilir. Gerçek maliyeti görmek için spread ile komisyonu her zaman birlikte toplamanız gerekir.",
          "Ayrıca reklamdaki spread rakamı genellikle \"en düşük\" (from) değeridir — piyasa koşullarına göre gerçek spread bunun oldukça üzerinde seyredebilir, özellikle önemli veri açıklamaları sırasında.",
        ],
      },
      {
        heading: "Çekim hızını nasıl gerçekten öğrenirsiniz?",
        paragraphs: [
          "Bir brokerin \"hızlı çekim\" vaadi, gerçek performansı garanti etmez. Bağımsız kullanıcı yorumlarında çekim süresiyle ilgili tekrar eden şikayetler olup olmadığına bakmak, sayfadaki iddiadan daha güvenilir bir göstergedir.",
        ],
        list: [
          "E-cüzdan çekimleri genellikle en hızlı yöntemdir (çoğu güvenilir brokerde aynı gün); banka havalesi ve kart çekimleri birkaç iş günü sürebilir.",
          "Çekim ücreti almayan brokerler, bu konuda kendinden emin olduklarının bir sinyalidir — gizli çekim ücreti uygulayan firmalara dikkat edin.",
          "Küçük bir test çekimi yaparak gerçek süreyi doğrudan gözlemlemek, herhangi bir yoruma güvenmekten daha kesin bir yöntemdir.",
        ],
      },
      {
        heading: "İkisini birlikte değerlendirme çerçevesi",
        paragraphs: [
          "Düşük spread'e sahip ama çekimleri yavaş olan bir broker, kısa vadede ucuz ama uzun vadede güven sorunu yaratabilir. Tersine, çekimleri hızlı ama spread'i geniş bir broker, aktif işlem yapan yatırımcı için maliyeti yükseltir. Kendi işlem sıklığınıza göre önceliklendirme yapmak gerekir:",
        ],
        list: [
          "Gün içi ve yüksek frekanslı işlem yapıyorsanız spread + komisyon toplamı sizin için daha belirleyicidir.",
          "Daha az sıklıkta işlem yapıp zaman zaman kâr realize ediyorsanız çekim hızı ve güvenilirliği öncelikli olmalıdır.",
          "FXPARTNER'ın kategori sayfalarında \"düşük spread\" etiketiyle filtrelenmiş brokerleri, her birinin çekim performans puanıyla birlikte karşılaştırabilirsiniz.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "\"En avantajlı\" firma, sizin işlem tarzınıza göre değişir — bu yüzden tek bir isim vermek yerine, gerçek maliyeti ve gerçek çekim performansını nasıl kontrol edeceğinizi bilmek daha kalıcı bir avantajdır. Bu bir yatırım tavsiyesi değildir; hesap açmadan önce güncel spread, komisyon ve çekim koşullarını brokerin resmi sitesinden teyit edin.",
        ],
      },
    ],
  },
  {
    slug: "uzmanlarin-secimi-forex-sinyal-saglayicisi",
    coverImage: "/blog/uzmanlarin-secimi-forex-sinyal-saglayicisi-cover.png",
    lang: "tr",
    title: "Uzmanların Seçimi Olarak Öne Çıkan Forex Sinyal Sağlayıcısı Hangisidir?",
    excerpt:
      "Bir sinyal sağlayıcısını 'uzman onaylı' yapan şey iddiası değil, şeffaflığıdır. Gerçek bir sinyal kaynağını sahte 'garanti kâr' vaatlerinden nasıl ayırt edeceğinizi anlatıyoruz.",
    publishedAt: "2026-08-12",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: güvenilir bir forex sinyal sağlayıcısını \"uzmanların seçimi\" ibaresi değil, şu üç şey belirler — sinyallerin gerçek bir hesapta alınmış işlemlere dayanması, geçmiş performansın doğrulanabilir olması, ve girişin yanında her zaman net bir stop-loss/take-profit seviyesi verilmesi. Bu üçü olmadan yapılan bir \"uzman onaylı\" iddiası, kontrol edilemez bir pazarlama cümlesinden ibarettir.",
        ],
      },
      {
        heading: "Gerçek sinyal ile pazarlama sinyalini ayırt etmek",
        paragraphs: [
          "Piyasada çok sayıda \"sinyal grubu\" var, ama büyük kısmı geçmiş performansını kanıtlayamıyor. Sorulması gereken temel sorular şunlar:",
        ],
        list: [
          "Bu sinyaller gerçek bir hesapta alınan işlemleri mi yansıtıyor, yoksa geriye dönük (backtest) bir simülasyon mu?",
          "Kayıp işlemler de paylaşılıyor mu, yoksa yalnızca kazanan işlemler mi öne çıkarılıyor?",
          "Her sinyalde giriş, stop-loss ve hedef seviyesi net biçimde belirtiliyor mu, yoksa yalnızca \"AL\" veya \"SAT\" gibi belirsiz bir yönlendirme mi veriliyor?",
          "\"Garanti kâr\" veya \"%100 başarı oranı\" gibi ifadeler kullanılıyorsa, bu ciddi bir uyarı işaretidir — hiçbir sinyal kaynağı piyasa hareketini garanti edemez.",
        ],
      },
      {
        heading: "FXPARTNER'ın sinyal yaklaşımı",
        paragraphs: [
          "FXPARTNER'ın sinyalleri, takip edilen gerçek bir MT5 hesabında açılan işlemleri yansıtır — giriş, stop-loss ve hedef seviyeleri, işlem gerçekleştiği anda otomatik olarak paylaşılır, sonradan düzenlenmez. Bu sinyaller genel bilgilendirme amaçlıdır ve yatırım tavsiyesi değildir; her yatırımcının kendi risk toleransına göre pozisyon büyüklüğü ve stop seviyesi belirlemesi gerekir.",
          "Güncel sinyalleri FXPARTNER'ın sinyaller sayfasından takip edebilir, geçmiş sinyallerin sonuçlarını da aynı yerde görebilirsiniz — bu şeffaflık, herhangi bir \"uzman onayı\" iddiasından daha güvenilir bir doğrulama yöntemidir.",
        ],
      },
      {
        heading: "Bir sinyal kaynağını değerlendirirken kontrol listesi",
        paragraphs: [],
        list: [
          "Geçmiş sinyallerin tamamına (kazanan ve kaybeden) erişebiliyor musunuz, yoksa yalnızca seçilmiş örnekler mi gösteriliyor?",
          "Giriş/stop/hedef seviyeleri işlem anında mı paylaşılıyor, yoksa sonradan mı yayınlanıyor?",
          "Sinyal kaynağı ücretliyse, ücretsiz bir deneme veya doğrulanabilir geçmiş performans sunuyor mu?",
          "Sinyal her zaman \"genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir\" uyarısıyla mı geliyor? Bu uyarının olmaması, kaynağın düzenleyici farkındalığının düşük olduğunun bir işaretidir.",
        ],
      },
    ],
  },
  {
    slug: "yapay-zeka-destekli-forex-sinyalleri-en-basarili-platform",
    coverImage: "/blog/yapay-zeka-destekli-forex-sinyalleri-en-basarili-platform-cover.png",
    lang: "tr",
    title: "Yapay Zeka Destekli Forex Sinyalleri İçin En Başarılı Platform Hangisi?",
    excerpt:
      "Yapay zeka, forex sinyallerinde fiyat tahmini yapan bir kahin değildir — verideki örüntüyü hızlıca işleyen bir araçtır. Bu farkın neden önemli olduğunu ve FXPARTNER'ın yaklaşımını anlatıyoruz.",
    publishedAt: "2026-08-12",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: \"en başarılı\" platform diye tek bir isim vermek yanıltıcı olur, çünkü hiçbir yapay zeka sistemi fiyat hareketini garanti edemez — bunu iddia eden her platforma şüpheyle yaklaşmak gerekir. Ama iyi bir yapay zeka destekli sistemi kötüsünden ayıran net kriterler var: gerçek veriyle çalışması, şeffaf olması, ve kararı kullanıcıya bırakması.",
        ],
      },
      {
        heading: "Yapay zeka forex sinyallerinde gerçekte ne yapar?",
        paragraphs: [
          "Yapay zekanın forex'teki gerçekçi rolü, fiyat tahmini üretmek değil, elinizdeki veriyi (haber akışı, teknik göstergeler, ekonomik takvim) hızlıca işleyip anlamlandırmaktır. İyi kurgulanmış bir sistemde sinyal zinciri şöyle işler: önceden tanımlanmış kurallar → fiyat/hacim tetikleyiciyi tutturur → uyarı tetiklenir → yapay zeka mevcut koşulları (takvim, haber, teknik durum) yeniden kontrol eder → karar kullanıcıya kalır.",
          "Bir platform \"yapay zeka fiyat tahmini yapıyor\" diyorsa, bu gerçekçi bir vaat değildir — piyasalar bu kadar öngörülebilir olsaydı, o platformun kendisi ticaret yaparak zenginleşirdi, sinyal satmazdı.",
        ],
      },
      {
        heading: "Gerçek platform ile pazarlama platformunu ayırt etmek",
        paragraphs: [],
        list: [
          "Sinyaller gerçek bir hesapta alınan işlemlere mi dayanıyor, yoksa yalnızca algoritmanın \"tahmini\" mi paylaşılıyor?",
          "Yapay zeka, size hazır bir \"al/sat\" kararı mı dayatıyor, yoksa mevcut veriyi düzenleyip nihai kararı size mi bırakıyor?",
          "Sistem, kendi geçmiş performansını (kazanan ve kaybeden dahil) şeffaf biçimde paylaşıyor mu?",
          "Ekonomik takvim ve haber akışı gibi gerçek zamanlı veriyi hesaba katıyor mu, yoksa sabit bir algoritmayla mı çalışıyor?",
        ],
      },
      {
        heading: "FXPARTNER'ın yapay zeka destekli araçları",
        paragraphs: [
          "FXPARTNER, iki ayrı ama tamamlayıcı araç sunar. AI Market Assistant, piyasa senaryolarını ve strateji sorularınızı yanıtlayan, 7/24 erişilebilir bir sohbet asistanıdır — size hangi pozisyonu açmanız gerektiğini söylemez, araştırmanızı hızlandırır. Sinyaller sayfası ise, gerçek bir MT5 hesabında açılan işlemleri (giriş, stop-loss, hedef) otomatik olarak paylaşan, düzenlenmemiş bir kaynaktır.",
          "İkisi birlikte kullanıldığında ortaya çıkan iş akışı şudur: ekonomik takvimden gündemi takip edin, AI Market Assistant'a soru sorarak bir senaryoyu anlamlandırın, sinyaller sayfasından gerçek işlem verisini takip edin — ama nihai kararı, kendi risk toleransınıza göre siz verin.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "Yapay zeka destekli bir forex platformunu değerlendirirken sorulması gereken soru \"ne kadar başarılı\" değil, \"ne kadar şeffaf ve gerçek\" olduğudur. Garanti kâr vaat eden hiçbir sistem gerçek değildir. Burada anlatılanlar genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir — her yapay zeka aracını, gerçek parayla kullanmadan önce demo hesapta test edin.",
        ],
      },
    ],
  },
  {
    slug: "turkiyede-forex-broker-secimi-spk-guvenilirlik-rehberi",
    lang: "tr",
    title: "Türkiye'de Forex Broker Seçimi: SPK, Yurt Dışı Lisans ve Güvenilirlik Rehberi",
    excerpt:
      "Türkiye'den forex işlem yapmak isteyenler için yerli ve yurt dışı broker ayrımı, SPK'nın rolü, ve bir brokerin güvenilirliğini değerlendirirken kullanılacak pratik çerçeve.",
    publishedAt: "2026-08-13",
    readingMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Türkiye'den forex/CFD işlem yapmak isteyen bir yatırımcı için ilk ve en temel ayrım şudur: Türkiye'de yerleşik, Sermaye Piyasası Kurulu (SPK) lisanslı bir aracı kurum üzerinden mi işlem yapılıyor, yoksa yurt dışında kurulu, yabancı bir düzenleyici altında faaliyet gösteren bir broker üzerinden mi? Bu iki seçenek hem yasal çerçeve hem de yatırımcı koruması açısından birbirinden tamamen farklıdır — ve çoğu kafa karışıklığı, bu ayrımın net anlaşılmamasından kaynaklanır.",
          "Bu rehber genel bilgilendirme amaçlıdır, yatırım veya hukuki tavsiye değildir. Düzenlemeler ve SPK'nın güncel duyuruları zaman içinde değişebilir; bu sayfada anlatılanları her zaman SPK'nın (spk.gov.tr) ve Türkiye Sermaye Piyasaları Birliği'nin (TSPB, tspb.org.tr) resmi kaynaklarıyla teyit etmenizi öneririz.",
        ],
      },
      {
        heading: "SPK ne yapar, kimi düzenler?",
        paragraphs: [
          "Sermaye Piyasası Kurulu (SPK), Türkiye'de sermaye piyasalarını ve yatırım kuruluşlarını düzenleyen resmi otoritedir. Türkiye'de yerleşik olarak kaldıraçlı alım satım (forex/CFD) hizmeti sunabilmek için bir kurumun SPK'dan yetki belgesi alması gerekir. SPK lisanslı bir aracı kurum, müşteri fonlarının ayrı tutulması, asgari sermaye şartları ve düzenli denetim gibi yükümlülüklere tabidir — bu da bir anlaşmazlık durumunda başvurabileceğiniz somut bir yasal mercii olduğu anlamına gelir.",
          "Türkiye Sermaye Piyasaları Birliği (TSPB), SPK lisanslı aracı kurumların üye olduğu özdenetim kuruluşudur ve üye kurumların güncel listesini kendi sitesinde yayınlar. Bir kurumun gerçekten SPK lisanslı olup olmadığını kontrol etmenin en güvenilir yolu, iddiaya değil bu iki resmi kaynağa bakmaktır.",
        ],
      },
      {
        heading: "Yurt dışı brokerler: neden farklı bir kategori?",
        paragraphs: [
          "Piyasada işlem gören forex brokerlerinin büyük çoğunluğu SPK lisanslı değildir — FCA (İngiltere), ASIC (Avustralya), CySEC (Kıbrıs) gibi yabancı düzenleyiciler altında, Türkiye dışında kurulu şirketlerdir. Bu brokerler kendi düzenleyicileri nezdinde tamamen meşru ve denetime tabi olabilir, ama Türkiye'deki bir yatırımcı için durum farklıdır: bu kurumlar SPK'nın doğrudan denetim ve yaptırım yetkisi altında değildir, ve bir anlaşmazlık çıktığında Türkiye'de başvurabileceğiniz bir SPK süreci bulunmaz.",
          "SPK, zaman zaman Türkiye'de yerleşik yatırımcılara yönelik pazarlama yapan, SPK yetkisi olmayan yurt dışı platformlara ilişkin kamuya duyurular yapmış ve bazı platformlara erişimi kısıtlayan kararlar almıştır. Bu, söz konusu her yurt dışı brokerin güvenilmez olduğu anlamına gelmez — birçoğu kendi ülkesinde onlarca yıldır faaliyet gösteren, tier-1 düzenleyiciler altında çalışan kurumlardır — ama Türkiye'deki bir yatırımcı için ek bir hukuki belirsizlik katmanı olduğu anlamına gelir.",
          "Bu yüzden yurt dışı bir broker seçmeden önce, o brokerin kendi düzenleyicisi nezdindeki durumunu (SPK'nın Türkiye'deki değil, kendi ülkesindeki lisans tier'ini) ve Türkiye'den erişim/işlem yapma konusundaki güncel durumunu ayrı ayrı araştırmak gerekir.",
        ],
      },
      {
        heading: "Kaldıraç, para transferi ve vergi: pratik farklar",
        paragraphs: [],
        list: [
          "Kaldıraç limitleri: SPK lisanslı yerli aracı kurumlarda uygulanan azami kaldıraç oranları, düzenleyici tarafından belirlenir ve genellikle yurt dışı offshore brokerlerin sunduğu oranlardan daha düşüktür — güncel oranı SPK lisanslı kurumun kendisinden teyit edin.",
          "Para transferi: Yurt dışı bir brokere yapılan yatırım/çekim işlemleri, banka veya kart sağlayıcınızın kendi kurallarına ve döviz mevzuatına tabidir; bazı işlemler ek belge veya açıklama gerektirebilir.",
          "Vergi: Elde edilen kazançların Türkiye'deki vergi mevzuatı karşısındaki durumu, brokerin nerede kurulu olduğundan bağımsız olarak yatırımcının kendi sorumluluğundadır — bu konuda güncel ve kişiye özel bilgi için bir mali müşavire danışmak gerekir.",
          "Şikayet/uyuşmazlık yolu: Yerli SPK lisanslı bir kurumla yaşanan uyuşmazlıkta SPK'ya ve TSPB'ye başvuru imkânınız vardır; yurt dışı bir brokerle yaşanan uyuşmazlıkta ise o brokerin kendi düzenleyicisinin şikayet mekanizması geçerlidir.",
        ],
      },
      {
        heading: "Bir brokerin güvenilirliğini değerlendirme çerçevesi",
        paragraphs: [
          "Yerli veya yurt dışı fark etmeksizin, bir brokeri değerlendirirken bakılması gereken dört eksen aynıdır — bu, FXPARTNER'ın kendi broker karşılaştırma sisteminde kullandığı çerçevedir:",
        ],
        list: [
          "Düzenleme — kaç lisansı var, hangi ülkelerde, hangi tier'de? Yerli işlem yapıyorsanız SPK/TSPB kaydını, yurt dışı işlem yapıyorsanız o ülkenin düzenleyici tier'ini kontrol edin.",
          "Maliyet — spread, komisyon, gecelik faiz (swap) ve gizli ücretler toplamda ne kadar tutuyor?",
          "Platform — MT4/MT5 gibi yaygın platformları destekliyor mu, demo hesapla test edilebiliyor mu?",
          "Çekim güvenilirliği — bağımsız kullanıcı yorumlarında tekrar eden çekim şikayeti var mı, çekim süreleri şeffaf mı?",
        ],
      },
      {
        heading: "Pratik kontrol listesi",
        paragraphs: [],
        list: [
          "Yerli bir kurumla çalışacaksanız, SPK'nın veya TSPB'nin güncel üye listesinden kurumun adını doğrulayın.",
          "Yurt dışı bir brokerle çalışacaksanız, o brokerin kendi ülkesindeki düzenleyici lisansını (FCA, ASIC, CySEC gibi) ve tier'ini kontrol edin; \"lisanslı\" iddiasını brokerin kendi sitesinden değil, ilgili düzenleyicinin resmi sitesinden teyit edin.",
          "Her iki durumda da, broker adını bağımsız inceleme kaynaklarında \"şikayet\" ve \"çekim\" terimleriyle arayarak tekrar eden bir örüntü olup olmadığına bakın.",
          "FXPARTNER'ın broker karşılaştırma sayfası, listelediği her brokeri düzenleme, maliyet, platform ve çekim performansına göre ayrı ayrı puanlar — hangi brokerin hangi eksende güçlü olduğunu görmek için kullanılabilir.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "\"Türkiye'de en güvenilir forex broker hangisi\" sorusunun tek bir cevabı yoktur, çünkü \"güvenilir\" olmak yerli/yurt dışı ayrımına, sizin risk toleransınıza ve hangi düzenleyici korumasını öncelendirdiğinize göre değişir. Bu sayfa size bir isim vermek yerine, doğru soruları hangi sırayla sormanız gerektiğini gösterir. Yatırım kararı vermeden önce güncel düzenleyici durumu SPK, TSPB veya ilgili yabancı düzenleyicinin resmi sitesinden teyit edin; bu içerik yatırım veya hukuki tavsiye niteliği taşımaz.",
        ],
      },
    ],
  },
  {
    slug: "2026-yeni-baslayanlar-icin-tavsiye-edilen-forex-firmasi",
    coverImage: "/blog/2026-yeni-baslayanlar-icin-tavsiye-edilen-forex-firmasi-cover.png",
    lang: "tr",
    title: "2026'da Yeni Başlayanlar İçin En Çok Tavsiye Edilen Forex Firması Hangisidir?",
    excerpt:
      "Yeni başlayan bir yatırımcı için 'en iyi' broker, deneyimli bir trader için en iyi olandan farklı kriterlere göre belirlenir. Hangi özelliklerin gerçekten önemli olduğunu anlatıyoruz.",
    publishedAt: "2026-08-14",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: yeni başlayanlar için \"en iyi\" broker, en düşük spread'e veya en yüksek kaldıraca sahip olan değil, düşük giriş bariyeri, geniş eğitim içeriği ve hataya toleranslı bir yapıya (düşük minimum yatırım, negatif bakiye koruması) sahip olandır. Deneyimli bir trader için önemli olan kriterler (ham spread, yüksek kaldıraç) yeni başlayan biri için çoğu zaman ikincil kalır — hatta bazı durumlarda risklidir.",
        ],
      },
      {
        heading: "Yeni başlayanlar için hangi kriterler öncelikli olmalı?",
        paragraphs: [],
        list: [
          "Düşük minimum yatırım — küçük bir tutarla başlayıp platformu ve kendi stratejinizi gerçek parayla ama düşük riskle test edebilmenizi sağlar.",
          "Kapsamlı eğitim materyali — canlı webinar, video kütüphanesi ve temel kavramları anlatan içerik, ilk aylardaki en büyük öğrenme eğrisini yumuşatır.",
          "Negatif bakiye koruması — ani bir piyasa hareketinde hesabınızın yatırdığınızdan daha fazla borçlanmasını engeller; yeni başlayanlar için kritik bir güvenlik ağıdır.",
          "Demo hesap kalitesi — gerçek piyasa koşullarını yansıtan, sınırsız süreli bir demo hesap, gerçek parayla başlamadan önce test alanı sağlar.",
          "Basit ve anlaşılır platform — MetaTrader gibi yaygın platformlar, çevrimiçi kaynak ve topluluk desteği bulmayı kolaylaştırır.",
        ],
      },
      {
        heading: "Dikkatli olunması gereken pazarlama taktikleri",
        paragraphs: [
          "Yeni başlayanları hedefleyen bazı brokerler, \"kayıpsız bonus\" veya \"garanti kâr\" gibi vaatlerle dikkat çeker — bu tür ifadeler her zaman bir uyarı işaretidir, çünkü hiçbir broker piyasa hareketini garanti edemez. Benzer şekilde, aşırı yüksek kaldıraç (1:1000 ve üzeri) yeni başlayan biri için bir avantaj değil, kontrolsüz kayıp riski demektir — kaldıracın nasıl çalıştığını tam olarak anlamadan yüksek oranlarla işlem açmak, hesabı hızla sıfırlamanın en yaygın yollarından biridir.",
          "Bonus kampanyalarını değerlendirirken şartlarını dikkatlice okuyun: birçok \"%100 hoş geldin bonusu\", belirli bir işlem hacmi tamamlanmadan çekilemez — bu şart karşılanmazsa bonus ve bazen de yatırılan tutarın kendisi risk altında olabilir.",
        ],
      },
      {
        heading: "Pratik başlangıç adımları",
        paragraphs: [],
        list: [
          "Önce demo hesapta en az birkaç hafta işlem yaparak platformu ve temel kavramları (spread, kaldıraç, stop-loss) öğrenin.",
          "Gerçek hesaba geçerken, kaybetmeyi göze alabileceğiniz küçük bir tutarla başlayın.",
          "Düzenleyici lisansı ve negatif bakiye koruması olup olmadığını hesap açmadan önce kontrol edin.",
          "FXPARTNER'ın yeni başlayanlar kategorisinde, düşük minimum yatırım ve eğitim içeriğine göre öne çıkan brokerleri karşılaştırabilirsiniz.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "\"En çok tavsiye edilen\" firma, deneyim seviyenize göre değişir — yeni başlayan biri için doğru öncelik sırası deneyimli bir trader'ınkinden farklıdır. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; hesap açmadan önce güncel şartları brokerin resmi sitesinden teyit edin ve her zaman kaybetmeyi göze alabileceğiniz tutarla başlayın.",
        ],
      },
    ],
  },
  {
    slug: "gunluk-forex-analizi-ucretli-hizmet-tavsiyesi",
    coverImage: "/blog/gunluk-forex-analizi-ucretli-hizmet-tavsiyesi-cover.png",
    lang: "tr",
    title: "Günlük Forex Analizleri Almak İçin Hangi Ücretli Hizmeti Tavsiye Edersin?",
    excerpt:
      "Ücretli bir forex analiz aboneliğine geçmeden önce, ücretsiz kaynakların gerçekte neyi karşılamadığını bilmek gerekir. Ücretli/ücretsiz ayrımını ve neye dikkat edeceğinizi anlatıyoruz.",
    publishedAt: "2026-08-14",
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          "Kısa cevap: tek bir \"en iyi\" ücretli hizmet yoktur — ücretli bir analiz aboneliğinin değeri, sunduğu içeriğin sizin işlem tarzınıza (gün içi mi, pozisyon mu) uyup uymadığına ve analizin şeffaf bir metodolojiye dayanıp dayanmadığına bağlıdır. Ücretli bir hizmete geçmeden önce, ücretsiz kaynakların gerçekte neyi karşılayıp neyi karşılamadığını bilmek gerekir.",
        ],
      },
      {
        heading: "Ücretsiz kaynaklar neyi karşılar?",
        paragraphs: [
          "Ekonomik takvim, temel teknik göstergeler ve genel piyasa özetleri gibi bilgiler artık geniş ölçüde ücretsiz erişilebilir durumda. FXPARTNER'ın kendi piyasa analizi sayfası, küresel borsalar, merkez bankası kararları ve ekonomik takvimdeki önemli verileri her gün ücretsiz olarak özetler — çoğu yatırımcının günlük ihtiyacının büyük kısmı bu tür kaynaklarla karşılanabilir.",
        ],
      },
      {
        heading: "Ücretli bir hizmet ne zaman anlamlı olur?",
        paragraphs: [],
        list: [
          "Belirli bir enstrüman grubuna (örneğin yalnızca altın veya belirli bir parite grubu) çok derinlemesine, sürekli güncellenen analiz gerekiyorsa.",
          "Kurumsal seviyede veri (order flow, pozisyon dağılımı gibi) sunan özel araçlara erişim gerekiyorsa.",
          "Zaman kısıtınız varsa ve piyasayı kendiniz tarayacak vaktiniz yoksa — bu durumda ücretli bir hizmet zaman tasarrufu olarak değerlendirilebilir.",
        ],
      },
      {
        heading: "Ücretli bir hizmeti değerlendirirken kontrol listesi",
        paragraphs: [],
        list: [
          "Analizin metodolojisi açıklanıyor mu, yoksa yalnızca sonuç mu paylaşılıyor? Şeffaf olmayan bir \"güven bana\" analizi, ücretsiz bir kaynaktan daha değerli değildir.",
          "Geçmiş analizlerin sonradan gerçekleşenle karşılaştırması mümkün mü? Yalnızca doğru çıkan tahminlerin öne çıkarıldığı bir hizmete dikkatli yaklaşın.",
          "Ücretsiz deneme süresi sunuyor mu? İçeriği gerçek paranızı bağlamadan test edebilmelisiniz.",
          "\"Garanti kâr\" veya belirli bir işlemin \"kesin\" sonucunu iddia eden bir hizmet, ücretli olsun olmasın güvenilir değildir — hiçbir analiz piyasa hareketini garanti edemez.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "Ücretli bir analiz hizmetine geçmeden önce, ücretsiz kaynaklarla (ekonomik takvim, FXPARTNER'ın günlük piyasa özetleri, AI Market Assistant) ihtiyacınızın ne kadarının zaten karşılandığını değerlendirin. Ücretli bir aboneliğin gerekçesi \"daha iyi tahmin\" değil, sizin ihtiyaç duyduğunuz derinlikte ve sıklıkta içerik olmalıdır. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
        ],
      },
    ],
  },
  {
    slug: "litefinance-cent-hesap-rehberi",
    adBrokerSlug: "lite-finance",
    lang: "tr",
    title: "10 Dolarla Gerçek İşlem: LiteFinance Cent Hesap Rehberi",
    excerpt:
      "Cent hesap, demo ile gerçek hesap arasındaki boşluğu dolduran ara basamaktır: gerçek para, gerçek fiyat, gerçek psikoloji — ama 100 kat küçük risk ölçeğinde. Nasıl çalıştığını, kime uygun olduğunu ve ne zaman terk edilmesi gerektiğini anlatıyoruz.",
    publishedAt: "2026-08-19",
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          "Demo hesapta üç ay boyunca istikrarlı kâr eden yatırımcıların büyük kısmı, gerçek hesaba geçtiği ilk ay para kaybeder. Sebep strateji değil, psikolojidir: demo hesapta zarar eden pozisyonu taşımak bedavadır, gerçek hesapta değildir. Bu farkı hiçbir demo hesap öğretemez, çünkü öğretebilmesi için gerçek para gerekir.",
          "Cent hesap tam olarak bu boşluğu doldurmak için var. Gerçek bir hesaptır — gerçek fiyatlarla, gerçek emir gerçekleştirmeyle ve gerçek parayla çalışır — ama hesap birimi dolar yerine cent olduğu için risk ölçeği yüz kat küçüktür. 10 dolar yatırırsınız, terminalde bakiyeniz 1.000 görünür ve 0,01 lotluk bir pozisyonda pip başına kaybınız 10 sent yerine 10 cent olur.",
          "Bu yazı LiteFinance'in cent hesabını örnek alıyor çünkü Türkiye'den erişilebilen brokerlar arasında cent hesabı ile 0.0 pipten ECN hesabını aynı çatı altında sunanlardan biri. Ama anlatılan mantık her cent hesap için geçerlidir. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
        ],
      },
      {
        heading: "Cent hesap teknik olarak nedir?",
        paragraphs: [
          "Standart bir forex hesabında 1 lot, 100.000 birimlik bir sözleşmedir. Cent hesapta 1 lot, 1.000 birimliktir — yani standart hesabın mikro lotunun onda biri ölçeğinde bir sözleşme. Bakiyeniz de aynı mantıkla gösterilir: yatırdığınız 10 dolar, terminalde 1.000 cent olarak görünür.",
          "Buradaki tek değişiklik ölçektir. Spread aynı piyasadan gelir, kayma (slippage) aynı şekilde yaşanır, gecelik swap aynı şekilde işler ve marjin çağrısı aynı kurallarla tetiklenir. Öğrenmek istediğiniz her mekanik burada gerçek haliyle çalışır — sadece hata yapmanın faturası küçüktür.",
          "LiteFinance'in cent hesabında minimum yatırım 10 dolar, spread 3 pipten başlıyor, komisyon alınmıyor ve stop out seviyesi %50. Kaldıraç 1:1000'e kadar seçilebiliyor. Bu rakamlar hesap açmadan önce brokerin resmi sitesinden teyit edilmelidir; broker koşulları zaman içinde değişir.",
        ],
      },
      {
        heading: "Demo hesap neden yetmiyor",
        paragraphs: [
          "Demo hesabın öğrettiği şeyler gerçektir: platformu kullanmak, emir tiplerini tanımak, grafik okumak, bir stratejiyi mekanik olarak uygulamak. Öğretemediği tek şey, kendi paranız risk altındayken nasıl karar verdiğinizdir — ve piyasada kaybedilen paranın büyük kısmı stratejiden değil, tam olarak bu karar anlarından çıkar.",
        ],
        list: [
          "Demo hesapta 200 dolarlık kayan zararı taşımak duygusal olarak bedavadır; aynı zarar gerçek parada uykunuzu kaçırır ve pozisyonu erken kapatmanıza yol açar.",
          "Demo hesapta kâr hedefine ulaşan pozisyonu bırakmak kolaydır; gerçek parada kârı erken realize etme dürtüsü çok daha güçlüdür.",
          "Demo hesapta zarar durdur seviyesini geri çekmenin sonucu yoktur; gerçek hesapta bu, tek işlemle hesabı bitiren en yaygın davranıştır.",
          "Demo hesapta gerçekleşen emirlerin çoğu ideal fiyattan olur; gerçek hesapta haber anlarında kayma ve genişleyen spreadle tanışırsınız.",
        ],
      },
      {
        heading: "İlk hafta planı: cent hesapta ne yapmalı",
        paragraphs: [
          "Cent hesabın amacı para kazanmak değil, gerçek koşullarda veri toplamaktır. Kazanç hedefiyle başlarsanız hesabın bütün faydasını kaybedersiniz — 10 dolarlık bir hesapta anlamlı bir kazanç ancak akıl dışı bir kaldıraçla mümkündür ve bu da öğrenmek istediğiniz her şeyi bozar.",
        ],
        list: [
          "Gün 1-2: Hesabı açın, doğrulamayı (KYC) tamamlayın, 10-20 dolar yatırın ve tek bir paritede (tercihen EUR/USD) en küçük lotla 3-5 işlem yapın. Amaç: emir gerçekleştirme ve platform akışını gerçek parayla görmek.",
          "Gün 3-5: Her işlemde zarar durdur ve kâr al seviyelerini önceden yazın ve işlem açıldıktan sonra hiçbirini değiştirmeyin. Amaç: planı bozma dürtüsünü ölçmek.",
          "Gün 6-7: Bir işlem günlüğü tutun — giriş sebebi, çıkış sebebi, işlem sırasında ne hissettiğiniz. Bu üç sütun, cent hesabın asıl çıktısıdır.",
          "Tüm hafta boyunca: Pozisyon büyüklüğünü tahminle değil hesapla belirleyin. FXPARTNER'ın pozisyon büyüklüğü hesaplayıcısı, hesap bakiyesi ve zarar durdur mesafesinden kaç lot açmanız gerektiğini verir.",
          "Yapmayın: Kaldıracı 1:1000'e çekip hesabı iki katına çıkarmayı denemek. Cent hesapta bunu yaparsanız öğrendiğiniz tek şey hesabın ne kadar hızlı sıfırlandığı olur.",
        ],
      },
      {
        heading: "Cent hesaptan ne zaman çıkılır?",
        paragraphs: [
          "Cent hesap bir basamaktır, varış noktası değil. Çıkış için doğru sinyal kâr değil, tutarlılıktır: en az 30-40 işlemlik bir seride, planınıza sadık kaldığınızı ve sonuçların rastlantısal olmadığını kendi günlüğünüzden görebiliyorsanız bir sonraki basamağa geçebilirsiniz.",
          "LiteFinance'te bir sonraki basamak Classic hesap (50 dolar minimum, 1.8 pipten spread, komisyonsuz) veya doğrudan ECN hesabıdır (50 dolar minimum, 0.0 pipten spread, lot başına 0,25 dolardan komisyon). Aynı broker içinde kaldığınız için platform, kabin ve para çekme akışı değişmez — yalnızca ölçek ve maliyet yapısı değişir. Hangi hacimde ECN'in Classic'ten ucuz hale geldiğini ayrı bir yazıda hesapladık.",
          "Erken geçmenin bedeli, cent hesabın önlemek için var olduğu hatanın tam olarak gerçek ölçekte yaşanmasıdır. Geç geçmenin bedeli ise yalnızca zamandır. İkisi arasında seçim yapmanız gerekiyorsa, geç kalın.",
        ],
      },
      {
        heading: "Cent hesabın sınırları",
        paragraphs: [],
        list: [
          "Cent hesap spreadi daha geniştir (LiteFinance'te 3 pipten başlar). Bu bir dezavantaj değil, ödediğiniz eğitim ücretidir — ama scalping gibi maliyete duyarlı stratejileri cent hesapta test etmenin sonuçları yanıltıcı olur.",
          "Küçük bakiye, risk yönetimi alanını daraltır. 10 dolarlık bir hesapta işlem başına %1 risk 10 senttir; bu, bazı enstrümanlarda en küçük lot büyüklüğünün bile altında kalabilir.",
          "Cent hesabın psikolojisi tam ölçekli değildir. 10 dolar kaybetmek 1.000 dolar kaybetmekle aynı hissettirmez — cent hesap duygusal baskının tamamını değil, başlangıcını öğretir.",
          "Kaldıraç burada da gerçek bir risktir. 1:1000 kaldıraçla açılan bir cent pozisyonu, hesabın tamamını dakikalar içinde götürebilir.",
        ],
      },
      {
        heading: "Hesap açmadan önce kontrol listesi",
        paragraphs: [],
        list: [
          "Hesabın hangi tüzel kişilikle açıldığını kontrol edin. LiteFinance'te Türkiye'den açılan hesaplar CySEC lisanslı Avrupa şirketine değil, offshore şirkete bağlanır — bu, düzenleyici güvencenin daha ince olduğu anlamına gelir.",
          "Para yatırmadan önce çekim yöntemini seçin. Çekim yalnızca yatırdığınız yönteme ve aynı para birimine yapılabilir; yanlış yöntemle yatırmak sonradan düzeltilmesi zahmetli bir hatadır.",
          "Doğrulamayı (KYC) ilk gün tamamlayın. Anlık para çekme özelliği yalnızca doğrulanmış hesaplarda çalışır.",
          "Bonus tekliflerini ilk hesapta kabul etmeyin. Bonus ek marjindir, çekilebilir bakiye değildir ve hacim şartı sizi gereksiz işlem açmaya iter — cent hesabın amacına doğrudan zıttır.",
          "Kaybetmeyi göze alabileceğiniz tutarla başlayın. Bu, cent hesap dahil her hesap türü için geçerlidir.",
        ],
      },
      {
        heading: "Özet",
        paragraphs: [
          "Cent hesap, gerçek para ile öğrenmenin en ucuz yoludur. Demo hesabın öğretemediği tek şeyi — kendi kararlarınızı baskı altında nasıl verdiğinizi — 10 dolarlık bir faturayla öğretir. Doğru kullanıldığında bir sonraki basamağa geçtiğinizde ödeyeceğiniz öğrenme maliyetini büyük ölçüde düşürür; kazanç hesabı gibi kullanıldığında ise yalnızca hesabın hızla sıfırlanmasını sağlar.",
          "LiteFinance'in hesap türleri, para çekme koşulları ve düzenleyici durumuyla ilgili tam dökümü broker inceleme sayfamızda bulabilirsiniz. Bu içerik yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "litefinance-anlik-para-cekme",
    adBrokerSlug: "lite-finance",
    // Dated because the artwork was replaced, not because the post was. The
    // old file was a generated credit card whose chip and embossed number
    // did not survive a close look; a new name is what makes a social
    // platform re-scrape rather than keep serving its cached copy of it.
    coverImage: "/blog/litefinance-anlik-para-cekme-cover-20260831.png",
    lang: "tr",
    title: "LiteFinance'te Anlık Para Çekme: Üç Şart ve Gerçek Süreler",
    excerpt:
      "LiteFinance'te çekim talepleri anlık işlenebiliyor — ama otomatik olarak değil. Anlık çekimin üç şartını, hangi yöntemin ne kadar sürdüğünü ve en sık yapılan beş hatayı anlatıyoruz.",
    publishedAt: "2026-08-19",
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          "Forex'te bir brokerın size verdiği en dürüst sinyal para çekmedir. Para yatırma her brokerda hızlıdır — parayı almak isterler. Asıl sınav, o parayı geri istediğinizde ne olduğudur.",
          "LiteFinance bu testte iyi bir profile sahip: doğrulanmış bir hesapta otomatik çekim akışı açıkken talepler anlık işlenir — desteklenen yöntemlerde günde 5.000 dolara kadar, gün içinde birden fazla kez, manuel onay beklemeden. Ama \"anlık\" kelimesi burada koşulsuz değil. Üç şart sağlanmazsa talebiniz normal kuyruğa düşer ve 24 saate kadar bekler.",
          "Bu yazı o üç şartı, hangi yöntemin gerçekte ne kadar sürdüğünü ve ilk çekimde en sık yapılan hataları anlatıyor. Koşullar değişebileceği için rakamları hesap açmadan önce brokerin resmi sitesinden teyit edin.",
        ],
      },
      {
        heading: "Anlık çekimin üç şartı",
        paragraphs: [
          "Anlık çekim bir ayrıcalık değil, bir yapılandırmadır. Üçünü de sağladığınızda çalışır, birini eksik bıraktığınızda çalışmaz — ve çoğu kullanıcı hangisinin eksik olduğunu para çekmeye çalıştığı gün öğrenir.",
        ],
        list: [
          "1. Hesap doğrulaması (KYC) tamamlanmış olmalı. Kimlik ve adres belgesi kabinden yüklenir. Doğrulanmamış bir hesapta hiçbir çekim otomatik işlenmez. Bunu para yatırdığınız gün halledin, çekmek istediğiniz gün değil.",
          "2. Kabinde otomatik çekim etkin olmalı. Bu bir ayardır ve varsayılan olarak açık gelmeyebilir. Kişisel kabinden kontrol edin.",
          "3. Çekim yöntemi bu akışı desteklemeli. Kartlar ve e-cüzdanlar destekler. Banka havalesi doğası gereği desteklemez — para muhabir banka zincirinden geçer ve bu zinciri hiçbir broker hızlandıramaz.",
        ],
      },
      {
        heading: "Yöntem başına gerçek süreler",
        paragraphs: [
          "Aşağıdaki süreler brokerın talebi işleme alma süresini değil, paranın size ulaşma süresini kapsar — ikisi farklıdır ve çoğu şikayet bu farktan doğar. Broker talebi 30 saniyede işleyebilir, ama e-cüzdan sağlayıcınız kendi tarafında 2 saat tutabilir.",
        ],
        list: [
          "E-cüzdan (otomatik akışta): anlık — çoğunlukla dakikalar içinde. Günlük 5.000 dolarlık otomatik limit bu kanalda en anlamlı hale gelir.",
          "Banka/kredi kartı: broker tarafında anlık işlenir, ancak kart ağının iade sürecine bağlı olarak hesabınıza yansıması 1-5 iş günü sürebilir. Bu gecikme brokerdan değil, kart şemasından kaynaklanır.",
          "Kripto transferi: ağ onay süresine bağlı, genellikle dakikalar. Ağ ücreti size aittir.",
          "Banka havalesi: 1-3 iş günü. Otomatik akışın dışındadır.",
          "5.000 doların üzerindeki talepler ve otomatik akış dışında kalan her şey: çoğunlukla 24 saat içinde, manuel işleme alınarak.",
        ],
      },
      {
        heading: "Aynı yöntem kuralı — en çok sürpriz yaratan madde",
        paragraphs: [
          "LiteFinance'te para yalnızca yatırdığınız yönteme ve aynı para birimine çekilebilir. Skrill ile yatırdıysanız yalnızca aynı Skrill cüzdanına çekersiniz; kartla yatırdıysanız iade önce o karta gider.",
          "Bu keyfi bir kısıtlama değil, kara para aklamayı önleme mevzuatının standart bir gereğidir ve sektörde yaygındır. Ama pratikte şu anlama gelir: para yatırma yönteminizi seçerken aslında para çekme yönteminizi de seçmiş olursunuz. Kullanmadığınız bir kartla veya erişiminizin belirsiz olduğu bir cüzdanla yatırım yapmak, sonradan düzeltilmesi zahmetli bir karardır.",
          "Birden fazla yöntemle yatırım yaptıysanız çekim genellikle yatırılan tutarlar oranında dağıtılır. Bu da hesabınızı tek bir yöntem etrafında kurmanın neden daha az sürtünme yarattığını açıklar.",
        ],
      },
      {
        heading: "Ücretler: %0-2 nereden çıkıyor?",
        paragraphs: [
          "LiteFinance yatırma işlemlerinden ücret almaz. Çekimlerde ise yönteme göre %0 ile %2 arasında bir masraf çıkabilir — bu genellikle brokerın kârı değil, ödeme sağlayıcısının işlem ücretidir ve maliyeti kimin üstlendiği yönteme göre değişir.",
          "Pratik sonuç: ayda bir kez 1.000 dolar çekmek, dört kez 250 dolar çekmekten daha ucuz olabilir. Sık ve küçük çekimler yapıyorsanız yöntem başına ücreti bir kez hesaplayın; yıllık toplamı çoğu kişinin beklediğinden yüksek çıkar.",
        ],
      },
      {
        heading: "İlk çekimde en sık yapılan beş hata",
        paragraphs: [],
        list: [
          "KYC'yi para çekmek istediği gün yapmaya çalışmak. Belge onayı zaman alır; \"anlık çekim çalışmıyor\" şikayetlerinin çoğu aslında budur.",
          "Aktif bonusu olan bir hesaptan çekim talebi göndermek. Bonus ek marjindir; çekim talebi genellikle bonusun ve ondan doğan kârın iptaline yol açar. Bonus koşullarını çekmeden önce okuyun.",
          "Açık pozisyon varken serbest marjinin tamamını çekmeye çalışmak. Çekilebilir tutar bakiyeniz değil, serbest marjinizdir; hesaplamayı açık pozisyonların kullandığı marjini düşerek yapın.",
          "Yatırdığından farklı bir cüzdana çekmeye çalışmak. Aynı yöntem kuralı nedeniyle talep reddedilir.",
          "İlk çekimi büyük tutarla denemek. Yeni bir brokerda ilk çekimi küçük bir tutarla yapıp süreci baştan sona görmek, her broker için geçerli bir sağduyu kuralıdır.",
        ],
      },
      {
        heading: "Çekim hızı bir güven ölçüsüdür — ama tek başına yeterli değil",
        paragraphs: [
          "Hızlı çekim önemli bir sinyaldir çünkü nakit akışı sorunu olan bir broker bunu sürdüremez. Ama hızlı çekim, düzenleyici korumanın yerine geçmez.",
          "LiteFinance'te Türkiye'den açılan hesaplar CySEC lisanslı Avrupa şirketine değil, offshore şirkete bağlanır. Bu, bir anlaşmazlık durumunda arkanızda bir yatırımcı tazmin fonu olmadığı anlamına gelir — çekimler anlık işlense bile. İki konu birbirinden bağımsızdır ve ikisini birlikte değerlendirmek gerekir.",
          "Brokerın düzenleyici yapısı, hesap türleri ve puanlamasıyla ilgili tam döküm için LiteFinance inceleme sayfamıza bakabilirsiniz. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
        ],
      },
    ],
  },
  {
    slug: "litefinance-ecn-maliyet-hesabi",
    adBrokerSlug: "lite-finance",
    lang: "tr",
    title: "Lot Başına Gerçekte Ne Ödüyorsunuz? ECN Maliyet Hesabı",
    excerpt:
      "\"0.0 pip spread\" reklamı tek başına hiçbir şey ifade etmez. Spread ve komisyonu toplayıp LiteFinance Classic, LiteFinance ECN ve XM Zero hesaplarının 1 lotluk gerçek maliyetini yan yana hesaplıyoruz.",
    publishedAt: "2026-08-19",
    readingMinutes: 9,
    sections: [
      {
        paragraphs: [
          "Forex reklamlarındaki en yaygın yanıltıcı ifade \"0.0 pipten spread\"dir. Yanlış değildir — ama eksiktir. 0.0 pip spread sunan her hesap, maliyeti komisyon olarak alır ve komisyonu görmezden gelen bir karşılaştırma her zaman yanlış hesabı ucuz gösterir.",
          "Doğru soru şu: aynı işlemi açıp kapattığımda toplam kaç dolar ödüyorum? Bu yazıda o hesabı üç hesap türü üzerinde adım adım yapıyoruz. Kullanılan rakamlar brokerların ilan ettiği başlangıç değerleridir ve değişebilir; kendi hesabınız için işlem yapmadan önce brokerin resmi sitesinden teyit edin.",
        ],
      },
      {
        heading: "Formül: toplam maliyet = spread + komisyon",
        paragraphs: [
          "EUR/USD'de 1 standart lot 100.000 birimdir ve bu büyüklükte 1 pip yaklaşık 10 dolar eder. Yani spreadi dolara çevirmek için pip cinsinden spreadi 10 ile çarpmanız yeterlidir.",
          "Komisyon tarafında dikkat edilecek tek bir ayrıntı var ve maliyeti ikiye katlayabilir: komisyonun tek yönlü mü (per side) yoksa gidiş-dönüş mü (round turn) olduğu. \"Lot başına 3,50 dolar, taraf başına\" ifadesi, bir pozisyonu açıp kapatmanın 7 dolar tuttuğu anlamına gelir. Bir brokerın komisyon rakamını okurken bu iki kelimeyi aramazsanız yaptığınız her karşılaştırma bozulur.",
          "Üçüncü bir kalem daha var: pozisyonu gecelik taşıyorsanız swap. Gün içi işlem yapıyorsanız swap sizi ilgilendirmez; birkaç gün pozisyon taşıyorsanız bazı paritelerde swap, spread ve komisyonun toplamından büyük olabilir.",
        ],
      },
      {
        heading: "Üç hesap, tek işlem: 1 lot EUR/USD aç-kapa",
        paragraphs: [
          "Aşağıdaki hesap, spreadin ilan edilen başlangıç değerinde olduğu varsayımıyla yapılmıştır. Gerçekte 0.0 pip bir taban değerdir, ortalama değil — normal seans koşullarında ECN tipi hesaplarda EUR/USD spreadi çoğunlukla 0.1-0.5 pip aralığında hareket eder. Karşılaştırmayı dürüst tutmak için ECN hesaplarında 0.3 pip ortalama varsaydık.",
        ],
        list: [
          "LiteFinance Classic — spread 1.8 pip, komisyon yok. Maliyet: 1,8 × 10 $ = 18 $.",
          "LiteFinance ECN — spread ~0.3 pip + lot başına 0,25 dolardan komisyon. Maliyet: 3 $ + 0,25-0,50 $ = yaklaşık 3,25-3,50 $.",
          "XM Zero — spread ~0.3 pip + lot başına taraf başına 3,50 dolar komisyon. Maliyet: 3 $ + 7 $ = yaklaşık 10 $.",
          "XM Standard — spread 1.0 pip, komisyon yok. Maliyet: 1,0 × 10 $ = 10 $.",
        ],
      },
      {
        heading: "Bu tablodan çıkan üç sonuç",
        paragraphs: [
          "Birincisi: komisyonsuz hesap ucuz hesap demek değildir. LiteFinance Classic bu listedeki tek \"komisyon yok\" seçeneği ve aynı zamanda en pahalısı — çünkü maliyet komisyondan kaldırılıp spreade gömülmüştür. Komisyonsuz hesapların cazibesi maliyette değil, hesabın basitliğindedir.",
          "İkincisi: iki farklı brokerın \"0.0 pip ECN\" hesabı arasında üç kata varan maliyet farkı olabilir. Buradaki fark spreadden değil, komisyon yapısından geliyor — LiteFinance'in lot başına 0,25 dolardan başlayan komisyonu ile XM Zero'nun taraf başına 3,50 doları arasındaki mesafe, aynı işlemi 3,50 dolara mı yoksa 10 dolara mı yaptığınızı belirliyor.",
          "Üçüncüsü: fark hacimle büyür. Ayda 50 lot işlem yapan biri için Classic ile ECN arasındaki yaklaşık 14,5 dolarlık lot farkı, ayda 725 dolara denk gelir. Bu, çoğu perakende hesabın yıllık getiri beklentisinden büyük bir kalemdir ve tamamen hesap türü seçimiyle ilgilidir.",
        ],
      },
      {
        heading: "Nakit iade hesabı nasıl değiştirir?",
        paragraphs: [
          "İşlem maliyeti tek yönlü bir kalem değildir: bir kısmı, brokerın iş ortağına ödediği payla geri gelebilir. FXPARTNER üzerinden bağlanan LiteFinance hesaplarında nakit iade oranı %50'ye kadar çıkıyor — ECN hesaplarda komisyon, Classic ve Cent hesaplarda spread üzerinden hesaplanıyor.",
          "Pratikte bu, yukarıdaki ECN maliyetinin bir bölümünün geri dönmesi anlamına gelir. İadenin büyüklüğü hesap türüne ve aylık hacme bağlı olduğu için tek bir rakam vermek doğru olmaz; ama yön nettir: iade, zaten en ucuz olan hesabı daha da ucuzlatır ve hacim büyüdükçe etkisi artar.",
          "Önemli ayrıntı: nakit iade için mevcut hesabınızı kapatmanız gerekmez. Hesap numaranızı FXPARTNER'ın nakit iade sayfasından göndermeniz yeterlidir; iade, işlem hacminize göre broker tarafından doğrudan işlem hesabınıza yatırılır.",
        ],
      },
      {
        heading: "Hangi hesap kime uygun?",
        paragraphs: [],
        list: [
          "Ayda 5 lotun altında işlem yapıyorsanız: maliyet farkı mutlak olarak küçüktür (yaklaşık 70 dolar). Hesabın basitliği sizin için daha değerliyse komisyonsuz bir hesap makul bir tercihtir.",
          "Ayda 5-50 lot arası: ECN tipi bir hesap net şekilde ucuzdur ve fark aylık bütçenizde görünür hale gelir.",
          "Scalping veya yüksek frekanslı işlem: ECN dışında bir seçenek pratikte anlamlı değildir. Bu tarzda toplam maliyet, stratejinin kâr eşiğini doğrudan belirler.",
          "Pozisyon taşıyorsanız (birkaç gün-hafta): önceliğiniz spread veya komisyon değil, swap oranlarıdır. Maliyet karşılaştırmasını swap üzerinden yapın.",
          "Uzman danışman (EA) kullanıyorsanız: geriye dönük testlerinizi kendi hesabınızın gerçek spread ve komisyonuyla çalıştırın. Varsayılan test ayarlarıyla kârlı görünen pek çok EA, gerçek maliyet girildiğinde zarara döner.",
        ],
      },
      {
        heading: "Karşılaştırmayı kendiniz yaparken",
        paragraphs: [],
        list: [
          "Komisyonun taraf başına mı gidiş-dönüş mü olduğunu doğrulayın — bu tek soru maliyeti ikiye katlayabilir.",
          "Spreadin ilan edilen minimumunu değil, işlem yaptığınız saatlerdeki ortalamasını ölçün. Bir demo hesapta bir hafta boyunca spreadi kaydetmek yeterlidir.",
          "İşlem yaptığınız enstrümanla hesaplayın. Altın, endeksler ve egzotik pariteler için pip değeri ve tipik spread tamamen farklıdır.",
          "Aylık hacminizle çarpın. Lot başına birkaç dolarlık fark, yıllık toplamda hesap büyüklüğünüzle kıyaslanabilir bir tutara ulaşabilir.",
          "Varsa nakit iadeyi net maliyetten düşün — ama iadeyi kâr gibi değil, maliyet indirimi gibi değerlendirin.",
        ],
      },
      {
        heading: "Özet",
        paragraphs: [
          "İşlem maliyeti, bir yatırımcının kontrol edebildiği çok az değişkenden biridir. Piyasanın yönünü tahmin edemezsiniz ama lot başına ne ödediğinizi tam olarak bilebilir ve düşürebilirsiniz — ve bu, uzun vadede pek çok strateji iyileştirmesinden daha büyük fark yaratır.",
          "LiteFinance'in hesap türleri, komisyon yapısı ve düzenleyici durumuyla ilgili tam döküm için broker inceleme sayfamıza bakabilirsiniz. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir.",
        ],
      },
    ],
  },
  {
    slug: "forex-bonus-tuzagi-hacim-sarti",
    lang: "tr",
    title: "Bonusunuzu Neden Çekemiyorsunuz? Hacim Şartının Matematiği",
    excerpt:
      "Yatırım bonusu bedava para değildir; koşullu bir marjin kredisidir. Hacim şartının nasıl hesaplandığını, bonusun gerçek maliyetini ve hangi durumda mantıklı olduğunu adım adım gösteriyoruz.",
    publishedAt: "2026-08-19",
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          "\"%100 yatırım bonusu\" bu sektörün en etkili pazarlama cümlesidir ve aynı zamanda en yanlış anlaşılanıdır. Yeni yatırımcıların büyük kısmı bonusu bakiyeye eklenen para sanır. Değildir. Bonus, belirli koşullar yerine getirilene kadar çekilemeyen, koşullu bir marjin kredisidir.",
          "Bu yazı marka bağımsızdır — anlatılan mekanik, bonus veren hemen her brokerda aynı şekilde çalışır. Örnekleri somutlaştırmak için LiteFinance'in yayınladığı bonus tiplerini kullanıyoruz, ama rakamlar dönemsel olarak değişir; katılmadan önce güncel koşulları brokerin resmi sitesinden okuyun.",
        ],
      },
      {
        heading: "Bonus tam olarak nedir?",
        paragraphs: [
          "Bonus, hesabınızın marjin hesaplamasına dahil edilen ama çekilebilir bakiyenize dahil edilmeyen bir tutardır. 500 dolar yatırıp %100 bonus aldığınızda terminalde 1.000 dolar görürsünüz; bu 1.000 doların 500'ü sizindir, 500'ü brokerın koşullu katkısıdır.",
          "Bunun size sağladığı tek somut şey daha fazla marjin alanıdır: aynı pozisyon büyüklüğünde marjin çağrısına daha geç yakalanırsınız. Sağlamadığı şey ise kâr potansiyelidir — bonus pozisyonlarınızın kazancını artırmaz, yalnızca daha büyük pozisyon açabilmenize izin verir. Bu ikisi arasındaki fark, bonusun neden bir risk çarpanı olduğunu açıklar.",
          "LiteFinance'te yaygın olarak görülen tipler: 50 dolar üzeri yatırımlarda %30 bonus ve promosyon koduyla 100 dolar üzeri yatırımlarda %100 bonus. Bonuslar genellikle 6 ay geçerlidir ve azami bir tavan tutar taşır.",
        ],
      },
      {
        heading: "Hacim şartı nasıl hesaplanır?",
        paragraphs: [
          "Bonusun (ve çoğu durumda bonustan doğan kârın) çekilebilir hale gelmesi için belirli bir işlem hacmini tamamlamanız gerekir. Bu hacim lot cinsinden ifade edilir ve genellikle bonus tutarına bağlı bir çarpanla hesaplanır.",
          "Aşağıdaki örnek gerçek bir kampanya koşulu değil, mekanizmayı göstermek için kurulmuş bir hesaptır. Kendi kampanyanızın çarpanını koşullar sayfasından okuyup aynı hesabı yapın.",
        ],
        list: [
          "Varsayım: 500 dolar yatırdınız, %100 bonusla 500 dolar bonus aldınız. Kampanya, bonusun her 1 doları için 1 lot işlem şartı koyuyor olsun.",
          "Gereken hacim: 500 lot. EUR/USD'de 500 standart lot, 50 milyon dolarlık nominal işlem hacmi demektir.",
          "Bu hacmin maliyeti: 1.8 pip spreadli bir hesapta lot başına yaklaşık 18 dolar × 500 lot = 9.000 dolar işlem maliyeti.",
          "Sonuç: 500 dolarlık bonusu çekilebilir hale getirmek için 9.000 dolar maliyet ödemeniz gerekir. Bu koşulda bonus, matematiksel olarak alınabilir bir şey değildir.",
          "Aynı hesabı düşük çarpanlı bir kampanyada yapın — örneğin bonusun her 1 doları için 0,1 lot — ve rakam 50 lota, maliyet 900 dolara iner. Karar tamamen çarpanda saklıdır.",
        ],
      },
      {
        heading: "Bonusun görünmeyen maliyeti: davranış değişikliği",
        paragraphs: [
          "Hacim şartının asıl bedeli ödediğiniz spread değil, sizi ittiği davranıştır. Şartı tamamlamaya çalışan bir yatırımcı, stratejisinin sinyal vermediği anlarda da işlem açar — çünkü artık amacı iyi işlem yapmak değil, lot biriktirmektir.",
          "Bu, forex'te hesap sıfırlamanın en sistematik yollarından biridir ve nedeni bonus değil, bonusun yarattığı teşviktir. Aynı yatırımcı bonus almasaydı ayda 10 işlem yapacaktı; bonusla 60 işlem yapar ve bu 50 fazladan işlemin beklenen değeri negatiftir.",
          "İkinci görünmeyen maliyet: bonus çoğu brokerda çekim talebinde iptal olur. Yani hesabınızda aktif bonus varken para çekmek isterseniz, bonusu ve çoğu durumda bonustan doğan kârı kaybedersiniz. Bu, acil nakit ihtiyacı olan biri için gerçek bir kayıptır.",
        ],
      },
      {
        heading: "Bonus ne zaman mantıklıdır?",
        paragraphs: [
          "Bonus her zaman kötü değildir — koşulları doğru okunduğunda belirli durumlarda işe yarar.",
        ],
        list: [
          "Zaten yapacağınız hacme yakın bir şart varsa. Ayda 40 lot işlem yapan biri için 50 lotluk bir şart, davranışını değiştirmeden ulaşılabilir bir hedeftir.",
          "Bonusu çekmeyi değil, yalnızca marjin tamponu olarak kullanmayı planlıyorsanız — ve bu tamponun pozisyon büyütmenize izin vermesine izin vermiyorsanız.",
          "Bonusun süresi (genellikle 6 ay) sizin normal işlem temponuzla uyumluysa.",
          "Ve her durumda: bonus, brokerı seçme sebebiniz değilse. Broker seçimi regülasyon, maliyet, platform ve para çekme üzerinden yapılır; bonus bu dördünden hiçbirini telafi etmez.",
        ],
      },
      {
        heading: "Bonus koşullarında okunacak beş satır",
        paragraphs: [],
        list: [
          "Hacim çarpanı: bonusun her 1 doları için kaç lot? Bu tek rakam bonusun alınabilir olup olmadığını belirler.",
          "Hangi enstrümanlar hacme sayılıyor? Bazı kampanyalarda yalnızca belirli pariteler veya belirli süreden uzun tutulan pozisyonlar sayılır.",
          "Bonus tavanı ne kadar? Yüzde büyük görünse de mutlak tavan çoğu zaman düşüktür.",
          "Geçerlilik süresi ne kadar? Süre dolduğunda bonus ve çoğu durumda ondan doğan kâr silinir.",
          "Çekim talebi bonusu iptal ediyor mu? Neredeyse her zaman evet — ama koşulun tam ifadesini görmeden varsaymayın.",
        ],
      },
      {
        heading: "Özet",
        paragraphs: [
          "Bonus bedava para değil, koşullu bir marjin kredisidir ve gerçek fiyatı hacim şartında yazılıdır. O şartı lot cinsinden hesaplayıp işlem maliyetine çevirdiğinizde, bonusun size ne kadara mal olduğunu tam olarak görürsünüz — ve çoğu kampanyada bu rakam bonusun kendisinden büyüktür.",
          "Broker seçerken bonusu değil, dört temel ekseni kullanın: regülasyon, maliyet, platform ve para çekme. FXPARTNER'ın broker sıralamalarında her broker tam olarak bu dört eksende puanlanır. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
        ],
      },
    ],
  },
  {
    slug: "litefinance-vs-xm-karsilastirma",
    coverImage: "/blog/litefinance-vs-xm-karsilastirma-cover.png",
    lang: "tr",
    title: "LiteFinance mi XM mi? İki Brokerı Dürüstçe Karşılaştırma",
    excerpt:
      "FXPARTNER her ikisinden de gelir elde ediyor — bu yüzden karşılaştırmayı bir kazanan ilan ederek değil, hangi profile hangisinin uyduğunu göstererek yapıyoruz. Regülasyon, maliyet, platform ve para çekme, yan yana.",
    publishedAt: "2026-08-19",
    readingMinutes: 9,
    sections: [
      {
        paragraphs: [
          "Önce şeffaflık: FXPARTNER hem XM'in hem LiteFinance'in iş ortağıdır ve her ikisinden de komisyon geliri elde eder. Yani \"hangisi daha iyi\" sorusuna verdiğimiz cevabın ticari olarak tarafsız olduğunu iddia edemeyiz — bunun yerine yapabileceğimiz şey, kararı sizin verebilmeniz için ikisinin farklarını gizlemeden yan yana koymaktır.",
          "İyi haber şu ki bu iki broker gerçekten farklı profillerde. Birbirinin yerine geçen iki seçenek olsalardı karşılaştırma anlamsız olurdu; öyle değiller ve fark, hangi ölçüde korunmak istediğinizle hangi ölçüde maliyet düşürmek istediğiniz arasındaki tercihe dayanıyor.",
        ],
      },
      {
        heading: "Regülasyon: en büyük fark burada",
        paragraphs: [
          "XM, ASIC (Avustralya), CySEC (Kıbrıs) ve DFSA (Dubai) dahil dört lisans taşıyor; bunların üçü Tier-1 otorite. Tier-1 lisanslar müşteri fonlarının şirket fonlarından ayrı tutulmasını, asgari sermaye rezervini ve bazı ülkelerde broker iflas ederse devreye giren bir tazminat şemasını şart koşar.",
          "LiteFinance grubunun da CySEC lisanslı bir Avrupa şirketi var — Liteforex (Europe) Ltd, lisans no 093/08 — ancak bu şirket yalnızca Avrupa Ekonomik Alanı müşterilerine hizmet veriyor. Türkiye'den açılan hesaplar bu şirkete değil, offshore tarafa bağlanıyor: LiteFinance Investment Limited (Mauritius FSC, lisans no GB20025921) veya LiteFinance Global LLC (Saint Vincent, kayıt no 931 LLC 2021 — bu bir şirket kaydıdır, denetleyici lisans değil).",
          "Pratik sonuç: Türkiye'den hesap açan bir yatırımcı için XM'in düzenleyici koruması belirgin şekilde daha güçlüdür. LiteFinance tarafında Mauritius FSC gerçek bir denetim katmanıdır, ancak Tier-1 seviyesinde değildir ve arkasında bir yatırımcı tazmin fonu yoktur. Her iki broker da SPK lisanslı değildir; Türkiye'ye hizmet veren tüm uluslararası brokerlar için bu geçerlidir.",
        ],
      },
      {
        heading: "Maliyet: fark hacimle büyüyor",
        paragraphs: [
          "Maliyet tarafında yön tersine dönüyor. İki brokerın ham spread hesapları arasındaki komisyon farkı, aynı işlemin fiyatını üç katına kadar değiştirebiliyor.",
        ],
        list: [
          "XM Standard/Micro: spread 1.0 pipten, komisyon yok, minimum yatırım 5 $. 1 lot EUR/USD maliyeti yaklaşık 10 $.",
          "XM Zero: spread 0.0 pipten, komisyon lot başına taraf başına 3,50 $, minimum yatırım 100 $. 1 lot maliyeti yaklaşık 10 $ (3 $ spread + 7 $ komisyon).",
          "LiteFinance Classic: spread 1.8 pipten, komisyon yok, minimum yatırım 50 $. 1 lot maliyeti yaklaşık 18 $.",
          "LiteFinance ECN: spread 0.0 pipten, komisyon lot başına 0,25 $'dan, minimum yatırım 50 $. 1 lot maliyeti yaklaşık 3,25-3,50 $.",
          "LiteFinance Cent: spread 3 pipten, komisyon yok, minimum yatırım 10 $ — maliyet açısından değil, öğrenme aracı olarak değerlendirilmesi gereken bir hesap.",
        ],
      },
      {
        heading: "Platform ve ürün",
        paragraphs: [
          "XM, MT4, MT5 ve kendi XM App'i üzerinden çalışıyor. Eğitim tarafı sektörde en güçlülerden biri: 23 dilde günlük canlı webinarlar, kapsamlı video kütüphanesi ve bir sadakat programı.",
          "LiteFinance dört platform sunuyor — MT4, MT5, cTrader ve tarayıcıdan çalışan kendi WebTerminal'i. cTrader desteği ayırt edici bir nokta: Level II fiyatlandırma ve yerel algoritmik işlem altyapısı nedeniyle ECN odaklı ve otomasyon kullanan yatırımcıların tercih ettiği platformdur ve XM'de bulunmaz.",
          "LiteFinance'in ikinci ayırt edici ürünü kendi sosyal işlem (copytrade) platformu: başka bir yatırımcının işlemlerini kopyalayabilir ya da kendi işlemlerinizi kopyalanmaya açıp kârdan komisyon alabilirsiniz. Fonlar kendi hesabınızda kalır ve kopyalama istediğiniz an durdurulabilir; kopyalama için tavsiye edilen başlangıç tutarı 50 dolardır.",
        ],
      },
      {
        heading: "Para çekme",
        paragraphs: [
          "İki brokerın da para çekme profili güçlü, ama mekanikleri farklı.",
          "XM'de çekim taleplerinin çoğu 24 saat içinde işleme alınır; e-cüzdan çekimleri genellikle aynı gün, kart ve banka çekimleri 2-5 iş günü sürer. XM çekim ücreti almaz.",
          "LiteFinance'te doğrulanmış bir hesapta otomatik çekim akışı açıkken talepler anlık işlenir — günde 5.000 dolara kadar, manuel onay beklemeden. Buna karşılık iki kısıt var: para yalnızca yatırıldığı yönteme ve aynı para birimine çekilebilir, ve yönteme göre %0-2 arası masraf çıkabilir.",
          "Özetle LiteFinance daha hızlı, XM daha az sürtünmeli. Anlık çekim önemli bir sinyaldir ama düzenleyici korumanın yerine geçmez — iki konu birbirinden bağımsızdır.",
        ],
      },
      {
        heading: "FXPARTNER Endeksi ve puanlar",
        paragraphs: [
          "Her broker dört eksende puanlanır: Regülasyon, Maliyet, Platform ve Para Çekme. XM'in bileşik endeksi 9.5, LiteFinance'in 9.1. Aradaki fark neredeyse tamamen regülasyon ekseninden geliyor — XM üç Tier-1 lisansla 5/5 alırken, Türkiye'den açılan hesabın offshore şirkete bağlanması nedeniyle LiteFinance 3/5'te kalıyor.",
          "Maliyet ve para çekme eksenlerinde ikisi de tam puana yakın; platform ekseninde LiteFinance dört platformuyla önde. Puanların tam dökümünü ve her eksenin gerekçesini iki brokerın inceleme sayfalarında görebilirsiniz.",
        ],
      },
      {
        heading: "Karar ağacı: hangisi sizin profilinize uyuyor?",
        paragraphs: [],
        list: [
          "Önceliğiniz düzenleyici koruma ve fon güvenliğiyse → XM. Üç Tier-1 lisans, bu karşılaştırmadaki tek gerçek ayrım noktasıdır ve telafi edilemez.",
          "Ayda 20 lotun üzerinde işlem yapıyorsanız ve maliyet asıl kaleminizse → LiteFinance ECN. Lot başına fark, yıllık toplamda hesap büyüklüğünüzle kıyaslanabilir bir tutara ulaşır.",
          "cTrader veya algoritmik işlem kullanıyorsanız → LiteFinance. XM cTrader desteklemiyor.",
          "10-50 dolar arası bir tutarla gerçek parayla öğrenmek istiyorsanız → LiteFinance Cent hesap. XM'in minimum yatırımı daha düşük (5 $) ama cent hesabı yok.",
          "Eğitim içeriği, webinar ve rehberlik arıyorsanız → XM. Bu alanda sektörün en güçlü kütüphanelerinden birine sahip.",
          "Başka birinin işlemlerini kopyalamak veya kendi işlemlerinizi kopyalatmak istiyorsanız → LiteFinance sosyal işlem platformu.",
          "Kararsızsanız → ikisini birden kullanmak yaygın ve makul bir çözümdür: uzun vadeli sermayeyi daha güçlü regüle olan tarafta tutup, maliyete duyarlı aktif işlemi diğer tarafta yapmak. Sermayeyi tek bir brokerda toplama zorunluluğunuz yok.",
        ],
      },
      {
        heading: "Son not",
        paragraphs: [
          "Bu karşılaştırmada bir kazanan ilan etmiyoruz çünkü dürüst cevap profile bağlı. Regülasyonu önceleyen biri için XM açık ara doğru tercih; maliyeti önceleyen aktif bir yatırımcı için LiteFinance ECN'in sunduğu rakamı XM'de bulmak mümkün değil.",
          "Hangisini seçerseniz seçin, karar vermeden önce iki şeyi kendiniz doğrulayın: hesabın hangi tüzel kişilikle açıldığı ve o hesap türünün güncel spread/komisyon rakamları. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "trump-clarity-act-cagrisi-kripto-yukselisi",
    coverImage: "/blog/trump-kripto-yasasi-cover.png",
    lang: "tr",
    title:
      "Trump'ın Kripto Yasası Çağrısı ve Kripto Yükselişi: Rakamlar, Takvim ve Gerçek Nedenler",
    excerpt:
      "Trump 19 Ağustos'ta Beyaz Saray'da CLARITY Act'in onaylanması çağrısı yaptı; Bitcoin 2 Haziran'dan bu yana ilk kez 70.000 doları gördü. Yükselişin arkasındaki üç katalizör, yasanın gerçek durumu ve 15 Eylül'deki kritik oylama.",
    publishedAt: "2026-08-20",
    readingMinutes: 8,
    sections: [
      {
        paragraphs: [
          "19 Ağustos 2026'da ABD Başkanı Donald Trump, Beyaz Saray yerleşkesindeki Eisenhower Binası'nda kripto sektörünün önde gelen isimleriyle bir araya geldi ve Senato'ya, CLARITY Act olarak bilinen kripto piyasa yapısı yasasını onaylama çağrısında bulundu. Toplantıda Coinbase, Ripple, Gemini, Robinhood, Polymarket ve Kalshi gibi şirketlerin üst düzey yöneticilerinin yanı sıra SEC ve CFTC yönetimi de yer aldı.",
          "Piyasa tepkisi sert oldu. Bitcoin 2 Haziran'dan bu yana ilk kez kısa süreliğine 70.000 doların üzerini gördü, Ethereum tek seansta çift haneli yükseldi ve toplam kripto piyasa değeri 2,3 trilyon doların üzerine çıktı.",
          "Bu yazının amacı manşeti tekrarlamak değil, iki şeyi netleştirmek: yasa henüz onaylanmadı ve yükselişin tek nedeni Trump'ın açıklaması değil. İkisini de sırayla ele alıyoruz.",
        ],
      },
      {
        heading: "Piyasada ne oldu: 19-20 Ağustos rakamları",
        paragraphs: [
          "Hareket kripto piyasasının geneline yayıldı ve altcoinlerde Bitcoin'den daha güçlü seyretti — regülasyon haberlerinde sık görülen bir örüntü, çünkü hukuki belirsizlikten en çok etkilenen varlıklar Bitcoin değil, menkul kıymet sayılıp sayılmayacağı tartışmalı olan tokenlar.",
        ],
        list: [
          "Bitcoin: 68.000-69.700 dolar bandında işlem gördü, gün içi zirvede 70.000 doların üzerine taştı; 24 saatlik değişim kaynağa ve saate göre yaklaşık +%5 ile +%7 arasında.",
          "Ethereum: 2.000 dolar seviyesini geri aldı ve 2.250 dolar civarına kadar yükseldi; günlük kazanç %17-18 bandında.",
          "Solana: yaklaşık 85 dolar, günlük +%10,8.",
          "XRP: yaklaşık 1,10 dolar, günlük +%10,3.",
          "Toplam kripto piyasa değeri 2,32 trilyon doların üzerine çıktı; Bitcoin dominansı %61 civarında.",
        ],
      },
      {
        paragraphs: [
          "Buradaki rakamlar 19-20 Ağustos seanslarına ait ve farklı kaynaklar farklı anlık görüntüler verdiği için birbirinden ayrışıyor — bazı yayınlar zirveyi 71.800 dolar civarında raporlarken, kapanışa yakın ölçümler 68.000-69.000 dolar aralığını gösteriyor. Bu bir çelişki değil, aynı günün farklı saatleri. İşlem yaparken tek referansınız kendi platformunuzdaki canlı fiyat olmalıdır.",
        ],
      },
      {
        heading: "CLARITY Act tam olarak ne yapıyor?",
        paragraphs: [
          "Tam adı Digital Asset Market Clarity Act. Bugün ABD'de bir kripto varlığın menkul kıymet mi (SEC yetkisi) yoksa emtia mı (CFTC yetkisi) sayılacağı büyük ölçüde dava dava, karar karar belirleniyor. Bu belirsizlik hem borsaların hangi kurala uyacağını hem de proje ekiplerinin ABD'de faaliyet gösterip gösteremeyeceğini bulanık bırakıyor.",
          "Tasarının getirmeyi hedeflediği çerçeve üç ana başlıkta özetlenebilir:",
        ],
        list: [
          "Hangi dijital varlığı hangi kurumun denetleyeceğini federal düzeyde netleştirmek — yani SEC ile CFTC arasındaki yetki sınırını çizmek.",
          "Kripto borsaları ve aracı kuruluşlar için kayıt, faaliyet ve müşteri varlıklarının korunmasına ilişkin kurallar oluşturmak.",
          "Kamu görevlilerinin dijital varlık ihraç etmesine ve bunlardan gelir elde etmesine ilişkin etik sınırlar koymak.",
        ],
      },
      {
        paragraphs: [
          "Sektörün bu yasayı yıllardır istemesinin nedeni tam olarak birinci madde: net bir kural, kısıtlayıcı bile olsa belirsizliğe tercih edilir, çünkü belirsizlik yatırım ve ürün planlamasını imkânsız kılar.",
        ],
      },
      {
        heading: "Yasa onaylanmadı — takvim ve gerçek durum",
        paragraphs: [
          "Bu ayrımın altını çizmek gerekiyor, çünkü haber sosyal medyada sık sık yasanın kabul edildiği izlenimiyle dolaşıyor. Trump'ın 19 Ağustos'taki açıklaması bir onay değil, bir çağrıydı. Tasarı hâlâ Senato'da bekliyor.",
          "Senato Çoğunluk Lideri John Thune 8 Ağustos'ta tasarı için cloture (görüşmeyi kapatma) önergesi verdi; bu adım 15 Eylül'de yapılacak bir usul oylamasının önünü açtı. Ancak orada oylanacak olan yasanın kabulü değil, görüşmeye başlanıp başlanmayacağıdır.",
          "Sayısal tablo şöyle: tasarının ilerlemesi için Senato'da 60 oy gerekiyor ve Cumhuriyetçilerin yaklaşık altı Demokrat oyuna ihtiyacı var. Tasarı Mayıs ayında Senato Bankacılık Komisyonu'ndan yalnızca iki Demokrat desteğiyle geçmişti ve o tarihten bu yana bu açık kapanmış değil.",
        ],
      },
      {
        paragraphs: ["Tıkanmanın üç ana nedeni var:"],
        list: [
          "Etik hükümleri: Kamu görevlilerinin ve eşlerinin dijital varlık ihraç etmesini yasaklamayı öngören düzenleme. Senatörler Ruben Gallego ve Thom Tillis'in hazırladığı uzlaşı metni, Trump'ın kripto şirketlerindeki paylarından çıkmasını da şart koşuyor; Trump bu metni henüz onaylamış değil. Haziranda açıklanan beyana göre başkanın 2025'te kripto işlerinden elde ettiği gelir 1,2 milyar dolara yakındı.",
          "Yasa dışı finansmanla mücadele ve kolluk yetkilerinin kapsamı konusunda anlaşma sağlanamaması.",
          "Stablecoin'lerin kullanıcılara getiri veya ödül dağıtıp dağıtamayacağı tartışması — bankacılık sektörünün yoğun lobi yaptığı başlık.",
        ],
      },
      {
        heading: "Yükselişin arkasındaki üç katalizör",
        paragraphs: [
          "Manşet Trump'ın çağrısı oldu, ancak aynı 48 saat içinde üç ayrı gelişme üst üste bindi. Hareketin büyüklüğünü dürüstçe açıklamak için üçünü birden saymak gerekiyor:",
        ],
        list: [
          "Politika sinyali: Trump'ın CLARITY Act çağrısı ve bir gün öncesinde, 18 Ağustos'ta SEC'in ilk kez doğrudan token ihraçlarına yönelik kural taslağı önermesi.",
          "Makro: ABD Hazinesi uzun vadeli tahvil geri alımlarını işlem başına 2 milyar dolardan 4 milyar dolara çıkardı. 30 yıllık tahvil faizi %5,337'den %5,18'e geriledi ve faizdeki bu gevşeme riskli varlıklara talebi doğrudan artırdı.",
          "Mekanik: kısa pozisyon tasfiyesi. 24 saat içinde yaklaşık 1,7-1,9 milyar dolarlık pozisyon likide oldu ve bunun ezici çoğunluğu short pozisyonlardı.",
        ],
      },
      {
        paragraphs: [
          "Üçüncü madde özellikle önemli. Short squeeze bir talep hikâyesi değil, bir zorunlu alım hikâyesidir: yükselen fiyat, aşağı yönlü bahis yapmış yatırımcıları pozisyonlarını kapatmak için alım yapmaya zorlar, bu alımlar fiyatı daha da yukarı iter ve döngü kendi kendini besler. Bu tür hareketler hızlı gelir; katalizör tükendiğinde ve zorunlu alımlar bittiğinde aynı hızla geri verilebilir.",
          "Yani 19 Ağustos'taki yükseliş yalnızca bir düzenleme beklentisinin fiyatlanması değil, üzerine kaldıraç tasfiyesi binmiş bir hareketti. Bu ayrım, hareketin kalıcılığı konusunda ne kadar iddialı olabileceğinizi belirler.",
        ],
      },
      {
        heading: "15 Eylül için üç senaryo",
        paragraphs: [
          "Piyasanın şu anda fiyatladığı şey bir sonuç değil, bir olasılık. Oylamanın üç makul çıktısı var ve her birinin farklı bir fiyat davranışı beklenir:",
        ],
        list: [
          "Usul oylaması geçer: Tasarı Senato gündemine girer. Bu, yasanın kabul edildiği anlamına gelmez ama belirsizliği azaltır. Beklenen tepki olumlu; ancak haber kısmen fiyatlandığı için ilk tepkinin ardından kâr satışı görülmesi olağandır.",
          "Usul oylaması geçmez: 60 oy eşiği aşılamaz ve süreç yeniden belirsizliğe döner. Ağustos yükselişinin bir kısmının geri verilmesi en olası senaryodur; bu durumda düşüşün sertliğini bu kez kaldıraçlı long pozisyonların tasfiyesi belirler.",
          "Hükümler yumuşatılarak uzlaşı sağlanır: Etik maddeleri ya da stablecoin başlığı esnetilerek ilerleme kaydedilir. Piyasa açısından genelde en olumlu senaryo budur, çünkü hem takvim işler hem de sektörün istediği yetki netliği korunur.",
        ],
      },
      {
        paragraphs: [
          "Burada klasik bir örüntüye dikkat etmek gerekiyor: söylentiyi al, haberi sat. Regülasyon süreçlerinde fiyat çoğu zaman beklenti aşamasında yükselir ve haber gerçekleştiğinde, sonuç olumlu olsa bile geri çekilir. Bu bir kural değil, ama sık tekrarlanan bir davranış biçimi.",
        ],
      },
      {
        heading: "Bu haber üzerinde işlem yapacaksanız",
        paragraphs: [
          "Haber odaklı hareketlerde en sık yapılan hata, yönü doğru tahmin edip pozisyon büyüklüğünü yanlış ayarlamaktır. Yön tuttuğu hâlde ara volatilite stop seviyesini süpürdüğü için zarar yazan çok sayıda işlem vardır.",
        ],
        list: [
          "Pozisyon büyüklüğünü normal seansa göre küçültün; oynaklık arttığında aynı lot artık aynı risk demek değildir. Sitemizdeki pozisyon büyüklüğü hesaplayıcısı bu ayarı hesabınıza göre yapmanızı sağlar.",
          "Kaldıracı düşürün. 19 Ağustos'ta 1,7 milyar doları aşan tasfiyenin nedeni yön hatası değil, kaldıraç seviyesiydi.",
          "Açıklama saatlerinde spreadlerin genişleyeceğini varsayın ve girişlerinizi bu genişlemeyi tolere edecek şekilde planlayın.",
          "15 Eylül'ü takviminize alın. Ekonomik takvim sayfamız bu tür planlı olayları önceden görmenizi sağlar; sürpriz olmayan bir volatiliteye hazırlıksız yakalanmak gereksizdir.",
          "Tek bir manşete göre işlem yapmayın. Yukarıdaki üç katalizör örneğinde olduğu gibi, bir hareketin nedeni çoğu zaman göründüğünden fazladır.",
        ],
      },
      {
        heading: "Sonuç",
        paragraphs: [
          "19 Ağustos'ta olan şey net: Trump kripto sektörüyle Beyaz Saray'da buluştu ve Senato'ya CLARITY Act'i onaylama çağrısı yaptı; piyasa bunu, tahvil geri alımları ve büyük bir short squeeze ile birlikte güçlü bir yükselişle fiyatladı. Olmayan şey de aynı ölçüde net: yasa onaylanmadı, 15 Eylül'deki oylama yalnızca bir usul adımı ve tasarının önündeki üç temel anlaşmazlık hâlâ çözülmüş değil.",
          "Bu iki cümleyi birbirine karıştırmamak, bu haberde alınabilecek en değerli pozisyondur. FXPARTNER olarak süreci takip etmeye ve 15 Eylül oylaması öncesinde gelişmeleri paylaşmaya devam edeceğiz.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kripto varlıklar ve kaldıraçlı işlemler yüksek risk içerir; sermayenizin tamamını kaybedebilirsiniz.",
        ],
      },
      {
        heading: "Kaynaklar",
        paragraphs: [
          "Bu yazıdaki olay akışı, yasama takvimi ve fiyat rakamları 19-20 Ağustos 2026 tarihli haberlerden derlenmiştir. Başlıca kaynaklar: CoinDesk, Forbes, The Block, Decrypt, American Banker ve ABD Senatosu Bankacılık Komisyonu'nun kamuya açık açıklamaları. Rakamlar derlendikleri andaki değerleri yansıtır ve okuduğunuz anda değişmiş olabilir.",
        ],
      },
    ],
  },
  {
    "slug": "xm-hesap-turleri-micro-standard-ultra-low-zero",
    "coverImage": "/blog/xm-hesap-turleri-micro-standard-ultra-low-zero-cover.png",
    "title": "XM Micro, Standard, Ultra Low ve Zero: Hangi Hesap Türü Size Uygun?",
    "excerpt": "XM'in beş hesap türünü spread, komisyon ve minimum yatırım açısından karşılaştırıyoruz. EURUSD standart lot üzerinden lot başına gerçek maliyeti dolar cinsinden hesaplayıp yıllık farkı ortaya koyuyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 8,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Hesap türü seçimi, çoğu yatırımcının hesap açarken en hızlı geçtiği ama sonradan en çok pişman olduğu adımdır. Ekrandaki tabloda \"0.0 pipten itibaren spread\" yazan satır doğal olarak en cazip görünür; yanındaki komisyon satırı ise küçük puntoyla kalır. Oysa işlem maliyeti tek bir kalemden değil, spread ile komisyonun toplamından oluşur ve bu toplam, aynı stratejiyi uygulayan iki kişinin yıl sonu bakiyesini birbirinden ayırabilecek büyüklüktedir.",
          "Bu yazıda XM'in beş hesap türünü (Micro, Standard, XM Ultra Low, Zero ve Shares) pazarlama diliyle değil, aritmetikle karşılaştıracağız. Amaç bir hesabı diğerine üstün ilan etmek değil; hangi profilin hangi maliyet yapısıyla daha az sürtünme yaşadığını göstermek. Hesaplamaların tamamı EURUSD üzerinden ve standart lot (100.000 birim) varsayımıyla yapılacak, çünkü karşılaştırmanın anlamlı olması için sabit bir zemin gerekiyor.",
          "Bir not: XM 2009'dan beri faaliyette, ASIC (443670), CySEC (120/10), DFSA (F003484) ve Belize FSC düzenlemeleri altında çalışıyor. Bu yazı regülasyon veya kurum incelemesi değil; herhangi bir brokerin lisans ve şikâyet geçmişini kendiniz doğrulamak isterseniz Broker Sorgulama aracı ve Broker Sıralamaları bunun için var. Burada odak tek bir teknik soruda: maliyet nerede oluşuyor?"
        ],
      },
      {
        "heading": "Beş hesap türü aslında üç farklı maliyet modeli",
        "paragraphs": [
          "İsimler beş tane olsa da, arkada yatan mantık üç grupta toplanıyor. Micro ve Standard aynı fiyatlama modelini paylaşıyor: 1.0 pipten itibaren spread, komisyon yok, minimum yatırım 5 $. Aralarındaki tek yapısal fark lot büyüklüğü; ikisi de aynı spread havuzundan besleniyor.",
          "İkinci grup XM Ultra Low. Spread 0.6 pipten itibaren başlıyor, yine komisyon alınmıyor, ancak minimum yatırım 100 $'a çıkıyor. Yani maliyetin tamamı hâlâ spreade gömülü, sadece daha dar.",
          "Üçüncü grup Zero. Burada spread 0.0 pipten itibaren başlıyor, ama maliyet spreadden komisyona taşınıyor: lot başına taraf başına 3.50 $. Minimum yatırım yine 100 $. Shares ise tamamen ayrı bir kategori: hisse başına komisyon alınıyor ve kaldıraç yok.",
          "Bu ayrımı kavramak önemli, çünkü \"komisyonsuz\" ifadesi maliyetsiz anlamına gelmiyor. Komisyonsuz hesaplarda maliyet, alış ile satış fiyatı arasındaki farkın içinde saklanıyor. Zero hesapta ise görünür hale geliyor. Hangisinin daha ucuz olduğu, tamamen sayılara bakmakla anlaşılır."
        ],
      },
      {
        "heading": "EURUSD tek lotta gerçek maliyet: 6 $, 7 $ ve 10 $ — ve \"0.0 spread\" neden her zaman en ucuz değil",
        "paragraphs": [
          "EURUSD'de standart lot 100.000 birimdir ve bu büyüklükte 1 pip hareket yaklaşık 10 $ değerindedir. Bu tek bilgi, üç hesabın maliyetini aynı para birimine çevirmemizi sağlar. Spread bir maliyettir çünkü pozisyonu açar açmaz o kadar zararla başlarsınız; komisyon ise doğrudan bakiyeden düşülür. İkisini de dolara çevirip toplarsak karşılaştırma dürüst olur.",
          "Sonuç sezgiye ters çıkar: en agresif görünen spread rakamına sahip Zero hesap, komisyon eklendiğinde Ultra Low'dan lot başına 1 $ daha pahalıdır. 7 $'a karşı 6 $. Fark küçük görünebilir, ama oransal olarak yaklaşık yüzde 17'lik bir maliyet farkıdır ve işlem sayısıyla doğrusal olarak büyür.",
          "Burada dikkat edilmesi gereken bir nüans var. Hem 0.0 hem 0.6 rakamları \"itibaren\" ifadesiyle veriliyor; bunlar taban değerler, ortalama değil. Likiditenin daraldığı saatlerde, veri açıklamalarında ve seans açılışlarında her iki hesapta da spread genişler. Ancak Zero hesapta komisyon sabittir, spread ise değişkendir; Ultra Low'da maliyetin tamamı değişkendir. Yani volatil dönemlerde Zero'nun maliyetinin sabit kısmı bir tampon işlevi görebilir, sakin dönemlerde ise dezavantaja dönüşür.",
          "İkinci nüans: bu karşılaştırma EURUSD'ye özgüdür. Spreadi doğal olarak geniş olan egzotik pariteler veya bazı emtialarda, sabit komisyonlu bir yapı ile değişken spreadli yapı arasındaki denge değişebilir. Bu yüzden kendi işlem yaptığınız enstrümanda aynı hesabı yapmadan genelleme yapmayın. Pozisyon Hesaplayıcı, kendi lot büyüklüğünüz ve enstrümanınız için pip değerini çıkarmanıza yardımcı olur.",
          "Hesap gidiş-dönüş (round-turn), yani pozisyonu açıp kapatmanın toplam maliyeti üzerinden yapılmalıdır:"
        ],
        "list": [
          "Zero hesap: 0.0 pip spread = 0 $ + komisyon 3.50 $ giriş + 3.50 $ çıkış = toplam 7 $ / lot",
          "XM Ultra Low: 0.6 pip spread = 6 $ + komisyon yok = toplam 6 $ / lot",
          "Standard: 1.0 pip spread = 10 $ + komisyon yok = toplam 10 $ / lot",
          "Micro: Standard ile aynı fiyatlama, 1.0 pip; maliyet lot büyüklüğüyle orantılı olarak küçülür"
        ],
      },
      {
        "heading": "Aylık 10, 50 ve 100 lotta yıllık fark ne kadar?",
        "paragraphs": [
          "Lot başına 1-4 dolarlık farklar tek işlemde önemsiz görünür. Yıllık hacme yayıldığında ise strateji seçiminden bağımsız, kaçınılmaz bir sızıntı kalemine dönüşür. Aşağıda üç farklı hacim senaryosu için yıllık toplam maliyetler yer alıyor. Hesap basittir: lot başına maliyet çarpı aylık lot çarpı 12."
        ],
        "list": [
          "Aylık 10 lot (yıllık 120 lot): Ultra Low 720 $, Zero 840 $, Standard/Micro 1.200 $. Ultra Low ile Zero arası fark 120 $, Standard ile Ultra Low arası fark 480 $.",
          "Aylık 50 lot (yıllık 600 lot): Ultra Low 3.600 $, Zero 4.200 $, Standard/Micro 6.000 $. Ultra Low ile Zero arası fark 600 $, Standard ile Ultra Low arası fark 2.400 $.",
          "Aylık 100 lot (yıllık 1.200 lot): Ultra Low 7.200 $, Zero 8.400 $, Standard/Micro 12.000 $. Ultra Low ile Zero arası fark 1.200 $, Standard ile Ultra Low arası fark 4.800 $.",
          "Standard ile Zero arasındaki yıllık fark aynı senaryolarda sırasıyla 360 $, 1.800 $ ve 3.600 $ olur."
        ],
      },
      {
        "heading": "Micro hesap bir cent hesabı değildir",
        "paragraphs": [
          "Piyasada en sık karşılaşılan yanlış anlamalardan biri Micro hesabın bir \"cent hesabı\" olduğu düşüncesidir. Cent hesaplarda bakiyeniz sent cinsinden gösterilir; 10 $ yatırdığınızda ekranda 1.000 birim görürsünüz ve bu psikolojik bir yanılsama yaratır. XM'in Micro hesabı böyle çalışmaz.",
          "Micro hesabın yaptığı tek şey, sözleşme büyüklüğünü küçültmek; yani aynı fiyatlama ve aynı spread yapısıyla, çok daha küçük lot adımlarına izin vermektir. Bakiye normal para biriminde tutulur, kâr ve zarar gerçek değerleriyle görünür. Spread yine 1.0 pipten itibaren başlar, komisyon yine yoktur, minimum yatırım yine 5 $'dır.",
          "Bunun pratik anlamı şudur: Micro hesap, maliyeti ucuzlatan bir hesap değil, riski küçük parçalara bölmeye izin veren bir hesaptır. Küçük sermayeyle gerçek piyasa koşullarında pozisyon boyutlandırmayı öğrenmek isteyen biri için gerçekten faydalıdır, çünkü Standard hesapta yuvarlanamayacak kadar küçük risk birimleriyle çalışabilirsiniz. Ama lot başına oransal işlem maliyetiniz Standard ile aynı kalır."
        ],
      },
      {
        "heading": "Asıl ayrım noktası spread değil, 5 $ ile 100 $ arasındaki eşik",
        "paragraphs": [
          "Beş hesabı yan yana koyduğunuzda en keskin çizgi, 0.4 pipin nerede olduğu değil, minimum yatırımın nerede olduğudur. Micro, Standard ve Shares 5 $'dan başlarken, Ultra Low ve Zero 100 $ eşiğinden başlar. Bu, hesapları fiilen iki dünyaya böler: düşük eşikli hesaplar tanışma ve öğrenme alanı, 100 $ eşikli hesaplar ise maliyet optimizasyonu alanıdır.",
          "5 $ ile hesap açılabilmesi bir kolaylıktır, ancak 5 $ ile işlem yapmak risk yönetimi açısından ciddi biçimde sorunludur. Nedenini birkaç maddede toplayalım:"
        ],
        "list": [
          "5 $'lık bir bakiyede, işlem başına yüzde 1 risk almak 5 sentlik bir risk demektir; bu tutarda anlamlı bir zarar durdur mesafesi kurmak matematiksel olarak mümkün değildir.",
          "Zorunlu olarak sermayeye göre çok büyük pozisyonlar açılır, yani kaldıraç fiilen sonuna kadar kullanılır ve tek bir hareket hesabı sıfırlar.",
          "İşlem maliyeti bakiyeye oranla devasa hale gelir: tek bir mikro pozisyonun spread maliyeti bile bakiyenin kayda değer bir yüzdesini götürebilir.",
          "Sonuçlar istatistiksel olarak anlamsızlaşır; birkaç işlemde hesabın bitmesi stratejinin iyi ya da kötü olduğu hakkında hiçbir şey söylemez.",
          "Psikolojik olarak yanlış alışkanlık kazandırır: kaybedilecek tutar önemsiz olduğu için disiplinsiz işlem normalleşir.",
          "Negatif bakiye koruması sizi borca düşmekten korur, ancak sermayenizi kaybetmekten korumaz; bu iki şey aynı değildir."
        ],
      },
      {
        "heading": "Shares hesabı neden kaldıraçsız ve kime mantıklı?",
        "paragraphs": [
          "Shares hesabı diğer dördünden temelde ayrılır: hisse başına komisyon alınır ve kaldıraç yoktur. Kaldıracın olmaması bir eksiklik değil, ürünün doğasıyla ilgili bir tercihtir. Tek bir şirket hissesi, bir para biriminden çok daha sert ve daha ani hareket edebilir; bilanço açıklamaları, temettü kararları veya şirkete özgü haberler gecede çift haneli boşluklar yaratabilir. Bu tür bir varlıkta kaldıraç, riski yönetilebilir olmaktan çıkarır.",
          "Kaldıraçsız yapı, pozisyonun büyüklüğünün doğrudan yatırdığınız parayla sınırlı olması demektir. Bu, teminat tamamlama baskısını ortadan kaldırır ve pozisyonu istediğiniz kadar uzun süre taşımanıza izin verir. Buna karşılık aynı getiriyi elde etmek için çok daha fazla sermaye bağlamanız gerekir.",
          "Bu hesap, kaldıraçlı döviz işlemi yapmak istemeyen, tekil şirketlere orta-uzun vadeli maruziyet arayan ve pozisyonunu haftalarca taşımayı planlayan bir profile mantıklı gelir. Gün içi hızlı alım satım yapan biri için ise komisyon yapısı ve kaldıraç yokluğu birlikte anlamsız bir kombinasyon oluşturur. Şirket bilançolarının yoğunlaştığı dönemleri (örneğin 26 Ağustos akşamı açıklanacak Nvidia bilançosu gibi) takip etmek isteyenler için Ekonomik Takvim bu tarihleri önceden görmeye yarar."
        ],
      },
      {
        "heading": "Karar ağacı: hangi profil hangi hesaba gitmeli?",
        "paragraphs": [
          "Tabloya bakıp \"o zaman herkes Ultra Low açsın\" demek acele bir sonuç olur. Üç şeyi birlikte düşünmek gerekir.",
          "Birincisi, maliyet farkı ancak sermayenizle orantılı olduğunda anlamlıdır. 1.000 $ sermayeyle ayda 100 lot işlem yapmak zaten sürdürülebilir bir tablo değildir; oradaki asıl sorun 4.800 $'lık maliyet farkı değil, hacmin sermayeye oranıdır. Buna karşılık 50.000 $ sermayeyle ayda 50 lot çeviren bir hesapta 2.400 $'lık yıllık fark, doğrudan getiriden düşen somut bir kalemdir.",
          "İkincisi, bu hesap yalnızca işlem maliyetini kapsar. Gecelik pozisyon taşıma (swap) maliyetleri, kayma (slippage) ve emir gerçekleşme kalitesi bu tabloya dahil değildir ve bazı stratejilerde spread farkından daha belirleyici olabilir.",
          "Üçüncüsü, işlem sıklığı düşükse bu farkların pratik etkisi sınırlıdır. Ayda birkaç pozisyon açan, hedefi yüzlerce pip olan bir swing yatırımcısı için 0.4 pipin peşine düşmek, dikkati asıl meseleden (pozisyon boyutu ve zarar durdur disiplininden) uzaklaştırır. Bu farklar, işlem sıklığı arttıkça önem kazanır.",
          "Bu üç filtreyi kendi durumunuza uyguladıktan sonra aşağıdaki liste, yukarıdaki tüm hesaplamaların özeti olarak iş görür. Kendi profilinizi en yakın satırda bulup oradan başlayabilirsiniz. Hiçbiri kesin bir reçete değil, sadece maliyet ve risk yapısına dayanan bir yön göstergesidir."
        ],
        "list": [
          "Sermayeniz 100 $'ın altında ve amacınız gerçek koşullarda pozisyon boyutlandırma öğrenmekse: Micro. Maliyet avantajı yok, ama riski yeterince küçük parçalara bölebilirsiniz.",
          "Sermayeniz birkaç yüz dolar seviyesinde ve normal lot adımlarıyla çalışmak istiyorsanız: Standard. Micro ile aynı fiyatlama, daha büyük sözleşme birimi.",
          "Sermayeniz 100 $ üzerinde ve işlem sıklığınız orta-yüksekse: XM Ultra Low. EURUSD'de lot başına 6 $ ile üç seçenek arasındaki en düşük toplam maliyet burada; komisyon takibi de gerekmez.",
          "Spreadin sıfıra yakın olmasının stratejiniz için teknik bir gereklilik olduğunu düşünüyorsanız: Zero. Ancak lot başına 7 $ toplam maliyeti kabul ettiğinizi bilerek girin.",
          "Kaldıraç kullanmak istemiyor, tekil hisselerde orta-uzun vadeli pozisyon taşımayı planlıyorsanız: Shares.",
          "Ayda birkaç işlem yapan bir swing yatırımcısıysanız: hesap türü tercihiniz sonucunuzu belirleyen değişken değildir; enerjinizi pozisyon boyutu ve zarar durdur disiplinine ayırın.",
          "Hangi profile girdiğinizden emin değilseniz: önce üç ay boyunca gerçek işlem sıklığınızı ölçün, sonra bu yazıdaki lot başına maliyet rakamlarıyla kendi hesabınızı yapın."
        ],
      },
      {
        "heading": "Sonuç: karşılaştırmayı doğru kalemler üzerinden yapın",
        "paragraphs": [
          "Bu yazının tek teknik iddiası şudur: EURUSD standart lotta Zero hesabın toplam maliyeti 7 $, Ultra Low'un 6 $, Standard ve Micro'nun 10 $'dır. \"0.0 spread\" ifadesi bir pazarlama başlığı değil, doğru bir bilgidir; ancak yanına 7 $'lık gidiş-dönüş komisyonu eklenmeden okunduğunda yanıltıcı bir sonuca götürür. Karşılaştırmayı her zaman spread artı komisyon toplamı üzerinden, kendi enstrümanınız ve kendi lot büyüklüğünüzle yapın.",
          "XM'in bu tabloyla ilgili dürüstçe anılması gereken sınırları da var: raw-spread hesap seçenekleri sınırlı sayıda, maksimum kaldıraç bölgeye ve hesabın bağlı olduğu tüzel kişiliğe göre değişiyor ve cTrader desteklenmiyor; platform tarafında MT4, MT5 ve XM App ile yetinmeniz gerekiyor. Minimum yatırımın 5 $ olması ise bir imkândır, davet değil. Hesap türü seçimi maliyeti birkaç yüz ile birkaç bin dolar arasında değiştirebilir; ama hiçbir hesap türü zayıf bir risk yönetimini telafi etmez. Sorularınızı somutlaştırmak için AI Asistan üzerinden kendi senaryonuzu da çalıştırabilirsiniz.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "xm-para-yatirma-cekme-sureler-kyc",
    "coverImage": "/blog/xm-para-yatirma-cekme-sureler-kyc-cover.png",
    "title": "XM'de Para Yatırma ve Çekme: Gerçek Süreler, KYC ve Takılma Noktaları",
    "excerpt": "XM'de yatırma ve çekme yöntemlerinin gerçek süreleri, \"işleme alma\" ile \"hesaba geçme\" arasındaki fark, KYC belgelerinin neden reddedildiği ve çekim geciktiğinde izlenecek adımlar.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 9,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Bir brokerle ilişkinizin ilk günü genellikle sorunsuz geçer. Para yatırma ekranı hızlıdır, kart bilgisi girilir, bakiye birkaç saniye içinde görünür. Bu aşamada hiçbir broker sizi zorlamaz; çünkü içeri para girişi, hemen her kurumun teknik ve ticari olarak en çok yatırım yaptığı süreçtir. Asıl sınav, ilk çekim talebini gönderdiğiniz gün başlar.",
          "Yatırma ile çekme arasındaki bu asimetri kötü niyetin işareti değil, sistemin yapısal bir sonucudur. Yatırmada broker parayı alan taraftır ve kimlik doğrulama yükünü ödeme sağlayıcısı üstlenir. Çekmede ise broker parayı gönderen taraf olur; bu andan itibaren kara para aklamayla mücadele mevzuatı, kaynak doğrulama kuralları ve ödeme sağlayıcılarının kendi takvimleri devreye girer. Aynı kullanıcı, aynı hesap, tamamen farklı bir prosedür.",
          "Bu yazıda XM örneği üzerinden yöntem bazlı gerçek süreleri, \"24 saat içinde işleme alınır\" ifadesinin ne anlama geldiğini, çekimlerin neden paranın yatırıldığı yönteme yapıldığını ve KYC belgelerinin hangi nedenlerle reddedildiğini ele alacağız. Amaç bir kurumu övmek değil; süreci önceden bilerek gereksiz bekleme ve hayal kırıklığı yaşamamanızı sağlamak."
        ],
      },
      {
        "heading": "Yatırma hızı bir kalite göstergesi değil; yöntem bazlı gerçek süreler ne diyor?",
        "paragraphs": [
          "Pazarlama materyallerinde en sık öne çıkarılan cümlelerden biri \"anında para yatırma\"dır. Oysa bu, sektörde neredeyse standarttır ve bir kurumu diğerinden ayırt etmez. Kart ve e-cüzdan altyapıları zaten anlık çalışır; broker burada yalnızca bir tahsilat kanalı kullanmaktadır. Değerlendirme yaparken ağırlığı yatırma hızına değil, çekim davranışına vermek gerekir: bir kurumun parayı ne kadar kolay aldığı değil, ne kadar öngörülebilir biçimde geri verdiği ölçüdür.",
          "Süre beklentisini doğru kurmanın yolu ise yöntemleri tek tek ayırmaktan geçer. \"Ne kadar sürer?\" sorusunun tek bir cevabı yoktur; cevap seçtiğiniz kanala göre değişir. XM'in bildirdiği çerçeve şu şekildedir (minimum yatırım tutarı 5 dolardır; Ultra Low ve Zero hesaplarında bu eşik 100 dolara çıkar):",
          "Bu sürelerin hiçbiri garanti değildir; hafta sonu, resmî tatiller, bankalar arası mutabakat günleri ve ödeme sağlayıcısının kendi doğrulama süreçleri takvimi uzatabilir. Özellikle Cuma akşamı gönderilen bir talebin pratikte Pazartesi işlem görmesi olağandır."
        ],
        "list": [
          "Kart ve e-cüzdan yatırma (Skrill, Neteller, WebMoney): genellikle anında.",
          "Banka havalesi ile yatırma: 1-3 iş günü.",
          "Çekim talebinin işleme alınması: genellikle 24 saat içinde.",
          "E-cüzdana çekim: çoğunlukla aynı gün.",
          "Karta ve banka havalesine çekim: 2-5 iş günü.",
          "XM tarafında yatırma ve çekme işlemleri için ücret alınmaz; ancak aracı banka veya cüzdan sağlayıcısının kendi kesintileri olabilir."
        ],
      },
      {
        "heading": "\"24 saat içinde işleme alınır\" ile \"hesabınıza geçer\" aynı şey değil",
        "paragraphs": [
          "Kullanıcıların yaşadığı hayal kırıklığının büyük kısmı, tek bir cümlenin yanlış okunmasından kaynaklanır. \"Çekim talepleri 24 saat içinde işleme alınır\" ifadesi, paranın 24 saat içinde hesabınızda olacağı anlamına gelmez. Bu cümle yalnızca sürecin brokerın kontrolündeki kısmını tarif eder.",
          "Süreci iki bağımsız aşamaya ayırmak gerekir. Birinci aşama, brokerın iç onayıdır: talebin alınması, hesabın KYC durumunun ve serbest teminatın kontrol edilmesi, ödeme talimatının hazırlanması ve sağlayıcıya iletilmesi. XM'de bu aşama genellikle 24 saat içinde tamamlanır ve tamamen kurumun sorumluluğundadır.",
          "İkinci aşama ise brokerın kontrolü dışındadır: ödeme sağlayıcısının, kart şebekesinin veya muhabir bankaların parayı hedefe ulaştırması. E-cüzdanlarda bu ikinci aşama neredeyse anlıktır, bu yüzden e-cüzdan çekimleri çoğunlukla aynı gün sonuçlanır. Kart iadelerinde ise para, ilgili kart şebekesi üzerinden geri akar ve bu akış 2-5 iş günü sürebilir; banka havalesinde muhabir banka zinciri devreye girdiği için süre benzer bir bantta kalır.",
          "Pratik sonuç şudur: 24. saatte para hesabınızda değilse bu, otomatik olarak bir sorun anlamına gelmez. Sorun sinyali, talebin brokerda hâlâ \"beklemede\" görünmesidir. Talep \"işlendi\" statüsüne geçmişse top artık ödeme sağlayıcısındadır ve doğru muhatap orasıdır."
        ],
      },
      {
        "heading": "Neden para, yatırdığınız yönteme geri dönmek zorunda?",
        "paragraphs": [
          "En sık karşılaşılan itiraz şudur: \"Ben kartla yatırdım ama Skrill'e çekmek istiyorum, neden olmuyor?\" Bunun cevabı brokerın keyfî bir tercihi değil, kara para aklamayla mücadele mevzuatının temel kuralıdır. Bu kural literatürde fon kaynağının izlenebilirliği, yani source of funds ilkesi olarak geçer.",
          "Mantık basittir. Eğer bir kullanıcı A kanalından para yatırıp B kanalından çekebilseydi, aracı kurum fiilen bir para transfer hizmetine dönüşürdü: fonun kaynağı ile varış noktası arasındaki bağ kopar, işlem zinciri izlenemez hale gelir. Düzenleyiciler tam da bunu engellemek için, çekimlerin öncelikle paranın geldiği kanala yapılmasını şart koşar. XM'in çekim politikasında bu kuralın uygulanması, sektör standardının dışına çıkmak değil, tam tersine standarda uymaktır.",
          "Uygulamada bu şöyle işler: kartla 500 dolar yatırdıysanız, çekiminiz önce o kart üzerinden yatırdığınız tutara kadar karta iade olarak gerçekleşir. Yatırdığınız tutarı aşan kâr kısmı, kart şebekeleri iade tutarını orijinal işlem tutarıyla sınırladığı için genellikle banka havalesi gibi ikinci bir kanala yönlendirilir. Yani birden fazla yöntemle yatırım yaptıysanız, çekiminiz de birden fazla parçaya bölünebilir ve her parçanın kendi süresi işler.",
          "Bu nedenle yatırma yöntemi seçimi aslında bir çekim yöntemi seçimidir. Paranızı hangi kanaldan gönderirseniz, büyük olasılıkla o kanaldan geri alacaksınız. Hızlı çekim önceliğiniz varsa, karar anı çekim ekranı değil, ilk yatırma ekranıdır."
        ],
      },
      {
        "heading": "KYC'yi hesap açar açmaz tamamlamak neden doğru sıra?",
        "paragraphs": [
          "Çoğu kullanıcı KYC belgelerini ilk çekim talebini gönderdikten sonra yüklemeye başlar. Bu, sürecin en yorucu biçimde yaşanmasının ana nedenidir. Belge doğrulama zaten birkaç gün sürebilecek bir işlemdir; onu paranıza ihtiyaç duyduğunuz güne bırakmak, bekleme süresini gereksiz yere uzatır ve stres altında hatalı belge yüklemeye yol açar.",
          "Doğru sıra şudur: hesabı açın, belgeleri aynı gün yükleyin, doğrulamanın tamamlandığını görün, sonra ilk yatırımı yapın. Böylece çekim gününde tek beklemeniz gereken şey ödeme sağlayıcısının takvimi olur. XM'de çekim işlemleri KYC'si tamamlanmış hesaplarda yapılır; bu bir istisna değil, düzenlemeye tabi tüm kurumlarda geçerli bir ön koşuldur.",
          "Genel olarak istenen belge seti iki başlıkta toplanır. Birincisi kimlik teyidi, ikincisi adres teyidi:"
        ],
        "list": [
          "Kimlik belgesi: pasaport, kimlik kartı veya ehliyet. Fotoğraf, ad-soyad, doğum tarihi, belge numarası ve son geçerlilik tarihi okunabilir olmalı.",
          "Adres teyidi: son dönemli elektrik, su, doğalgaz veya internet faturası ya da banka hesap ekstresi. Belgede ad-soyad ve tam adres birlikte görünmeli.",
          "Belgenin dört köşesi de kadraja girmiş olmalı; kesik kenar en sık ret nedenlerinden biridir.",
          "Kart ile yatırım yapıldıysa kartın ön ve arka yüzü istenebilir; bu durumda kart numarasının ortadaki hanelerinin ve arka yüzdeki güvenlik kodunun kapatılması beklenir.",
          "Ad-soyad yazımı, hesap açılışında girdiğiniz bilgiyle birebir aynı olmalı."
        ],
      },
      {
        "heading": "Belgeler en çok hangi nedenlerle reddediliyor?",
        "paragraphs": [
          "Belge reddi genellikle kullanıcının kimliğiyle değil, dosyanın teknik kalitesiyle ilgilidir. Doğrulama ekipleri belgeyi makine ve insan gözüyle okunabilir bulmak zorundadır; okunamayan bir belge, doğru bilgi içerse bile kabul edilemez. En yaygın ret nedenleri şunlardır:",
          "Bu listedeki maddelerin ortak özelliği, hepsinin baştan önlenebilir olmasıdır. Belgeyi düz bir zeminde, gündüz ışığında, gölge düşürmeden ve tam kadrajla çekmek, ret ihtimalini büyük ölçüde ortadan kaldırır. Tarayıcı kullanımı, telefon kamerasına göre daha az sorun çıkarır.",
          "İsim uyuşmazlığı ayrı bir başlık hak eder. Evlilik sonrası soyadı değişikliği, ikinci ad kullanımı veya Türkçe karakterlerin farklı yazımı gibi durumlar sistemin otomatik eşleştirmesini bozar. Böyle bir durum varsa, belgeyi yüklemeden önce destek hattına açıklama yapmak süreci kısaltır. XM tarafında 28'den fazla dilde 7/24 canlı destek bulunması, bu tür açıklamaların kendi dilinizde yapılabilmesi açısından pratik bir kolaylıktır."
        ],
        "list": [
          "Belgenin kenarları kesik veya bir köşesi kadraj dışında.",
          "Düşük çözünürlük; yazılar veya belge numarası okunamıyor.",
          "Flaş yansıması, gölge veya parmakla kapatılmış alanlar.",
          "Süresi geçmiş kimlik belgesi veya tarihi çok eski adres belgesi.",
          "Belgedeki ad-soyad ile hesaptaki ad-soyadın uyuşmaması.",
          "Adres belgesinde ad-soyad veya adresten birinin görünmemesi.",
          "Ekran fotoğrafı olarak alınmış, üzerinde tarayıcı arayüzü görünen dosyalar."
        ],
      },
      {
        "heading": "Bonuslu hesapta çekim yaparsanız ne olur?",
        "paragraphs": [
          "Bonus kampanyaları sektörde yaygındır ve genel mantıkları birbirine benzer. Bonus, bakiyenizde görünen ama sizin yatırdığınız para olmayan bir tutardır; kurum bu tutarı belirli bir işlem hacmi karşılığında sunar. Bu yüzden çoğu programda para çekimi, çekilen tutarla orantılı biçimde bonusun bir kısmının veya tamamının hesaptan düşülmesine yol açar.",
          "Hacim şartının arkasındaki mantık da aynı yerden gelir. Bonusun doğrudan nakde çevrilebilmesi durumunda kampanya bir promosyon olmaktan çıkıp doğrudan nakit dağıtımına dönüşür. Bu nedenle bonusla ilişkili tutarın serbest kalması genellikle belirli bir lot hacminin tamamlanmasına bağlanır. Buradaki oranlar kampanyadan kampanyaya ve bölgeden bölgeye değiştiği için, kendi hesabınıza uygulanan koşulları kampanya sayfasından ve destek üzerinden doğrulamanız gerekir; genel bir rakam vermek yanıltıcı olur.",
          "Pratik öneri şudur: bonuslu bir hesapta kısmi çekim yapmayı planlıyorsanız, çekim öncesi bakiyenizin ne kadarının bonus kaynaklı olduğunu ve çekimin marjinizi nasıl etkileyeceğini hesaplayın. Açık pozisyonu olan bir hesapta çekim, serbest teminatı düşürerek margin call eşiğini yaklaştırabilir. Pozisyon büyüklüğü ile teminat ilişkisini önceden görmek için Pozisyon Hesaplayıcı bu tür senaryolarda işe yarar."
        ],
      },
      {
        "heading": "Çekim gecikti: adım adım ne yapmalı?",
        "paragraphs": [
          "Beklenen süre aşıldığında ilk refleks genellikle destek hattına sitem etmek olur; oysa doğru sıralamayla ilerlemek hem daha hızlı sonuç verir hem de sorunun gerçekten nerede olduğunu gösterir. Aşağıdaki adımları sırasıyla uygulayın:",
          "Bu adımlar sonunda sorun çözülmüyorsa, elinizde artık somut bir kayıt olur: talep tarihi, statü değişikliği zamanı, işlem referansı ve destek yazışması. Bir brokerle yaşanan uyuşmazlıkta düzenleyiciye veya bağımsız uzlaştırma mekanizmasına başvurmanın ön koşulu, tam olarak bu kayıt setidir. Şikâyet geçmişi ve lisans durumu kontrolü için Broker Sorgulama aracı ile Broker Sıralamaları başlangıç noktası olabilir."
        ],
        "list": [
          "Hesabınızdaki işlem geçmişinden talebin statüsünü kontrol edin: hâlâ beklemede mi, işlendi mi?",
          "KYC durumunuzun tamamlanmış göründüğünü doğrulayın; eksik belge çekimi sessizce bekletebilir.",
          "Talebin banka veya cüzdan sağlayıcısının tatil ve mutabakat takvimine denk gelip gelmediğine bakın.",
          "Statü \"işlendi\" ise brokerdan işlem referans numarasını isteyin ve bu numarayla ödeme sağlayıcısına veya bankanıza başvurun.",
          "Statü hâlâ \"beklemede\" ise canlı destekten yazılı olarak gerekçe talep edin; sözlü bilgiyle yetinmeyin.",
          "Tüm yazışmaları, ekran görüntülerini ve tarihleri saklayın.",
          "Sorun 5 iş gününü aşıyor ve gerekçe verilmiyorsa, kurumun lisans aldığı düzenleyicinin şikâyet kanalını öğrenin."
        ],
      },
      {
        "heading": "Çekim davranışı, bir brokerı değerlendirmede en dürüst sinyaldir",
        "paragraphs": [
          "Bir aracı kurumun reklamı, spread tablosu, platform çeşitliliği ve eğitim içeriği hakkında söylenen her şey pazarlama tarafından şekillendirilebilir. Çekim süreci ise şekillendirilemez; çünkü orada kurumun operasyonel disiplini, likidite yönetimi ve düzenleyici uyumu doğrudan görünür hale gelir. Parayı zamanında ve gerekçesiz sorun çıkarmadan gönderen bir kurum, bunu her ay tekrar tekrar kanıtlamak zorundadır.",
          "Bu yüzden bir brokerı test etmenin en sağlıklı yolu, büyük bir tutarla başlamak değil, küçük bir yatırım yapıp erken bir çekim denemesidir. Süreç boyunca ne kadar bilgi verildiği, statülerin ne kadar şeffaf göründüğü ve destek ekibinin yazılı gerekçe verip vermediği, tablo ve rakamlardan çok daha fazlasını anlatır. XM örneğinde süreler ve ücretsiz çekim politikası açıkça duyurulmuş durumdadır; sizin işiniz bu duyuruyu kendi hesabınızda doğrulamaktır.",
          "Özetle: KYC'yi ilk gün bitirin, yatırma yöntemini çekim yöntemi olarak düşünerek seçin, \"işleme alma\" ile \"hesaba geçme\" arasındaki farkı bilerek bekleyin ve gecikme durumunda duygusal değil kayıt temelli ilerleyin. Bu dört alışkanlık, çekim sürecinde yaşanan sorunların büyük bölümünü baştan ortadan kaldırır.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "mt4-mt5-xm-app-hangi-platform",
    "coverImage": "/blog/mt4-mt5-xm-app-hangi-platform-cover.png",
    "title": "MT4, MT5 ve XM App: Hangi Platformda İşlem Yapmalısınız?",
    "excerpt": "MT4 ile MT5 arasındaki fark bir sürüm yükseltmesinden ibaret değil; MQL4 ve MQL5 birbiriyle uyumlu bile değil. Üç platformu kabiliyet, ekosistem ve broker bağımsızlığı açısından karşılaştırıyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 9,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Platform seçimi, hesap türü seçimi kadar dikkat çekmeyen ama etkisi daha uzun süren bir karardır. Hesap türünü sonradan değiştirmek çoğu kurumda birkaç dakikalık bir işlemdir; platform değiştirmek ise yıllar içinde biriktirdiğiniz şablonları, indikatör ayarlarını, grafik düzenlerini ve varsa otomatik işlem sistemlerinizi yeniden kurmak anlamına gelir. Bu yüzden platform kararı, günlük konfor sorusundan çok bir taşınma maliyeti sorusudur.",
          "Piyasada bu konu genellikle yanlış çerçevelenir: \"MT5, MT4'ün yeni sürümüdür, o hâlde daha iyidir\" cümlesi teknik olarak yanıltıcıdır. İkisi aynı şirketin ürünü olsa da farklı ürünlerdir, farklı programlama dilleriyle çalışırlar ve birinde yazdığınız bir sistem diğerinde çalışmaz. Aynı şekilde, bir brokerin kendi mobil uygulaması ile bir masaüstü işlem terminalini yan yana koyup \"hangisi daha iyi\" diye sormak da doğru soru değildir; bunlar farklı işleri yapan araçlardır.",
          "Bu yazıda XM'in sunduğu üç platformu — MT4, MT5 ve XM App — kabiliyet, ekosistem, hesap modeli ve broker bağımsızlığı başlıkları altında karşılaştıracağız. Sonunda demo hesapta uygulayabileceğiniz somut bir test protokolü ve profil bazlı bir karar listesi bulacaksınız. Amaç bir platformu diğerine üstün ilan etmek değil; hangi kullanım tarzının hangi araçla daha az sürtünme yaşadığını göstermek."
        ],
      },
      {
        "heading": "MT4 ile MT5 arasındaki ilişki bir sürüm yükseltmesi değil",
        "paragraphs": [
          "Numaralandırma yanıltıcıdır. MT5, MT4'ün üzerine inşa edilmiş bir güncelleme değil, sıfırdan yazılmış ayrı bir terminaldir. Aynı arayüz mantığını, benzer menü yapısını ve tanıdık grafik görünümünü paylaşırlar; ama motor farklıdır. Bu yüzden MT4 kullanıcısı MT5'e geçtiğinde kendini evinde hisseder, sonra ilk gerçek işini yapmaya çalıştığında farkların yüzeysel olmadığını görür.",
          "MT5 daha yeni ve daha kabiliyetli bir platformdur. Daha fazla zaman dilimi sunar, dolayısıyla MT4'te elle oluşturmanız gereken ara periyotlar hazır gelir. Ekonomik takvim terminalin içine gömülüdür; veri açıklamalarını grafikten ayrı bir sekmede takip etmek zorunda kalmazsınız. Emir türleri daha çeşitlidir, strateji test motoru belirgin biçimde daha hızlıdır ve çoklu iş parçacığı kullanabilir. Ayrıca MT5 forex dışında hisse senedi ve vadeli işlem enstrümanlarını da doğal olarak destekleyecek şekilde tasarlanmıştır; MT4 esas olarak forex ve CFD odaklı bir mimariye sahiptir.",
          "Buradaki fark listesi, MT5'in her kullanıcı için doğru seçim olduğu anlamına gelmez. Sunulan kabiliyetlerin kaçını gerçekten kullanacağınız, kararın asıl belirleyicisidir. Günde iki pozisyon açan ve tek zaman dilimine bakan biri için gelişmiş test motorunun pratik karşılığı yoktur.",
          "MT5'in MT4'e göre öne çıkan somut farkları şunlardır:"
        ],
        "list": [
          "Daha fazla hazır zaman dilimi; ara periyotları elle üretmeye gerek kalmaz",
          "Terminal içine gömülü ekonomik takvim ve haber akışı",
          "Daha geniş bekleyen emir türü seti",
          "Çok daha hızlı ve çok çekirdekli çalışabilen strateji test motoru",
          "Hisse senedi ve vadeli işlem gibi borsa enstrümanlarına uygun mimari",
          "Piyasa derinliği görüntüleme desteği"
        ],
      },
      {
        "heading": "MT4 neden hâlâ ayakta: ekosistem ve MQL4-MQL5 uyumsuzluğu",
        "paragraphs": [
          "Teknik olarak daha yetenekli platformun her zaman kazanmadığı durumlardan biri budur. MT4, uzun yıllar boyunca fiilî standart olduğu için etrafında çok büyük bir üçüncü taraf ekosistemi oluştu: otomatik işlem sistemleri (EA'lar), özel indikatörler, şablonlar, forum arşivleri, kod örnekleri ve bunları anlatan eğitim içerikleri. MT5 için üretilen içerik yıllar içinde arttı, ancak MT4 arşivi hacim olarak hâlâ daha büyüktür.",
          "Asıl kritik nokta şudur: MQL4 ile MQL5 birbiriyle uyumlu değildir. MT4 için yazılmış bir EA'yı MT5'e kopyalayıp çalıştıramazsınız. Kaynak kodu elinizde olsa bile taşıma işlemi bir dönüştürme değil, çoğu zaman yeniden yazma anlamına gelir; çünkü diller yalnızca sözdizimi düzeyinde değil, emir yönetimi mantığı düzeyinde de ayrışır. Kaynak kodu elinizde değilse — derlenmiş dosya satın aldıysanız — taşıma seçeneği tamamen ortadan kalkar.",
          "Bu, otomatik sistem kullananlar için platform kararını neredeyse tek başına belirleyen faktördür. Kullandığınız veya satın almayı planladığınız EA hangi platform içinse, platformunuz odur. Tersini yapmaya çalışmak, geliştirici desteği olmayan bir yeniden yazım projesine girişmek demektir.",
          "Bir uyarı da tersi yönde geçerli: büyük ekosistem, kaliteli ekosistem anlamına gelmez. MT4 için dolaşımda olan EA ve indikatörlerin önemli bir kısmı geriye dönük test sonuçlarına aşırı uyarlanmış, canlı piyasada aynı davranışı göstermeyen sistemlerdir. Arşivin büyüklüğü bir avantajdır; seçim titizliğinin yerini tutmaz."
        ],
      },
      {
        "heading": "Netting mi hedging mi? Hesap modeli işlem tarzınızı belirler",
        "paragraphs": [
          "İki platform arasındaki en az konuşulan ama en somut farklardan biri pozisyon muhasebesi modelidir. MT4 hedging modeliyle çalışır: aynı enstrümanda birden fazla bağımsız pozisyon açabilirsiniz ve bunlar ayrı ayrı yaşar. EURUSD'de bir alış ve bir satış pozisyonunuz aynı anda açık durabilir; her birinin kendi giriş fiyatı, kendi stop-loss seviyesi ve kendi kâr-zarar hesabı vardır.",
          "MT5 ise hem netting hem hedging modelini destekler; hangisinin geçerli olduğunu hesabınızın tanımı belirler. Netting modelinde aynı enstrümanda tek bir net pozisyon tutulur. Bir lot alışınız varken yarım lot satış yaparsanız yeni bir pozisyon açılmaz, mevcut pozisyon yarım lota iner. Ters yönde daha büyük bir işlem yaparsanız pozisyon kapanır ve yön değiştirir.",
          "Bu ayrım teorik değildir. Kademeli giriş yapan, aynı enstrümanda farklı zaman dilimlerine göre ayrı ayrı pozisyon taşıyan veya her pozisyona kendi stop seviyesini koyan bir yaklaşım netting hesapta beklediğiniz gibi davranmaz. Buna karşılık netting modeli, tek bir net riske bakmak isteyenler için daha temiz bir tablo sunar ve marj kullanımı açısından daha şeffaftır.",
          "XM tarafında MT4 ve MT5 hesapları hedging mantığıyla kullanılabilir; yine de hesabı açmadan önce ilgili hesap tanımının hangi modelde çalıştığını doğrulamak yerinde olur. Bu tür yapısal detaylar, kurumun kendi hesap özellikleri sayfasından teyit edilmesi gereken şeylerdir."
        ],
      },
      {
        "heading": "XM App ne yapar, ne yapmaz?",
        "paragraphs": [
          "XM App, XM'in kendi mobil uygulamasıdır ve MT4 ile MT5'in mobil sürümlerinden farklı bir amaca hizmet eder. Onu bir masaüstü terminalinin küçültülmüş hâli olarak değil, hesap yönetimi ve hızlı işlem için tasarlanmış ayrı bir arayüz olarak düşünmek daha doğrudur.",
          "İyi yaptığı işler nettir: hesap bakiyesi, marj durumu ve açık pozisyonları hızlıca görmek; para yatırma ve çekme taleplerini başlatmak; belge yükleme ve hesap doğrulama gibi idari işleri halletmek; basit bir alış-satış emri iletmek veya açık bir pozisyonu kapatmak. Yolda, masaüstünden uzaktayken pozisyonunuza müdahale etmeniz gerektiğinde bu yeterlidir ve hızlıdır.",
          "Yapmadığı işler de aynı ölçüde nettir ve bunları baştan bilmek gerekir. XM App otomatik işlem sistemi çalıştıramaz; bir EA'yı mobil uygulamada koşturmanın yolu yoktur. Derin grafik analizi için de uygun değildir: çok sayıda indikatörü üst üste bindirmek, uzun geçmişe dönük çizim yapmak, çoklu grafik düzeni kurmak veya ince ayarlı bir şablon sistemi işletmek küçük ekranda pratik olarak mümkün değildir. Ayrıca strateji testi yapamazsınız.",
          "Buradan çıkan sonuç bir dışlama değil, bir iş bölümüdür. Analizi ve sistem yönetimini masaüstü terminalinde yapıp, gün içindeki takip ve idari işleri mobil uygulamaya bırakmak çoğu kullanıcı için makul bir düzendir. Sorun, mobil uygulamayı tek platform olarak kullanmaya çalışmakta ortaya çıkar."
        ],
      },
      {
        "heading": "Platform ayarlarınız kime ait? Bağlanma maliyeti meselesi",
        "paragraphs": [
          "Bu, platform tartışmalarında neredeyse hiç gündeme gelmeyen ama uzun vadede en pahalıya mal olan konudur. MT4 ve MT5 bağımsız bir yazılım şirketinin ürünüdür ve çok sayıda kurum tarafından desteklenir. Şablonlarınız, özel indikatörleriniz, grafik düzenleriniz, uyarı ayarlarınız ve EA'larınız yerel dosyalar hâlinde durur. Kurum değiştirdiğinizde bu dosyaları yeni kurulumun ilgili klasörlerine kopyalayıp kaldığınız yerden devam edersiniz.",
          "Brokerin kendi uygulaması için bu geçerli değildir. Orada biriktirdiğiniz izleme listeleri, arayüz alışkanlıkları ve varsa özel görünümler o kuruma aittir ve sizinle taşınmaz. Bu bir kötü niyet göstergesi değil, tescilli yazılımın doğal sonucudur; ama sonucu değiştirmez: brokerin kendi uygulamasına ne kadar çok yerleşirseniz, kurum değiştirmenin size maliyeti o kadar artar. Buna bağlanma (lock-in) maliyeti denir ve genellikle taşınmaya karar verdiğiniz gün fark edilir.",
          "Pratik sonuç şudur: uzun vadede kurum değiştirme ihtimalinizi sıfır saymıyorsanız, analiz ve sistem katmanınızı standart bir terminalde tutmak stratejik bir tercihtir. Mobil uygulamayı kullanmayın demek değil bu; asıl kurulumunuzu oraya yaslamayın demek. Karşılaştırma yaparken Broker Sorgulama aracı ve Broker Sıralamaları gibi kaynaklara bakmak, hangi kurumların hangi standart platformları desteklediğini görmek açısından işe yarar."
        ],
      },
      {
        "heading": "XM cTrader desteklemiyor: bu kimin için sorun?",
        "paragraphs": [
          "Açıkça belirtmek gerekir: XM'in platform listesi MT4, MT5 ve XM App ile sınırlıdır. cTrader desteklenmemektedir. Bu, kurumun eksik yönleri arasında dürüstçe sayılması gereken bir maddedir ve pazarlama diliyle geçiştirilmemelidir.",
          "Kimin için gerçekten sorun olduğu ise daha dar bir sorudur. cTrader, emir defteri görünümü, derinlik tabanlı emir iletimi ve cAlgo tarafındaki geliştirme ortamı nedeniyle belirli bir kullanıcı grubunda tercih edilir. Eğer stratejiniz seviye seviye likidite görmeye, gelişmiş emir defteri etkileşimine dayanıyorsa veya mevcut algoritmalarınız cTrader ekosisteminde yazılmışsa, bu eksiklik sizin için doğrudan bir eleme kriteridir; başka hiçbir avantaj bunu telafi etmez.",
          "Buna karşılık MT4 veya MT5 üzerinden çalışan, EA'ları MQL tarafında olan veya manuel işlem yapan bir kullanıcı için pratik etkisi sınırlıdır. Yani bu madde herkes için değil, belirli bir teknik profil için belirleyicidir. Kararı verirken kendinize sormanız gereken soru basittir: cTrader'ı bugün fiilen kullanıyor musunuz, yoksa listede görmek mi istiyorsunuz? İkisi farklı şeylerdir.",
          "Aynı dürüstlükle eklenmesi gereken diğer noktalar: XM'de raw-spread hesap seçenekleri sınırlıdır ve maksimum kaldıraç bölgeye ve tüzel kişiliğe göre değişir. XM Global 2009'dan beri faaliyette; ASIC (443670), CySEC (120/10), DFSA (F003484) ve Belize FSC düzenlemeleri altında çalışıyor, negatif bakiye koruması sunuyor. Bunlar birbirini iptal eden değil, birlikte değerlendirilmesi gereken bilgilerdir."
        ],
      },
      {
        "heading": "Demo hesapta platform testi: neye, nasıl bakmalı?",
        "paragraphs": [
          "Platform kararını ekran görüntülerine veya özellik listelerine bakarak vermek yerine, demo hesapta ölçülebilir bir test yapmak çok daha bilgilendiricidir. Demo hesap gerçek piyasa koşullarını birebir yansıtmaz — özellikle emir gerçekleştirme tarafında canlı hesaptan farklı davranabilir — ama arayüzün sizinle uyumunu ve platformun stres altındaki davranışını görmek için yeterlidir.",
          "Testi rastgele tıklayarak değil, sabit bir protokolle yapın. Aynı adımları hem MT4'te hem MT5'te, mümkünse aynı saatlerde tekrarlayın; ancak bu şekilde karşılaştırdığınız şey platform olur, piyasa koşulu olmaz. Not tutun; hafızaya güvenmeyin.",
          "Şu başlıkları sırayla ölçün:"
        ],
        "list": [
          "Emir gerçekleştirme hızı: emri gönderdiğiniz an ile onay ekranının döndüğü an arasındaki gecikmeyi sakin bir saatte birkaç kez ölçün",
          "Kayma (slippage): girdiğiniz fiyat ile gerçekleşen fiyat arasındaki farkı kaydedin; sakin saatlerle hareketli saatleri ayrı ayrı not edin",
          "Tek tık işlem: özelliği açın ve yanlışlıkla emir göndermeye ne kadar açık olduğunu, onay adımlarının nerede devreye girdiğini test edin",
          "Stop-loss yerleştirme: emri açarken, açtıktan sonra ve grafik üzerinden sürükleyerek stop koymayı deneyin; hangisinin kaç adım sürdüğünü ölçün",
          "Haber anı davranışı: takvimdeki bir veri açıklamasında spreadin nasıl genişlediğini, emirlerin nasıl karşılandığını ve arayüzün donup donmadığını izleyin",
          "Hafta sonu ve kapanış davranışı: piyasa kapalıyken grafiklerin, bekleyen emirlerin ve bağlantının nasıl davrandığını kontrol edin",
          "Yeniden bağlanma: internet bağlantısını kısa süre kesip terminalin açık pozisyonlarla nasıl toparlandığını görün"
        ],
      },
      {
        "heading": "Profilinize göre karar: kısa bir özet",
        "paragraphs": [
          "Doğru platform diye genel bir cevap yok; kullanım tarzınıza göre sürtünmesi en az olan platform var. Aşağıdaki liste, yukarıdaki teknik ayrımların pratik karşılığını özetliyor. Kararı verirken ekonomik takvimi ve pozisyon büyüklüğü hesaplarını nasıl takip ettiğinizi de hesaba katın; Ekonomik Takvim ve Pozisyon Hesaplayıcı gibi platform dışı araçlar bazı ihtiyaçları zaten karşılıyor olabilir.",
        ],
        "list": [
          "Elinizde MT4 için yazılmış bir EA varsa: MT4. Karar başka kritere bakmadan verilmiştir, çünkü o kod MT5'te çalışmaz",
          "Hisse ve vadeli işlem enstrümanlarına da bakıyorsanız veya yoğun strateji testi yapıyorsanız: MT5",
          "Çok sayıda zaman dilimi arasında geçiş yapıyor ve ekonomik takvimi terminalin içinde istiyorsanız: MT5",
          "Aynı enstrümanda kademeli ve ters yönlü pozisyonlar taşıyorsanız: hedging modeliyle çalışan bir hesap; netting hesap bu tarzı bozar",
          "Günde birkaç manuel işlem yapıyorsanız: fark büyük ölçüde teoriktir, alıştığınız arayüzde kalın",
          "Yalnızca takip, bakiye ve para yatırma-çekme işleri için: XM App yeterlidir, ama tek platformunuz olmamalıdır",
          "cTrader'ı fiilen kullanıyorsanız: XM bu ihtiyacı karşılamıyor, kurum listesini buna göre daraltın"
        ],
      },
      {
        "heading": "Son not",
        "paragraphs": [
          "Platform, sonuçları belirleyen değişkenlerden yalnızca biridir ve muhtemelen en belirleyicisi değildir. Risk yönetimi, pozisyon büyüklüğü ve işlem maliyeti yapısı, arayüz tercihinden çok daha fazla ağırlık taşır. Platformu bir kez seçip alışkanlık hâline getirmek, sürekli platform değiştirerek her seferinde yeniden öğrenmekten genellikle daha verimlidir.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "lot-nedir-mikro-mini-standart-lot-hesaplama",
    "coverImage": "/blog/lot-nedir-mikro-mini-standart-lot-hesaplama-cover.png",
    "title": "Lot Nedir? Mikro, Mini ve Standart Lot Hesaplaması Adım Adım",
    "excerpt": "Standart, mini, mikro ve nano lotun kaç birime denk geldiğini, pip değerinin neden pariteye göre değiştiğini ve lot büyüklüğünün risk yüzdesinden nasıl türetildiğini iki tam sayısal örnekle adım adım anlatıyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 8,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Yeni başlayan bir yatırımcının platformda takıldığı ilk kutu, fiyat grafiği değil, emir ekranındaki lot kutusudur. Yön kararını vermiştir, seviyeyi belirlemiştir, stop noktasını bile işaretlemiştir; ama o kutuya ne yazacağını bilmez. Çoğu kişi burada teknik bir hesap yapmak yerine kendisini rahat hissettiren bir sayı yazar: 0.10, 0.50, bazen 1.00. Oysa bu kutuya yazılan sayı, işlemin sonucunu yön tahmininden daha güçlü biçimde belirler.",
          "Sebebi basit: yön tahmininiz uzun vadede belli bir isabet oranında kalır, ama lot büyüklüğü her işlemde kaybınızın mutlak boyutunu belirler. İsabet oranı yüzde 55 olan bir sistem bile, tek işlemde hesabın yüzde 20'sini riske atan bir lot seçimiyle birkaç ardışık zararda tükenebilir. Lot, stratejinin süsü değil, hayatta kalma mekanizmasıdır.",
          "Bu yazıda önce lot birimlerinin ne anlama geldiğini, sonra pip değerinin neden enstrümandan enstrümana değiştiğini, ardından da lot büyüklüğünü riskten türeten formülü ele alacağız. İki tam sayısal örnek çözeceğiz. Sonunda ise en sık yapılan hataları ve kaldıraçla ilgili yaygın kavram karışıklığını netleştireceğiz."
        ],
      },
      {
        "heading": "Lot bir para birimi değil, bir sözleşme büyüklüğüdür",
        "paragraphs": [
          "Lot, forex piyasasında işlem gören standartlaştırılmış miktarın adıdır. Bir lot alıyorum demek, belli bir sayıda baz para birimi alıyorum demektir. Bu miktar sabittir ve piyasa genelinde kabul görmüş dört kademesi vardır.",
          "Kademeler arasındaki oran her zaman on kattır. Standart lottan mini lota, mini lottan mikro lota, mikro lottan nano lota geçerken büyüklük her seferinde onda birine iner. Bu düzenli yapı, lot hesabını zihinden yapmayı kolaylaştırır: mikro lot cinsinden bir sonuç bulduysanız virgülü iki basamak kaydırarak standart lot cinsine çevirebilirsiniz.",
          "Platformda gördüğünüz 0.01, 0.10, 1.00 gibi rakamlar standart lot cinsindendir. Yani 0.01 lot, bir mikro lottur; 0.10 lot, bir mini lottur. Bu dönüşümü içselleştirmek, ilerideki hesapların tamamını sadeleştirir.",
          "Lot büyüklüğünün doğrudan sonucu şudur: pozisyon ne kadar büyükse, fiyatın aynı miktarda hareketi hesabınıza o kadar büyük bir tutar olarak yansır. Fiyat aynıdır, grafik aynıdır; değişen tek şey sizin o harekete maruz kalma derecenizdir."
        ],
        "list": [
          "Standart lot = 100.000 birim (platformda 1.00)",
          "Mini lot = 10.000 birim (platformda 0.10)",
          "Mikro lot = 1.000 birim (platformda 0.01)",
          "Nano lot = 100 birim (platformda 0.001, her broker desteklemez)"
        ],
      },
      {
        "heading": "EURUSD'de bir pip kaç dolar eder?",
        "paragraphs": [
          "Pip, kurdaki en küçük standart hareket birimidir. Beş haneli kotasyonlu çoğu parite için pip, dördüncü ondalık basamaktır; yani 0.0001. EURUSD 1.1597'den 1.1598'e çıktığında fiyat bir pip yükselmiş olur.",
          "Bu hareketin kaç dolar ettiği ise doğrudan lot büyüklüğüne bağlıdır. EURUSD'de dolar kotasyon para birimi olduğu için hesap temizdir ve hafızaya alınmaya değer bir tablo ortaya çıkar. Bu üç satır, forex risk hesabının omurgasıdır. Aklınızda tuttuğunuz tek şey standart lotta 10 $ olsa bile, geri kalanını onda bir kuralıyla türetebilirsiniz.",
          "Dikkat edilmesi gereken nokta, bu değerlerin EURUSD gibi kotasyonu dolar olan pariteler için geçerli olmasıdır. GBPUSD, AUDUSD, NZDUSD gibi sonu USD ile biten paritelerde de aynı tablo çalışır. Ama kotasyon para birimi dolar olmadığında hesap değişir."
        ],
        "list": [
          "Standart lot (100.000 birim): 1 pip = 10 $",
          "Mini lot (10.000 birim): 1 pip = 1 $",
          "Mikro lot (1.000 birim): 1 pip = 0.10 $",
          "Nano lot (100 birim): 1 pip = 0.01 $"
        ],
      },
      {
        "heading": "Pip değeri neden kotasyon para birimine bağlıdır?",
        "paragraphs": [
          "Bir pozisyonun kâr veya zararı, doğası gereği kotasyon para birimi cinsinden oluşur. EURUSD alırken euro alıp dolar satarsınız; sonuç dolar olarak birikir. Hesabınız da dolar cinsindense herhangi bir çevrim gerekmez, tablo doğrudan geçerlidir.",
          "USDJPY gibi Japon yeni kotasyonlu paritelerde iki şey birden değişir. Birincisi, pip tanımı: yen çiftlerinde fiyat iki ondalıkla kote edildiği için bir pip 0.0001 değil, 0.01'dir. İkincisi, oluşan kâr veya zarar yen cinsindendir ve dolar bazlı bir hesapta görünür hale gelmesi için güncel USDJPY kuruyla dolara çevrilmesi gerekir. Bu çevrim kur değiştikçe değiştiği için, yen çiftlerinde pip değeri sabit bir sayı değildir; gün içinde bile hafifçe kayar.",
          "Altında (XAUUSD) durum bir başka açıdan farklıdır. Burada birim pip değil ons ve dolardır. Standart sözleşme 100 onstur. Dolayısıyla altın fiyatındaki 1 dolarlık hareket, standart lotta 100 $ eder. Altın gibi günlük hareket aralığı onlarca doları bulabilen bir enstrümanda bu çarpanın ne anlama geldiğini görmek için altının bugünlerde 4.367 $ civarında işlem gördüğünü ve haftalık dip ile zirve arasında 4.324 $ ile 4.370 $ bandının oluştuğunu hatırlamak yeterli. Böyle bir bantta standart lotluk bir pozisyon, dar bir gün içinde bile dört haneli tutarlarda dalgalanır.",
          "Buradan çıkan pratik kural şudur: pip değerini ezberlemeyin, enstrümana göre teyit edin. EURUSD'nin tablosunu USDJPY'ye veya altına taşımak, hesabınızı sistematik olarak yanlış boyutlandırmanın en hızlı yoludur. Sitedeki Pozisyon Hesaplayıcı aracı tam olarak bu adımı otomatikleştirmek için var: enstrümanı, hesap para birimini ve lot büyüklüğünü girdiğinizde pip değerini doğru para biriminde verir."
        ],
      },
      {
        "heading": "Asıl formül: lot, riskten türetilir",
        "paragraphs": [
          "Şimdiye kadar anlatılan her şey tek bir denkleme hizmet ediyor. Lot büyüklüğünü sezgiyle değil, üç bilinen büyüklükten hesaplarsınız: kaybetmeye razı olduğunuz tutar, stopun uzaklığı ve bir birim hareketin parasal değeri.",
          "Lot = (Hesap büyüklüğü x Risk yüzdesi) / (Stop mesafesi (pip) x Pip değeri)",
          "Payda duran şey, riske ettiğiniz para miktarıdır. Paydada duran şey ise, stopa kadar gidilirse bir standart lotluk pozisyonun kaybettireceği tutardır. Bölme işlemi size kaç standart lot açabileceğinizi verir.",
          "Bu formülün en önemli özelliği, işlem sırasını tersine çevirmesidir. Önce lotu seçip sonra stopu ona göre ayarlamazsınız. Önce teknik olarak anlamlı stop seviyesini belirlersiniz, sonra risk yüzdenizi sabitlersiniz, lot bu ikisinin sonucu olarak çıkar. Yani lot bir karar değil, bir çıktıdır.",
          "Risk yüzdesi tarafında yaygın uygulama işlem başına yüzde 1 ile yüzde 2 aralığıdır. Bu bir kural değil bir tercihtir, ama sabit tutulması önemlidir; çünkü formülün koruyucu etkisi tam olarak bu sabitlikten gelir. Risk yüzdesini işlemden işleme değiştirirseniz, farkında olmadan en yüksek riski en çok güvendiğiniz ama en az doğrulanmış fikre ayırmış olursunuz."
        ],
      },
      {
        "heading": "İki örnek: EURUSD'de 25 pip stop ve altında 12 dolarlık stop",
        "paragraphs": [
          "Formülü somutlaştırmanın tek yolu sayılarla çalışmaktır. İki farklı enstrümanda, aynı risk disiplinini uygulayan iki hesap düşünelim.",
          "Birinci örnek: 2.000 $ büyüklüğünde bir hesap, işlem başına yüzde 1 risk alıyor. Bu, işlem başına 20 $ demektir. Enstrüman EURUSD ve teknik yapı 25 pip uzaklıkta bir stop gerektiriyor. EURUSD'de standart lotta pip değeri 10 $ olduğuna göre, paydadaki tutar 25 x 10 = 250 $ olur. Bölme işlemi 20 / 250 = 0.08 sonucunu verir. Yani 0.08 lot, mikro lot cinsinden sekiz mikro lot.",
          "Bu sonucu doğrulamak kolaydır. 0.08 lotta bir pip 0.80 $ eder; 25 pip stop tetiklenirse kayıp 25 x 0.80 = 20 $ olur. Tam olarak hedeflenen risk tutarı. Formül, hesabı kendi içinde tutarlı hale getirir.",
          "İkinci örnek: 5.000 $ büyüklüğünde bir hesap, yine yüzde 1 risk alıyor; yani 50 $. Enstrüman XAUUSD ve stop mesafesi 12 dolar. Altında standart lotta 1 dolarlık hareket 100 $ ettiğine göre, payda 12 x 100 = 1.200 $ olur. Bölme işlemi 50 / 1.200 = 0.041 sonucunu verir. Platformda genellikle iki ondalık adım kullanıldığı için bu 0.04 lota yuvarlanır.",
          "Yuvarlamanın yönü de bir karardır. Aşağı yuvarlamak riski hedefin biraz altında bırakır, yukarı yuvarlamak üstüne çıkarır. Risk yönetiminde aşağı yuvarlamak tutarlı olan yaklaşımdır. 0.04 lotta 12 dolarlık stop 48 $ kaybettirir; 0.05 lotta ise 60 $, yani hedeflenen riskin yüzde 20 üzerinde.",
          "İki örnek arasındaki farkı görmek önemli. Hesap büyüklüğü iki buçuk katına çıkmasına rağmen lot büyüklüğü yarıya inmiştir. Sebep enstrümanın karakteridir: altında birim hareket başına parasal değer çok daha yüksektir ve makul bir stop mesafesi çok daha geniştir. Aynı risk disiplini, farklı enstrümanlarda tamamen farklı lot rakamları üretir. Bir enstrümanda alıştığınız lot büyüklüğünü diğerine taşımak, bu yazının anlattığı her şeyi geçersiz kılar."
        ],
      },
      {
        "heading": "Kaldıraç lot büyüklüğünü belirlemez, sadece teminatı belirler",
        "paragraphs": [
          "Yeni başlayanların en köklü kavram karışıklığı burada. Yaygın sanı, yüksek kaldıracın daha büyük pozisyon açmayı gerektirdiği veya otomatik olarak daha riskli hale getirdiği yönünde. Oysa kaldıraç, açtığınız pozisyonun büyüklüğünü değil, o pozisyonu açık tutmak için hesabınızda bloke edilecek teminat miktarını belirler.",
          "Şöyle düşünün: 0.08 lotluk bir EURUSD pozisyonunun piyasa riski, kaldıraç 1:30 da olsa 1:1000 de olsa aynıdır. Fiyat 25 pip aleyhinize gittiğinde kaybınız her iki durumda da 20 $'dır. Değişen tek şey, o pozisyonun ne kadar sermayenizi bloke ettiğidir. Yüksek kaldıraç blokeyi azaltır, kaybı azaltmaz.",
          "O halde yüksek kaldıraç neden riskli sayılıyor? Çünkü dolaylı bir etki yaratıyor. Teminat gereksinimi düştüğünde, hesap bakiyesi teorik olarak çok daha büyük pozisyonlara izin verir hale gelir ve bu izin, disiplini olmayan yatırımcı için bir davete dönüşür. Risk, kaldıraç oranından değil, o oranın açtığı alanı doldurma eğiliminden doğar.",
          "XM'de maksimum kaldıraç 1:1000'e kadar çıkabiliyor, ancak bu oran bölgeye ve hesabın bağlı olduğu tüzel kişiliğe göre değişiyor; her kullanıcı için geçerli tek bir rakam yok. Uygulamada önemli olan da bu üst sınır değil, sizin formülden çıkan lot büyüklüğünüzün o kaldıraçla açılabilir olup olmadığıdır. Formül önce gelir, kaldıraç sonra teyit edilir."
        ],
      },
      {
        "heading": "Lot hesabında en sık yapılan dört hata",
        "paragraphs": [
          "Bu hataların ortak noktası, hepsinin makul görünmesidir. Hiçbiri açıkça yanlış hissettirmez; sadece hesabı sessizce aşındırır.",
          "Dördüncü maddeye biraz daha yakından bakmak gerekiyor. Hesabınız dolar dışı bir para biriminde tutuluyorsa, formülün payındaki risk tutarı hesap para biriminde, paydadaki pip değeri ise çoğu zaman dolar cinsindedir. İkisini aynı para birimine çevirmeden bölerseniz sonuç anlamsız çıkar. Bu, tabloyu ezberleyip formülü mekanik uygulayan yatırımcının en kolay atladığı adımdır.",
          "Bir diğer sessiz hata, stop mesafesini piyasa koşullarından bağımsız düşünmektir. Volatilitenin arttığı dönemlerde aynı teknik yapı daha geniş stop gerektirir ve formül otomatik olarak daha küçük lot üretir. Bu bir kısıtlama değil, sistemin doğru çalıştığının işaretidir. Önemli veri açıklamalarının ve merkez bankası etkinliklerinin ne zaman olduğunu Ekonomik Takvim üzerinden önceden görmek, bu tür dönemlerde pozisyon boyutunu bilinçli ayarlamayı kolaylaştırır."
        ],
        "list": [
          "Lotu hesaplamak yerine içine sinen bir sayı seçmek; rahatlık hissi bir risk ölçüsü değildir",
          "Stop mesafesini lota göre ayarlamak; sıra tersinedir, önce stop belirlenir, lot ondan türer",
          "Kaldıracı pozisyon büyüklüğüyle karıştırmak; kaldıraç teminatı belirler, riski değil",
          "Hesap para birimi ile enstrümanın kotasyon para birimi farkını atlamak",
          "Aynı lot büyüklüğünü EURUSD, USDJPY ve XAUUSD'de ayrım gözetmeden kullanmak"
        ],
      },
      {
        "heading": "Küçük hesapta mikro lot neden önemli, 5 dolarlık minimum neden yanıltıcı?",
        "paragraphs": [
          "Formülün küçük hesaplarda işe yaraması için brokerin yeterince ince lot adımlarına izin vermesi gerekir. 2.000 $'lık örnekte 0.08 lot çıktı; broker sadece 0.10 adımlarına izin verseydi bu sonucu uygulamak mümkün olmaz, ya riski yüzde 25 aşmak ya da işlemi tamamen pas geçmek gerekirdi. Mikro lot desteği, risk yönetimini teorik olmaktan çıkarıp uygulanabilir kılan şeydir.",
          "XM'in Micro hesabı bu açıdan küçük bakiyeli hesaplar için işlevsel bir seçenek; küçük lot adımlarıyla çalışabilmek, risk yüzdesini gerçekten sabit tutmayı mümkün kılıyor. Fiyatlama tarafında Micro ve Standard aynı modeli paylaşıyor: 1.0 pipten itibaren spread, komisyon yok. Fark maliyet yapısında değil, işlem yapabildiğiniz büyüklük çözünürlüğünde.",
          "Buna karşılık, minimum yatırımın 5 $ olması risk yönetimi açısından yanıltıcı bir avantajdır ve bunu açıkça söylemek gerekir. 5 $'lık bir hesapta yüzde 1 risk, işlem başına 5 sentlik bir kayıp bütçesi demektir. Bu bütçeyle EURUSD'de makul bir stop mesafesinde açılabilecek pozisyon, çoğu durumda desteklenen en küçük lot adımının bile altında kalır. Yani hesap teknik olarak açılabilir ama disiplinli boyutlandırma yapılamaz.",
          "Sonuç olarak düşük minimum yatırım, platformu tanımak ve emir mekaniğini deneyimlemek için anlamlı bir eşik. Risk kurallarını gerçekten uygulayabilmek içinse hesap büyüklüğünün, kullandığınız stop mesafeleri ve enstrümanın pip değeriyle uyumlu olması gerekir. Bu uyumun olup olmadığını görmenin en hızlı yolu, kendi rakamlarınızı Pozisyon Hesaplayıcı'ya girip çıkan lot büyüklüğünün brokerin izin verdiği en küçük adımın üzerinde kalıp kalmadığına bakmaktır. Farklı brokerlerin lot adımlarını ve hesap koşullarını karşılaştırmak isterseniz Broker Sıralamaları ve Broker Sorgulama aracı bu karşılaştırmayı yapmanıza yardımcı olur."
        ],
      },
      {
        "heading": "Lot kutusuna yazdığınız sayı, stratejinizin özetidir",
        "paragraphs": [
          "Lot hesabı zor bir matematik değil; tek bir bölme işlemi. Zor olan, o işlemi her seferinde yapma disiplinidir. Standart lot 100.000 birimdir, mini 10.000, mikro 1.000, nano 100. EURUSD'de standart lotta bir pip 10 $, mini lotta 1 $, mikro lotta 0.10 $ eder. Bu tablo dolar kotasyonlu pariteler için geçerlidir; yen çiftlerinde pip 0.01'dir ve çevrim gerekir, altında sözleşme 100 ons olduğu için 1 dolarlık hareket standart lotta 100 $ eder.",
          "Geri kalan her şey formülden çıkar. Riske edeceğiniz tutarı belirleyin, stopu teknik gerekçeyle koyun, bölme işlemini yapın, aşağı yuvarlayın. Kaldıracın bu denklemde yeri yok; o sadece pozisyonun ne kadar teminat bloke edeceğini söyler. Lot kutusuna yazdığınız sayı, aslında risk anlayışınızın tek satırlık özetidir.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "marjin-margin-call-stop-out-nedir",
    "coverImage": "/blog/marjin-margin-call-stop-out-nedir-cover.png",
    "title": "Marjin, Margin Call ve Stop Out: Hesabınız Tam Olarak Ne Zaman Kapanır?",
    "excerpt": "Bakiye, öz sermaye, kullanılan marjin ve marjin seviyesi formüllerini ayırıyor; 1.000 $ hesap ve 1 lot EURUSD üzerinden marjin seviyesinin hangi pip mesafesinde yüzde 100'e indiğini adım adım hesaplıyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 9,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Kaldıraçlı işlemlerde hesabın kapanması ani bir olay gibi görünür ama değildir. Platform bir anda pozisyonları tasfiye ettiğinde çoğu yatırımcının aklına gelen ilk cümle \"kaldıraç yüzünden patladı\" olur. Oysa tasfiyeye giden yol tamamen aritmetiktir, adım adım izlenebilir ve pozisyon açılmadan önce hesaplanabilir. Sorun genellikle formülün karmaşıklığında değil, terimlerin birbirine karıştırılmasında yatar.",
          "Bakiye ile öz sermaye aynı şey değildir. Kullanılan marjin ile serbest marjin aynı şey değildir. Margin call ile stop out ise birbirinden bütünüyle farklı iki olaydır: biri bir uyarı, diğeri bir tasfiye işlemidir. Bu dört ayrımı netleştiren bir yatırımcı, pozisyonu açtığı anda hesabının hangi fiyat seviyesinde kapanacağını bilir. Bilmeyen yatırımcı ise bunu ancak olay gerçekleştikten sonra öğrenir.",
          "Bu yazıda önce terimleri kesin tanımlarla ve formüllerle ayıracağız, sonra tek bir sayısal senaryoyu sonuna kadar çözeceğiz. Senaryonun sonunda çıkan ders, çoğu kişinin beklediğinin tersidir: hesabı bitiren şey kaldıraç oranı değil, pozisyon büyüklüğüdür."
        ],
      },
      {
        "heading": "Dört terim, dört formül: bakiye, öz sermaye, kullanılan marjin, serbest marjin",
        "paragraphs": [
          "Platform ekranındaki alt bardaki rakamlar rastgele dizilmiş değildir; her biri bir öncekinden türer. Sırasıyla okumak, sistemin nasıl çalıştığını görmenin en hızlı yoludur.",
          "Bakiye (Balance), yalnızca kapatılmış işlemlerin sonucudur. Açık pozisyonlarınız ne durumda olursa olsun bakiye değişmez; bir pozisyonu kapattığınız anda kâr veya zarar bakiyeye yazılır. Bu yüzden bakiye, hesabınızın anlık durumunu değil, geçmişini gösteren bir sayıdır.",
          "Öz sermaye (Equity), hesabın gerçek anlık değeridir. Formülü basittir: Equity = Bakiye + açık pozisyonların kâr/zararı. Bütün pozisyonlarınızı şu an piyasa fiyatından kapatsaydınız elinizde kalacak tutar budur. Marjin mekanizmasının tamamı bakiyeye değil, bu sayıya bakar.",
          "Kullanılan marjin (Used Margin), açtığınız pozisyonu taşımak için hesabınızda bloke edilen teminattır. Formülü: Kullanılan Marjin = Pozisyon Büyüklüğü / Kaldıraç. Bu para hesabınızdan çıkmaz, sadece dondurulur; pozisyon kapandığında serbest kalır.",
          "Serbest marjin (Free Margin), yeni pozisyon açmak veya mevcut pozisyonların zararını emmek için kalan tutardır: Serbest Marjin = Equity - Kullanılan Marjin. Zarar büyüdükçe equity düşer, kullanılan marjin sabit kaldığı için serbest marjin erir. Hesabın dayanıklılığı bu sayıda saklıdır."
        ],
        "list": [
          "Bakiye = kapalı işlemlerin net sonucu (açık pozisyonlardan etkilenmez)",
          "Öz Sermaye (Equity) = Bakiye + açık pozisyonların kâr/zararı",
          "Kullanılan Marjin = Pozisyon Büyüklüğü / Kaldıraç",
          "Serbest Marjin = Equity - Kullanılan Marjin",
          "Marjin Seviyesi (%) = (Equity / Kullanılan Marjin) x 100"
        ],
      },
      {
        "heading": "Marjin seviyesi neden tek gerçek gösterge tablosudur?",
        "paragraphs": [
          "Yukarıdaki beşinci formül, diğer dördünü tek bir yüzdeye sıkıştırır: Marjin Seviyesi = (Equity / Kullanılan Marjin) x 100. Broker'ın sistemleri hesabınızı bu yüzde üzerinden izler; margin call ve stop out eşikleri de bu yüzdeye göre tanımlanır.",
          "Sayının okunması sezgiseldir. Marjin seviyesi %1000 ise, öz sermayeniz bloke edilen teminatın on katıdır; pozisyonun zarar taşıma kapasitesi geniştir. %200'e düştüğünde teminatın iki katı kadar öz sermayeniz kalmıştır. %100 ise öz sermayeniz tam olarak bloke edilen teminata eşittir; yani serbest marjin sıfırdır ve yeni pozisyon açma kapasiteniz bitmiştir.",
          "Burada kritik nokta şudur: yüzde düşerken pay değişir, payda genellikle sabit kalır. Kullanılan marjin, pozisyonu açtığınız andaki büyüklük ve kaldıraca göre belirlenir ve pozisyon açık kaldığı sürece değişmez. Değişen tek şey equity'dir. Dolayısıyla marjin seviyesinin düşüş hızı, doğrudan zararınızın hızıdır ve zararın hızı da pozisyon büyüklüğüne bağlıdır.",
          "Bu yüzden marjin seviyesi bir \"risk göstergesi\" değil, risk göstergesinin ta kendisidir. Açık pozisyonu olan bir hesapta izlenmesi gereken tek sayı istenirse, kâr/zarar rakamı değil bu yüzde olmalıdır."
        ],
      },
      {
        "heading": "Margin call bir uyarı, stop out bir tasfiyedir — ve seviyeleri broker belirler",
        "paragraphs": [
          "Margin call, marjin seviyesi broker'ın belirlediği ilk eşiğin altına indiğinde tetiklenen uyarıdır. Anlamı şudur: teminatınız pozisyonu taşımaya yetecek güvenli aralığın dışına çıktı, ya teminat ekleyin ya pozisyon küçültün. Bu aşamada henüz kimse sizin adınıza bir şey kapatmaz; karar hâlâ sizdedir. Modern platformlarda bu uyarı çoğu zaman renk değişimi veya bildirim olarak gelir, eski adının çağrıştırdığı gibi bir telefon araması olarak değil.",
          "Stop out ise uyarı değildir. Marjin seviyesi ikinci ve daha düşük eşiğin altına indiğinde sistem, sizden onay almadan pozisyonları otomatik olarak kapatmaya başlar. Bu bir müdahale hakkı değil, sözleşmeden doğan bir tasfiye mekanizmasıdır.",
          "Bu iki eşiğin sayısal değeri evrensel değildir; her broker kendi belirler ve aynı broker içinde bile hesap türüne, enstrümana ve tüzel kişiliğe göre farklılaşabilir. Sektörde yaygın olarak margin call eşiğinin %100 ile %50 bandında, stop out eşiğinin ise %50 ile %20 bandında görüldüğü söylenebilir. Ancak bu bir standart değil, bir gözlem aralığıdır.",
          "Pratik sonuç nettir: kendi hesabınızın margin call ve stop out yüzdesini tahmin etmeyin, hesap sözleşmenizden veya broker'ın işlem koşulları sayfasından doğrulayın. Bu iki sayı, hesabınızın hangi fiyat seviyesinde biteceğini belirleyen parametrelerdir; bilinmeyen bir parametreyle risk yönetimi yapılamaz. Farklı brokerlerin koşullarını karşılaştırmak isterseniz Broker Sorgulama aracı ve Broker Sıralamaları bu tür şart karşılaştırmaları için uygun başlangıç noktalarıdır."
        ],
      },
      {
        "heading": "Sayısal senaryo: 1.000 $ hesap, 1:500 kaldıraç, 1 lot EURUSD",
        "paragraphs": [
          "Şimdi formülleri tek bir örnekte sonuna kadar çalıştıralım. Varsayımlar: hesapta 1.000 $ var, kaldıraç 1:500, EURUSD kuru 1.10 ve 1 standart lot (100.000 birim) alım pozisyonu açılıyor. Spread ve swap gibi kalemleri, aritmetiği bulandırmamak için hesaba katmıyoruz.",
          "Önce pozisyon değeri: 100.000 birim x 1.10 = 110.000 $. Sonra kullanılan marjin: 110.000 / 500 = 220 $. Serbest marjin ise 1.000 - 220 = 780 $. Açılış anında marjin seviyesi (1.000 / 220) x 100 = yaklaşık %455'tir.",
          "Standart lotta EURUSD'de 1 pip yaklaşık 10 $ değerindedir. Yani fiyat aleyhinize her 1 pip hareket ettiğinde equity 10 $ azalır. Marjin seviyesinin %100'e inmesi için equity'nin kullanılan marjine, yani 220 $'a eşitlenmesi gerekir. Bunun için gereken zarar: 1.000 - 220 = 780 $. 780 / 10 = 78 pip.",
          "Sonuç şu: fiyat 78 pip aleyhinize giderse öz sermayeniz 220 $'a düşer ve marjin seviyeniz %100 olur. EURUSD'de 78 pip, yani yaklaşık 0.0078'lik bir hareket, olağandışı bir hareket değildir; birçok gün içinde görülebilecek bir aralıktır. Bu noktada hesabınızın yüzde 78'i tek bir pozisyonda silinmiş olur ve bu, 1:500 gibi yüksek bir kaldıraçta bile böyledir.",
          "Aynı hesabı kaldıraç değiştirerek tekrarlayın: kaldıraç 1:100 olsaydı kullanılan marjin 1.100 $ olurdu ve 1.000 $'lık hesapla bu pozisyon zaten açılamazdı. Kaldıracın yaptığı tek şey, pozisyonu açmanıza izin verip vermemektir. Pozisyon açıldıktan sonra zararınızın hızını belirleyen şey kaldıraç değil, lot büyüklüğüdür — çünkü pip değeri lot büyüklüğünden türer, kaldıraçtan değil."
        ],
        "list": [
          "Pozisyon değeri: 100.000 x 1.10 = 110.000 $",
          "Kullanılan marjin: 110.000 / 500 = 220 $",
          "Serbest marjin: 1.000 - 220 = 780 $",
          "Pip değeri: 1 standart lot EURUSD'de yaklaşık 10 $",
          "Marjin seviyesinin %100 olması için gereken zarar: 780 $ = 78 pip",
          "Bu noktada equity 220 $, kayıp hesabın yüzde 78'i"
        ],
      },
      {
        "heading": "Asıl ders: hesabı bitiren kaldıraç değil, pozisyon büyüklüğüdür",
        "paragraphs": [
          "Yukarıdaki senaryonun en önemli çıktısı, kaldıraç tartışmasının çoğu zaman yanlış yerde yapıldığını göstermesidir. 1:500 kaldıraç, 1.000 $'lık hesaba 1 lotluk pozisyon açma kapısını açar. Kapının açılması ile içeri girmek zorunda olmak aynı şey değildir.",
          "Aynı hesapta 1 lot yerine 0.10 lot açılsaydı, kullanılan marjin 22 $, pip değeri yaklaşık 1 $ olurdu. Marjin seviyesinin %100'e inmesi için gereken zarar bu kez çok daha büyük bir fiyat hareketi gerektirirdi. Kaldıraç oranı hiç değişmeden, hesabın dayanıklılığı bambaşka bir düzeye çıkar. Yani risk düğmesi kaldıraç ayarında değil, lot kutusundadır.",
          "Bu, yüksek kaldıracın zararsız olduğu anlamına gelmez. Yüksek kaldıraç, küçük bir hesapla çok büyük bir pozisyon açmayı teknik olarak mümkün kıldığı için davranışsal bir risk taşır; sınırı sistem koymadığında sınırı yatırımcının koyması gerekir. XM'de maksimum kaldıraç 1:1000'e kadar çıkabilmekte, ancak bu oran bölgeye ve tüzel kişiliğe göre değişmektedir; bu tür üst sınırları kendi hesabınız için doğrulamadan planlama yapmayın.",
          "Pozisyon büyüklüğünü hesabınızın taşıyabileceği zarara göre belirlemek, marjin matematiğinin tamamını lehinize çevirir. Kendi hesap büyüklüğünüz ve enstrümanınız için pip değerini ve gerekli teminatı çıkarmak isterseniz Pozisyon Hesaplayıcı bu aritmetiği kısaltır."
        ],
      },
      {
        "heading": "Stop out neden bir koruma değil, bir tasfiyedir?",
        "paragraphs": [
          "Stop out bazen \"broker sizi koruyor\" diye anlatılır. Daha doğru bir tanım şudur: stop out, öncelikle broker'ın alacağını koruyan bir tasfiye mekanizmasıdır. Sizin zararınızı sabitlemesi, bu sürecin amacı değil sonucudur. Sistem, teminatınızın taşıyabileceği zararın sınırına gelindiğinde pozisyonu piyasa fiyatından kapatır; bu fiyatın sizin için uygun olup olmadığı hesaba katılmaz.",
          "Birden fazla açık pozisyon varsa hangisinin önce kapatılacağı da genellikle sizin tercihinize bırakılmaz. Yaygın uygulama, en çok zarardaki pozisyonun ilk sırada kapatılmasıdır; çünkü marjin seviyesini en hızlı yukarı çeken işlem odur. Bu, stratejinizin mantığına aykırı bir sonuç doğurabilir: örneğin bir korunma amaçlı taşıdığınız bacak kapanırken diğeri açık kalabilir ve pozisyonunuz istemediğiniz bir yöne açık hale gelir.",
          "Daha önemli bir kısıt daha var. Stop out seviyesi bir garanti değil, bir tetikleyicidir. Fiyat sürekli aktığında sistem o seviyeye yakın bir yerde kapatabilir; ancak önemli veri açıklamaları, hafta sonu açılışları veya beklenmedik haber anlarında fiyat iki seviye arasında hiç işlem görmeden sıçrayabilir. Buna boşluk (gap) denir. Boşluk anında stop out seviyesi tamamen atlanabilir ve pozisyon, hesaplanandan çok daha kötü bir fiyattan kapanabilir.",
          "Bu senaryoda öz sermaye sıfırın altına inebilir; yani hesap eksiye düşebilir. Negatif bakiye koruması tam olarak burada devreye girer: hesabın eksi bakiyesi sıfırlanır ve yatırdığınızdan fazlasını borçlanmazsınız. XM negatif bakiye koruması sunmaktadır. Ancak bu korumanın ne yaptığını doğru anlamak gerekir; sermayenizi korumaz, yalnızca kaybınızın hesaptaki tutarla sınırlı kalmasını sağlar.",
          "Boşluk riskini yönetmenin en pratik yolu, yüksek etkili veri saatlerini önceden bilmek ve o saatlerde taşınan pozisyon büyüklüğünü buna göre ayarlamaktır. Ekonomik Takvim, hangi saatlerde bu tür hareketlerin olasılığının arttığını görmek için kullanılabilir."
        ],
      },
      {
        "heading": "Marjin seviyesini sağlıklı tutmanın somut yolları",
        "paragraphs": [
          "Marjin seviyesi tek bir kesirdir: payda equity, paydada kullanılan marjin vardır. Yüzdeyi yükseltmenin de yalnızca iki yolu vardır — payı büyütmek veya paydayı küçültmek. Aşağıdaki maddelerin hepsi bu iki hareketten birine dayanır.",
          "Bu listedeki maddeler bir strateji değil, hijyen kurallarıdır. Hiçbiri kâr üretmez; hepsi, kâr üretecek kadar uzun süre piyasada kalmanızı hedefler."
        ],
        "list": [
          "Pozisyon büyüklüğünü hesabın büyüklüğüne göre belirleyin; lot kutusuna girdiğiniz sayı, risk ayarının kendisidir",
          "Pozisyonu açmadan önce kullanılan marjini ve marjin seviyesinin %100'e ineceği pip mesafesini hesaplayın",
          "Zararı durdur (stop loss) emrini, stop out seviyesinden çok önce devreye girecek şekilde konumlandırın; tasfiyeyi sisteme bırakmayın",
          "Aynı yöne bakan birden fazla pozisyonu tek bir büyük pozisyon gibi değerlendirin; korelasyonlu enstrümanlarda toplam risk göründüğünden fazladır",
          "Serbest marjini sıfıra yaklaştıran bir yükü kalıcı olarak taşımayın; tampon olmadan tek bir haber yeterlidir",
          "Yüksek etkili veri ve olay saatlerinde taşınan pozisyon büyüklüğünü önceden gözden geçirin",
          "Hesabınızın margin call ve stop out yüzdelerini sözleşmeden doğrulayın ve bu iki sayıyı planınıza yazın"
        ],
      },
      {
        "heading": "Hedging ve netting hesaplarda marjin hesabı neden farklılaşabilir?",
        "paragraphs": [
          "Son bir teknik ayrım: aynı enstrümanda hem alım hem satım pozisyonu taşıyabildiğiniz hesap yapısına hedging, aynı enstrümandaki pozisyonların tek bir net pozisyona indirgendiği yapıya netting denir. Bu tercih platform ve hesap türüne göre değişir.",
          "Netting yapıda 1 lot alım ve 0.6 lot satım, 0.4 lotluk tek bir net pozisyona dönüşür ve teminat bu net büyüklük üzerinden hesaplanır. Hedging yapıda ise iki pozisyon ayrı ayrı durur; brokerin uygulamasına göre teminat iki bacak için de tam olarak bloke edilebilir, kısmen indirimli uygulanabilir veya kilitli pozisyon için farklı bir kural işletilebilir.",
          "Sonuç olarak, kâğıt üzerinde \"yönsüz\" görünen bir pozisyon çifti, hesap yapısına bağlı olarak marjin seviyenizi beklediğinizden daha fazla baskılayabilir. Aynı işlemleri iki farklı hesap türünde açtığınızda farklı kullanılan marjin rakamları görmeniz bu yüzden şaşırtıcı değildir. Kendi hesabınızın hangi modelle çalıştığını ve kilitli pozisyonlarda teminatı nasıl hesapladığını, gerçek para riske etmeden önce demo ortamında test etmek en temiz doğrulama yöntemidir."
        ],
      },
      {
        "heading": "Toparlarsak",
        "paragraphs": [
          "Marjin mekanizması gizemli değil, sadece sıralıdır. Bakiye geçmişi gösterir, equity bugünü gösterir, kullanılan marjin pozisyonun bedelidir, serbest marjin tamponunuzdur ve marjin seviyesi bu dördünü tek bir yüzdeye indirger. Margin call bir uyarı, stop out ise bir tasfiyedir; ikisinin eşikleri brokerden brokere değişir ve tahmin edilmesi değil doğrulanması gereken sayılardır.",
          "1.000 $ hesap, 1:500 kaldıraç ve 1 lot EURUSD örneğinde gördüğümüz gibi, 78 piplik bir hareket hesabın yüzde 78'ini silmeye yetiyor. Bu sonucu üreten şey kaldıraç oranı değil, hesabın büyüklüğüne göre fazla büyük seçilmiş bir pozisyondu. Kaldıraç kapıyı açar; içeriye ne kadar yük taşıdığınıza siz karar verirsiniz. Boşluk riskinin stop out seviyesini atlayabildiği durumlarda negatif bakiye koruması kaybı hesaptaki tutarla sınırlar — XM bu korumayı sunmaktadır — ama sermayenizi korumaz. Sermayeyi koruyan tek şey, pozisyon açılmadan önce yapılan hesaptır.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "altin-xauusd-agustos-2026-teknik-gorunum",
    "coverImage": "/blog/altin-xauusd-agustos-2026-teknik-gorunum-cover.png",
    "title": "Altın (XAU/USD) 4.370 Doları Test Etti: Jackson Hole Öncesi Teknik ve Temel Görünüm",
    "excerpt": "Altın 4.367 dolar civarında işlem görürken RSI ve MACD ivme kaybına işaret ediyor. 4.311 dolarlık desteğin iki tarafındaki senaryoları, Fed'in ikili tablosunu ve Jackson Hole takvimini teknik bir çerçevede ele alıyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 10,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "Altın, 20 Ağustos 2026 itibarıyla ons başına 4.367 dolar civarında işlem görüyor. Gün zirvesi 4.370 dolara uzandı; haftanın dibi ise 4.324 dolarda kaldı. Fiyat haftalık bazda yukarı yönlü ve dibinden kırk dolardan fazla uzaklaşmış durumda. İlk bakışta tablo net: alıcılar kontrolde.",
          "Ancak fiyatın yönü ile o yönün arkasındaki güç her zaman aynı hikâyeyi anlatmaz ve bu hafta altında tam olarak böyle bir ayrışma var. Fiyat yukarı gidiyor, fakat ivme göstergeleri bu yükselişi eskisi kadar hevesli biçimde onaylamıyor: RSI 60'ın altına çekildi, MACD histogramı daralıyor ve Salı günü düşüş yönlü bir yutan mum oluştu. Hiçbiri tek başına dönüş sinyali değil, ama bir arada yükselişin kırılgan bir zeminde ilerlediğini söylüyorlar.",
          "Bu yazıda amaç bir yön tahmini yapmak değil; önümüzdeki iki haftada altının hangi seviyelerde hangi soruları soracağını ve hangi başlıkların bu soruların cevabını değiştirebileceğini bir çerçeveye oturtmak. 26 Ağustos'taki çekirdek PCE verisinden 27-29 Ağustos'taki Jackson Hole sempozyumuna, oradan 16 Eylül FOMC toplantısına uzanan bir takvim var ve altın bu takvimin tam ortasında duruyor."
        ],
      },
      {
        "heading": "Teknik tablo: yükseliş sürüyor ama ivme zayıflıyor",
        "paragraphs": [
          "Seviyeler \"fiyat nerede karar verecek?\" sorusunu, ivme göstergeleri ise \"o karara giden hareket ne kadar güçlü?\" sorusunu yanıtlar. Altında şu an bu iki cevap örtüşmüyor.",
          "Aşağı yönde ilk ciddi eşik 4.311 dolar, yani 14 Ağustos'ta görülen dip. Böyle bir seviyenin önemi bir kez test edilip savunulmuş olmasından gelir: piyasa o fiyatta alıcı bulmuştur, dolayısıyla oraya yeniden gelindiğinde aynı tepkinin gelip gelmeyeceği ölçülebilir bir soru haline gelir. Altında bir sonraki referans 4.220 dolar; arada belirgin bir istasyon olmadığı için bu bölge kırılım halinde hareketin hızlanabileceği bir boşluktur.",
          "Yukarı yönde ilk direnç 4.450 dolar; üzerinde 4.510 dolarda 200 günlük basit hareketli ortalama duruyor. Bu ortalama orta-uzun vadeli trend algısı için yaygın biçimde izlendiğinden, birçok kural tabanlı yaklaşım fiyatın hangi tarafında kapandığına göre konumlanır; bu da seviyenin etrafında işlem yoğunluğunu artırır. Daha yukarıda Mayıs sonu zirvesi olan 4.600 dolar var.",
          "İvme tarafına gelince: RSI'ın 60'ın altına çekilmesi aşırı satım anlamına gelmez. Yükseliş rejimlerinde 50-80 bandında salınan bir göstergenin alt yarıya kayması, alım baskısının azaldığına işaret eder. MACD histogramının daralması da benzer bir şey söyler: histogram iki hareketli ortalama arasındaki farkın değişimini gösterir, daralması trendin bittiği değil hızlanmayı bıraktığı anlamına gelir.",
          "Salı günkü düşüş yönlü yutan mum ise daha somut bir bilgi taşır: bir önceki günün gövdesinin tamamının satıcılar tarafından geri alındığını, yani gün içinde yukarı çıkan fiyatın kapanışa doğru satış gördüğünü gösterir. Tek başına zayıf bir sinyaldir, fakat ivme göstergeleriyle aynı yöne işaret ettiğinde dikkate değer hale gelir — şu anki durum bu."
        ],
        "list": [
          "Destekler: 4.311 $ (14 Ağustos dibi) ve altında 4.220 $",
          "Dirençler: 4.450 $, ardından 4.510 $ (200 günlük SMA) ve 4.600 $ (Mayıs sonu zirvesi)",
          "Güncel fiyat: 4.367 $ civarı; gün zirvesi 4.370 $, haftalık dip 4.324 $",
          "İvme: RSI 60'ın altında, MACD histogramı daralıyor, Salı günü düşüş yönlü yutan mum"
        ],
      },
      {
        "heading": "İki senaryo: 4.311 dolar neden ayrım noktası?",
        "paragraphs": [
          "Senaryo kurmak tahmin yapmak değildir; senaryo, \"şu olursa şuraya bakarım\" biçiminde önceden karar verme disiplinidir. Altındaki mevcut yapı 4.311 doları doğal bir ayrım çizgisi haline getiriyor: bu seviyenin üstünde kalındığı sürece yükseliş yapısı teknik olarak bozulmuş sayılmaz, altında günlük kapanış görülürse yapı sorgulanır hale gelir.",
          "Aşağıdaki çerçeve hangi seviyelerin hangi durumda devreye girdiğini gösteriyor."
        ],
        "list": [
          "Senaryo 1 — 4.311 dolar üzerinde tutunma: Fiyat bu desteği koruduğu sürece haftalık dip olan 4.324 dolar ve mevcut 4.367 dolar bandı ara referans olarak kalır. Yukarıda ilk ciddi test 4.450 dolar; burada satış görülmesi ivme göstergelerinin uyarısını doğrular. 4.450 doların üzerinde tutunma sağlanırsa bir sonraki gündem maddesi doğrudan 4.510 dolardaki 200 günlük SMA olur.",
          "Senaryo 1'in devamı — 4.510 dolar üstü: 200 günlük ortalamanın üzerinde günlük kapanışlar orta vadeli trend okumasını güçlendirir ve 4.600 dolardaki Mayıs sonu zirvesini gündeme getirir.",
          "Senaryo 2 — 4.311 doların altında kapanış: 14 Ağustos dibi kırılmış olur ve yukarıdaki yapı geçersizleşir. Ara destek zayıf olduğu için bir sonraki teknik referans 4.220 dolara iner; aradaki mesafenin genişliği hareketin hızlanma ihtimalini artırır.",
          "Senaryo 2'nin devamı — 4.220 dolar tepkisi: Alıcı tepkisi gelirse fiyat 4.311 dolara dönmeye çalışır ve eski destek direnç olarak sınanır. Tepki gelmezse yapı daha geniş bir düzeltme okumasına döner.",
          "Ortak nokta: kararı anlık dokunuş değil, kapanışlar verir — haber saatlerinde bu ayrım daha da önemlidir."
        ],
      },
      {
        "heading": "Temel taraf: dolar zayıflığı, düşen getiriler ve reel faiz bağlantısı",
        "paragraphs": [
          "Yükselişin arkasında birkaç temel unsur birlikte çalışıyor. Birincisi doların genel zayıflığı. Altın dolar cinsinden fiyatlandığı için, dolar diğer para birimleri karşısında değer kaybettiğinde altının fiyatı mekanik olarak yukarı yönlü baskı görür; bu bir talep hikâyesi değil, birim hikâyesidir. EUR/USD'nin 1.1597 civarına, yaklaşık iki ayın zirvesine çıkmış olması bu zayıflığın altını çiziyor.",
          "İkincisi, ABD Hazinesinin geri alım işlemlerinin uzun vadeli getirileri aşağı çekmesi. Getiriler düştüğünde altın için tablo doğrudan değişir; nedenini anlamak için altının en temel özelliğine bakmak gerekir.",
          "Altın getirisi olmayan bir varlıktır. Kupon ödemez, temettü dağıtmaz. Dolayısıyla altın tutmanın bir fırsat maliyeti vardır: aynı parayı tahvile koysanız faiz kazanacaktınız. Bu maliyeti belirleyen şey nominal faiz değil, reel faizdir — yani nominal faizden enflasyonun düşülmüş hali. Reel faiz yüksekken altın tutmak pahalıdır, çünkü vazgeçilen reel getiri büyüktür. Reel faiz düştüğünde ise elde tutma maliyeti azalır ve varlık göreli olarak daha çekici hale gelir.",
          "Şu andaki bileşim tam olarak bu yönde çalışıyor: nominal uzun vadeli getiriler geri alımların etkisiyle aşağı gelirken enflasyon %3'lerin ortasında seyrediyor; Haziran çekirdek PCE yıllık %3.3 olarak açıklanmıştı. Nominal getiri düşerken enflasyon yerinde saydığında reel faiz sıkışır. Enflasyon endişelerinin canlı kalması ayrıca altının geleneksel enflasyon koruması kimliğini gündemde tutuyor.",
          "Dördüncü unsur petrolün toparlanması. Enerji fiyatlarındaki yükseliş manşet enflasyon beklentilerini yukarı çeker ve dolaylı olarak altın talebini destekleyebilir; ancak bu etki beklentiler üzerinden dolaşarak ve gecikmeli gelir. Toplamda temel zemin destekleyici görünüyor, fakat bu zeminin en kritik parçası — para politikasının yönü — net değil."
        ],
      },
      {
        "heading": "Fed'in ikili tablosu altın için neden belirsizlik üretiyor?",
        "paragraphs": [
          "Fed politika faizi hedef aralığı şu anda %3.50-3.75 ve Temmuz FOMC toplantısında faiz sabit tutuldu. Fakat toplantının asıl dikkat çeken tarafı karar değil, itirazın yönüydü: üç bölgesel Fed başkanı — Logan, Hammack ve Kashkari — 25 baz puanlık ARTIRIM yönünde muhalefet şerhi düştü. Zayıflayan bir ekonomi görüntüsünün ortasında muhalefetin indirim değil artırım yönünde olması, kurul içindeki enflasyon endişesinin ne kadar canlı olduğunu gösteriyor.",
          "Diğer tarafta ekonominin yavaşladığına dair somut veriler var. Temmuz tarım dışı istihdam -23.000 geldi ve önceki aylarda ciddi aşağı yönlü revizyonlar yapıldı; Temmuz perakende satışlar -%0.6 ile Mayıs 2025'ten bu yana en sert aylık düşüşü kaydetti. İkisi birlikte talep tarafında belirgin bir soğuma anlatıyor. Buna karşılık Temmuz TÜFE manşet ve çekirdekte yıllık bazda hafifledi, ÜFE beklentiden yumuşak geldi — ama enflasyon hâlâ %3'lerin ortasında, yani hedefin belirgin biçimde üzerinde.",
          "Altın için asıl belirsizlik bu ikili tablodan doğuyor, çünkü iki hikâye de savunulabilir ve altını farklı yönlere iter. Zayıflayan istihdam ve tüketim hikâyesi kazanırsa Fed'in gevşemeye yönelmesi beklenir, reel faizler düşer ve altının fırsat maliyeti azalır. Enflasyonun inatçılığı hikâyesi kazanırsa üç bölgesel başkanın işaret ettiği sıkılaşma senaryosu fiyatlanmaya başlar, reel faizler yükselir ve fırsat maliyeti artar.",
          "Piyasa şu an ikisinin arasında duruyor: 16 Eylül FOMC toplantısı için sabit tutma olasılığı yaklaşık %65 fiyatlanıyor. Bu net bir beklenti değil; kalan dilim, sürpriz bir verinin fiyatlamayı hızla kaydırabileceğini gösteriyor. Altındaki ivme kaybını da bu çerçevede okumak mantıklı: piyasa bir katalizör bekliyor ve o katalizör henüz gelmedi."
        ],
      },
      {
        "heading": "Takvim riski: 26 Ağustos'tan 16 Eylül'e uzanan üç eşik",
        "paragraphs": [
          "Altını hareket ettirebilecek olayların büyük kısmı takvimde belli. Bu sürpriz olmayacağı anlamına gelmiyor; sürprizin ne zaman gelebileceğinin bilindiği anlamına geliyor — ki bu bilgi pozisyon yönetiminde yön tahmininden daha kullanışlıdır.",
          "İlk eşik 26 Ağustos. O gün 12:30 GMT'de hem ABD 2. çeyrek GSYH verisinin ikinci tahmini (öncü okuma %1.5) hem de çekirdek PCE açıklanacak. Çekirdek PCE Fed'in tercih ettiği enflasyon ölçüsü olduğu için reel faiz denklemini doğrudan etkiler; beklentinin üzerinde bir okuma sıkılaşma tarafını, altında bir okuma gevşeme tarafını güçlendirir.",
          "İkinci eşik 27-29 Ağustos'taki Jackson Hole Ekonomi Sempozyumu. Wyoming'deki Jackson Lake Lodge'da düzenlenen sempozyumun teması \"Financial Innovation: Implications for Payments and Policy\"; 70'ten fazla ülkeden yaklaşık 120 katılımcı bekleniyor. Jackson Hole tarihsel olarak, resmi toplantılar dışında politika yönüne dair en açık sinyallerin verildiği kürsü olarak izlenir.",
          "Bu yılın en kritik anı 28 Ağustos, yaklaşık 10:00 ET (14:00 GMT). Kevin Warsh, Fed Başkanı sıfatıyla ilk Jackson Hole açılış konuşmasını yapacak. Bu konuşmanın 16 Eylül kararı için belirleyici görülmesinin üç nedeni var. Birincisi zamanlama: FOMC öncesindeki son geniş çaplı politika beyanı niteliğinde. İkincisi, bir başkanın ilk Jackson Hole konuşması genellikle tek bir toplantının ötesinde kurumun çerçevesine dair ton belirler; piyasa bunu taktiksel değil stratejik sinyal olarak okur. Üçüncüsü, Temmuz'daki muhalefet şerhlerinin ardından kurul içinde görünür bir ayrışma var; başkanın enflasyon ile istihdam arasındaki dengeyi nasıl kurduğunu ilk kez bu kürsüden duyacak olan piyasa, %65'lik sabit tutma fiyatlamasını buna göre yeniden ayarlayabilir.",
          "Üçüncü eşik 16 Eylül'deki FOMC faiz kararı. O tarihe kadar altının 4.311-4.450 bandındaki davranışı, piyasanın bu soruya verdiği cevabın kademeli olarak fiyata yansıması biçiminde okunabilir. Takibi için Ekonomik Takvim kullanışlıdır; XM'in ekonomik takvimi de veri saatlerini ve önceki okumaları aynı ekranda gösterir."
        ],
        "list": [
          "25 Ağustos 14:00 GMT — ABD Tüketici Güven Endeksi",
          "26 Ağustos 12:30 GMT — ABD 2. çeyrek GSYH (ikinci tahmin, öncü %1.5) ve çekirdek PCE",
          "27-29 Ağustos — Jackson Hole Ekonomi Sempozyumu, Wyoming",
          "28 Ağustos ~14:00 GMT — Kevin Warsh'ın Fed Başkanı olarak ilk açılış konuşması",
          "16 Eylül — FOMC faiz kararı (sabit tutma olasılığı ~%65 fiyatlanıyor)"
        ],
      },
      {
        "heading": "XAUUSD'de pozisyon büyüklüğü neden döviz paritelerinden farklı hesaplanır?",
        "paragraphs": [
          "Teknik ve temel tabloyu doğru okumak yetmez; enstrümanın sözleşme yapısını bilmek de gerekir, çünkü bu yapı risk hesabını doğrudan değiştirir. XAUUSD'de standart lot 100 onstur. Pratik sonucu şudur: altın fiyatında 1 dolarlık hareket, standart lotta 100 dolar kâr veya zarar demektir. Bu, döviz paritelerine alışkın bir yatırımcı için sezgiye ters bir ölçek farkı yaratır, çünkü altında günlük dalgalanma tek dolarlarla değil onlarca dolarla ölçülür. Bu hafta iyi bir örnek: 4.324-4.370 dolar aralığı standart lotta 4.600 dolarlık dalgalanmaya karşılık gelir.",
          "Bu ölçek, stop mesafesi ile lot büyüklüğü arasındaki ilişkiyi keskinleştirir. Yukarıdaki çerçevede 4.311 dolar destek, 4.450 dolar direnç ve bandın genişliği 139 dolar. Stop'u teknik olarak anlamlı bir yere, yani desteğin altına koymak isterseniz mevcut 4.367 dolar seviyesinden itibaren stop mesafeniz elli doları rahatlıkla aşar. Standart lotta elli dolarlık mesafe 5.000 dolarlık risk demektir; bu, çoğu hesap için kabul edilebilir tek işlem riskinin çok üzerindedir.",
          "Sonuç şu: altında lot büyüklüğü hesap büyüklüğüne göre değil, stop mesafesine göre belirlenir. Önce stop seviyesine karar verirsiniz, sonra o mesafede kaybetmeye razı olduğunuz tutarı belirlersiniz, lot büyüklüğü bu iki sayıdan çıkar. Geniş bantta işlem yapmak otomatik olarak daha küçük lot demektir. Pozisyon Hesaplayıcı bu üç değişkeni bağlar; XM tarafında minimum lot adımlarının küçük olması da sonucu uygulanabilir kılan pratik bir detay, çünkü hesap küçük bir lot gerektirdiğinde yukarı yuvarlamak zorunda kalmazsınız.",
          "Son olarak takvim ile işlem mekaniği arasındaki bağlantı: 26 Ağustos'taki çekirdek PCE ve 28 Ağustos'taki Warsh konuşması gibi anlarda iki ek risk devreye girer — spread genişlemesi ve kayma. Likidite geçici olarak inceldiği için alış-satış farkı normalin belirgin biçimde üzerine çıkabilir; fiyat sıçramaları nedeniyle emirler istenen seviyeden değil, mevcut ilk fiyattan gerçekleşebilir. Bu, stop emirlerinin de belirlenen seviyenin ötesinde çalışabileceği anlamına gelir; yani hesapladığınız risk, gerçekleşen riskin alt sınırıdır, garantisi değil."
        ],
        "list": [
          "XAUUSD standart lot = 100 ons; 1 dolarlık hareket = standart lotta 100 $",
          "Bu haftanın 4.324-4.370 dolar aralığı standart lotta 4.600 $'lık dalgalanmaya denk gelir",
          "139 dolar genişliğindeki 4.311-4.450 bandının dışına konan bir stop, standart lotta binlerce dolarlık risk üretir",
          "Doğru sıra: önce stop seviyesi, sonra kabul edilen risk tutarı, en son lot büyüklüğü",
          "Veri ve konuşma saatlerinde spread genişlemesi ve kayma riski artar; stop'lar belirlenen seviyenin ötesinde çalışabilir"
        ],
      },
      {
        "heading": "Kapanış: yön değil, seviyeler ve tarihler",
        "paragraphs": [
          "Altındaki mevcut tablo kolay bir hikâyeye izin vermiyor. Fiyat 4.367 dolar civarında ve haftalık dibinden belirgin biçimde yukarıda; temel zemin destekleyici. Buna karşılık ivme göstergeleri yorulmaya işaret ediyor ve Fed tarafındaki ikili tablo, hangi yöne kararlı bir fiyatlama yapılacağını belirsiz bırakıyor.",
          "Böyle bir ortamda en işlevsel yaklaşım, yön tahmini yerine seviye ve tarih disiplini kurmaktır. Aşağıda 4.311 ve 4.220 dolar, yukarıda 4.450, 4.510 ve 4.600 dolar; takvimde 26 Ağustos, 28 Ağustos ve 16 Eylül. Piyasa bu çerçevenin neresinde karar verirse versin, kararı önceden bilmek yerine karara nasıl tepki vereceğinizi önceden belirlemiş olmak, altın gibi ölçeği büyük bir enstrümanda gerçek avantajdır.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    "slug": "jackson-hole-2026-warsh-eylul-fomc",
    "coverImage": "/blog/jackson-hole-2026-warsh-eylul-fomc-cover.png",
    "title": "Jackson Hole 2026: Warsh'ın İlk Konuşması ve Eylül FOMC İçin Ne Anlama Geliyor?",
    "excerpt": "27-29 Ağustos'ta Jackson Hole'da Kevin Warsh, Fed Başkanı olarak ilk açılış konuşmasını yapacak. Zayıflayan istihdam ile inatçı enflasyon arasındaki ikilemin 16 Eylül FOMC fiyatlamasına nasıl yansıdığını inceliyoruz.",
    "publishedAt": "2026-08-20",
    "readingMinutes": 10,
    "lang": "tr",
    "sections": [
      {
        "paragraphs": [
          "27-29 Ağustos tarihlerinde Wyoming'deki Jackson Lake Lodge'da toplanacak olan ekonomi sempozyumu, bu yıl alışılmışın dışında bir gündemle geliyor. 28 Ağustos'ta yaklaşık 14:00 GMT'de (ABD Doğu saatiyle 10:00 civarı) Kevin Warsh, Fed Başkanı sıfatıyla ilk Jackson Hole açılış konuşmasını yapacak. Bir Fed başkanının bu kürsüdeki ilk konuşması, teknik içeriğinden bağımsız olarak piyasa katılımcıları tarafından bir üslup testi gibi izlenir: yeni başkan hangi kelimeleri seçiyor, hangi verilere ağırlık veriyor, önceliği fiyat istikrarı mı yoksa istihdam mı?",
          "Bu yılın resmî teması ise doğrudan faiz patikası hakkında değil: \"Financial Innovation: Implications for Payments and Policy\". Yani ödeme sistemleri, finansal yenilik ve bunların para politikası aktarımına etkileri. 70'ten fazla ülkeden yaklaşık 120 katılımcının bir araya geldiği bu akademik çerçeve, konuşmanın büyük bölümünün yapısal konulara ayrılabileceğini gösteriyor. Ancak piyasa, temanın ne olduğuna değil, açılış konuşmasının içine sıkıştırılacak birkaç cümleye bakacak.",
          "Bu yazının amacı bir yön tahmini yapmak değil. Amaç, önümüzdeki iki haftanın takvimini, Fed'in içinde bulunduğu veri ikilemini ve mevcut piyasa fiyatlamasının hangi noktada kırılgan hale geldiğini olabildiğince sade biçimde ortaya koymak. Yön tahmini yapmak yerine, hangi mekanizmanın hangi sonucu doğurabileceğini anlamak, haber dönemlerinde çok daha kullanışlı bir zihinsel araçtır."
        ],
      },
      {
        "heading": "Jackson Hole neden bu kadar konuşuluyor — ve her yıl neden konuşulmamalı?",
        "paragraphs": [
          "Sempozyum 1982'den beri Kansas City Fed tarafından düzenleniyor. Başlangıçta akademik bir buluşma olarak tasarlanan etkinlik, zaman içinde merkez bankacılarının resmî toplantı takvimi dışında, görece serbest bir ortamda konuşabildiği nadir platformlardan birine dönüştü. Tam da bu serbestlik nedeniyle, geçmişte bazı politika dönüşlerinin ilk sinyalleri buradan verildi. Bir FOMC bildirisi hukuk metni gibi yazılır; Jackson Hole konuşması ise çerçeveyi açıklama imkânı tanır.",
          "Bu tarihsel arka plan, etkinliğe hak ettiğinden fazla bir kesinlik atfedilmesine de yol açıyor. Dürüst olmak gerekirse: Jackson Hole her yıl piyasa hareketi yaratmaz. Yılların önemli bir bölümünde konuşmalar mevcut duruşu tekrar eder, sürpriz içermez ve ilk dakikalardaki oynaklık gün içinde sönümlenir. Etkinliğin \"her zaman kritik\" olduğu algısı, büyük ölçüde birkaç istisnai yılın hafızada orantısız yer kaplamasından kaynaklanıyor.",
          "Bu yılı görece daha izlenebilir kılan şey, temanın kendisi değil, üç şeyin aynı anda üst üste binmesi: yeni bir Fed başkanının ilk konuşması, Temmuz toplantısında ortaya çıkmış açık bir kurul içi görüş ayrılığı ve birbiriyle çelişen makro veriler. Bu üçlü olmasaydı, sempozyum muhtemelen sıradan bir akademik hafta olarak geçecekti.",
          "Dolayısıyla doğru beklenti şudur: konuşma, mevcut belirsizliği azaltabilir ya da hiç dokunmadan geçebilir. İkisi de olağan sonuçlardır ve bir plan, iki ihtimali de kaldırabilecek şekilde kurulmalıdır."
        ],
      },
      {
        "heading": "Fed'in bugünkü ikilemi: zayıflayan istihdama karşı inatçı enflasyon",
        "paragraphs": [
          "Fed'in politika faizi hedef aralığı şu anda %3.50-3.75. Temmuz 2026 toplantısında faiz sabit tutuldu, ancak kararın kendisinden daha dikkat çekici olan, muhalefet şerhlerinin yönüydü. Logan, Hammack ve Kashkari — üç bölgesel Fed başkanı — 25 baz puanlık bir indirim değil, ARTIRIM yönünde muhalefet şerhi düştü. Bu, kurulun bir kanadının enflasyonu hâlâ birincil risk olarak gördüğünü açıkça gösteriyor.",
          "Bu görüşün veri tarafında dayanağı var. Enflasyon %3'lerin ortasında seyrediyor ve Fed'in tercih ettiği ölçüt olan çekirdek PCE, Haziran'da yıllık %3.3 seviyesindeydi. Hedefin belirgin biçimde üzerinde olan bu seviye, uzun süredir aynı bantta sıkışmış durumda. Enflasyonun düşüş hızının yavaşlaması, bir merkez bankası için indirim tartışmasını başlatmayı zorlaştıran türden bir durumdur.",
          "Madalyonun diğer yüzü ise reel ekonomiden geliyor ve tablo belirgin biçimde soğuyor. Temmuz tarım dışı istihdam -23.000 geldi; yani net iş kaybı. Bunun tek başına gürültü olduğu söylenebilirdi, ancak önceki aylarda yapılan ciddi aşağı yönlü revizyonlar, işgücü piyasasının bir süredir düşünüldüğünden zayıf olduğunu ima ediyor. Tüketici tarafında da Temmuz perakende satışları -%0.6 ile Mayıs 2025'ten bu yana en sert aylık düşüşünü kaydetti.",
          "Enflasyon cephesinde ise en son veriler bir miktar rahatlama sundu: Temmuz TÜFE'de hem manşet hem çekirdekte yıllık bazda hafifleme görüldü ve ÜFE beklentiden yumuşak geldi. Ancak tek bir aylık hafifleme, %3'lerin ortasındaki bir enflasyonu hedefe yakınsamış saymak için yeterli değil.",
          "Fed'in ikilemini böylece iki cümleye indirebiliriz: faizi indirirse, henüz kırılmamış bir enflasyon dinamiğini yeniden canlandırma riski alır. Faizi sabit tutmakta ısrar ederse — ya da bazı üyelerin savunduğu gibi artırırsa — zaten daralan istihdam ve tüketimi daha da sıkıştırma riski alır. Bu tür simetrik olmayan risklerin bulunduğu dönemlerde merkez bankaları genellikle beklemeyi tercih eder ve iletişimi belirsiz tutar."
        ],
        "list": [
          "Sıkı duruşu destekleyen taraf: çekirdek PCE (Haziran) yıllık %3.3, enflasyon %3'lerin ortasında, Temmuz'da üç üyeden artırım yönünde muhalefet şerhi.",
          "Gevşemeyi destekleyen taraf: Temmuz tarım dışı istihdam -23.000 ve önceki aylarda ciddi aşağı revizyonlar.",
          "Tüketim tarafı: Temmuz perakende satışlar -%0.6, Mayıs 2025'ten bu yana en sert aylık düşüş.",
          "Son dönem yumuşama sinyali: Temmuz TÜFE'de manşet ve çekirdekte yıllık hafifleme, ÜFE beklentiden yumuşak.",
          "Mevcut politika zemini: hedef aralık %3.50-3.75, Temmuz'da faiz sabit tutuldu."
        ],
      },
      {
        "heading": "Piyasa fiyatlaması neden asimetrik bir risk yaratıyor?",
        "paragraphs": [
          "16 Eylül FOMC toplantısı için piyasa fiyatlaması, faizin sabit tutulma olasılığını yaklaşık %65 olarak gösteriyor. Birkaç hafta önce bu oran kabaca 50/50 seviyesindeydi. Yani konsensüs, kısa sürede belirgin biçimde \"sabit tutma\" tarafına kaydı.",
          "Bu kaymanın ne anlama geldiğini doğru okumak gerekiyor. Fiyatlama bir tahmin değil, bir pozisyon dağılımıdır. %65, katılımcıların ağırlıklı olarak sabit tutma senaryosuna göre konumlandığını gösterir. Bir senaryo fiyatlandığında, o senaryo gerçekleştiğinde piyasanın vereceği tepki sınırlı kalır — çünkü zaten fiyatın içindedir. Buna karşılık, fiyatlanmamış olan sonuç gerçekleşirse tepki orantısız biçimde sert olur, zira çok sayıda pozisyonun aynı anda yeniden düzenlenmesi gerekir.",
          "Bu nedenle mevcut tablo asimetrik bir risk taşıyor. Warsh'ın konuşması mevcut duruşu teyit ederse, tepki muhtemelen ölçülü kalacaktır. Ancak konuşma, kalan yaklaşık %35'lik ihtimali besleyecek bir ton içerirse — ister bir indirim kapısını aralayan güvercin bir vurgu, ister Temmuz'daki artırım yönlü muhalefeti sahiplenen şahin bir vurgu — hareket, olasılığıyla orantısız biçimde büyük olabilir.",
          "Buradan çıkan pratik sonuç şudur: konsensüs bir yöne kaydığında, sürpriz genellikle o yönün tersinden gelir. Bu bir kehanet değil, pozisyon matematiğinin doğal sonucudur. Kalabalık tarafta duran işlemler, ters senaryoda çıkış için aynı dar kapıyı kullanmak zorunda kalır."
        ],
      },
      {
        "heading": "Önümüzdeki iki haftanın takvimi: sadece Jackson Hole değil",
        "paragraphs": [
          "Warsh'ın konuşması bu dönemin tek başlığı değil. Sempozyumun etrafında, hem ABD hem de diğer büyük ekonomilerden gelen bir veri yoğunluğu var. Özellikle 26 Ağustos, tek günde birden fazla önemli başlığın toplandığı bir tarih. Aşağıdaki liste, saatleri GMT cinsinden veriyor:"
        ],
        "list": [
          "25 Ağustos 01:30 GMT — RBA toplantı tutanakları (politika faizi %4.35).",
          "25 Ağustos 14:00 GMT — ABD Tüketici Güven Endeksi.",
          "26 Ağustos 01:30 GMT — Avustralya TÜFE (önceki yıllık %3.8).",
          "26 Ağustos 12:30 GMT — ABD 2. çeyrek GSYH ikinci tahmini (öncü okuma %1.5) ve çekirdek PCE verisi.",
          "26 Ağustos akşamı — Nvidia bilançosu; risk iştahı ve endeks tarafı için ayrı bir başlık.",
          "27 Ağustos 23:30 GMT — Tokyo TÜFE (önceki yıllık %1.7).",
          "27-29 Ağustos — Jackson Hole Ekonomi Sempozyumu, Jackson Lake Lodge.",
          "28 Ağustos 12:30 GMT — Kanada 2. çeyrek GSYH; 14:00 GMT — Warsh'ın açılış konuşması."
        ],
      },
      {
        "heading": "Bu seviyeler neden önemli: aktarım mekanizması olarak okumak",
        "paragraphs": [
          "Aşağıdaki bölüm bir fiyat tahmini değildir. Amaç, bir faiz beklentisi değişikliğinin hangi kanallardan hangi enstrümana ulaştığını ve bugün hangi teknik seviyelerin bu geçişin ölçüldüğü noktalar olduğunu göstermektir. Seviyeler, hareketin nereye gideceğini söylemez; hareketin ciddiye alınıp alınmadığını ölçmeye yarar.",
          "EUR/USD şu anda 1.1597 civarında, yaklaşık iki ayın zirvesine yakın. Hemen üzerinde 1.1600 direnci var; aşağıda 1.1578 (50 periyot hareketli ortalama) ve 1.1552 (200 periyot hareketli ortalama) destek olarak izleniyor. Aktarım kanalı doğrudan: güvercin bir ton, ABD faiz beklentisini aşağı çeker, dolar getiri avantajını azaltır ve pariteyi yukarı iter — bu durumda 1.1600'ün kalıcı biçimde aşılıp aşılamadığı asıl soru olur. Şahin bir ton ise ters yönde çalışır ve önce 1.1578, ardından 1.1552 test edilebilir.",
          "Altın 4.367 $ civarında işlem görüyor. Aşağıda 4.311 $ (14 Ağustos dibi), yukarıda 4.450 $ ilk referanslar. Altının faize duyarlılığı reel getiri üzerinden çalışır: faiz beklentisi düştüğünde getirisiz varlık tutmanın fırsat maliyeti azalır ve altın destek bulur; beklenti yukarı kaydığında bunun tersi geçerlidir. Teknik göstergelerde ivmenin bir miktar zayıfladığını da not etmek gerekir — RSI 60'ın altına çekilmiş, MACD histogramı daralıyor.",
          "Bitcoin ise yıllık dipten %20'den fazla toparlanmış durumda. Yukarıda 70.283/70.531 bölgesi ve 71.402 direnç olarak izleniyor; aşağıda 66.519 ve 65.416 destek konumunda. Kripto tarafında aktarım daha dolaylıdır ve genellikle likidite/risk iştahı kanalıyla çalışır: gevşeme beklentisinin arttığı ortamlarda risk iştahı desteklenir, sıkılaşma beklentisi ise ters yönde baskı yapar. Bu ilişkinin her dönemde aynı güçte çalışmadığını akılda tutmak gerekir.",
          "Şahin ve güvercin senaryoları böylece somut hale gelir: güvercin bir tonda EUR/USD'de 1.1600 üzeri, altında 4.450 $ yönü ve Bitcoin'de 70.283/70.531 bölgesi test edilebilir; şahin bir tonda ise EUR/USD'de 1.1578-1.1552 bandı, altında 4.311 $ ve Bitcoin'de 66.519 gündeme gelebilir. Bu, ne olacağının değil, olursa nerede ölçüleceğinin haritasıdır."
        ],
      },
      {
        "heading": "Haber anında işlem yapmanın gerçek maliyeti: spread, kayma ve boşluk",
        "paragraphs": [
          "Haber dönemlerinde en çok gözden kaçan şey, riskin sadece yönle ilgili olmadığıdır. Yönü doğru tahmin eden bir işlem bile, işlem altyapısının o anki koşulları nedeniyle zararla kapanabilir. Bunun dört ana kaynağı var.",
          "Birincisi spread genişlemesi. Veri veya konuşma anında likidite sağlayıcılar kotasyonlarını geri çeker; alış-satış farkı normal seviyesinin katlarına çıkabilir. Sıfır veya düşük spreadli hesap türlerinde bile bu geçerlidir, çünkü \"0.0 pipten itibaren\" gibi ifadeler taban değeri anlatır, ortalamayı değil. Örneğin XM'in Zero hesabında spread 0.0 pipten başlar ama lot başına taraf başına 3.50 $ komisyon sabittir; Ultra Low'da ise maliyetin tamamı değişken spreadin içindedir. Volatil dakikalarda bu iki yapının davranışı birbirinden farklılaşır.",
          "İkincisi kayma (slippage). Emriniz gördüğünüz fiyattan değil, emrin sıraya girdiği anda piyasada mevcut olan fiyattan gerçekleşir. Hızlı hareketlerde aradaki fark anlamlı boyutlara ulaşabilir.",
          "Üçüncüsü boşluk (gap) riski. Fiyat bir seviyeden diğerine sıçradığında, aradaki stop emirleri o seviyede değil, boşluğun bittiği ilk fiyattan çalışır. Yani planladığınız zararın üzerinde bir zararla kapanabilirsiniz. Garantili stop imkânının bulunmadığı ortamlarda bu risk tamamen ortadan kaldırılamaz.",
          "Dördüncüsü likiditenin çekilmesi. Emir defterinin inceldiği anlarda görece küçük hacimler bile fiyatı beklenenden fazla hareket ettirir; bu da ilk üç maddenin hepsini büyütür.",
          "Bu risklere karşı yapılabilecekler teknik değil, disiplin düzeyindedir:"
        ],
        "list": [
          "Pozisyon büyüklüğünü küçültmek: haber saatlerinde normal lotun bir kısmıyla çalışmak, oynaklığın etkisini doğrudan azaltır.",
          "Veri veya konuşma öncesi pozisyonu tamamen kapatmak: en basit ve en kesin korunma yöntemi budur; işlem yapmamak da bir karardır.",
          "Garantili stop bulunmayan ortamlarda stop mesafesini genişletip lotu düşürmek: böylece toplam risk sabit kalırken gürültüyle stop olma ihtimali azalır.",
          "Hesabın marjin seviyesini önceden kontrol etmek: kullanılabilir teminatın düşük olduğu bir hesapta ani hareket, stop çalışmadan marjin kapatmasına yol açabilir.",
          "Takvimi önceden çıkarmak: hangi saatte hangi verinin geleceğini bilmek, pozisyonun o saate denk gelmesini tesadüf olmaktan çıkarır — sitedeki Ekonomik Takvim sayfası bu planlamayı yapmak için yeterlidir.",
          "Pozisyon Hesaplayıcı ile lot başına risk tutarını işlemden önce dolar cinsinden görmek."
        ],
      },
      {
        "heading": "Sonuç: konuşmayı bir yön kaynağı değil, bir belirsizlik ölçütü olarak izleyin",
        "paragraphs": [
          "Özetlemek gerekirse: 28 Ağustos'taki konuşma, Fed'in zayıflayan istihdam ile %3'lerin ortasındaki enflasyon arasında hangisine ağırlık verdiğine dair bir ipucu sunabilir. 16 Eylül FOMC için sabit tutma olasılığının yaklaşık %65'e çıkmış olması, sürprizin daha çok bu fiyatlamanın dışında kalan senaryodan gelebileceği anlamına geliyor. Ancak sempozyumun her yıl piyasa hareketi yaratmadığını ve bu yılın resmî temasının doğrudan faiz patikası olmadığını da hatırda tutmak gerekiyor.",
          "Bu tür dönemlerde en işlevsel yaklaşım, tahmini keskinleştirmek yerine planı sağlamlaştırmaktır. Seviyeleri hedef olarak değil, tepkinin ciddiyetini ölçen referanslar olarak kullanmak; pozisyon büyüklüğünü oynaklığa göre ayarlamak; ve takvimi işlem planının parçası haline getirmek, sonucu kontrol edemediğiniz bir haftada kontrol edebileceğiniz tek şeydir. Broker tarafında ise hangi hesap yapısının volatil dakikalarda nasıl davrandığını — sabit komisyon mu, değişken spread mi — önceden bilmek, sonradan sürpriz yaşamamayı sağlar.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir; kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz."
        ],
      },
    ],
  },
  {
    slug: "teminat-bonusu-nedir-trade-bonusu-farki",
    // Square build of the campaign banner — same treatment as the XM cashback
    // post: blurred fill behind, wide original letterboxed on top, because the
    // post page crops covers to a square and would cut the headline off.
    coverImage: "/blog/teminat-bonusu-nedir-trade-bonusu-farki-cover.png",
    adBrokerSlug: "lite-finance",
    lang: "tr",
    title: "Teminat Bonusu Nedir? Trade Bonusundan Farkı — Rakamlarla",
    excerpt:
      "Teminat bonusu ile trade bonusu aynı şey değildir: biri hesabınızın dalgalanmaya dayanma payını büyütür, diğeri sizi hacim şartına bağlar. Farkı 1.000 dolarlık bir hesap üzerinden pip pip hesaplıyoruz — ve teminat bonusunu boşa harcamanın tek yolunu gösteriyoruz.",
    publishedAt: "2026-08-20",
    readingMinutes: 9,
    sections: [
      {
        paragraphs: [
          "Forex'te \"bonus\" kelimesi tek bir şeyi anlatmaz. Piyasada birbirinden tamamen farklı iki mekanizma aynı isimle pazarlanıyor ve ikisini karıştırmak, yatırımcının hesabına doğrudan zarar veren bir hataya dönüşüyor.",
          "Birincisi trade bonusu (yatırım bonusu, kredi bonusu): bakiyenize eklenir, işlem sermayeniz büyümüş gibi görünür, ama çekilebilir hale gelmesi için belirli bir işlem hacmini tamamlamanız gerekir. İkincisi teminat bonusu: bakiyenize değil teminatınıza eklenir, hacim şartı taşımaz ve tek işlevi hesabınızın piyasa dalgalanmasına dayanma payını büyütmektir.",
          "Bu yazıda ikisinin farkını 1.000 dolarlık bir hesap üzerinden rakamlarla gösteriyoruz. Sonda da teminat bonusunun sağladığı avantajı tamamen sıfırlayan tek hatayı hesaplayacağız — ve bu hatayı yapanların oranı, tahmin edilenden yüksek.",
        ],
      },
      {
        heading: "Neden bu ayrım bugün özellikle önemli?",
        paragraphs: [
          "Çünkü piyasadaki standart uygulama trade bonusudur. Küresel brokerların yayınladığı \"%30\", \"%50\", \"%100 bonus\" kampanyalarının neredeyse tamamı hacim şartına bağlı trade bonuslarıdır: bonusu almak kolaydır, tutmak zordur ve çoğu durumda çekilebilir hale getirmenin maliyeti bonusun kendisinden büyüktür.",
          "Koşulsuz teminat bonusu ise piyasada nadir görülür. Nedeni basit: brokerın bu bonustan doğrudan bir hacim geliri garantisi yoktur — yatırımcıyı daha çok işlem yapmaya zorlamaz. Bu yüzden genellikle standart kampanya olarak değil, belirli iş ortaklıkları üzerinden sunulur.",
          "FXPARTNER üzerinden açılan Lite Finance hesaplarına tanımlanan %20 teminat bonusu tam olarak böyle bir düzenlemedir: koşulsuz, şartsız ve hacim taahhüdü içermez. Bu, FXPARTNER'ın Lite Finance ile kurduğu resmi iş ortaklığından doğan, Türk yatırımcılara özel bir imkândır — brokerın herkese açık kampanya sayfasında yayınladığı bir teklif değildir.",
        ],
      },
      {
        heading: "Kurulum: 1.000 dolarlık hesap, %20 bonus",
        paragraphs: [
          "Aşağıdaki bütün hesaplar tek bir senaryo üzerinden yürüyor. Rakamları sadeleştirmek için EUR/USD paritesini 1,00 kabul ettik ve stop out seviyesini %20 aldık — stop out oranı hesap türüne göre değişir (Lite Finance'te ECN hesapta %20, cent hesapta %50), kendi hesabınızınkini kabinden kontrol edin.",
        ],
        list: [
          "Yatırım: 1.000 $. Bonus oranı: %20 → 200 $.",
          "Açılan pozisyon: 0,5 lot EUR/USD, 1:100 kaldıraç.",
          "Bu pozisyonun bloke ettiği teminat: yaklaşık 500 $.",
          "0,5 lotta 1 pip hareket: 5 $.",
        ],
      },
      {
        heading: "Senaryo A — Bonus yok",
        paragraphs: [
          "Öz sermayeniz 1.000 $, pozisyonun bloke ettiği teminat 500 $. Stop out %20 seviyesinde tetiklendiğine göre, hesabınız öz sermaye 100 dolara (500 $ × %20) inince zorla kapatılır.",
          "Yani taşıyabileceğiniz azami zarar: 1.000 − 100 = 900 $. Pip cinsinden: 900 ÷ 5 = 180 pip. Pozisyonunuz size karşı 180 pip giderse hesap kapanır.",
        ],
      },
      {
        heading: "Senaryo B — %20 teminat bonusu",
        paragraphs: [
          "Bonus bakiyenize değil teminat tabanınıza ekleniyor: teminat hesabında öz sermayeniz 1.200 $ olarak işlem görüyor. Kendi paranız hâlâ 1.000 $ — değişen tek şey, marjin hesaplamasının hangi rakam üzerinden yapıldığı.",
          "Aynı pozisyon, aynı 500 $ bloke teminat, aynı %20 stop out eşiği: hesap yine 100 dolara inince kapanır. Ama bu kez yukarıdan aşağıya kat edilecek mesafe daha uzun.",
          "Taşıyabileceğiniz azami zarar: 1.200 − 100 = 1.100 $. Pip cinsinden: 1.100 ÷ 5 = 220 pip.",
          "Sonuç: teminat bonusu size 40 pip ekstra nefes payı verdi (180 → 220). Bu, bonus tutarının tam karşılığıdır — 200 $ bonus, 0,5 lotluk bir pozisyonda tam olarak 40 pip demektir. Kârınız değişmedi, kaldıracınız değişmedi, riskiniz değişmedi; sadece piyasanın size karşı gidebileceği mesafe uzadı.",
        ],
      },
      {
        heading: "Senaryo C — Aynı %20, ama trade bonusu olarak",
        paragraphs: [
          "Şimdi aynı 200 doları trade bonusu olarak alalım. Bakiyeniz 1.200 $ görünür ve ilk bakışta bu daha cazip gelir — sonuçta \"daha fazla sermaye\".",
          "Ama bu 200 doları çekebilmek için bir işlem hacmini tamamlamanız gerekir. Çarpan kampanyadan kampanyaya değişir; yaygın bir örnek üzerinden gidelim: bonusun her 1 doları için 1 lot işlem şartı. Bu, 200 lot demektir.",
          "200 lotun maliyeti nedir? 1,8 pip spreadli bir hesapta 1 standart lotun maliyeti yaklaşık 18 $. 200 × 18 = 3.600 $.",
          "Yani 200 dolarlık bonusu çekilebilir hale getirmek için 3.600 dolar işlem maliyeti ödemeniz gerekir. Bu koşulda bonus, matematiksel olarak alınabilir bir şey değildir — ve çekim talebi gönderdiğiniz anda çoğu brokerda bonus ve ondan doğan kâr iptal olur.",
          "Kendi kampanyanızın çarpanını koşullar sayfasından okuyup aynı hesabı yapın. Çarpan düştükçe tablo değişir; ama yön aynı kalır: trade bonusunun fiyatı hacim şartında yazılıdır.",
        ],
      },
      {
        heading: "İki bonusun yan yana karşılaştırması",
        paragraphs: [],
        list: [
          "Nereye eklenir — Teminat bonusu: teminat tabanına. Trade bonusu: bakiyeye.",
          "Hacim şartı — Teminat bonusu: yok. Trade bonusu: var, çoğunlukla bonusun katları düzeyinde.",
          "Ne sağlar — Teminat bonusu: dalgalanmaya dayanma payı (yukarıdaki örnekte 40 pip). Trade bonusu: görünürde sermaye.",
          "Kâr kime ait — Teminat bonusu: kârınız kendi bakiyenizde birikir ve çekilebilir. Trade bonusu: bonustan doğan kâr, hacim şartı tamamlanana kadar kilitlidir.",
          "Davranışa etkisi — Teminat bonusu: sizi işlem açmaya zorlamaz. Trade bonusu: hacim şartını kovalatarak stratejiniz sinyal vermediğinde bile işlem açmaya iter.",
          "Ortak nokta — İkisi de çekilebilir nakit değildir. Teminat bonusu çekim yapıldığında hesaptan düşülebilir; trade bonusu çekim talebinde iptal olur.",
        ],
      },
      {
        heading: "Teminat bonusunu boşa harcamanın tek yolu",
        paragraphs: [
          "Buraya kadar teminat bonusu kusursuz görünüyor. Bir tuzağı var ve tamamen yatırımcının kendi elinde: ekstra teminatı daha büyük pozisyon açmak için kullanmak.",
          "Hesaplayalım. Teminat tabanınız 1.200 $ olduğuna göre 0,5 lot yerine 0,6 lot açabilirsiniz. Bu pozisyon 600 $ teminat bloke eder, stop out eşiği 600 × %20 = 120 $ olur ve taşıyabileceğiniz azami zarar 1.200 − 120 = 1.080 $ olur. 0,6 lotta 1 pip 6 $ ettiğine göre: 1.080 ÷ 6 = 180 pip.",
          "180 pip. Yani bonussuz halinizle tamamen aynı. Pozisyonu bonus oranında büyüttüğünüz anda, bonusun size verdiği 40 piplik nefes payı matematiksel olarak sıfırlanır — elinizde sadece daha büyük bir pozisyon ve pip başına daha yüksek bir zarar kalır.",
          "Teminat bonusunun bütün değeri, pozisyon büyüklüğünü değiştirmemenizde saklı. Aynı lotla devam ederseniz bonus net kazançtır; lotu büyütürseniz bonus hiç var olmamış gibi olur. Bu, kampanyanın küçük yazılarında değil, dördüncü sınıf aritmetiğinde yazılıdır.",
        ],
      },
      {
        heading: "Teminat bonusu kime yarar?",
        paragraphs: [],
        list: [
          "Zarar durdur mesafesi geniş olan swing yatırımcılarına: ekstra teminat payı, pozisyonun normal dalgalanmada erken kapanma riskini düşürür.",
          "Küçük sermayeyle çalışanlara: 500-2.000 dolar aralığındaki hesaplarda stop out'a olan mesafe zaten dardır; %20'lik bir teminat eklemesi bu aralıkta oransal olarak en çok fark yaratan yerdir.",
          "Haber dönemlerinde pozisyon taşıyanlara: ani spread genişlemeleri ve kaymalar, teminat seviyesini bir anda aşağı çeker. Ekstra teminat bu ani hareketlerde tampon görevi görür.",
          "Yaramayacağı kişi: bonusu \"daha fazla lot açabilirim\" diye okuyan yatırımcı. Yukarıdaki hesap tam olarak bunu gösteriyor.",
        ],
      },
      {
        heading: "Katılmadan önce sorulacak dört soru",
        paragraphs: [],
        list: [
          "Bonus teminata mı, bakiyeye mi ekleniyor? Bu tek soru, hangi bonusla karşı karşıya olduğunuzu belirler.",
          "Hacim şartı var mı? Yoksa gerçekten koşulsuz bir teminat bonusudur; varsa adı ne olursa olsun trade bonusudur.",
          "Bonustan doğan kâr çekilebilir mi, yoksa kilitli mi?",
          "Çekim yaptığımda bonus ne oluyor? Teminat bonuslarında bonus genellikle çekim tutarıyla orantılı olarak düşülür — bu normaldir, ama önceden bilmek gerekir.",
        ],
      },
      {
        heading: "FXPARTNER'a özel %20 teminat bonusu",
        paragraphs: [
          "FXPARTNER üzerinden açılan Lite Finance hesaplarında bu bonus koşulsuz ve şartsız tanımlanır: yatırdığınız tutarın %20'si teminat tarafına eklenir, hacim taahhüdü istenmez ve kazancınız kendi bakiyenizde birikir. Yukarıdaki B senaryosu tam olarak bu kampanyanın hesabıdır.",
          "Lite Finance'in hesap türleri, komisyon yapısı, para çekme koşulları ve düzenleyici durumuyla ilgili tam döküm — düzenleyici zayıflıkları dahil — broker inceleme sayfamızda yer alıyor. Bonusun cazip olması brokerı değerlendirme kriterlerinizin yerine geçmemeli: broker seçimi regülasyon, maliyet, platform ve para çekme üzerinden yapılır.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz. Kampanya koşulları değişebilir; katılmadan önce güncel şartları teyit edin.",
        ],
      },
    ],
  },
  {
    slug: "xm-nakit-iadesi-nasil-calisir",
    adBrokerSlug: "xm",
    // Square build of the 16:9 campaign banner — the post page renders covers
    // at aspect-square, so the wide original would lose its headline to the
    // crop. Blurred fill behind, untouched banner letterboxed on top.
    coverImage: "/blog/xm-nakit-iadesi-nasil-calisir-cover.png",
    lang: "tr",
    title: "XM Nakit İadesi: Haklı Çıkmanızı Gerektirmeyen Tek Kalem",
    excerpt:
      "İşlem hesabınızdaki her getiri kalemi piyasada haklı çıkmanıza bağlıdır — biri hariç. Nakit iadesinin parası nereden gelir, gün sonunda ödenmesi neyi değiştirir ve maliyet eşiğinizi tam olarak ne kadar düşürür? Rakamlarla.",
    publishedAt: "2026-08-20",
    readingMinutes: 10,
    sections: [
      {
        paragraphs: [
          "İki yatırımcı düşünün. Aynı brokerda, aynı paritede, aynı gün, aynı işlemleri açıp aynı seviyelerden kapatıyorlar. Yıl sonunda birinin hesabında diğerinden daha fazla para var.",
          "Aradaki fark strateji değil. Analiz değil, zamanlama değil, şans değil. Fark, birinin yaptığı her işlemin maliyetinin bir kısmını geri alıyor olması.",
          "İşlem hesabınızdaki bütün getiri kalemleri tek bir şeye bağlıdır: piyasada haklı çıkmanıza. Nakit iadesi bu listenin dışındaki tek kalemdir — kazandığınız işlemde de, kaybettiğiniz işlemde de ödenir. Bu yazı onun nasıl çalıştığını, parasının nereden geldiğini ve sizin hesabınızda tam olarak neyi değiştirdiğini anlatıyor.",
        ],
      },
      {
        heading: "Bu paranın kaynağı ne? Kimse bedava para vermez",
        paragraphs: [
          "Doğru soru bu ve cevabını bilmeden katılmamak gerekir.",
          "Bir brokerın geliri, sizin ödediğiniz spread ve komisyondan oluşur. Broker bu gelirin bir kısmını, kendisine yatırımcı yönlendiren iş ortaklarına pay olarak öder — sektörde standart olan IB (introducing broker) modeli budur. FXPARTNER, XM'in resmi iş ortağıdır ve bu payın bir bölümünü, işlemi fiilen yapan kişiye, yani size geri verir.",
          "Buradaki kritik nokta şu: nakit iadesi sizin spreadinizin üzerine eklenen bir maliyetten çıkmaz. Ortak kodla açılan hesapta da, kodsuz açılan hesapta da ödediğiniz spread aynıdır. Değişen tek şey, brokerın zaten ödeyeceği ortak payının bir kısmının sizde kalmasıdır. Yani kodsuz hesap açan bir yatırımcı daha ucuza işlem yapmıyor — sadece kendisine ait olabilecek bir payı hiç talep etmemiş oluyor.",
          "Bu modeli açıkça yazıyoruz çünkü \"bedava para\" gibi sunulan her teklifte ilk sorulması gereken soru paranın kaynağıdır. Kaynağı açıklanamayan bir teklif, açıklanabilen bir tekliften her zaman daha risklidir.",
        ],
      },
      {
        heading: "Rakamlarla: eşiğiniz ne kadar düşüyor?",
        paragraphs: [
          "Nakit iadesinin etkisini anlamanın en net yolu onu kâr olarak değil, eşik düşüşü olarak görmektir.",
          "XM Standard hesapta EUR/USD spreadi 1,0 pipten başlar. 1 standart lotta 1 pip yaklaşık 10 dolar ettiğine göre, o pozisyondan bir dolar kazanmadan önce piyasadan 10 doları geri kazanmanız gerekir. Bu, her işlemde aştığınız görünmez eşiktir.",
          "Nakit iadesi bu eşiği doğrudan aşağı çeker. Lot başına iadeniz ne kadarsa, gerçek maliyetiniz o kadar azalır:",
        ],
        list: [
          "Lot başına 2 $ iade → gerçek maliyet 8 $ → eşik 1,0 pip yerine 0,8 pip.",
          "Lot başına 3 $ iade → gerçek maliyet 7 $ → eşik 0,7 pip. Aşmanız gereken mesafe %30 kısaldı.",
          "Lot başına 5 $ iade → gerçek maliyet 5 $ → eşik 0,5 pip. Maliyetinizin yarısı geri döndü.",
        ],
      },
      {
        heading: "Yıllık tabloya çevirince",
        paragraphs: [
          "Tek işlemde birkaç dolar kulağa küçük gelir. Nakit iadesini anlamlı kılan şey tekrardır — her lotta, istisnasız.",
          "Ayda 20 lot işlem yapan bir yatırımcı yılda 240 lot demektir:",
        ],
        list: [
          "Lot başına 2 $ → yılda 480 $.",
          "Lot başına 3 $ → yılda 720 $.",
          "Lot başına 5 $ → yılda 1.200 $.",
          "Ayda 50 lot yapıyorsanız bu rakamları 2,5 ile çarpın: yılda 1.200 $ ile 3.000 $ arası.",
        ],
      },
      {
        heading: "Önemli uyarı: kendi oranınızı öğrenin",
        paragraphs: [
          "Yukarıdaki rakamlar mekanizmayı göstermek için kurulmuş örneklerdir, taahhüt değildir. Lot başına iade oranı hesap türüne, işlem yaptığınız enstrümana ve aylık hacminize göre değişir — Zero hesapta komisyon üzerinden, Standard ve Micro hesapta spread üzerinden hesaplanır ve bu ikisi aynı rakamı vermez.",
          "Kendi profilinize karşılık gelen güncel oranı FXPARTNER'ın nakit iadesi sayfasından öğrenebilirsiniz. Bir oranı öğrenmeden yıllık planlama yapmayın; \"yaklaşık\" bir rakamla kurulan bütçe, gerçekleşmediğinde en çok kırgınlık yaratan şeydir.",
        ],
      },
      {
        heading: "\"Gün sonunda\" ne demek — ve neden fark eder?",
        paragraphs: [
          "Nakit iadesi programlarının çoğu aylık, bazıları üç aylık ödeme yapar. XM nakit iadesi kampanyasında iade gün sonunda hesabınıza döner. Bu, sadece bir hız farkı değil; üç ayrı sonucu var.",
        ],
        list: [
          "Para aynı gün teminatınıza döner ve ertesi gün sizin için çalışmaya başlar. Aylık ödeme yapan bir programda aynı tutar ortalama iki hafta boyunca sizin dışınızda bekler.",
          "Maliyetiniz görünür hale gelir. Her gün ne kadar iade aldığınızı görmek, o gün ne kadar maliyet ödediğinizi de görmek demektir. Görünen maliyet, yönetilen maliyettir — pek çok yatırımcı işlem maliyetini ilk kez bu şekilde takip etmeye başlar.",
          "Doğrulanabilirlik. Günlük ödemede bir aksaklığı ertesi gün fark edersiniz; aylık ödemede aynı aksaklığı otuz gün sonra öğrenirsiniz. Sıklık, güvenin en pratik biçimidir.",
        ],
      },
      {
        heading: "Değiştirme maliyeti: sıfır",
        paragraphs: [
          "Nakit iadesini finansal kararlar arasında sıra dışı yapan şey, sizden hiçbir ödün istememesidir. Brokerınızı değiştirmiyorsunuz — zaten XM'de kalıyorsunuz. Stratejinizi değiştirmiyorsunuz. Platformunuzu, lot büyüklüğünüzü, risk kurallarınızı değiştirmiyorsunuz.",
          "XM hesabınız zaten varsa mevcut hesabınızı kapatmanız da gerekmiyor: FXPARTNER ortak koduyla bir ek hesap açıp işlemlerinize o hesap üzerinden devam ediyorsunuz.",
        ],
        list: [
          "1. FXPARTNER ortak kodu ile XM'de ek hesap açın.",
          "2. İşlemlerinize bu hesap üzerinden devam edin — alışkanlıklarınızda hiçbir şey değişmiyor.",
          "3. Yaptığınız işlemlerin nakit iadesi gün sonunda hesabınıza geçmeye başlar.",
        ],
      },
      {
        heading: "Kimin için ne kadar fark eder?",
        paragraphs: [
          "Dürüst olmak gerekirse nakit iadesi herkes için aynı ölçüde anlamlı değil. Kendi profilinizi aşağıdan bulun:",
        ],
        list: [
          "Ayda 5 lotun altında: yıllık iade birkaç yüz dolar seviyesinde kalır. Zararına değil ama hayatınızı değiştirmez; bu hacimde asıl önceliğiniz maliyet değil, tutarlılık olmalı.",
          "Ayda 20-50 lot: burada rakam görünür hale gelir. Yıllık iade, çoğu yatırımcının aylık işlem maliyetinin birkaç katına denk gelir.",
          "Ayda 100 lot ve üzeri: nakit iadesi artık bir ayrıntı değil, gelir tablonuzun kalemidir. Bu hacimde iadeyi almamak, stratejinizde bilerek bir performans kaybını kabul etmekle aynı şeydir.",
          "Scalper ve EA kullanıcıları: en yüksek etki burada. Bu tarzlarda toplam maliyet, stratejinin kâr eşiğini belirleyen baskın değişkendir; maliyetteki %20-30'luk bir düşüş, bazı sistemleri zarar bölgesinden çıkarabilecek büyüklüktedir.",
        ],
      },
      {
        heading: "Nakit iadesinin yapmadığı şeyler",
        paragraphs: [
          "Bir teklifi dürüstçe anlatmanın yolu, ne olmadığını da söylemekten geçer.",
          "Nakit iadesi kâr değildir; maliyet geri dönüşüdür. 500 dolar kaybettiğiniz bir ayda 60 dolar iade aldıysanız, o ay 440 dolar kaybettiniz. İade zararı azaltır, işareti değiştirmez.",
          "Nakit iadesi zarar eden bir stratejiyi kâra geçirmez. Ortalama olarak lot başına 5 dolar kaybettiren bir sistemde lot başına 3 dolarlık iade, sizi lot başına 2 dolar zararda bırakır — ve hacim büyüdükçe bu zarar da büyür.",
          "Bu yüzden en pahalı hata şudur: iade kazanmak için daha fazla işlem açmak. Stratejiniz sinyal vermediği halde lot biriktirmek, iadeyle geri alacağınızdan çok daha fazlasını piyasaya bırakmanın en hızlı yoludur. Nakit iadesi, yapacağınız işlemlerin maliyetini düşürmek içindir; yapmayacağınız işlemleri yapmak için değil.",
          "Son olarak: hiçbir broker sadece nakit iadesi verdiği için seçilmez. Broker seçimi dört eksende yapılır — regülasyon, maliyet, platform ve para çekme. XM bu dört eksende zaten güçlü olduğu için nakit iadesi anlamlı bir ek avantaja dönüşüyor; zayıf bir brokerda aynı iade, yalnızca kötü bir kararın üzerine konmuş bir süs olurdu.",
        ],
      },
      {
        heading: "Neden XM?",
        paragraphs: [
          "Nakit iadesi bir çarpandır; neyin üzerine bindiğine bakmak gerekir.",
          "XM Global, ASIC (Avustralya), CySEC (Kıbrıs) ve DFSA (Dubai) dahil dört lisans taşıyor — bunların üçü tier-1 otorite. Tier-1 düzenleme, müşteri fonlarının şirket fonlarından ayrı tutulmasını ve asgari sermaye rezervini zorunlu kılar. Minimum yatırım 5 dolar, negatif bakiye koruması var, yatırma ve çekme işlemlerinde broker ücreti alınmıyor ve çekim talepleri genellikle 24 saat içinde işleniyor.",
          "FXPARTNER Endeksi'nde XM'in bileşik puanı 9.5 — sıralamamızdaki en yüksek puan ve bunun büyük bölümü regülasyon ekseninden geliyor. Nakit iadesi, bu temelin üzerine eklenen bir maliyet avantajıdır; onun yerine geçen bir şey değil.",
        ],
      },
      {
        heading: "Bu kampanya şu ana kadar ne ödedi?",
        paragraphs: [
          "FXPARTNER ortak kodu ile XM'de işlem yapan yatırımcılara bugüne kadar toplam 17.369 dolar nakit iadesi ödendi. Bu rakam bir projeksiyon değil, gerçekleşmiş ödemelerin toplamı.",
          "Kampanyanın tam koşullarını, güncel oranları ve başvuru adımlarını kampanyalar sayfamızda bulabilirsiniz. Nakit iadesi kaydınızı oluşturduktan sonra ödemeleriniz hesabınızda takip edilebilir hale gelir.",
        ],
      },
      {
        heading: "Özet",
        paragraphs: [
          "Piyasada haklı çıkıp çıkmayacağınızı kimse garanti edemez. Ama her işlemde ödediğiniz maliyetin bir kısmının geri döneceğini baştan bilebilirsiniz — ve bu, işlem hesabınızdaki tek belirli kalemdir.",
          "Değiştirmeniz gereken hiçbir şey yok: aynı broker, aynı strateji, aynı işlemler. Tek fark, hesabın hangi ortak koduyla açıldığı. Ayda 20 lot işlem yapan biri için bu tek satırlık fark, yılda birkaç yüz dolar demek.",
          "Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir ve sermayenizin tamamını kaybedebilirsiniz. Nakit iadesi oranları ve kampanya koşulları değişebilir; katılmadan önce güncel şartları teyit edin.",
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
