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
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
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
    coverImage: "/blog/litefinance-anlik-para-cekme-cover.png",
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
    slug: "teminat-bonusu-nedir-trade-bonusu-farki",
    // Square build of the campaign banner — same treatment as the XM cashback
    // post: blurred fill behind, wide original letterboxed on top, because the
    // post page crops covers to a square and would cut the headline off.
    coverImage: "/blog/teminat-bonusu-nedir-trade-bonusu-farki-cover.png",
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
