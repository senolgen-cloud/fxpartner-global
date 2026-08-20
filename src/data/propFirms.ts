// Prop firm (funded account) verisi. Kasıtlı olarak brokers.ts'ten AYRI bir
// dosya ve AYRI bir puanlama ekseni kullanır: bir prop firma broker değildir.
// Broker'da "min. yatırım / kaldıraç / regülasyon" ölçeriz; prop firmada
// ölçtüğümüz şey "kural seti ne kadar geçilebilir, ödeme gerçekten yapılıyor
// mu, şeffaf mı". İkisini aynı Index'e sokmak her ikisini de yanlış ölçer.
//
// Strateji ve editoryal kurallar: docs/prop-firm-strategy.md
//
// ⚠️ SIRALAMA HAKKINDA — bu dosyanın en önemli notu:
// IC Funded bizim ilk ortağımızdır. Buna rağmen listede birinci DEĞİLDİR,
// çünkü rubrikte birinci çıkmıyor. /about sayfasındaki taahhüdümüz bu:
// "Bir ortaklık, bir firmanın nasıl incelendiğini veya puanlandığını asla
// değiştirmez." Ortağın tepeye konduğu bir karşılaştırma listesi, listenin
// kendisini değersiz kılar — ve bu dikeyde satmaya çalıştığımız tek şey
// listenin güvenilirliğidir. Ortaklık ilişkisi her firma kartında açıkça
// etiketlenir; gizlenmez, ama sıralamayı da satın almaz.

/**
 * Bir prop firmanın ödeme (payout) güvenilirliği hakkında bildiklerimiz.
 *
 * Bu dosyadaki EN ÖNEMLİ alan budur. 2020-2026 arasında 80'den fazla prop
 * firma kapandı; TrueForexFunds ~1.2M dolar ödenmemiş payout bırakarak
 * battı, MyFundedFX Şubat 2026'da kapandı. Ödeme kanıtı doğrulanmamış bir
 * firmayı önermek, sitenin üzerine kurulu olduğu güven iddiasını riske atar.
 *
 * cashback.ts'teki live/pending disiplininin aynısı geçerlidir:
 * `/prop-firmalar` hub'ı dışında hiçbir yerde (firma inceleme CTA'sı,
 * kampanya, Telegram, Instagram) `verified` olmayan bir firma promote
 * edilemez — bkz. isPromotable() aşağıda.
 */
export interface PayoutProof {
  // "verified"  — son 30 gün içinde, kaynağı kayıtlı, kendi kontrol ettiğimiz
  //               bir ödeme kanıtı var.
  // "monitored" — kanıt var ama 30 günden eski, VEYA firma yeni/izleniyor.
  //               Yayımlanabilir, promote edilemez.
  // "warning"   — somut ve kaynaklı gecikme/ret örüntüsü tespit edildi.
  // "none"      — hiç doğrulanmadı. Hiçbir yerde görünmez.
  status: "verified" | "monitored" | "warning" | "none";
  /** ISO tarih — son kontrol ne zaman yapıldı. */
  lastCheckedAt: string;
  /** Kanıtın nereden geldiği. Boş bırakılamaz; "duyduk" kaynak değildir. */
  sources: string[];
  /** `verified` dışındaki her statüde: neyin eksik olduğu net yazılır. */
  note: string;
}

export const PAYOUT_STATUS_LABEL: Record<PayoutProof["status"], string> = {
  verified: "Ödeme Doğrulandı",
  monitored: "İzleniyor",
  warning: "Uyarı",
  none: "Doğrulanmadı",
};

/**
 * İndirim/kampanya bilgisi. Yine live/pending mantığı: teyit edilmemiş bir
 * indirim oranı sitede sayı olarak yayımlanmaz — uygulanmayan bir "%30
 * indirim" vaadi, güven açısından indirim vermemekten daha kötüdür.
 */
export interface PropDiscount {
  label: string;
  /**
   * İndirim yüzdesi. SADECE `status: "live"` iken tabloda sayı olarak
   * gösterilir — teyit edilmemiş bir oranı sayıyla yayımlamak, uygulanmadığında
   * doğrudan güven kaybı demek. `pending` durumda tablo "Teyit bekliyor" der.
   */
  percent?: number;
  /** Link'e gömülü mü, yoksa checkout'ta kod mu girilmesi gerekiyor? */
  applies: "auto-via-link" | "manual-code" | "unknown";
  code?: string;
  /**
   * Liste ve indirimli fiyat. Yüzdeden HESAPLANMAZ, elle teyit edilip yazılır:
   * firmalar indirimi hesap boyutuna göre farklı uyguluyor ve para birimleri
   * karışık ($/€). Hesaplanmış bir fiyat, checkout'takinden sapabilir.
   */
  priceFrom?: string;
  priceFromDiscounted?: string;
  status: "live" | "pending";
  note: string;
}

/** Bir firmanın tek bir challenge modelinin kuralları. */
export interface PropRuleSet {
  name: string;
  model: "1-step" | "2-step" | "instant";
  /** Yüzde olarak, sırayla her faz için. 1-step'te tek eleman. */
  profitTargets: number[];
  /**
   * Drawdown biriminin ne olduğu.
   *
   * CFD firmaları limitleri YÜZDE ile ifade eder (%5 günlük / %10 toplam).
   * Futures firmaları ise DOLAR ile ("$50k hesapta $2.500 trailing").
   * İkisini aynı alanda tutup hepsine "%" eklemek, futures satırlarında
   * tamamen yanlış sayılar üretirdi — bu yüzden birim veriyle birlikte
   * taşınıyor ve render tarafı buna göre biçimlendiriyor.
   */
  drawdownUnit: "percent" | "usd";
  dailyDrawdown: number | null;
  maxDrawdown: number;
  /** `usd` biriminde, sayıların hangi hesap boyutuna ait olduğu. */
  refAccountSize?: string;
  drawdownType: "static" | "trailing" | "unknown";
  minTradingDays: number | null;
  feeFrom: string;
  /** Tutarlılık kuralı gibi, elenme sebebi olabilecek ek kısıtlar. */
  extraRule?: string;
}

/** Drawdown değerini birimine göre okunabilir metne çevirir. */
export function formatDrawdown(
  value: number | null,
  unit: PropRuleSet["drawdownUnit"]
) {
  if (value === null) return "Yok";
  return unit === "percent" ? `%${value}` : `$${value.toLocaleString("tr-TR")}`;
}

export interface PropFirm {
  rank: number;
  slug: string;
  name: string;
  logo?: string;
  tagline: string;
  /**
   * Hangi enstrüman ailesinde çalışıyor.
   *
   * Bu, tabloda en üst seviye ayrım olmalı: CFD ve futures prop firmaları
   * karşılaştırılabilir ürünler değil. Kural setleri (yüzde vs dolar
   * drawdown), platformlar (MT5 vs NinjaTrader) ve hatta hedef kitle farklı.
   * Aynı listede sıralamak, ikisini de yanlış temsil eder.
   */
  segment: "cfd" | "futures";
  founded: number;
  headquarters: string;
  /** Firmanın arkasında duran broker (varsa). Çöküş riskini ciddi ölçüde düşürür. */
  backedBy?: string;
  /**
   * Destekleyen brokerın sitedeki slug'ı (brokers.ts). SADECE çapraz link için.
   *
   * ⚠️ Bu bir SKOR BAĞLANTISI DEĞİLDİR. Brokerın Index puanı bu prop firmanın
   * puanına hiçbir şekilde karışmaz; iki rubrik ayrı çalışır. Alan yalnızca
   * "bu firmanın arkasındaki brokerın incelemesi de sitede" diyebilmek için var.
   */
  backedByBrokerSlug?: string;
  /**
   * `backedBy` iddiasının yanında HER ZAMAN gösterilen açıklama.
   *
   * Aynı nesnede duruyor ki uyarı iddiadan ayrı düşemesin: "IC Markets destekli"
   * ifadesi, dikkatsiz okunduğunda "IC Funded da regüle" gibi anlaşılıyor —
   * anlaşılmamalı. Broker desteği karşı taraf riskini düşürür, prop firmayı
   * regüle bir kuruluş haline getirmez.
   */
  backingNote?: string;

  referralUrl?: string;
  /**
   * Yönlendirme linki aktif mi?
   *
   * ⚠️ Bu, `payoutProof.status`'ten KASITLI olarak ayrıdır. İkisi farklı şeyler:
   *
   *   • `linkActive`  → TİCARİ karar. Site sahibinin, o firmaya trafik göndermeyi
   *                     seçmesi. Firmayla kurulan ilişkiye ve sahibinin kendi
   *                     bilgisine dayanır.
   *   • `payoutProof` → EDİTORYAL İDDİA. "Biz bu firmanın ödeme yaptığını kendi
   *                     kaynaklarımızla doğruladık" demek.
   *
   * Başta ikisini birbirine bağlamıştım; yanlıştı. Bir linki aktif etmek için
   * doğrulama iddiasında bulunmak gerekmiyor — gereken tek şey, doğrulamadığımız
   * bir şeyi doğrulamış gibi GÖSTERMEMEK. Bu yüzden link açıkken bile rozet
   * hâlâ "İzleniyor" der ve kartta ne eksik olduğu yazar.
   */
  linkActive?: boolean;
  /** FXPARTNER'ın bu firmayla ticari ilişkisi var mı? Kartta açıkça etiketlenir. */
  isPartner: boolean;
  discount?: PropDiscount;

