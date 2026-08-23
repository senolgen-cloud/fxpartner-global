import { Broker, TIER1_REGULATORS } from "@/data/brokers";
import { trData } from "@/lib/localizeContent";
import { trf } from "@/lib/chrome";

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
  // "ve" is a word, not punctuation — English wants "and", Ukrainian "та".
  if (items.length === 2) return trf("{a} ve {b}", { a: items[0], b: items[1] });
  return trf("{list} ve {last}", {
    list: items.slice(0, -1).join(", "),
    last: items[items.length - 1],
  });
}

function platformBlurb(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [needle, blurb] of trData(PLATFORM_BLURBS)) {
    if (key.includes(needle)) return blurb;
  }
  return trf("özel bir {name} platformu", { name });
}

export function platformParagraph(broker: Broker): string {
  const blurbs = broker.platforms.map(platformBlurb);
  if (blurbs.length === 1) {
    return trf("{broker}, {platform} üzerinden işlem yapılmasını sağlar.", {
      broker: broker.name,
      platform: blurbs[0],
    });
  }
  return trf("{broker}, {count} platformu destekler: {list}.", {
    broker: broker.name,
    count: broker.platforms.length,
    list: joinList(blurbs),
  });
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
    // The Turkish suffixes (-leri/-si, -lar) are grammatical agreement that
    // no other language reproduces, so they stay inside the two variants
    // rather than being spliced in.
    return trf(
      tier1.length > 1
        ? "{broker}, {count} regülasyon lisansı taşıyor: {list}. {tier1} Tier-1 otoriteleri — bunlar müşteri fonlarının ayrılmasını ve minimum sermaye rezervini şart koşar, bazı ülkelerde broker iflas ederse bir tazminat şemasını da destekler. Kalan lisanslar offshore’dur; bu genellikle daha hafif sermaye şartları ve arkasında bir yatırımcı tazminat şeması olmaması anlamına gelir."
        : "{broker}, {count} regülasyon lisansı taşıyor: {list}. {tier1} Tier-1 otoritesi — bunlar müşteri fonlarının ayrılmasını ve minimum sermaye rezervini şart koşar, bazı ülkelerde broker iflas ederse bir tazminat şemasını da destekler. Kalan lisans offshore’dur; bu genellikle daha hafif sermaye şartları ve arkasında bir yatırımcı tazminat şeması olmaması anlamına gelir.",
      { broker: broker.name, count: broker.regulators.length, list, tier1: joinList(tier1) }
    );
  }
  if (tier1.length > 0) {
    return trf(
      "{broker}, {count} Tier-1 lisans altında faaliyet gösteriyor — {list} — en güçlü regülasyon seviyesi olan bu lisanslar müşteri fonlarının ayrılmasını, minimum sermaye rezervini ve bazı ülkelerde broker iflas ederse bir tazminat şemasını şart koşar.",
      { broker: broker.name, count: broker.regulators.length, list }
    );
  }
  return trf(
    "{broker}, {list} tarafından lisanslıdır. Bunların hiçbiri Tier-1 otorite değildir (FCA, ASIC, CySEC, DFSA veya İrlanda Merkez Bankası) — offshore regülatörler genellikle daha hafif sermaye şartları taşır ve arkalarında bir yatırımcı tazminat şeması bulunmaz, bu yüzden canlı bir hesaba para yatırmadan önce bunu aşağıdaki güçlü yönlerle birlikte değerlendirmekte fayda var.",
    { broker: broker.name, list }
  );
}

export function verdictParagraph(broker: Broker): string {
  const strengths = broker.pros.slice(0, 2);
  const tradeoff = broker.cons[0]
    ? ` En önemli ödünü ${broker.cons[0]} — bunu yukarıdaki güçlü yönlerle birlikte değerlendirmekte fayda var.`
    : "";
  return trf(
    "{bestFor} için {broker} güçlü bir uyum sağlıyor: {strengths}.{tradeoff} Herhangi bir brokerda olduğu gibi, canlı bir hesaba para yatırmadan önce güncel spreadleri, kaldıracı ve bölgesel kullanılabilirliği {broker}’ın resmi sitesinden doğrulayın.",
    { bestFor: broker.bestFor, broker: broker.name, strengths: joinList(strengths), tradeoff }
  );
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
