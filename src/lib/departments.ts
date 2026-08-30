// Canonical "virtual company" registry for FXPARTNER. Every automated
// route (src/app/api/cron/*) and every editorial data file should be
// owned by exactly one department here — this is the source of truth
// other code and docs/ORGANIZATION.md refer back to, not a duplicate.
/**
 * A real person on the department's staff.
 *
 * Deliberately NOT the `expert` field below. That one is an editorial
 * persona — a name and a voice that generated copy is written in — and
 * putting a real colleague there would sign machine-written prose with a
 * real person's name. These two things look similar in a registry and are
 * not the same thing at all, so they are separate fields.
 *
 * No biography, employer history or credential is recorded here. The people
 * below joined with careers behind them; none of that was written down when
 * the roster was set, and inventing it for a real person is worse than
 * leaving it out. Add it when they supply it themselves.
 */
export interface TeamMember {
  name: string;
  title: string;
  /** What they are responsible for, named in terms of this repo's surfaces. */
  focus: string;
}

export interface Department {
  id: string;
  name: string;
  mission: string;
  expert: {
    name: string;
    title: string;
    focus: string;
    voice: string;
  };
  /**
   * The people in the department. Added 2026-08-28; before that every
   * department was one persona and no staff.
   */
  team: TeamMember[];
  owns: string[];
  // "active": runs unattended on a schedule.
  // "paused": code exists, wired to a department, but only fires via
  //   manual workflow_dispatch until someone deliberately schedules it.
  // "manual": no automation at all, human-executed only.
  automation: "active" | "paused" | "manual";
}