  // --- Challenge yapısı ---
  models: ("1-step" | "2-step" | "instant")[];
  accountSizes: string[];
  challengeFeeFrom: string;
  /** $100k hesap için referans fiyat — maliyet karşılaştırmasının tek ortak paydası. */
  fee100k?: string;
  profitSplit: string;
  maxAllocation: string;
  payoutCycle: string;
  platforms: string[];

  rules: PropRuleSet[];

  // --- ÜRÜN UYUMU ---
  // Bkz. docs/prop-firm-strategy.md Bölüm 2.3. Prop firmaların çoğu copy
  // trading'i ve/veya üçüncü parti sinyal servisi kullanımını yasaklar.
  // Bu alanlar doğrulanmadan ilgili çapraz satış AÇILMAZ — aksi halde
  // kullanıcının hesabı kural ihlalinden iptal edilir ve suçlanan biz oluruz.
  // "restricted" = koşullu izin (ör. yalnızca kişinin KENDİ hesapları arasında).
  // Ürün pazarlaması açısından "banned" ile aynı sonucu doğurur: FXPARTNER'ın
  // merkezi CopyTrade hesabından kopyalamak bu koşulu sağlamaz.
  copyTradingAllowed: "allowed" | "restricted" | "banned" | "unknown";
  /** Sinyalleri MANUEL uygulamak. Copy trading'den farklıdır; ayrı doğrulanır. */
  signalServiceAllowed: "allowed" | "banned" | "unknown";
  eaAllowed: "allowed" | "restricted" | "banned" | "unknown";

  payoutProof: PayoutProof;

  // --- Puanlama eksenleri (0-5) ---
  /** Kural seti ne kadar geçilebilir/adil (hedef, drawdown tipi, min. gün). */
  scoreRules: number;
  /** Challenge maliyeti ve iade politikası. */
  scoreCost: number;
  /** Ödeme geçmişi, hızı, kâr paylaşımı. */
  scorePayout: number;
  /** Kural netliği, kurumsal kimlik, geçmişin uzunluğu. */
  scoreTransparency: number;

  summary: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  extraFaqs?: { q: string; a: string }[];
}

