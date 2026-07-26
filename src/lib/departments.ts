// Canonical "virtual company" registry for FXPARTNER. Every automated
// route (src/app/api/cron/*) and every editorial data file should be
// owned by exactly one department here — this is the source of truth
// other code and docs/ORGANIZATION.md refer back to, not a duplicate.
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
  owns: string[];
  // "active": runs unattended on a schedule.
  // "paused": code exists, wired to a department, but only fires via
  //   manual workflow_dispatch until someone deliberately schedules it.
  // "manual": no automation at all, human-executed only.
  automation: "active" | "paused" | "manual";
}

export const departments: Department[] = [
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
    owns: [
      "src/app/api/cron/market-update/route.ts",
      "src/app/api/cron/market-analysis-share/route.ts",
      "src/app/piyasa-analizi",
      "src/lib/market-data.ts",
      "src/lib/technicals.ts",
      "src/lib/telegram-posted-store.ts",
    ],
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
    owns: [
      "src/app/api/cron/news-update/route.ts",
      "src/app/blog",
      "src/lib/news.ts",
      "src/lib/relevance-filter.ts",
      "src/lib/translate.ts",
    ],
    // Blocked, not just deferred: needs DEEPL_API_KEY and
    // UPSTASH_REDIS_REST_URL/TOKEN in Vercel production before this can
    // move to "active" — see docs/ORGANIZATION.md.
    automation: "paused",
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
    owns: ["src/data/brokers.ts", "src/app/brokers", "src/app/categories", "src/lib/brokerContent.ts"],
    automation: "manual",
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
    owns: ["src/data/cashback.ts", "src/app/cashback", "src/app/admin/cashback"],
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
    owns: ["src/app/campaigns", "src/app/api/cron/campaign-digest/route.ts"],
    automation: "active",
  },
  {
    id: "social-community",
    name: "Sosyal Medya & Topluluk Departmanı",
    mission:
      "Telegram kanalını ve VIP topluluğu yönetmek; diğer departmanların içeriğini tek bir marka sesiyle yayınlamak.",
    expert: {
      name: "Barış Ongun",
      title: "Topluluk ve Sosyal Medya Yöneticisi",
      focus: "Telegram gönderim altyapısı, VIP davet akışı, ton tutarlılığı",
      voice: "Premium ama samimi, asla spam sıklığında değil",
    },
    owns: ["src/lib/telegram.ts", ".github/workflows/telegram-cron.yml"],
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
    owns: ["src/app/terms", "src/app/privacy", "src/app/blacklist", "src/app/complaint"],
    automation: "manual",
  },
];

export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