export const departments: Department[] = [
  // First in the list on purpose. The signal board is what the site is for;
  // everything else — reviews, education, campaigns — is built around a
  // tracked account publishing what it actually did. It went without a
  // department until 2026-08-28 only because nobody had written one down.
  {
    id: "signals-copytrade",
    name: "Sinyal & Copytrade Departmanı",
    mission:
      "Takip edilen MT5 hesabının işlemlerini olduğu gibi yayınlamak; panonun erişim kademelerini, istatistiklerini ve kopyalama akışını doğru tutmak. Bir sinyal bir tavsiye değil, gerçekleşmiş bir işlemin kaydıdır.",
    expert: {
      name: "Onur Bektaş",
      title: "Sinyal Operasyonları Direktörü",
      focus: "MT5 köprüsü, sinyal panosu, erişim kademeleri, copytrade akışı",
      voice: "Yalnızca olanı bildirir; 'şunu al' demez, 'şu işlem açıldı' der",
    },
    team: [
      {
        // Sosyal Medya & Topluluk'tan buraya taşındı. Oraya "Topluluk ve
        // Sinyal Operasyonu" unvanıyla konmuştu, çünkü sinyalin departmanı
        // yoktu; artık var.
        name: "Sezgin Ünal",
        title: "Sinyal Operasyonu Sorumlusu",
        focus: "MT5 köprüsünün sağlığı, panodaki açık/kapalı işlem doğruluğu, copytrade başvuruları",
      },
    ],
    owns: [
      // MT5 köprüsü: EA'lar bu uçlara yazar, pano bu uçlardan okur.
      "mt5-ea",
      "src/app/api/trade-signal/route.ts",
      "src/app/api/trade-update/route.ts",
      "src/app/api/trade-result/route.ts",
      "src/app/api/pending-order/route.ts",
      "src/app/api/signals/route.ts",
      "src/app/api/live-prices/route.ts",
      // Pano ve erişim.
      "src/app/[locale]/signals",
      "src/components/SignalsBoard.tsx",
      "src/components/SignalsPromoBanner.tsx",
      "src/lib/signalAccess.ts",
      "src/lib/signalPeriods.ts",
      "src/lib/signalStats.ts",
      // tierAccess.ts ve vip.ts burada değil: 28.08.2026'da Üyelik & Hesap
      // Departmanı açılınca oraya taşındılar, tam da buradaki not öyle
      // olacağını söylediği için. Pano onları kullanmaya devam ediyor;
      // kullanmak sahiplenmek değil.
      // Copytrade.
      "src/app/[locale]/copytrade",
      "src/data/copytrade.ts",
      "src/components/CopyTradeButton.tsx",
      "src/components/CopytradeInquiryForm.tsx",
      // "Bu hareket kaç lotta ne eder" — pozisyon büyüklüğü tarafı.
      "src/app/[locale]/pozisyon-hesaplayici",
      "src/components/PositionSizeCalculator.tsx",
      "src/components/LotLadder.tsx",
      "src/lib/positionSize.ts",
      "src/lib/contractSizes.ts",
    ],
    // Bu departmanın otomasyonu takvimle değil olayla çalışıyor: EA bir
    // işlem açtığında uç nokta tetikleniyor, cron beklemiyor. Yukarıdaki
    // üç değerin böyle bir karşılığı yok; "active" en yakını, çünkü
    // insan müdahalesi olmadan sürekli çalışıyor.
    //
    // Panoyu Telegram'a DUYURMAK burada değil: active-signals-digest ve
    // signalAlertPace.ts Sosyal Medya & Topluluk'ta kalıyor. O departmanın
    // tanımı zaten "diğer departmanların içeriğini tek bir marka sesiyle
    // yayınlamak" — yayın kanalı onların, içerik bizim.
    automation: "active",
  },
  // Sinyalin hemen ardından, çünkü ikisi birbirine kenetli: panoyu kimin
  // görebildiğine bu departmanın kademeleri karar veriyor.
  {
    id: "membership-account",
    name: "Üyelik & Hesap Departmanı",
    mission:
      "Üyeliğin tamamı: kayıt, giriş ve kimlik doğrulama, erişim kademeleri, üye paneli, bildirim kutusu ve üyenin kendi hesabı üzerindeki kontrolü.",
    expert: {
      name: "Selin Arıkan",
      title: "Üye Deneyimi Direktörü",
      focus: "Kayıt/giriş akışı, erişim kademeleri, üye paneli, bildirim tercihleri",
      voice: "Açık ve zorlamasız; bir üyeyi yükseltmeye ikna etmez, ne aldığını söyler",
    },
    // Kadrosu yok. On iki kişinin tamamı başka departmanlara yerleşmişti ve
    // sırf roster boş kalmasın diye birini buraya kaydırmak, yanlış bir
    // atamayı görünür bir boşluğa tercih etmek olurdu. Boşluk kayıtlı
    // duruyor; doldurmak kurucunun kararı.
    team: [],
    owns: [
      // Kimlik doğrulama.
      "src/auth.ts",
      "src/lib/authProviders.ts",
      "src/app/api/auth/[...nextauth]/route.ts",
      // Panel ve akışlar.
      "src/app/[locale]/account",
      "src/components/account",
      "src/components/SignInForm.tsx",
      "src/components/SimpleSignInForm.tsx",
      "src/components/UpgradeGate.tsx",
      "src/lib/accents.ts",
      // Erişim kademeleri. Sinyal panosunu bunlar kilitliyor ama kademe bir
      // üyelik kavramı; pano onları kullanıyor, sahiplenmiyor.
      "src/lib/tierAccess.ts",
      "src/lib/vip.ts",
      // Bildirim KUTUSU — gönderim değil. Sınır şurada: push altyapısı
      // (push.ts, sw.js, api/push/*, NotificationOptIn) Sosyal Medya &
      // Topluluk'ta, çünkü orası yayın kanalı. Üyenin zilde ne gördüğü,
      // neyin okunmuş sayıldığı ve tercihlerinin ne olduğu burada.
      "src/lib/memberNotifications.ts",
      "src/app/api/notifications/route.ts",
      "src/components/HeaderBell.tsx",
      "src/components/NotificationProvider.tsx",
      "src/app/[locale]/paketler",
      "src/data/packageTiers.ts",
      // Abonelik ödemesi.
      "src/lib/nowpayments.ts",
      // Üyeye giden e-postalar.
      "src/lib/email.ts",
      "src/lib/welcomeEmail.ts",
      // Zilin sesi.
      "src/lib/chime.ts",
    ],
    // Kayıt, giriş ve panel istek anında çalışıyor; zamanlanmış hiçbir iş
    // yok ve olması da gerekmiyor.
    automation: "manual",
  },
  // Üyelikten sonra, içerik departmanlarından önce: bu üçü (sinyal, üyelik,
  // asistan) okurun kullandığı ürün yüzeyleri.
  {
    id: "ai-assistant",
    name: "Yapay Zeka Asistanı Departmanı",
    mission:
      "Asistanın sorulara sitenin kendi verisiyle cevap vermesini sağlamak: canlı kurlar ve broker kataloğu. Ne söylediğinden, neyi söylemeyi reddettiğinden ve her cevabın maliyetinden sorumlu.",
    expert: {
      name: "Cem Yalçın",
      title: "Yapay Zeka Ürün Direktörü",
      focus: "Asistan istem tasarımı, kademe limitleri, soru kaydının incelenmesi",
      voice: "Bilmediğini bilmediğini söyler; tavsiye değil bilgi verir",
    },
    // Kadrosu yok — Üyelik & Hesap ile aynı sebep: on iki kişinin tamamı
    // yerleşmişti ve boş roster, yanlış atamadan iyidir.
    team: [],
    owns: [
      "src/app/[locale]/ai-asistan",
      "src/app/api/ai-assistant/route.ts",
      "src/components/AiMarketAssistant.tsx",
      // Sorulan her soru ai_assistant_log'a yazılıyor; bu sayfa onu okuyor.
      // Asistanın gerçekte ne cevapladığını görmenin tek yolu, yani ürünün
      // denetim yüzeyi.
      "src/app/[locale]/admin/ai-sorulari",
      // Modelin adının yazılı olduğu tek yer, ve onu tek yer tutan denetim.
      // Scriptler .mjs olduğu için TypeScript modülünü import edemiyor;
      // scripts/lib/gemini.mjs değeri kopyalamak yerine gemini.ts'ten
      // okuyor, böylece "tek yer" gerçekten tek yer kalıyor.
      "src/lib/gemini.ts",
      "scripts/lib/gemini.mjs",
      "scripts/check-gemini-model.mjs",
    ],
    // "active", çünkü asistan bir insan araya girmeden markanın adına
    // konuşuyor — takvimli değil, istek anında, ama denetimsiz. Uyumluluk &
    // Marka'nın "active olan her şey benim onayımdan geçer" kuralı tam da bu
    // yüzden buraya da uygulanmalı.
    //
    // SAHİPLENMEDİĞİ ŞEY: model çağıran her modül. educationPost.ts,
    // bulletin.ts ve translateContent.ts da Gemini'ye gidiyor ama ürettikleri
    // şey içerik, ve içerik onu yazan departmanın. Bu departman asistan
    // ürününün sahibi, sitenin yapay zeka kullanımının değil.
    //
    // Model adı artık tek yerde: lib/gemini.ts. Altı dosyada ayrı ayrı
    // yazılıydı ve yükseltme altı düzenleme demekti; biri atlanırsa hiçbir
    // şey bozulmuyor, sadece o yüzey eski modeli çağırmaya devam ediyordu.
    // Sabit bu departmanın, çünkü sitenin hangi modelle konuştuğu tek bir
    // karar ve tek bir sahibi olmalı — en çok çağıran taraf olduğu için
    // değil.
    automation: "active",
  },
  {
    id: "market-intelligence",
    name: "Piyasa Analizi Departmanı",
    mission:
      "Fiyat, hacim ve teknik göstergeleri okuyup tarafsız, iddiasız piyasa özetleri üretmek.",
    expert: {
      name: "Kaan Ediz",
      title: "Baş Piyasa Analisti",
      focus: "Teknik analiz (SMA/RSI), günlük piyasa özeti",
      voice: "Sakin, sayısal, asla 'kesin yön' iddiası yok",
    },
    team: [
      {
        name: "Mehmet Ali Erdoğan",
        title: "Kıdemli Teknik Analist",
        focus: "Günlük teknik analiz üretimi ve /teknik-analiz sayfasının enstrüman kapsamı",
      },
      {
        name: "Tuğçe Süslü",
        title: "Makro Ekonomist",
        focus: "Ekonomik takvim yorumu, veri günlerinde beklenti/gerçekleşen okuması",
      },
    ],
    owns: [
      "src/app/api/cron/market-update/route.ts",
      "src/app/api/cron/market-analysis-share/route.ts",
      "src/app/api/cron/economic-calendar-alert/route.ts",
      "src/app/[locale]/piyasa-analizi",
      "src/app/[locale]/ekonomik-takvim",
      "src/lib/market-data.ts",
      "src/lib/technicals.ts",
      "src/lib/telegram-posted-store.ts",
      "src/lib/economicCalendar.ts",
      "src/app/[locale]/teknik-analiz",
      "src/data/technicalAnalysis.ts",
      "src/components/TechnicalAnalysisCard.tsx",
      "src/app/api/technical-analysis-share/route.ts",
      ".github/workflows/technical-analysis-share.yml",
      "src/data/marketAnalysis.ts",
      // Canlı kur beslemesi. Asistan ve ticker da kullanıyor; kullanmak
      // sahiplenmek değil.
      "src/lib/rates.ts",
    ],
    // economic-calendar-alert scheduled (every 5 min) as of 2026-08-07 per
    // owner approval — same "department active, one owned cron still
    // paused" shape as market-update above.
    automation: "active",
  },
  {
    id: "news-editorial",
    name: "Haber & Editöryal Departmanı",
    mission:
      "İlgili finans haberlerini filtreleyip sadık şekilde Türkçeleştirerek yayınlamak — asla yorumla çarpıtmadan.",
    expert: {
      name: "Elif Sarman",
      title: "Editöryal Direktör",
      focus: "Haber filtreleme, sadık çeviri, blog editörlüğü",
      voice: "Güvenilir, tarafsız, kaynağa bağlı",
    },
    team: [
      {
        name: "Şebnem Köser",
        title: "Akademi Editörü",
        focus: "FXPARTNER Akademi ders serisi, konu kuyruğu ve görsel anlatımların metinleri",
      },
      {
        name: "Yunus Emre Coşkun",
        title: "Haber Editörü",
        focus: "Haber filtreleme ve çeviri kalitesi, /haber-bulteni günlük bülteni",
      },
    ],
    owns: [
      "src/app/api/cron/news-update/route.ts",
      "src/app/api/cron/blog-share/route.ts",
      "src/app/[locale]/blog",
      "src/data/blog.ts",
      "src/lib/news.ts",
      "src/lib/relevance-filter.ts",
      "src/lib/translate.ts",
      // İkisi de Gemini'ye gidiyor ama ürettikleri şey içerik; asistan
      // departmanının değil, yazının sahibinin işi.
      "src/lib/bulletin.ts",
      "src/lib/translateContent.ts",
          "src/app/api/cron/education-posts/route.ts",
      "src/lib/educationTopics.ts",
      "src/lib/educationPost.ts",
      "src/app/[locale]/egitim",
      ".github/workflows/education-posts.yml",
      "src/app/[locale]/haber-bulteni",
      // Bültenin okur listesi. Toplama formu pazarlama gibi görünür ama
      // topladığı şey bu departmanın yazdığı bülteni okuyacak kişiler.
      "src/lib/newsletter-actions.ts",
      "src/components/NewsletterSignup.tsx",
      "src/components/NewsletterPopup.tsx",
      // Akademi görsel anlatımları — /egitim zaten burada.
      "src/lib/educationVisuals.ts",
      "src/components/education",
      "scripts/check-education-visuals.mjs",
],
    // "active" as of 2026-08-05: blog-share (announces manually-written
    // /blog posts) is scheduled, per the user's explicit request in that
    // session to automate posting. news-update (external news
    // translation) was also scheduled on 2026-08-08 per an explicit
    // "I want 5-6+ news posts/day" request (every 3h, one message per
    // item); scaled back to a twice-daily single-digest format on
    // 2026-08-10 after the owner flagged that cadence risked crowding
    // out signals/campaigns content and causing notification fatigue.
    // Still silently no-ops/fails until DEEPL_API_KEY is set in Vercel
    // production, see docs/ORGANIZATION.md, but no further code change
    // is needed once that key is added.
        // education-posts is the paused exception in this department: wired,
    // tested and deliberately left on workflow_dispatch. It publishes
    // generated prose under the site name, so compliance-brand signs off
    // before it goes on a schedule — and the cadence is its own question,
    // since four a day is five times the blog's hand-written rate.
automation: "active",
  },
  {
    id: "broker-intelligence",
    name: "Broker İstihbaratı & İnceleme Departmanı",
    mission:
      "Broker'ları düzenleme, maliyet ve çekim performansına göre araştırıp puanlamak, incelemeleri güncel tutmak.",
    expert: {
      name: "Deniz Akar",
      title: "Baş Broker Analisti",
      focus: "Broker skorlama, regülasyon takibi, karşılaştırma",
      voice: "Titiz, kanıta dayalı, asla abartılı övgü yok",
    },
    team: [
      {
        name: "Dilek Arabacıoğlu",
        title: "Regülasyon Araştırmacısı",
        focus: "Lisans doğrulama, /broker-lookup sorgu verisi, risk uyarı listesinin beslenmesi",
      },
      {
        name: "Taner Turan",
        title: "Broker Analisti",
        focus: "Maliyet ve spread karşılaştırmaları, /categories sıralamaları, prop firma incelemeleri",
      },
    ],
    owns: [
      "src/data/brokers.ts",
      "src/app/[locale]/brokers",
      "src/app/[locale]/categories",
      "src/lib/brokerContent.ts",
      "src/app/api/cron/broker-review-share",
      // Türkçe liste sayfası — /brokers ile aynı katalog, ayrı URL.
      "src/app/[locale]/brokerlar",
      "src/lib/brokerReviews.ts",
      "src/lib/comparisonCriteria.ts",
      "src/lib/monogram.ts",
      "src/components/ComparisonTable.tsx",
      // İsimle regülasyon sorgusu.
      "src/app/[locale]/broker-lookup",
      "src/data/brokerLookup.ts",
      "src/components/BrokerLookupSearch.tsx",
      "src/components/BrokerLookupFullIndex.tsx",
      // Prop firmalar broker gibi inceleniyor ve karşılaştırılıyor, o yüzden
      // burada. İndirim kodlarının ticari tarafı Ortaklık'ın ilişkisi;
      // sayfalar buranın işi.
      "src/app/[locale]/prop-firmalar",
      "src/data/propFirms.ts",
      "src/components/PropFirmComparisonTable.tsx",
      "src/components/PropFirmFeaturedCard.tsx",
      // Broker düzenleme raporu — kataloğun toplu okuması.
      "src/app/[locale]/raporlar",
    ],
    // broker-review-share cron posts one broker review page per hour to
    // Telegram, rotating through src/data/brokers.ts — activated per
    // explicit owner request on 2026-08-10, see telegram-cron.yml.
    automation: "active",
  },
  {
    id: "partnerships-cashback",
    name: "Ortaklık & Cashback Departmanı",
    mission:
      "Broker'larla rev-share/IB anlaşmalarını yönetmek, cashback oranlarını doğru ve güncel tutmak.",
    expert: {
      name: "Mert Kıvanç",
      title: "Ortaklıklar Direktörü",
      focus: "Rev-share anlaşmaları, cashback onboarding akışı",
      voice: "Sözleşmeye sadık, oranları asla teyitsiz kesinleştirmez",
    },
    team: [
      {
        name: "Erden Tarlan",
        title: "Ortaklık Yöneticisi",
        focus: "IB/rev-share anlaşmalarının takibi, cashback oranlarının kaynağından doğrulanması, /partners başvuruları",
      },
    ],
    owns: [
      "src/data/cashback.ts",
      "src/app/[locale]/cashback",
      "src/app/[locale]/admin/cashback",
      "src/app/[locale]/partners",
      "src/data/partnerProgram.ts",
      "src/components/partners",
    ],
    automation: "manual",
  },
  {
    id: "advertising-campaigns",
    name: "Reklam & Kampanya Departmanı",
    mission:
      "Aktif broker kampanyalarını (referral, deposit, cashback) tek bir yerde toplamak ve topluluğa hatırlatmak.",
    expert: {
      name: "Sena Yıldırım",
      title: "Büyüme ve Reklam Direktörü",
      focus: "Kampanya küratörlüğü, haftalık özet, referral copy",
      voice: "Net, kar vaadi yok, her zaman 'şartlar değişebilir' notu var",
    },
    team: [
      {
        name: "Gülşah Avcı",
        title: "Kampanya Küratörü",
        focus: "Kampanya şartlarının brokerın resmi sayfasından doğrulanması ve /campaigns içeriğinin güncelliği",
      },
    ],
    owns: [
      "src/app/[locale]/campaigns",
      "src/app/api/cron/campaign-digest/route.ts",
      // Yazı gövdelerine ve sayfa kenarlarına giren sponsorlu yerleşimler.
      "src/lib/xm.ts",
      "src/components/XmInlineAd.tsx",
      "src/components/BrokerAdBanner.tsx",
      "src/components/BrokerSkyscraperAd.tsx",
      "src/components/RotatingBrokerAd.tsx",
      "src/components/SponsoredLeaderboard.tsx",
    ],
    automation: "active",
  },
  {
    id: "social-community",
    name: "Sosyal Medya & Topluluk Departmanı",
    mission:
      "Telegram kanalını, web push bildirimlerini ve VIP topluluğu yönetmek; diğer departmanların içeriğini tek bir marka sesiyle yayınlamak.",
    expert: {
      name: "Barış Ongun",
      title: "Topluluk ve Sosyal Medya Yöneticisi",
      focus: "Telegram gönderim altyapısı, web push bildirimleri, VIP davet akışı, ton tutarlılığı",
      voice: "Premium ama samimi, asla spam sıklığında değil",
    },
    team: [
      {
        name: "Esmanur Bulut",
        title: "Sosyal Medya Uzmanı",
        focus: "Instagram yayın planı (docs/instagram-strategy.md) ve görsel içerik üretimi",
      },
    ],
    owns: [
      "src/lib/telegram.ts",
      "src/lib/push.ts",
      "src/app/api/push/subscribe/route.ts",
      "src/app/api/push/unsubscribe/route.ts",
      "src/components/NotificationOptIn.tsx",
      "public/sw.js",
      ".github/workflows/telegram-cron.yml",
      "src/app/api/cron/active-signals-digest/route.ts",
      ".github/workflows/active-signals-digest.yml",
      "src/lib/signalAlertPace.ts",
      "src/app/api/community/sentiment/route.ts",
      "src/components/SentimentPoll.tsx",
      // İnsan destek kanalı. Yapay Zeka Asistanı Departmanı'nın karşı
      // tarafı: biri modelin cevapladığı soru, bu WhatsApp'ta bir insana
      // gidiyor.
      "src/components/LiveSupportWidget.tsx",
      "src/app/[locale]/topluluk",
      "src/app/[locale]/instagram",
      // Sinyal kartlarını X'e gönderiyor. İçerik sinyalin, kanal buranın —
      // active-signals-digest ile aynı ayrım.
      "src/lib/x.ts",
      "src/lib/telegram-pace.ts",
      // Uygulama kurulumu. Yayın kanalının uzantısı: iki sayfanın da vaadi
      // bildirim, ve service worker zaten burada.
      "src/app/[locale]/app",
      "src/app/[locale]/kurulum",
      "src/lib/standalone.ts",
      "src/components/AddToHomeScreen.tsx",
      "src/components/InstallAppButtons.tsx",
      "src/components/ServiceWorkerRegistrar.tsx",
    ],
    // active-signals-digest activated 2026-08-24 per explicit owner request,
    // every 3 hours rather than the hourly it was first asked for — the same
    // correction broker-review-share needed after hourly flooded the channel.
    // The route sends nothing when the board is unchanged, so the quiet hours
    // cost nothing. See the header of its workflow file.
    automation: "active",
  },
  {
    id: "compliance-brand",
    name: "Uyumluluk & Marka Departmanı",
    mission:
      "Tüm otomatik ve manuel içeriğin 'yatırım tavsiyesi değildir' ilkesine ve marka tonuna uyduğunu doğrulamak; yeni bir otomasyonu 'paused'tan 'active'e almadan önce son onayı vermek.",
    expert: {
      name: "Aylin Demirtaş",
      title: "Uyumluluk ve Marka Direktörü",
      focus: "Yasal uyarı metinleri, marka ses rehberi, kara liste/şikayet süreci",
      voice: "Temkinli, asla korku odaklı pazarlamaya izin vermez",
    },
    team: [
      {
        name: "Nilüfer Hatun",
        title: "Uyumluluk Uzmanı",
        focus: "Yasal uyarı metinleri, şikayet süreci, bir otomasyonu 'active'e almadan önceki son okuma",
      },
      {
        name: "Akif Tuncel",
        title: "Veri Koruma Sorumlusu",
        focus: "Çerez onayı ve consent kayıtları, /privacy metninin uygulamayla uyumu",
      },
    ],
    owns: [
      "src/app/[locale]/terms",
      "src/app/[locale]/privacy",
      "src/app/[locale]/blacklist",
      "src/app/[locale]/complaint",
      // Akif Tuncel'in görev tanımı zaten bunları anıyordu; departman
      // dosyalara sahip değildi.
      "src/lib/consent.ts",
      "src/app/api/consent/route.ts",
      "src/components/CookieConsent.tsx",
      // Şirketin kendini anlattığı sayfa — marka metni.
      "src/app/[locale]/about",
    ],
    automation: "manual",
  },
];

export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