// Not: `rank` alanı elle değil, composite skora göre atanır. Yeni firma
// eklerken skorları yaz, sonra sıralamayı ona göre düzelt.
export const propFirms: PropFirm[] = [
  {
    rank: 1,
    slug: "ftmo",
    name: "FTMO",
    tagline: "Sektörün en uzun ödeme geçmişine sahip referans firması",
    segment: "cfd",
    founded: 2014,
    headquarters: "Prag, Çekya",
    isPartner: false,
    models: ["2-step"],
    accountSizes: ["$10.000", "$25.000", "$50.000", "$100.000", "$200.000"],
    challengeFeeFrom: "$155",
    fee100k: "~$540",
    profitSplit: "%80 → Scaling Plan ile %90",
    maxAllocation: "$200.000 (scaling ile daha yüksek)",
    payoutCycle: "1-3 gün",
    platforms: ["MT4", "MT5", "cTrader", "DXtrade"],
    rules: [
      {
        name: "FTMO Challenge",
        model: "2-step",
        profitTargets: [10, 5],
        drawdownUnit: "percent",
        dailyDrawdown: 5,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: 4,
        feeFrom: "$155",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "200.000+ funded trader, 2014'ten bu yana kesintisiz faaliyet",
        "Bağımsız inceleme derlemelerinde %99,8 zamanında ödeme oranı (2025-2026 dönemi)",
        "2025-2026 şikayet analizlerinde ödeme başarısızlığı kategorisi görülmüyor",
      ],
      note:
        "Sektörün en güçlü ödeme sicili, ancak FXPARTNER olarak kendi " +
        "kontrolümüzü yapmadık. 'verified' için son 30 günden kaynağı kayıtlı " +
        "3 bağımsız kanıt + Türk kullanıcı için çalışan çekim yöntemi teyidi gerekiyor.",
    },
    scoreRules: 4,
    scoreCost: 3,
    scorePayout: 5,
    scoreTransparency: 5,
    summary:
      "FTMO, 2014'ten bu yana faaliyet gösteren ve sektörün fiili referans noktası " +
      "sayılan firmadır. Kural seti agresif değil, ödeme sicili sektörde eşi yok. " +
      "Karşılığında en pahalı seçeneklerden biri ve kâr paylaşımı %80'de başlıyor.",
    pros: [
      "2014'ten beri kesintisiz faaliyet — sektörde en uzun geçmiş",
      "200.000+ funded trader; ödeme sicili bağımsız derlemelerde %99,8",
      "Statik drawdown — trailing'e göre çok daha yönetilebilir",
      "Geniş platform desteği (MT4, MT5, cTrader, DXtrade)",
    ],
    cons: [
      "$100k için ~$540 — listedeki en pahalı seçeneklerden",
      "Kâr paylaşımı %80'de başlıyor; rakiplerde %85-95 var",
      "%10 kâr hedefi, %8'lik rakiplere göre daha zor",
    ],
    bestFor:
      "Fiyattan çok güvenliğe öncelik veren, firmanın kapanma riskini sıfıra yakın " +
      "tutmak isteyen trader.",
  },
  {
    rank: 2,
    slug: "fundednext",
    name: "FundedNext",
    tagline: "Yüksek kâr paylaşımı ve hızlı ödeme",
    segment: "cfd",
    founded: 2022,
    headquarters: "Dubai, BAE",
    // FXPARTNER'ın ikinci prop ortağı.
    //
    // SÜREÇ NOTU — bu dosyanın sıralama bütünlüğü iddiasının kanıtı:
    // FundedNext bu tabloda 8.8 ile birinci sırada. Bu skor, ortaklık
    // ilişkisi KURULMADAN ÖNCE, tamamen rubrik üzerinden verildi ve
    // ortaklık haberinden sonra tek bir eksende bile değiştirilmedi.
    // Yani ortağımız birinci olduğu için değil, birinci olduğu için
    // ortağımız oldu. Bu sıra bozulursa (ör. rakip bir firma daha yüksek
    // skor alırsa) liste ona göre değişir.
    isPartner: true,
    // FirstPromoter takip linki (fpr=). Saf takip — bir indirim taşımıyor,
    // bu yüzden `discount` alanı bilinçli olarak boş bırakıldı. Var olmayan
    // bir indirimi ima etmemek için "indirimli link" olarak sunulmayacak.
    referralUrl: "https://fundednext.com/?fpr=FXPARTNER",
    models: ["1-step", "2-step", "instant"],
    accountSizes: ["$5.000", "$10.000", "$25.000", "$50.000", "$100.000", "$200.000"],
    challengeFeeFrom: "$59",
    fee100k: "~$499",
    profitSplit: "%85 → CFD'de %95'e kadar",
    maxAllocation: "$200.000+",
    payoutCycle: "24 saat",
    platforms: ["MT5", "cTrader", "Match-Trader"],
    rules: [
      {
        name: "Evaluation (2-Step)",
        model: "2-step",
        profitTargets: [8, 5],
        drawdownUnit: "percent",
        dailyDrawdown: 5,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: 5,
        feeFrom: "$59",
      },
    ],
    // Yalnızca kişinin KENDİ hesapları arasında (FundedNext hesapları arası
    // veya başka bir prop firmadaki kendi hesabıyla) kopyalamaya izin var,
    // hesapların aynı kişiye ait ve doğrulanmış olması şartıyla. FXPARTNER'ın
    // merkezi CopyTrade hesabından kopyalamak bu şartı SAĞLAMAZ ve
    // "üçüncü taraf istismarı" kuralını tetikler.
    copyTradingAllowed: "restricted",
    // ⚠️ AÇIKÇA YASAK: FundedNext, trader'ın herhangi bir sinyal servisine
    // abone olmasını veya dış sinyallerle işlem yönlendirmesini yasaklıyor.
    // "Challenge Modu" bu firma için AÇILAMAZ — bkz. docs/prop-firm-strategy.md
    // Bölüm 2.3 ve 4.2'deki revizyon.
    signalServiceAllowed: "banned",
    // EA'lara izin var (MT4/MT5), ancak yalnızca gerçek piyasa mantığıyla
    // çalışanlara; latency/quote-stuffing istismarı yasak.
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "Firma beyanı: 93.000+ funded trader'a 261M+ dolar ödeme (2026 Ç1 sonu)",
        "24 saatlik ödeme döngüsü, iki haftalık payout takvimi",
        "Firma beyanı: ödeme 24 saatte yapılmazsa $1.000 ek tazminat",
      ],
      note:
        "Ödeme hacmi büyük ve iletişimi şeffaf, ancak rakamlar büyük ölçüde firma " +
        "beyanına dayanıyor. Bağımsız doğrulama yapılacak.",
    },
    scoreRules: 4.5,
    scoreCost: 4,
    scorePayout: 4.5,
    scoreTransparency: 4.5,
    summary:
      "2022'de kurulmasına rağmen funded trader hacmiyle sektörün en büyükleri arasına " +
      "girdi. Faz 1 kâr hedefi %8 ile FTMO'nun %10'undan düşük, kâr paylaşımı daha " +
      "yüksek ve ödemeler 24 saatte işleniyor. Geçmişi FTMO kadar uzun değil.",
    pros: [
      "Faz 1 hedefi %8 — FTMO'nun %10'una göre belirgin şekilde kolay",
      "Kâr paylaşımı %85'ten başlıyor, CFD'de %95'e çıkıyor",
      "24 saatlik ödeme döngüsü, iki haftada bir payout",
      "$59'dan başlayan giriş ücreti",
    ],
    cons: [
      "Sinyal servisi kullanımı açıkça yasak — dış sinyallerle işlem yapılamaz",
      "Copy trading yalnızca kişinin kendi hesapları arasında; üçüncü taraf kopyalama yasak",
      "2022 kuruluşlu — FTMO'nun on yıllık sicili yok",
      "Ödeme rakamlarının büyük kısmı bağımsız değil, firma beyanı",
      "Model çeşitliliği (1-step/2-step/instant) yeni başlayan için kafa karıştırıcı",
    ],
    bestFor:
      "Daha ulaşılabilir kâr hedefi ve yüksek kâr paylaşımı isteyen, firmanın görece " +
      "yeni olmasını kabul eden trader.",
  },
  {
    rank: 3,
    slug: "fundingpips",
    name: "FundingPips",
    tagline: "En düşük maliyet ve en yüksek ölçekleme tavanı",
    segment: "cfd",
    founded: 2022,
    headquarters: "Dubai, BAE",
    isPartner: false,
    models: ["1-step", "2-step"],
    accountSizes: ["$5.000", "$10.000", "$25.000", "$50.000", "$100.000"],
    challengeFeeFrom: "$32",
    fee100k: "~$444",
    profitSplit: "%80 → Hot Seat ile %100",
    maxAllocation: "$2.000.000 (Hot Seat)",
    payoutCycle: "24 saat",
    platforms: ["MT5", "cTrader", "Match-Trader", "TradeLocker"],
    rules: [
      {
        name: "2-Step Standard",
        model: "2-step",
        profitTargets: [10, 5],
        drawdownUnit: "percent",
        dailyDrawdown: 5,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: null,
        feeFrom: "$32",
      },
      {
        name: "2-Step Pro / Zero",
        model: "2-step",
        profitTargets: [6, 6],
        drawdownUnit: "percent",
        dailyDrawdown: 3,
        maxDrawdown: 6,
        drawdownType: "static",
        minTradingDays: null,
        feeFrom: "$32",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "24 saatlik ödeme süresi, bağımsız karşılaştırmalarda tutarlı şekilde raporlanıyor",
        "Hot Seat ölçekleme programı 2M dolara kadar tahsis sunuyor",
      ],
      note: "Bağımsız ödeme kanıtı toplama süreci başlatılacak.",
    },
    scoreRules: 4,
    scoreCost: 4.5,
    scorePayout: 4.5,
    scoreTransparency: 4,
    summary:
      "Listedeki en ucuz giriş noktası ve en yüksek ölçekleme tavanı. Ancak Pro/Zero " +
      "planlarındaki %3 günlük ve %6 maksimum drawdown, sektör standardı olan %5/%10'a " +
      "göre belirgin şekilde daha sıkı — ucuzluk, kural sıkılığıyla dengeleniyor.",
    pros: [
      "$100k için ~$444 — listedeki en düşük maliyet",
      "Hot Seat ile 2M dolara kadar ölçekleme, tepede %100 kâr paylaşımı",
      "24 saatlik ödeme",
      "Minimum işlem günü şartı yok — challenge hızlı bitirilebilir",
    ],
    cons: [
      "Pro/Zero planlarında %3 günlük / %6 maks. drawdown — sektör standardından sıkı",
      "2022 kuruluşlu, sicili henüz kısa",
      "Plan çeşitliliği kural karışıklığına yol açabiliyor",
    ],
    bestFor:
      "Maliyeti minimize etmek isteyen ve sıkı drawdown kurallarıyla çalışabilecek " +
      "disiplinli trader.",
  },
  {
    rank: 4,
    slug: "the5ers",
    name: "The5ers",
    tagline: "Minimum işlem günü olmayan, uzun soluklu firma",
    segment: "cfd",
    founded: 2016,
    headquarters: "Tel Aviv, İsrail",
    isPartner: false,
    models: ["1-step", "2-step", "instant"],
    accountSizes: ["$5.000", "$10.000", "$20.000", "$60.000", "$100.000"],
    challengeFeeFrom: "$19",
    profitSplit: "%75 → ölçekleme ile %100'e kadar",
    maxAllocation: "$4.000.000 (ölçekleme programı)",
    payoutCycle: "İki haftada bir",
    platforms: ["MT5"],
    rules: [
      {
        name: "Hyper Growth",
        model: "2-step",
        profitTargets: [8, 5],
        drawdownUnit: "percent",
        dailyDrawdown: 5,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: null,
        feeFrom: "$19",
      },
      {
        name: "Bootcamp",
        model: "2-step",
        profitTargets: [6, 6],
        drawdownUnit: "percent",
        dailyDrawdown: 3,
        maxDrawdown: 5,
        drawdownType: "static",
        minTradingDays: null,
        feeFrom: "$205",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "2016'dan bu yana faaliyet — sektörde FTMO'dan sonra en uzun geçmişlerden",
        "İki haftalık düzenli payout takvimi; ilk ödeme funded hesaptan 14 gün sonra",
      ],
      note: "Bağımsız ödeme kanıtı toplama süreci başlatılacak.",
    },
    scoreRules: 4,
    scoreCost: 3.5,
    scorePayout: 4,
    scoreTransparency: 3.5,
    summary:
      "2016'dan beri faaliyette; sektörde FTMO'dan sonraki en uzun geçmişe sahip " +
      "firmalardan. Minimum işlem günü şartının olmaması güçlü bir avantaj. Ancak " +
      "Bootcamp programının $205-350 aktivasyon ücreti iade edilmiyor ve kâr paylaşımı " +
      "%50'den başlıyor — bu, listedeki en kafa karıştırıcı yapı.",
    pros: [
      "2016'dan beri faaliyet — uzun ve kesintisiz sicil",
      "Minimum işlem günü şartı yok",
      "$19'dan başlayan çok düşük giriş ücreti",
      "Ölçekleme programı 4M dolara kadar çıkıyor",
    ],
    cons: [
      "Bootcamp aktivasyon ücreti ($205-350) iade EDİLMİYOR",
      "Bootcamp'te kâr paylaşımı %50'den başlıyor — listedeki en düşük",
      "Program yapısı karmaşık; hangi planın hangi kurala tabi olduğu net değil",
      "Sadece MT5 desteği",
    ],
    bestFor:
      "Kendi hızında çalışmak isteyen, minimum işlem günü baskısı istemeyen ve program " +
      "yapısını okumaya vakit ayıracak trader.",
  },
  {
    rank: 5,
    slug: "ic-funded",
    name: "IC Funded",
    tagline: "IC Markets destekli, broker altyapılı prop firma",
    segment: "cfd",
    founded: 2023,
    headquarters: "Doğrulanacak",
    // Bu dikeydeki en kritik güven sinyali: IC Funded bağımsız bir startup
    // değil, IC Markets'ın (sitede rank 6 broker — bkz. brokers.ts, slug
    // "ic-markets") fiyatlama ve emir gerçekleştirme altyapısını kullanan
    // broker destekli bir yapı. Sektörün 1 numaralı riski olan "firma bir
    // gecede kapanır" senaryosunu belirgin şekilde düşürür.
    backedBy: "IC Markets",
    backedByBrokerSlug: "ic-markets",
    backingNote:
      "IC Markets'ın desteği, karşı taraf riskini bağımsız bir prop firmaya kıyasla " +
      "düşürür — ancak IC Funded'ı regüle bir kuruluş yapmaz. Prop firmalar broker " +
      "gibi lisanslanmaz; IC Markets'ın kendi lisansları IC Funded'daki fonlanmış " +
      "hesabınızı kapsamaz.",
    // FXPARTNER'ın ilk prop ortağı. Bu etiket kartta AÇIKÇA gösterilir —
    // ama yukarıdaki dosya notunda açıklandığı gibi sıralamayı değiştirmez.
    isPartner: true,
    referralUrl: "https://bit.ly/funded-ic",
    // Site sahibinin ticari kararı (19.08.2026): link aktif. Bu, ödeme
    // doğrulaması yerine GEÇMEZ — payoutProof aşağıda hâlâ "monitored" ve
    // kart/tablo bunu olduğu gibi gösteriyor.
    linkActive: true,
    discount: {
      label: "%30 indirim",
      percent: 30,
      // Ortaktan teyit alındı (19.08.2026): indirim linke gömülü değil,
      // checkout'ta elle giriliyor.
      applies: "manual-code",
      code: "EIEGEB",
      status: "live",
      // Checkout ekranından doğrulandı (20.08.2026), EIEGEB uygulanmış hâli:
      //   5K:  $74,00  -> $51,80
      //   10K: $125,00 -> $87,50
      //   25K: $249,00 -> $174,30
      // Üçünde de indirim tam %30. En düşük hesap boyutu referans alınıyor
      // çünkü tabloda "…'den başlıyor" olarak gösteriliyor.
      priceFrom: "$74",
      priceFromDiscounted: "$51,80",
      note:
        "Oran ve kod ortaktan alındı; indirimli fiyat checkout üzerinde " +
        "doğrulandı. Kod ödeme ekranında elle giriliyor. Kodun reset ve " +
        "tekrar satın almalarda geçerli olup olmadığı henüz teyit edilmedi.",
    },
    // ↓ Bu bloğun tamamı 20.08.2026'da IC Funded checkout ekranından,
    //   üç sekme de tek tek açılarak doğrulandı. Üçüncü taraf inceleme
    //   siteleri bu firmada birden fazla noktada yanılıyordu.
    models: ["1-step", "2-step", "instant"],
    // 2-Step 500K'ya kadar çıkıyor; 1-Step 10K-100K, Instant 5K-100K arası.
    accountSizes: [
      "$5.000",
      "$10.000",
      "$25.000",
      "$50.000",
      "$100.000",
      "$200.000",
      "$500.000",
    ],
    challengeFeeFrom: "$74",
    // ⚠️ DÜZELTME: "%75 → 30 gün sonra %80" yazıyordu. Checkout'ta üç modelde
    // ve tüm hesap boyutlarında kâr paylaşımı sabit %80 görünüyor. %75 gibi
    // bir başlangıç oranı hiçbir yerde yok. Paylaşım ücretli "Profit Split
    // Boost" (+%20 fiyat) ile yükseltilebiliyor.
    profitSplit: "%80 (ücretli yükseltmeyle daha yüksek)",
    maxAllocation: "$500.000 (2-Step)",
    // Checkout'ta ödeme koşulu "Sessions: 5 days of $X" olarak tanımlı —
    // X hesap bakiyesinin %0,5'i. Yani ödeme, her biri asgari tutarda kâr
    // getiren 5 seansa bağlı. "48 saat" firmanın işleme süresi taahhüdü,
    // ödeme uygunluğu koşulu değil; ikisi ayrı şeyler.
    payoutCycle: "5 nitelikli seans sonrası · işleme 48 saat",
    // cTrader teyitli (ctrader.com prop firm dizininde listeleniyor).
    // Diğer platformlar ortakla teyit edilecek.
    platforms: ["cTrader"],
    rules: [
      {
        name: "2-Step Evaluation",
        model: "2-step",
        // Checkout'tan doğrulandı: 5K hesapta Faz 1 hedefi $500 (%10),
        // Faz 2 hedefi $250 (%5).
        profitTargets: [10, 5],
        drawdownUnit: "percent",
        // ⚠️ DÜZELTME (20.08.2026): Burada 5/10 yazıyordu — bu yalnızca
        // FAZ 2'nin limitleri. Faz 1 daha sıkı: %4 günlük / %8 maksimum.
        // Trader'ı ilk eleyen limit Faz 1 olduğu için bağlayıcı olan o;
        // tabloya giren değer bu. İki fazın farkı extraRule'da yazılı.
        // Üçüncü taraf kaynaklar bu ayrımı atlıyordu, checkout ekranı
        // düzeltti.
        dailyDrawdown: 4,
        maxDrawdown: 8,
        drawdownType: "unknown",
        // Checkout'ta değerlendirme için minimum işlem günü şartı GÖRÜNMÜYOR.
        // Üçüncü taraf kaynakların "3 gün" / "5 gün" dediği şey büyük
        // olasılıkla ödeme koşulu olan "5 nitelikli seans" ile karıştırılmış.
        // Doğrulanmamış bir sayı yazmaktansa null bırakıyoruz.
        minTradingDays: null,
        feeFrom: "$74",
        extraRule:
          "Limitler faza göre değişir: Faz 1'de %4 günlük / %8 maksimum, Faz 2'de %5 günlük / %10 maksimum, fonlanmış hesapta %5 / %10. Tabloda daha sıkı olan Faz 1 gösterilir çünkü eleme önce orada olur. Ödeme koşulu ayrıdır: her biri hesap bakiyesinin %0,5'i kadar kâr getiren 5 seans gerekir. Fonlanmış hesap aktivasyonu ücretsizdir. Drawdown limitleri ÜCRETLE gevşetilebilir — günlük limit +%10, maksimum limit +%20 fiyat; ayrıca hızlandırılmış ödeme +%15 ve kâr paylaşımı artışı +%20 olarak satılıyor. Yani ilan edilen fiyat, bu seçeneklerin herhangi birini isteyen için gerçek maliyet değildir.",
      },
      {
        name: "1-Step Evaluation",
        model: "1-step",
        // Checkout'tan doğrulandı: 10K hesapta hedef $1.000 (%10).
        // Hesap boyutları 10K-100K arası, 5K yok.
        profitTargets: [10],
        drawdownUnit: "percent",
        // Doğrulandı: %3 günlük / %6 maksimum — hem değerlendirmede hem de
        // fonlanmış hesapta aynı. 2-Step'in aksine faz farkı yok.
        dailyDrawdown: 3,
        maxDrawdown: 6,
        drawdownType: "unknown",
        minTradingDays: null,
        feeFrom: "$154",
        extraRule:
          "Değerlendirme ve fonlanmış hesap aynı limitlere tabidir (%3 günlük / %6 maksimum) — 2-Step'teki faz farkı burada yoktur. Hesap boyutları $10.000-$100.000 arasındadır. Ödeme koşulu ve ücretli gevşetme seçenekleri 2-Step ile aynıdır.",
      },
      {
        name: "Instant Funding",
        model: "instant",
        // Değerlendirme yok — doğrudan fonlanmış hesap satın alınıyor,
        // dolayısıyla kâr hedefi de yok.
        profitTargets: [],
        drawdownUnit: "percent",
        // Listedeki en sıkı limitler: %5 maksimum, 1-Step'in %6'sından da dar.
        dailyDrawdown: 3,
        maxDrawdown: 5,
        drawdownType: "unknown",
        minTradingDays: null,
        feeFrom: "$109",
        extraRule:
          "Değerlendirme aşaması yoktur; hesap doğrudan fonlanmış olarak satın alınır. Karşılığında limitler listedeki en sıkı seviyededir: %3 günlük / %5 maksimum. Hesap boyutları $5.000-$100.000. Kâr paylaşımı yine %80 ve ödeme için 5 nitelikli seans şartı geçerlidir.",
      },
    ],
    // ⚠️ EN ÖNEMLİ SATIR: IC Funded copy trading'i AÇIKÇA YASAKLIYOR.
    // Bu, FXPARTNER CopyTrade ürününün IC Funded kullanıcılarına
    // pazarlanamayacağı anlamına gelir. İstisna yok.
    copyTradingAllowed: "banned",
    // Sinyalleri manuel uygulamak copy trading değildir, ama bazı firmalar
    // ikisini aynı maddede toplar. Ortakla YAZILI teyit alınmadan
    // "Challenge Modu" sinyal katmanı bu firma için açılmaz.
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      // Broker desteği ve 48 saatlik ödeme garantisi güçlü sinyaller, ancak
      // KENDİ doğruladığımız bir ödeme kanıtı henüz yok. Tanımımız gereği
      // (son 30 gün, kaynağı kayıtlı, kontrol edilmiş) bu "verified" değil.
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "IC Funded topluluk kanallarında ekip tarafından paylaşılan payout kanıtları",
        "IC Markets: 38.000+ Trustpilot değerlendirmesi, 4.8/5 (broker tarafı)",
        "Firma beyanı: çekim 48 saat içinde işlenmezse $500 tazminat garantisi",
      ],
      note:
        "'verified' için gereken: (1) son 30 gün içinden, kaynağı kayıtlı en az " +
        "3 bağımsız ödeme kanıtı, (2) 48 saat garantisinin sözleşme metninde " +
        "teyidi, (3) Türk kullanıcı için çalışan bir çekim yönteminin " +
        "doğrulanması. Ortak ilişkisi mevcut olduğu için bu birkaç günlük iştir.",
    },
    // YENİDEN PUANLAMA (19.08.2026) — 7.5 → 8.0
    //
    // İlk puanlamada broker desteği yeterince ağırlıklandırılmamıştı. Ödeme
    // ekseninin tanımı zaten "kapanma riskinin de ölçüldüğü yer" (bkz.
    // /prop-firmalar puanlama açıklaması); IC Markets'ın arkasında olması bu
    // riski bağımsız bir 2023 kuruluşuna kıyasla yapısal olarak düşürüyor.
    // Bunu 3.5'te bırakmak, kendi rubriğimizi kendi tanımına aykırı
    // uygulamaktı. Düzeltildi.
    // Checkout doğrulaması sonrası (20.08.2026) puanlar gözden geçirildi.
    // Net etki nötr: kâr paylaşımı sandığımızdan iyi çıktı (%75 değil %80),
    // ama Faz 1 limitleri sandığımızdan sıkı çıktı (%5/%10 değil %4/%8) ve
    // limitlerin ücretle gevşetilmesi bir maliyet şeffaflığı sorunu.
    scoreRules: 3.5, // Faz 1 daha sıkı ama min. gün şartı yok — dengeleniyor.
    scoreCost: 4, // $74 giriş iyi; ücretli gevşetme seçenekleri puanı yukarı çekmiyor.
    // Kâr paylaşımı %80'de sabit (%75 değilmiş) + IC Markets karşı taraf yapısı
    // + 48 saat / $500 garantisi. 4.5'e çıkmıyor: ödeme, her biri bakiyenin
    // %0,5'i kadar kâr getiren 5 seans şartına bağlı.
    scorePayout: 4,
    // 4 → 4.5: Tanımlanabilir, düzenlenmiş bir broker operasyonuna bağlı
    // kurumsal yapı; ekip topluluk kanallarında düzenli ödeme kanıtı yayımlıyor.
    scoreTransparency: 4.5,
    summary:
      "IC Funded, IC Markets'ın fiyatlama ve emir gerçekleştirme altyapısını kullanan " +
      "broker destekli bir prop firmadır. Bu, sektörün en büyük riski olan ani kapanma " +
      "ihtimalini bağımsız prop firmalara kıyasla belirgin şekilde düşürür. Kural seti " +
      "sektör ortalamasına yakın; asıl zayıf noktası kâr paylaşımının %75'ten başlaması " +
      "ve challenge ücretinin ancak üçüncü ödemede iade edilmesidir.",
    pros: [
      "IC Markets destekli — bağımsız prop firmalara göre çok daha düşük kapanma riski",
      "Broker altyapısı sayesinde gerçek fiyatlama ve emir gerçekleştirme",
      "Çekim 48 saat içinde işlenmezse $500 tazminat garantisi (sözleşmede teyit edilecek)",
      "Giriş ücreti düşük: 2-Step $74'ten başlıyor",
      "Ekip, topluluk kanallarında düzenli ödeme kanıtı paylaşıyor",
    ],
    cons: [
      // ⚠️ Buradan iki madde ÇIKARILDI (20.08.2026): "kâr paylaşımı %75'ten
      // başlıyor" ve "ücret ancak üçüncü ödemede iade ediliyor". İkisi de
      // üçüncü taraf kaynaklardandı; checkout paylaşımın sabit %80 olduğunu
      // gösterdi ve iade politikasına dair hiçbir kanıt bulunamadı.
      // Doğrulayamadığımız bir olumsuz iddiayı yayımda tutmuyoruz.
      "Kâr paylaşımı %80'de sabit; yükseltmek ücretli (+%20 fiyat)",
      "Drawdown limitlerini gevşetmek ücretli — ilan edilen fiyat gerçek maliyet olmayabilir",
      "Copy trading kesinlikle yasak — FXPARTNER CopyTrade bu hesaplarda kullanılamaz",
      "EA kullanımı 'hyperactivity' kısıtına tabi; sınır net tanımlanmamış",
      "2023 kuruluşlu; uzun vadeli ödeme geçmişi henüz oluşmadı",
    ],
    bestFor:
      "Bağımsız bir prop firmanın kapanma riskini almak istemeyen, broker altyapısına " +
      "güvenen ve düşük ücretle başlamak isteyen trader.",
  },
  {
    rank: 6,
    slug: "alpha-capital-group",
    name: "Alpha Capital Group",
    tagline: "İngiltere merkezli, geniş platform desteği",
    segment: "cfd",
    founded: 2021,
    headquarters: "Londra, İngiltere",
    isPartner: false,
    models: ["1-step", "2-step"],
    accountSizes: ["$10.000", "$25.000", "$50.000", "$100.000", "$200.000", "$400.000"],
    challengeFeeFrom: "$69",
    profitSplit: "%80",
    maxAllocation: "$400.000",
    payoutCycle: "İki haftada bir",
    platforms: ["MT5", "cTrader", "DXtrade", "TradeLocker"],
    rules: [
      {
        name: "Alpha Pro",
        model: "2-step",
        profitTargets: [8, 5],
        drawdownUnit: "percent",
        dailyDrawdown: 5,
        maxDrawdown: 10,
        // Plana göre statik veya trailing değişiyor — bu, hesaplayıcıya
        // girmeden önce plan bazında ayrıştırılması gereken bir alan.
        drawdownType: "unknown",
        minTradingDays: null,
        feeFrom: "$69",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "2021'den bu yana faaliyet; İngiltere merkezli kurumsal yapı",
        "Bağımsız inceleme sitelerinde ödeme kanıtı raporlanıyor",
      ],
      note: "Bağımsız ödeme kanıtı toplama süreci başlatılacak.",
    },
    scoreRules: 3.5,
    scoreCost: 3.5,
    scorePayout: 4,
    scoreTransparency: 4,
    summary:
      "İngiltere merkezli, 2021'den beri faaliyette. En geniş platform desteğine sahip " +
      "firmalardan ve $400.000'a kadar tahsis sunuyor. Zayıf noktası, plana göre " +
      "değişen drawdown tipi (statik veya trailing) ve '%40 en iyi gün' kuralı gibi " +
      "ek kısıtların kural setini karmaşıklaştırması.",
    pros: [
      "En geniş platform desteği: MT5, cTrader, DXtrade, TradeLocker",
      "$400.000'a kadar tahsis",
      "İngiltere merkezli kurumsal yapı",
      "Minimum işlem günü şartı yok",
    ],
    cons: [
      "Drawdown tipi plana göre statik veya trailing — trailing çok daha zor",
      "'%40 en iyi gün' kuralı gibi ek kısıtlar kural setini karmaşıklaştırıyor",
      "Kâr paylaşımı %80'de sabit; ölçekleme ile artış rakipler kadar agresif değil",
    ],
    bestFor:
      "Belirli bir platformda (DXtrade, TradeLocker) çalışmak zorunda olan ve kural " +
      "detaylarını okumaya vakit ayıracak trader.",
  },
  // ─────────────────────────────────────────────────────────────────────
  // FUTURES SEGMENTİ
  //
  // Bu firmalar CFD tarafındakilerle aynı ürün DEĞİL: limitleri dolar
  // cinsinden, platformları NinjaTrader/Tradovate, enstrümanları CME
  // vadeli işlemleri. Tabloda `segment` ile ayrılıyorlar.
  //
  // ⚠️ 2026 boyunca bu üç firmanın da şartları esaslı biçimde değişti
  // (Apex 4.0 Mart 2026'da abonelik modelini tek seferlik ücretle
  // değiştirdi; Topstep 12 Ocak 2026'da kâr paylaşımını yeniden
  // yapılandırdı). Buradaki sayılar açık kaynaklardan derlendi ve
  // hiçbiri henüz FXPARTNER tarafından doğrulanmadı — üçü de
  // `payoutProof: "monitored"`, yani hiçbiri promote edilmiyor.
  // ─────────────────────────────────────────────────────────────────────
  {
    rank: 7,
    slug: "topstep",
    name: "Topstep",
    tagline: "2012'den beri faaliyette, futures tarafının en uzun geçmişi",
    segment: "futures",
    founded: 2012,
    headquarters: "Chicago, ABD",
    isPartner: false,
    models: ["1-step"],
    accountSizes: ["$50.000", "$100.000", "$150.000"],
    challengeFeeFrom: "$49/ay",
    profitSplit: "%90 (12 Ocak 2026'dan itibaren ilk ödemeden geçerli)",
    maxAllocation: "$150.000",
    payoutCycle: "Ayda 4 talebe kadar",
    platforms: ["TopstepX", "NinjaTrader", "Tradovate", "TradingView"],
    rules: [
      {
        name: "Trading Combine $50K",
        model: "1-step",
        profitTargets: [6],
        drawdownUnit: "usd",
        dailyDrawdown: 1000,
        maxDrawdown: 2000,
        refAccountSize: "$50.000",
        drawdownType: "trailing",
        minTradingDays: null,
        feeFrom: "$165/ay",
        extraRule:
          "Ödeme talebi için en az $150 kâr getiren 5 kazançlı gün gerekiyor. Express Funded hesaplarda ödeme, bakiyenin %50'si veya $5.000 ile sınırlı.",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "unknown",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "2012'den bu yana kesintisiz faaliyet — futures prop tarafında en uzun geçmiş",
        "Apex ile birlikte sektördeki yeni funded-trader kayıtlarının tahmini %55-65'ini oluşturuyor",
      ],
      note:
        "Uzun sicil güçlü bir sinyal, ancak FXPARTNER kendi ödeme doğrulamasını " +
        "yapmadı. Ayrıca kâr paylaşımı yapısı 12 Ocak 2026'da değişti; mevcut " +
        "şartların firmadan teyidi gerekiyor.",
    },
    scoreRules: 4,
    scoreCost: 3,
    scorePayout: 4.5,
    scoreTransparency: 4.5,
    summary:
      "Topstep, futures prop tarafının en köklü firması — 2012'den beri faaliyette. " +
      "Trailing drawdown kullanıyor ancak günlük zarar limiti de var, yani iki sınır " +
      "birden takip edilmeli. Asıl zayıf noktası maliyet yapısı: aylık abonelik " +
      "modeli, tek seferlik ücret ödeyen rakiplere göre uzun süren değerlendirmelerde " +
      "belirgin şekilde pahalıya geliyor.",
    pros: [
      "2012'den beri faaliyet — sektörde en uzun kesintisiz sicil",
      "12 Ocak 2026'dan itibaren ilk ödemeden geçerli %90 kâr paylaşımı",
      "Geniş platform desteği: TopstepX, NinjaTrader, Tradovate, TradingView",
      "Minimum işlem günü şartı yok",
    ],
    cons: [
      "Aylık abonelik modeli — değerlendirme uzarsa maliyet birikiyor",
      "Trailing drawdown, statik drawdown'a göre belirgin şekilde zor",
      "Ödeme için en az $150 kâr getiren 5 kazançlı gün şartı",
      "Express Funded hesaplarda ödeme tavanı (%50 veya $5.000)",
    ],
    bestFor:
      "Futures işlem yapan, uzun kurumsal geçmişe önem veren ve değerlendirmeyi " +
      "hızlı bitirebileceğini düşünen trader.",
  },
  {
    rank: 8,
    slug: "apex-trader-funding",
    name: "Apex Trader Funding",
    tagline: "Futures tarafının en yüksek hacimli firmalarından",
    segment: "futures",
    founded: 2021,
    headquarters: "Austin, Texas, ABD",
    isPartner: false,
    models: ["1-step"],
    accountSizes: ["$25.000", "$50.000", "$100.000", "$150.000", "$250.000", "$300.000"],
    challengeFeeFrom: "$131 + $79 aktivasyon",
    profitSplit: "İlk $25.000 kârın tamamı, sonrasında %90",
    maxAllocation: "$300.000",
    payoutCycle: "Firma şartlarına göre",
    platforms: ["Tradovate", "NinjaTrader"],
    rules: [
      {
        name: "Evaluation $50K (Intraday Trail)",
        model: "1-step",
        profitTargets: [6],
        drawdownUnit: "usd",
        // Apex çoğu hesap tipinde SERT GÜNLÜK zarar limiti uygulamıyor;
        // hesabı yöneten şey trailing maksimum drawdown. Buradaki null
        // "veri eksik" değil, "böyle bir limit yok" demek.
        dailyDrawdown: null,
        maxDrawdown: 2500,
        refAccountSize: "$50.000",
        drawdownType: "trailing",
        minTradingDays: null,
        feeFrom: "$131 + $79",
        extraRule:
          "%50 tutarlılık kuralı geçerli. Mart 2026'daki 4.0 güncellemesiyle MAE ve 5:1 risk-getiri kuralları kaldırıldı; gün sonu (EOD) veya gün içi (intraday) trailing drawdown arasında seçim yapılabiliyor.",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "unknown",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "Topstep ile birlikte sektördeki yeni funded-trader kayıtlarının tahmini %55-65'ini oluşturuyor",
        "Affiliate programı 180 günlük cookie ve reset'ler dahil ömür boyu tekrarlı komisyon sunuyor",
      ],
      note:
        "Hacim yüksek ancak FXPARTNER kendi ödeme doğrulamasını yapmadı. " +
        "Model Mart 2026'da (4.0) esaslı biçimde değişti — mevcut ücret ve " +
        "kural yapısının firmadan teyidi gerekiyor.",
    },
    scoreRules: 3.5,
    scoreCost: 4,
    scorePayout: 4.5,
    scoreTransparency: 3.5,
    summary:
      "Apex, futures prop tarafında hacim olarak en büyük firmalardan biri. En güçlü " +
      "yanı kâr paylaşımı: ilk 25.000 doların tamamı trader'da kalıyor, sonrasında %90. " +
      "Buna karşılık gün içi trailing drawdown, normal piyasa geri çekilmelerinde bile " +
      "hesabı kapatabiliyor ve %50 tutarlılık kuralı ek bir eleme sebebi — kural seti " +
      "göründüğünden daha zor.",
    pros: [
      "İlk $25.000 kârın tamamı trader'da, sonrasında %90 paylaşım",
      "Geniş hesap yelpazesi: $25.000 - $300.000",
      "Mart 2026'dan itibaren tek seferlik ücret (aylık abonelik kaldırıldı)",
      "Gün sonu veya gün içi trailing drawdown arasında seçim imkânı",
      "Sık ve agresif indirim kampanyaları",
    ],
    cons: [
      "Gün içi trailing drawdown, normal geri çekilmelerde bile hesabı kapatabiliyor",
      "%50 tutarlılık kuralı ek eleme riski yaratıyor",
      "Değerlendirme ücretine ek $79 aktivasyon ücreti",
      "Kural seti 2026'da esaslı biçimde değişti; eski rehberler yanıltıcı olabilir",
    ],
    bestFor:
      "Yüksek kâr paylaşımı isteyen, trailing drawdown ile çalışmaya alışkın ve " +
      "tutarlılık kuralını yönetebilecek futures trader'ı.",
  },
  {
    rank: 9,
    slug: "earn2trade",
    name: "Earn2Trade",
    tagline: "Eğitim ve değerlendirmeyi birleştiren futures programı",
    segment: "futures",
    founded: 2018,
    headquarters: "ABD",
    isPartner: false,
    models: ["1-step"],
    accountSizes: ["$50.000", "$100.000", "$150.000", "$200.000"],
    challengeFeeFrom: "$139 aktivasyon",
    profitSplit: "%80",
    maxAllocation: "$200.000",
    payoutCycle: "Minimum $100 eşiği",
    platforms: ["NinjaTrader", "Finamark"],
    rules: [
      {
        name: "Gauntlet Mini",
        model: "1-step",
        profitTargets: [6],
        drawdownUnit: "usd",
        dailyDrawdown: 1100,
        maxDrawdown: 2000,
        refAccountSize: "$50.000",
        // Gün sonu (EOD) drawdown her gün sıfırlanıyor — gün içi trailing'e
        // göre işleme daha fazla nefes alanı bırakıyor.
        drawdownType: "trailing",
        minTradingDays: 10,
        feeFrom: "$139",
        extraRule:
          "%30 tutarlılık kuralı ve onaylı işlem saatleri şartı geçerli. Onaylı saatler, günlük zarar limiti ve drawdown — bu üçünün ihlali hesabı anında sonlandırıyor.",
      },
    ],
    // Earn2Trade copy trading'i açıkça yasaklıyor.
    copyTradingAllowed: "banned",
    signalServiceAllowed: "unknown",
    eaAllowed: "unknown",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-19",
      sources: [
        "2018'den bu yana faaliyet; eğitim programı ile değerlendirmeyi birleştiren yapı",
        "Funded hesaplarda %80/20 kâr paylaşımı, $100 minimum ödeme eşiği",
      ],
      note: "Bağımsız ödeme kanıtı toplama süreci başlatılacak.",
    },
    scoreRules: 3.5,
    scoreCost: 3.5,
    scorePayout: 4,
    scoreTransparency: 4,
    summary:
      "Earn2Trade, değerlendirme programını bir eğitim müfredatıyla birleştiriyor — " +
      "futures'a yeni başlayanlar için listedeki en anlamlı yapı bu. Gün sonu " +
      "drawdown'ı her gün sıfırlandığı için gün içi trailing kullanan rakiplere göre " +
      "işleme daha fazla alan bırakıyor. Buna karşılık %30 tutarlılık kuralı ve " +
      "onaylı işlem saatleri şartı, kural setini göründüğünden sıkı hale getiriyor.",
    pros: [
      "Eğitim müfredatı değerlendirmeyle birlikte geliyor — yeni başlayan için avantaj",
      "Gün sonu drawdown her gün sıfırlanıyor; gün içi trailing'den daha yönetilebilir",
      "Aktivasyon ücreti ilk çekimden mahsup ediliyor, peşin ödenmiyor",
      "$100 gibi düşük bir minimum ödeme eşiği",
    ],
    cons: [
      "%30 tutarlılık kuralı — tek bir büyük kazanç günü değerlendirmeyi geçersiz kılabilir",
      "Onaylı işlem saatleri dışında işlem hesabı anında sonlandırıyor",
      "Minimum 10 işlem günü şartı",
      "Copy trading kesinlikle yasak",
      "Kâr paylaşımı %80 — futures tarafındaki %90'lık rakiplerin altında",
    ],
    bestFor:
      "Futures'a yeni başlayan, eğitimle birlikte ilerlemek isteyen ve gün sonu " +
      "drawdown'ın esnekliğine ihtiyaç duyan trader.",
  },
  {
    rank: 10,
    slug: "blueberry-funded",
    name: "Blueberry Funded",
    tagline: "ASIC regüleli Blueberry Markets destekli",
    segment: "cfd",
    founded: 2024,
    headquarters: "Avustralya",
    // IC Funded gibi broker destekli bir yapı — ama buradaki broker ASIC
    // regüleli, yani karşı taraf riski açısından listedeki en güçlü
    // destek yapılarından biri.
    backedBy: "Blueberry Markets",
    backingNote:
      "Blueberry Markets ASIC regüleli bir brokerdır ve bu destek karşı taraf " +
      "riskini bağımsız prop firmalara kıyasla düşürür — ancak Blueberry Funded'ı " +
      "regüle bir kuruluş yapmaz. Prop firmalar broker gibi lisanslanmaz; " +
      "brokerın lisansı fonlanmış hesabınızı kapsamaz.",
    isPartner: false,
    models: ["1-step", "2-step", "instant"],
    accountSizes: ["$1.250", "$5.000", "$10.000", "$25.000", "$50.000", "$100.000", "$200.000"],
    challengeFeeFrom: "$30",
    profitSplit: "%80 → ölçekleme ile %90",
    maxAllocation: "$2.000.000 (ölçekleme programı)",
    payoutCycle: "İki haftada bir, 24 saat içinde",
    platforms: ["MT4", "MT5", "cTrader"],
    rules: [
      {
        name: "2-Step Evaluation",
        model: "2-step",
        profitTargets: [8, 6],
        drawdownUnit: "percent",
        dailyDrawdown: 4,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: null,
        feeFrom: "$30",
        extraRule:
          "Günlük drawdown, 17:00 EST'teki bakiye veya öz sermayenin yükseğinden hesaplanır ve gün boyunca sabit kalır — gerçekleşmemiş kâr günlük zarar tabanını yükseltebilir. Tutarlılık kuralları 1-step, 2-step ve Instant challenge'larda kaldırıldı. Yüksek etkili haber ticareti, arbitraj ve aşırı hızlı işlem kalıpları kısıtlı.",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-20",
      sources: [
        "ASIC regüleli Blueberry Markets tarafından destekleniyor",
        "İki haftalık ödeme döngüsü, 24 saat içinde işleme alınıyor",
        "Ölçekleme programı $2.000.000'a kadar çıkıyor",
      ],
      note:
        "Broker desteği güçlü bir sinyal ancak firma 2024'te kuruldu, uzun vadeli " +
        "ödeme sicili henüz oluşmadı. FXPARTNER kendi doğrulamasını yapmadı.",
    },
    scoreRules: 4,
    scoreCost: 3.5,
    scorePayout: 4,
    scoreTransparency: 4.5,
    summary:
      "Blueberry Funded, ASIC regüleli Blueberry Markets tarafından desteklenen bir " +
      "prop firmadır — listedeki en güçlü destek yapılarından biri. Tutarlılık " +
      "kurallarını tamamen kaldırmış olması trader lehine ciddi bir fark. Zayıf " +
      "noktası 2024 kuruluşlu olması ve günlük drawdown'ın 17:00 EST'te sabitlenen " +
      "bir referanstan hesaplanması — bu detay gözden kaçarsa beklenmedik ihlal üretir.",
    pros: [
      "ASIC regüleli Blueberry Markets desteği — güçlü karşı taraf yapısı",
      "Tutarlılık kuralı yok (1-step, 2-step ve Instant'ta kaldırıldı)",
      "$1.250'den başlayan çok geniş hesap yelpazesi",
      "Ölçekleme $2.000.000'a kadar, kâr paylaşımı %90'a çıkıyor",
      "Ödemeler 24 saat içinde işleniyor",
    ],
    cons: [
      "2024 kuruluşlu — uzun vadeli ödeme sicili henüz yok",
      "Günlük drawdown 17:00 EST referansından sabitleniyor; gerçekleşmemiş kâr tabanı yükseltebiliyor",
      "Haber ticareti ve otomasyon kısıtlamaları var",
      "31 farklı hesap seçeneği yeni başlayan için kafa karıştırıcı",
    ],
    bestFor:
      "Regüle bir brokerın arkasında durmasını önemseyen ve tutarlılık kuralıyla " +
      "uğraşmak istemeyen trader.",
  },
  {
    rank: 11,
    slug: "e8-markets",
    name: "E8 Markets",
    tagline: "Yüksek ödeme hacmi, karmaşık kural seti",
    segment: "cfd",
    founded: 2021,
    headquarters: "ABD",
    isPartner: false,
    models: ["1-step", "2-step", "instant"],
    accountSizes: ["$25.000", "$50.000", "$100.000", "$150.000"],
    challengeFeeFrom: "$130",
    fee100k: "$260",
    profitSplit: "%80 → ücretli yükseltmeyle %90 veya %100",
    maxAllocation: "$150.000",
    payoutCycle: "İki haftada bir, 1-2 gün işleme",
    platforms: ["MT5", "cTrader", "TradeLocker"],
    rules: [
      {
        name: "E8 Signature",
        model: "2-step",
        profitTargets: [8, 5],
        drawdownUnit: "percent",
        // Gün sonu "dinamik" drawdown: seviye her günün sonunda en yüksek
        // kapanış bakiyesine göre yukarı çekiliyor.
        dailyDrawdown: 4,
        maxDrawdown: 8,
        drawdownType: "trailing",
        minTradingDays: null,
        feeFrom: "$130",
        extraRule:
          "Drawdown ürüne göre değişiyor: E8 One / Classic / Track'te gün içi trailing, E8 Signature'da gün sonu dinamik. Fonlanmış hesapta 'en iyi gün' kuralı var — E8 One'da %40, E8 Signature'da %35 tavan. İlk ödeme 8. günde; sonrası her biri %0,3 gerçekleşmiş kâr içeren 5 kârlı güne bağlı.",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "unknown",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-20",
      sources: [
        "Firma beyanı: 200.000+ trader'a 68M+ dolar ödeme, 18.907 ödeme işlemi",
        "Beyan edilen ortalama ödeme tutarı: $3.636",
        "2021'den bu yana faaliyet; ABD'de E8 Funding LLC olarak kayıtlı, CEO'su kamuya açık",
      ],
      note:
        "Ödeme hacmi ve işlem sayısı listedeki en somut rakamlar arasında, ancak " +
        "hepsi firma beyanı. Bağımsız doğrulama yapılacak.",
    },
    scoreRules: 3.5,
    scoreCost: 3.5,
    scorePayout: 4.5,
    scoreTransparency: 4,
    summary:
      "E8 Markets, 68 milyon doları aşan ödeme hacmi ve 18.907 ödeme işlemiyle " +
      "sektörün en somut rakamlarını açıklayan firmalardan biri. Buna karşılık kural " +
      "seti listedeki en karmaşığı: drawdown tipi ürüne göre değişiyor ve fonlanmış " +
      "hesapta 'en iyi gün' tavanı var. Hangi ürünü aldığınızı bilmeden başlamak " +
      "burada gerçek bir risk.",
    pros: [
      "68M+ dolar ödeme, 18.907 ödeme işlemi — sektörde en somut beyan edilen rakamlar",
      "2021'den beri faaliyet; ABD'de kayıtlı tüzel kişilik, CEO kamuya açık",
      "Kâr paylaşımı ücretli yükseltmeyle %100'e çıkabiliyor",
      "İlk ödeme 8. günde alınabiliyor",
    ],
    cons: [
      "Drawdown tipi ürüne göre değişiyor (gün içi trailing vs gün sonu dinamik) — kural seti karmaşık",
      "Fonlanmış hesapta 'en iyi gün' tavanı (%40 / %35)",
      "Ödeme için her biri %0,3 kâr içeren 5 kârlı gün şartı",
      "Maksimum tahsis $150.000 — rakiplerin altında",
    ],
    bestFor:
      "Kural metnini baştan sona okuyacak, hangi ürünü aldığını netleştirip ona göre " +
      "çalışacak deneyimli trader.",
  },
  {
    rank: 12,
    slug: "myfundedfutures",
    name: "MyFundedFutures",
    tagline: "Aktivasyon ücreti olmayan futures programı",
    segment: "futures",
    founded: 2023,
    headquarters: "ABD",
    isPartner: false,
    models: ["1-step"],
    accountSizes: ["$50.000", "$100.000", "$150.000"],
    challengeFeeFrom: "$80",
    profitSplit: "Core/Pro %80 · Rapid %90",
    maxAllocation: "$150.000",
    payoutCycle: "Rapid'de 24 saat · Pro'da iki haftada bir",
    platforms: ["NinjaTrader", "Tradovate", "TradingView"],
    rules: [
      {
        name: "Pro",
        model: "1-step",
        profitTargets: [6],
        drawdownUnit: "percent",
        // Üç planın hiçbirinde günlük zarar limiti yok — tek taban trailing
        // drawdown. Bu, sektörde alışılmadık ve trader lehine bir fark.
        dailyDrawdown: null,
        maxDrawdown: 3,
        drawdownType: "trailing",
        minTradingDays: null,
        feeFrom: "$80",
        extraRule:
          "Pro planında tutarlılık kuralı yok, $1.000 minimum ödeme ve tüm Pro hesaplar genelinde $100.000 kümülatif tavan var. Core planı %40 tutarlılık kuralı ve ödeme döngüsü başına $5.000 tavan uygular; Rapid planında tutarlılık kuralı yoktur ama drawdown gün içi trailing'dir. Aktivasyon ücretleri tüm planlarda kaldırıldı.",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "unknown",
    payoutProof: {
      status: "monitored",
      lastCheckedAt: "2026-08-20",
      sources: [
        "Rapid planında ilk sim-funded işlemden sonra her 24 saatte ödeme uygunluğu açılıyor",
        "Aktivasyon ücretleri tüm planlarda kaldırıldı",
      ],
      note: "Bağımsız ödeme kanıtı toplama süreci başlatılacak.",
    },
    scoreRules: 4,
    scoreCost: 4,
    scorePayout: 4,
    scoreTransparency: 3.5,
    summary:
      "MyFundedFutures'ın öne çıkan yanı, üç planının hiçbirinde günlük zarar limiti " +
      "olmaması — tek taban trailing drawdown. Bu, gün içi dalgalanmada nefes alanı " +
      "bırakıyor ve futures tarafında alışılmadık bir esneklik. Zayıf noktası üç planın " +
      "birbirinden farklı kurallara tabi olması: Core'da tutarlılık kuralı var, Rapid'de " +
      "yok ama drawdown gün içi, Pro'da ikisi de yok ama kümülatif ödeme tavanı var.",
    pros: [
      "Hiçbir planda günlük zarar limiti yok — tek sınır trailing drawdown",
      "Aktivasyon ücretleri tamamen kaldırıldı",
      "Rapid planında %90 kâr paylaşımı ve 24 saatte ödeme uygunluğu",
      "Pro ve Core'da gün sonu drawdown — gün içi trailing'den yönetilebilir",
    ],
    cons: [
      "Üç plan üç farklı kural setine tabi; yanlış plan seçimi pahalıya patlıyor",
      "Pro planında tüm hesaplar genelinde $100.000 kümülatif ödeme tavanı",
      "Core planında %40 tutarlılık kuralı ve döngü başına $5.000 tavan",
      "2023 kuruluşlu — sicil kısa",
    ],
    bestFor:
      "Günlük zarar limiti baskısı olmadan çalışmak isteyen ve üç plan arasındaki " +
      "farkı okuyup doğru olanı seçecek futures trader'ı.",
  },
  {
    rank: 13,
    slug: "goat-funded-trader",
    name: "Goat Funded Trader",
    tagline: "En ucuz giriş — ama ciddi güven soruları var",
    segment: "cfd",
    founded: 2023,
    headquarters: "Doğrulanacak",
    isPartner: false,
    models: ["1-step", "2-step", "instant"],
    accountSizes: ["$5.000", "$10.000", "$25.000", "$50.000", "$100.000", "$200.000", "$400.000"],
    challengeFeeFrom: "$5 (Pay Later)",
    profitSplit: "%75 → 4 ödeme sonrası %95",
    maxAllocation: "$400.000",
    payoutCycle: "48-72 saat",
    platforms: ["MT5", "cTrader", "Match-Trader"],
    rules: [
      {
        name: "2-Step",
        model: "2-step",
        profitTargets: [8, 6],
        drawdownUnit: "percent",
        dailyDrawdown: 4,
        maxDrawdown: 10,
        drawdownType: "static",
        minTradingDays: 3,
        feeFrom: "$5 (Pay Later)",
        extraRule:
          "İlk iki ödemede %6 çekim limiti uygulanıyor. HFT stratejileri ve altın arbitraj EA'ları yasak. Instant Funding dışındaki tüm hesap tiplerinde minimum 3 işlem günü şartı var.",
      },
      {
        name: "1-Step",
        model: "1-step",
        profitTargets: [10],
        drawdownUnit: "percent",
        dailyDrawdown: 3,
        maxDrawdown: 6,
        drawdownType: "static",
        minTradingDays: 3,
        feeFrom: "$5 (Pay Later)",
      },
    ],
    copyTradingAllowed: "unknown",
    signalServiceAllowed: "unknown",
    eaAllowed: "restricted",
    payoutProof: {
      // ⚠️ Listedeki ilk "warning" — bu statünün var olma sebebi tam olarak bu.
      // Trustpilot'un sahte yorumları temizledikten sonra puanı geri çekmesi,
      // bir şeffaflık sorunudur ve ödeme reddi şikayetleriyle birleştiğinde
      // firmayı promote edilebilir olmaktan çıkarır.
      status: "warning",
      lastCheckedAt: "2026-08-20",
      sources: [
        "Trustpilot, sahte yorumları kaldırdıktan sonra firmanın puanını geri çekti",
        "Şikayetler iki başlıkta yoğunlaşıyor: koordineli işlem şüphesiyle ödeme reddi, ve trader'ın limitler içinde olduğunu düşündüğü halde hesabın ihlalli sayılması",
        "İlk iki ödemede %6 çekim limiti uygulanıyor",
      ],
      note:
        "Bu firma UYARI statüsündedir ve sitede hiçbir yerde önerilmez. Sahte yorum " +
        "temizliği sonrası puanın geri çekilmesi ile ödeme reddi şikayetlerinin bir " +
        "arada bulunması, ücretin ne kadar düşük olduğundan bağımsız olarak ciddi bir " +
        "risk göstergesidir. Listede tutulmasının sebebi, arayan kişinin bu bilgiyi " +
        "bulabilmesidir.",
    },
    scoreRules: 3.5,
    scoreCost: 4.5,
    scorePayout: 2,
    scoreTransparency: 2,
    summary:
      "Goat Funded Trader, $5'lık Pay Later girişiyle sektörün en ucuz başlangıcını " +
      "sunuyor ve kural seti kâğıt üzerinde makul. Ancak Trustpilot'un sahte yorumları " +
      "temizledikten sonra puanı geri çekmesi ve ödeme reddi şikayetlerinin belirli bir " +
      "örüntü oluşturması, bu firmayı öneremeyeceğimiz anlamına geliyor. Prop firmada " +
      "asıl ürün ödemedir; ödeme sorgulanıyorsa ücretin düşüklüğü bir avantaj değildir.",
    pros: [
      "Sektörün en düşük giriş maliyeti: Pay Later ile $5 peşin",
      "Kâr paylaşımı 4 ödeme sonrası %95'e çıkıyor",
      "$400.000'a kadar tahsis, statik drawdown",
      "Ödemeler 48-72 saatte işleniyor",
    ],
    cons: [
      "⚠️ Trustpilot, sahte yorumları kaldırdıktan sonra puanı geri çekti",
      "⚠️ Ödeme reddi şikayetleri belirli bir örüntü oluşturuyor",
      "Trader'ın limitler içinde olduğunu düşündüğü halde hesabın ihlalli sayıldığı şikayetler var",
      "İlk iki ödemede %6 çekim limiti",
      "Kâr paylaşımı %75'ten başlıyor",
    ],
    bestFor:
      "Şu an için önermiyoruz. Ödeme kanıtı durumu netleşene kadar, düşük ücret bu " +
      "riski karşılamıyor.",
  },
];

/**
 * Composite skor — brokers.ts'teki getBrokerScores ile aynı mantık:
 * dört eksenin ortalaması, 10 üzerinden.
 */
export function getPropFirmScores(firm: PropFirm) {
  const composite =
    Math.round(
      ((firm.scoreRules + firm.scoreCost + firm.scorePayout + firm.scoreTransparency) /
        4) *
        2 *
        10
    ) / 10;
  return {
    rules: firm.scoreRules,
    cost: firm.scoreCost,
    payout: firm.scorePayout,
    transparency: firm.scoreTransparency,
    composite,
  };
}

/** Slug ile firma getir. */
export function getPropFirm(slug: string) {
  return propFirms.find((f) => f.slug === slug);
}

/**
 * Sayfa üstünde öne çıkarılan ortak.
 *
 * ⚠️ BU BİR SIRALAMA DEĞİLDİR. Ticari ilişkiye dayalı, kartın üzerinde
 * açıkça "Ortaklık yerleşimi" diye etiketlenen bir yerleşimdir. Sıralama
 * tabloda, rubriğe göre durmaya devam eder.
 *
 * Bu ayrım, bir ortağa görünürlük vermenin puanlamayı bozmayan tek dürüst
 * yoludur: okuyucu neyin editoryal değerlendirme, neyin ticari yerleşim
 * olduğunu tek bakışta ayırt edebilir. Rakiplerin (bkz.
 * docs/competitor-best2traders-analysis.md Bölüm 3.1) yaptığı hata,
 * ikisini birbirine karıştırmak.
 */
/**
 * Bu brokerın desteklediği prop firma (varsa) — broker inceleme sayfasından
 * çapraz link vermek için.
 *
 * Bağımlılık yönü kasıtlı: `brokers.ts` bu dosyaya HİÇ referans vermez, broker
 * sayfası sunum katmanında buradan okur. Böylece broker verisi prop dikeyinden
 * tamamen bağımsız kalır.
 */
export function getPropFirmByBackingBroker(brokerSlug: string) {
  return propFirms.find((f) => f.backedByBrokerSlug === brokerSlug);
}

export const FEATURED_PARTNER_SLUG = "ic-funded";

export function getFeaturedPartner() {
  const firm = getPropFirm(FEATURED_PARTNER_SLUG);
  // Öne çıkarma yalnızca gerçekten ortak olan bir firma için geçerli.
  return firm?.isPartner ? firm : undefined;
}

/** Composite skora göre sıralı liste. */
export function propFirmsByScore() {
  return [...propFirms].sort(
    (a, b) => getPropFirmScores(b).composite - getPropFirmScores(a).composite
  );
}

/**
 * Bir firmanın `/prop-firmalar` hub'ı DIŞINDA promote edilip edilemeyeceği.
 *
 * Hub sayfası her firmayı (statüsüyle birlikte) listeler — bilgi vermek
 * amacındır. Ama inceleme sayfasındaki CTA, kampanya sayfası, Telegram
 * postu, Instagram — bunların hepsi bir tavsiyedir ve yalnızca ödeme
 * kanıtı doğrulanmış firmalar için açılır.
 */
export function isPromotable(firm: PropFirm) {
  return firm.payoutProof.status === "verified";
}

/**
 * Yönlendirme linki gösterilebilir mi?
 *
 * `isPromotable()`'dan ayrı: link aktif etmek ticari bir karar, "ödeme
 * doğrulandı" demek ise editoryal bir iddia. Link açık olabilir ve rozet
 * aynı anda dürüstçe "İzleniyor" diyebilir — yeter ki doğrulanmamış bir şey
 * doğrulanmış gibi gösterilmesin.
 */
export function hasActiveLink(firm: PropFirm) {
  return Boolean(firm.linkActive && firm.referralUrl);
}

/**
 * FXPARTNER CopyTrade'in bu firmada kullanılıp kullanılamayacağı.
 * "unknown" da "hayır" demektir — doğrulanmamış izin, izin değildir.
 */
export function canUseCopyTrade(firm: PropFirm) {
  return firm.copyTradingAllowed === "allowed";
}

/**
 * "Challenge Modu" sinyal katmanının bu firma için açılıp açılamayacağı.
 * Aynı mantık: yazılı teyit yoksa kapalıdır.
 */
export function canUseSignals(firm: PropFirm) {
  return firm.signalServiceAllowed === "allowed";
}
