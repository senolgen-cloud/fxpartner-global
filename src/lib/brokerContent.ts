import { Broker, TIER1_REGULATORS } from "@/data/brokers";
import { trData } from "@/lib/localizeContent";

const PLATFORM_BLURBS: [needle: string, blurb: string][] = [
  [
    "mt4",
    "MetaTrader 4 — broker bağımsız uzman danışmanları ve indikatörleriyle bilinen, sektörün en yaygın kullanılan perakende platformu",
  ],
  [
    "mt5",
    "MetaTrader 5 — MetaTrader'ın daha fazla zaman dilimi, emir türü ve yerleşik ekonomik takvime sahip daha yeni platformu",
  ],
  [
    "ctrader",
    "cTrader — Level II fiyatlandırması ve yerel cAlgo otomasyonu nedeniyle ECN odaklı ve algoritmik yatırımcıların tercih ettiği platform",
  ],
  [
    "tradingview",
    "TradingView — canlı emir gerçekleştirmeyi en yaygın kullanılan bağımsız grafik araçlarından birine doğrudan bağlar",
  ],
  [
    "webtrader",
    "indirme gerektirmeyen, tarayıcı tabanlı bir WebTrader",
  ],
];

// Joins ["A"] -> "A", ["A","B"] -> "A ve B", ["A","B","C"] -> "A, B ve C".
function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ve ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ve ${items[items.length - 1]}`;
}

function platformBlurb(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [needle, blurb] of trData(PLATFORM_BLURBS)) {
    if (key.includes(needle)) return blurb;
  }
  return `özel bir ${name} platformu`;
}

export function platformParagraph(broker: Broker): string {
  const blurbs = broker.platforms.map(platformBlurb);
  if (blurbs.length === 1) {
    return `${broker.name}, ${blurbs[0]} üzerinden işlem yapılmasını sağlar.`;
  }
  return `${broker.name}, ${broker.platforms.length} platformu destekler: ${joinList(blurbs)}.`;
}

export function regulationParagraph(broker: Broker): string {
  const note = broker.regulationNote ? ` ${broker.regulationNote}` : "";
  return `${baseRegulationParagraph(broker)}${note}`;
}

function baseRegulationParagraph(broker: Broker): string {
  const tier1 = broker.regulators.filter((r) => TIER1_REGULATORS.has(r));
  const other = broker.regulators.filter((r) => !TIER1_REGULATORS.has(r));
  const list = joinList(broker.regulators);

  if (tier1.length > 0 && other.length > 0) {
    return `${broker.name}, ${broker.regulators.length} regülasyon lisansı taşıyor: ${list}. ${joinList(tier1)} Tier-1 otorite${tier1.length > 1 ? "leri" : "si"} — bunlar müşteri fonlarının ayrılmasını ve minimum sermaye rezervini şart koşar, bazı ülkelerde broker iflas ederse bir tazminat şemasını da destekler. Kalan lisans${other.length > 1 ? "lar" : ""} offshore'dur; bu genellikle daha hafif sermaye şartları ve arkasında bir yatırımcı tazminat şeması olmaması anlamına gelir.`;
  }
  if (tier1.length > 0) {
    return `${broker.name}, ${broker.regulators.length} Tier-1 lisans altında faaliyet gösteriyor — ${list} — en güçlü regülasyon seviyesi olan bu lisanslar müşteri fonlarının ayrılmasını, minimum sermaye rezervini ve bazı ülkelerde broker iflas ederse bir tazminat şemasını şart koşar.`;
  }
  return `${broker.name}, ${list} tarafından lisanslıdır. Bunların hiçbiri Tier-1 otorite değildir (FCA, ASIC, CySEC, DFSA veya İrlanda Merkez Bankası) — offshore regülatörler genellikle daha hafif sermaye şartları taşır ve arkalarında bir yatırımcı tazminat şeması bulunmaz, bu yüzden canlı bir hesaba para yatırmadan önce bunu aşağıdaki güçlü yönlerle birlikte değerlendirmekte fayda var.`;
}

export function verdictParagraph(broker: Broker): string {
  const strengths = broker.pros.slice(0, 2);
  const tradeoff = broker.cons[0]
    ? ` En önemli ödünü ${broker.cons[0]} — bunu yukarıdaki güçlü yönlerle birlikte değerlendirmekte fayda var.`
    : "";
  return `${broker.bestFor} için ${broker.name} güçlü bir uyum sağlıyor: ${joinList(strengths)}.${tradeoff} Herhangi bir brokerda olduğu gibi, canlı bir hesaba para yatırmadan önce güncel spreadleri, kaldıracı ve bölgesel kullanılabilirliği ${broker.name}'ın resmi sitesinden doğrulayın.`;
}

export function brokerFaqs(broker: Broker): { q: string; a: string }[] {
  const n = broker.regulators.length;
  const tier1Count = broker.regulators.filter((r) => TIER1_REGULATORS.has(r)).length;
  const tier1Clause =
    tier1Count === 0
      ? "Bunların hiçbiri Tier-1 otorite değil"
      : tier1Count === n
        ? `${n} lisansın tamamı Tier-1`
        : `${n} lisanstan ${tier1Count} tanesi Tier-1 otorite`;
  const faqs = [
    {
      q: `${broker.name} regüle mi?`,
      a: `${broker.name}, ${n} lisans taşıyor (${broker.regulators.join(", ")}). ${tier1Clause} — Tier-1 olarak kabul ettiğimiz otoriteler FCA, ASIC, CySEC, DFSA ve İrlanda Merkez Bankası'dır.`,
    },
    {
      q: `${broker.name}'da minimum yatırım tutarı nedir?`,
      a: `${broker.minDeposit}. Maksimum kaldıraç ${broker.maxLeverage}'e kadar çıkıyor, ancak tam rakam hesap türünüze ve ikamet ettiğiniz ülkeye bağlıdır.`,
    },
    {
      q: `${broker.name} hangi platformları destekliyor?`,
      a: `${broker.platforms.join(", ")}.`,
    },
  ];
  if (broker.promotion) {
    faqs.push({
      q: `${broker.name}'ın aktif bir kampanyası var mı?`,
      a: `Evet — aşağıdaki ${broker.promotion.title} kampanyasına bakın veya tüm partner brokerlardaki güncel teklifler için Kampanyalar sayfamızı kontrol edin.`,
    });
  }
  if (broker.extraFaqs) {
    faqs.push(...broker.extraFaqs);
  }
  return faqs;
}
