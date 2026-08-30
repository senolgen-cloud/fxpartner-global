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
      // Üyelik kademesi aslında bir üyelik konusu, ama üyelik departmanı
      // yok ve bunları kullanan tek yüzey pano. Bir gün /account kendi
      // departmanını alırsa ikisi oraya taşınır.
      "src/lib/tierAccess.ts",
      "src/lib/vip.ts",
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
        // Soyadı el yazısı listeden net okunamadı; teyit edilip
        // tamamlanacak. Bir insanın adını tahminle yazmaktansa eksik
        // bırakmak doğrusu.
        name: "Tuğçe",
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
        name: "Şebnem Köse",
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
          "src/app/api/cron/education-posts/route.ts",
      "src/lib/educationTopics.ts",
      "src/lib/educationPost.ts",
      "src/app/[locale]/egitim",
      ".github/workflows/education-posts.yml",
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
        name: "Erdem Tarlan",
        title: "Ortaklık Yöneticisi",
        focus: "IB/rev-share anlaşmalarının takibi, cashback oranlarının kaynağından doğrulanması, /partners başvuruları",
      },
    ],
    owns: [
      "src/data/cashback.ts",
      "src/app/[locale]/cashback",
      "src/app/[locale]/admin/cashback",
      "src/app/[locale]/partners",
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
    owns: ["src/app/[locale]/campaigns", "src/app/api/cron/campaign-digest/route.ts"],
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
        name: "Arif Tuncel",
        title: "Veri Koruma Sorumlusu",
        focus: "Çerez onayı ve consent kayıtları, /privacy metninin uygulamayla uyumu",
      },
    ],
    owns: ["src/app/[locale]/terms", "src/app/[locale]/privacy", "src/app/[locale]/blacklist", "src/app/[locale]/complaint"],
    automation: "manual",
  },
];

export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
