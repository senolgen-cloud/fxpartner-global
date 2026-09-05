import Link from "@/components/LocaleLink";
import { tr, trf } from "@/lib/chrome";
import { localizeBlogPost, localizeBlogPosts, localizeBrokers, trData } from "@/lib/localizeContent";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import { COMPARISON_CRITERIA } from "@/lib/comparisonCriteria";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import HeroVideo from "@/components/HeroVideo";
import HeroSpotlight from "@/components/HeroSpotlight";
import TradingVideo from "@/components/TradingVideo";
import HeroCashbackForm from "@/components/HeroCashbackForm";
import InstallAppButtons from "@/components/InstallAppButtons";
import HeroProductShot from "@/components/HeroProductShot";
import HeroEcosystemMockups from "@/components/HeroEcosystemMockups";
import ShowcaseGallery from "@/components/ShowcaseGallery";
import SponsoredLeaderboard from "@/components/SponsoredLeaderboard";
import RegulatorBadges from "@/components/RegulatorBadges";
import HeroBrokerSearch from "@/components/HeroBrokerSearch";
import PropFirmFeaturedCard from "@/components/PropFirmFeaturedCard";
import { brokers } from "@/data/brokers";
import { propFirms, propFirmsByScore, getPropFirmScores } from "@/data/propFirms";
import { lookupBrokers } from "@/data/brokerLookup";
import { faqSchema } from "@/lib/schema";
import type { BrokerReviewStats } from "@/lib/brokerReviews";
import type { AccountRecord } from "@/lib/trackRecord";
import AccountSummary from "@/components/AccountSummary";
import {
  cachedLatestSignal,
  cachedBrokerReviewStats,
  cachedAccountRecord,
  type SignalJson,
} from "@/lib/cachedReads";
import { maskLockedActiveSignal } from "@/lib/signalAccess";
import { loadOptional } from "@/lib/dbOptional";
import { setServerLocale } from "@/lib/serverLocale";

const trackedBrokerCount = lookupBrokers.length;
const trackedRegulatorCount = new Set([
  ...brokers.flatMap((b) => b.regulators),
  ...lookupBrokers.flatMap((b) => b.regulators ?? []),
]).size;
// Read from each broker's real minDeposit string (e.g. "$5", "From $10*")
// rather than a hand-typed number, so this can't go stale if a broker with
// a lower minimum gets added later.
const lowestMinDeposit = Math.min(
  ...brokers.map((b) => {
    const n = parseFloat(b.minDeposit.replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? Infinity : n;
  })
);

type StatTile = { label: string; value: number; prefix?: string; suffix?: string };

// The fallback row: what the site can say about itself without the
// database. Kept as data rather than inline JSX because the record row
// below replaces it wholesale when there is a record to show.
const inventoryStats: StatTile[] = [
  { label: "Takip Edilen Broker", value: trackedBrokerCount },
  { label: "Regülasyon Otoritesi", value: trackedRegulatorCount, suffix: "+" },
  { label: "En Düşük Giriş", value: lowestMinDeposit, prefix: "$" },
  { label: "Karşılaştırma Kriteri", value: COMPARISON_CRITERIA.length },
];

// The four cards under the hero, and the four points in "Neden FXPARTNER".
//
// Both rows come from the comp. Both were edited for claims we can actually
// stand behind — see the note at each render site. The icon is named rather
// than embedded so this stays plain data that trData() can walk.
type PillarIconName =
  | "eye"
  | "bolt"
  | "shield"
  | "wallet"
  | "chart"
  | "scale"
  | "people";

type Pillar = { icon: PillarIconName; title: string; body: string };

const heroPillars: Pillar[] = [
  {
    icon: "eye",
    title: "Şeffaf Sonuçlar",
    body: "Her işlem giriş, hedef ve stop seviyesiyle yayınlanır; kapandığında sonucu panoda kalır.",
  },
  {
    icon: "bolt",
    title: "Gerçek Zamanlı",
    body: "Sinyal, takip edilen MT5 hesabında açıldığı anda siteye ve Telegram'a düşer.",
  },
  {
    icon: "shield",
    title: "Bağımsız Broker Verisi",
    body: "{count} broker regülatör uyarı listelerine karşı tarandı; riskliler açıkça işaretlendi.",
  },
  {
    icon: "wallet",
    title: "Komisyon Paylaşımı",
    body: "Partner brokerdan aldığımız komisyonun bir kısmı cashback olarak size döner.",
  },
];

// "Neden FXPARTNER?" — the four reasons, one step deeper than the cards
// above. Where the hero row says what the site does, these say why any of
// it should be believed.
const whyPillars: Pillar[] = [
  {
    icon: "chart",
    title: "Doğrulanmış Performans",
    body: "Kayıp da kazanç da aynı panoda duruyor; sıfırlama tarihi ve başlangıç bakiyesi tablonun altında açıkça yazılı. İsabet oranı yeterli örneklem yoksa hiç yayınlanmıyor.",
  },
  {
    icon: "eye",
    title: "Açık Ticari İlişki",
    body: "Brokerlardan komisyon aldığımızı her kartta yazıyoruz — ve ortağımız olan brokerları da risk uyarısı listesine koyuyoruz.",
  },
  {
    icon: "scale",
    title: "Risk Yönetimi",
    body: "Her sinyalde zarar durdur seviyesi var; pozisyon hesaplayıcı, riskinize göre lot büyüklüğünü siz belirleyesiniz diye ücretsiz.",
  },
  {
    icon: "people",
    title: "Topluluk",
    body: "Broker yorumları gerçek kullanıcılardan geliyor ve düzeltilmeden yayınlanıyor — olumsuz olanlar dahil.",
  },
];

function PillarIcon({ name }: { name: PillarIconName }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5 text-signal",
  };
  switch (name) {
    case "eye":
      return (
        <svg {...p}>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...p}>
          <path d="M13 2.5 4.5 13.5H11l-.5 8L19.5 10.5H13l0-8Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...p}>
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <path d="M3 10h18M16.5 14.5h.01" />
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 19.5V9M10 19.5V4.5M16 19.5v-7M21 19.5H3" />
        </svg>
      );
    case "scale":
      return (
        <svg {...p}>
          <path d="M12 3.5v17M5 20.5h14M7 7.5 3.5 14h7L7 7.5ZM17 7.5 13.5 14h7L17 7.5ZM4 7.5h16" />
        </svg>
      );
    case "people":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 19.5c0-3.1 2.9-5.6 6.5-5.6s6.5 2.5 6.5 5.6" />
          <path d="M16.5 6.2a3.2 3.2 0 0 1 0 6M17.5 14.4c2.4.5 4 2.4 4 4.6" />
        </svg>
      );
  }
}

const steps = [
  {
    n: "01",
    title: "Regülasyonu kontrol edin",
    body: "FCA, ASIC veya CySEC gibi üst düzey (Tier-1) otoriteler tarafından denetlenen brokerlar, fonlarınızın güvenliği için daha güçlü bir çerçeve sunar.",
  },
  {
    n: "02",
    title: "Maliyet yapısını karşılaştırın",
    body: "Spread, komisyon ve gecelik swap oranlarını birlikte değerlendirin — düşük bir spread bazen daha yüksek bir komisyonla dengelenir.",
  },
  {
    n: "03",
    title: "Platformu ve araçları test edin",
    body: "MT4, MT5 veya cTrader arayüzünün kendi stratejinize uyup uymadığını görmek için bir demo hesap açın.",
  },
  {
    n: "04",
    title: "Para çekme sürecini deneyin",
    body: "Küçük bir depozitle başlayıp ilk para çekme talebinizin hızını ve şeffaflığını izlemek, uzun vadeli güveni test etmenin en iyi yoludur.",
  },
];

const accountSteps = [
  "Yukarıdaki sıralamadan, regülasyonu ve maliyet profili risk toleransınıza uyan bir broker seçin.",
  "Broker'ın KYC formunu kimliğiniz ve adres belgenizle tamamlayın — çoğu Tier-1 regüle broker ilk depozitten önce bunu ister.",
  "Hesabı önce tüm işlem sermayenizle değil, minimum depozit ile fonlayın; böylece riske girmeden işlem kalitesini değerlendirebilirsiniz.",
  "Platformu (MT4, MT5 veya broker'ın kendi uygulaması) demo modunda açın ve spread ile emir gerçekleştirmenin reklamı yapılanla eşleştiğini doğrulayın.",
];

const withdrawalSteps = [
  "Önce küçük bir para çekme talebinde bulunun — tutardan çok broker'ın gerçek işlem süresini gözlemlemek önemlidir.",
  "Depozit yaptığınız aynı ödeme yöntemini kullanın; çoğu regüle broker kara para aklamayı önleme uyumluluğu için bunu şart koşar.",
  "Talepten paranın ulaşmasına kadar geçen süreyi takip edin: güvenilir brokerlarda aynı gün ile 3 iş günü arası tipiktir, daha uzun gecikmeler uyarı işaretidir.",
  "Onay e-postasını veya işlem numarasını saklayın — broker'la veya regülatörünüzle bir gecikmeyi tartışmanız gerekirse referansınız olur.",
];

const faqs = [
  {
    q: "FXPARTNER Endeksi nedir ve nasıl hesaplanır?",
    a: "FXPARTNER Endeksi, aşağıdaki 01-04 rehberindeki dört kriterden (Regülasyon, Maliyet, Platform, Para Çekme) hesaplanan 0-10 arası bileşik bir puandır. Platform ekseni, broker'ın platform verilerinden otomatik olarak hesaplanır. Regülasyon ekseni varsayılan olarak lisans verilerinden türetilir; editör ekibi gerekçeli bir istisna yaptığında bu puanı güncelleyebilir. Maliyet ve Para Çekme eksenleri, incelemede bulunan doğrulanabilir sinyallere dayalı editoryal değerlendirmelerdir — belirli bir sinyali olmayan brokerlar o eksende nötr bir puan alır. Endeks, yıldız puanlamasından ayrı bir ölçüdür; ikisi farklı şeyleri yansıtabilir.",
  },
  {
    q: "Bu sıralama nasıl belirleniyor?",
    a: "Regülasyon kalitesi, maliyet şeffaflığı, platform çeşitliliği ve yatırımcı profiline uygunluk gibi genel kriterlere dayalı bir değerlendirmedir. FXPARTNER, listelenen brokerların bazılarıyla ortaklık/referans ilişkisine sahiptir ve hesap açılışlarından komisyon kazanabilir; bu durum her broker kartında ayrıca belirtilir.",
  },
  {
    q: "Yeni başlayanlar için hangi brokerlar düşük giriş bariyeri sunuyor?",
    a: "Tek bir “en iyi” broker yok. Düşük minimum depozit ve eğitim içeriği arıyorsanız XM ve Lite Finance düşük giriş bariyeriyle öne çıkar. Her ikisi de FXPARTNER’ın ortaklık bağlantısı bulunan brokerlardır; hesap açılışından komisyon kazanabiliriz ve bu gelir sıralamayı etkilemez. Bu bir yatırım tavsiyesi değildir — kendi ihtiyaçlarınıza göre karşılaştırın.",
  },
  {
    q: "Kaldıraç oranları ülkeye göre neden değişir?",
    a: "AB ve İngiltere gibi bölgelerde ESMA/FCA regülasyonları perakende yatırımcılar için kaldıracı sınırlarken, offshore lisanslı hesaplar çok daha yüksek oranlar sunabilir. Bu sayfadaki rakamlar bölgeye göre değişebilir.",
  },
  {
    q: "Bu site yatırım tavsiyesi veriyor mu?",
    a: "Hayır. İçerik yalnızca genel bilgilendirme amaçlıdır ve kişisel yatırım tavsiyesi değildir. Karar vermeden önce kendi araştırmanızı yapmalı ve gerekirse bir uzmana danışmalısınız.",
  },
  {
    q: "İşlem sinyalleri nasıl oluşturuluyor ve ne kadar doğru?",
    a: "Sinyaller, FXPARTNER'ın takip edilen MT5 hesabında çalışan otomatik bir işlem motorundan gelir: motor trend, momentum ve volatilite koşullarının uyuşmasını arar ve hesapta bir pozisyon açıldığı anda sinyal otomatik olarak yayınlanır. Araya insan eli girmez — sinyaller seçilerek yayınlanmaz, açılan her işlem panoya düşer. Her sinyalde giriş, zarar durdur ve kâr al seviyesi bulunur; böylece sonucu nesnel olarak kontrol edilebilir — kapanan sinyaller, kazanç veya kayıp sonucuyla birlikte sinyaller sayfasında görünür kalır. Geçmiş performans gelecekteki sonuçları garanti etmez ve sinyaller kişiselleştirilmiş tavsiye değil, eğitim amaçlıdır.",
  },
  {
    q: "Forex ticaretinin riskleri nelerdir?",
    a: "Forex ticareti kaldıraç kullanır; bu hem kazançları hem de kayıpları büyütür — hesap türüne ve yargı alanına bağlı olarak ilk depozitinizden daha fazlasını kaybedebilirsiniz. Yüksek volatilite dönemlerinde spread ve swap'lar genişler, offshore regüleli hesaplar Tier-1 regüleli hesaplara göre daha zayıf yatırımcı koruma garantileri taşır. Yalnızca kaybetmeyi göze alabileceğiniz sermayeyle işlem yapın ve gerçek fon yatırmadan önce bir demo hesap kullanın.",
  },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  // The home page was handing the raw Turkish brokers to the list and the
  // hero, so eighteen translated bestFor lines sat unused on the busiest
  // page on the site. /brokerlar had always localized them.
  const localBrokers = localizeBrokers(brokers, locale);

  // Prefer the latest still-open trade so the hero card reflects a real
  // signal a visitor could still act on; fall back to the latest closed
  // one so the card isn't empty between open trades.
  //
  // Optional, both of them. This page is overwhelmingly built from the
  // repo — the hero, eighteen brokers, the comparison table, the FAQ — and
  // exactly two things on it come from the database. Letting either one
  // take the home page down, as they did on 2026-08-31, is the wrong
  // trade by a wide margin: the hero card sits empty between open trades
  // anyway, and the ranking already renders without ratings for a broker
  // nobody has reviewed.
  const { data: rawLatestSignal } = await loadOptional(
    "home: latest signal",
    null as SignalJson | null,
    cachedLatestSignal
  );

  // Masked as if nobody were signed in, and deliberately WITHOUT reading the
  // session.
  //
  // This card was publishing the live entry, TP and SL of the newest trade to
  // every anonymous visitor of the busiest page on the site — including
  // Pro/VIP instruments. The /signals page and /api/signals have masked for a
  // long time; this render path never did, so the levels the rest of the
  // system withholds were sitting in the shop window.
  //
  // Passing null rather than the viewer's real tier is the point: reading the
  // session here would put a per-request query back on the home page, which
  // is exactly what the shared-read work took off it. A member loses nothing
  // — the hero is a shop window, and /signals shows them the real numbers.
  // Free-tier pairs are untouched either way, because an anonymous viewer is
  // entitled to those.
  const latestSignal = rawLatestSignal
    ? maskLockedActiveSignal(rawLatestSignal, null)
    : null;

  // Optional like the other two, and for the same reason — but the
  // fallback matters more here, because this one is load-bearing copy: the
  // headline and the stat row both change when it is null. The page then
  // says what it said before the record existed rather than a claim with a
  // hole in it.
  const { data: accountRecord } = await loadOptional(
    "home: account record",
    null as AccountRecord | null,
    cachedAccountRecord
  );

  const { data: brokerReviewStats } = await loadOptional(
    "home: broker review stats",
    {} as Record<string, BrokerReviewStats>,
    cachedBrokerReviewStats
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(faqs))) }}
      />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-text-on-ink">
          <div
            aria-hidden="true"
            className="hero-glow-signal pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/25 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="hero-glow-gold pointer-events-none absolute -right-16 top-10 h-[360px] w-[360px] rounded-full bg-gold/20 blur-[110px]"
          />
          <HeroVideo />
          <HeroSpotlight />

          {/* Two columns: the argument on the left, what it is an argument
              about on the right.

              The centred stack this replaces put the copy, then a product
              shot, then the install buttons, then the dashboard cards, then
              the feature row — five things down one column, so a visitor
              scrolled past four before reaching anything they could act on.
              Side by side, the claim and its evidence are on one screen and
              the buttons sit in the first of them.

              The right column is HeroEcosystemMockups, unchanged and
              deliberately so: it draws the newest real signal, masked as if
              nobody were signed in. The comp this follows had a decorative
              panel there reading "TOTAL PROFIT +$23,458.72" and "WIN RATE
              85%" over a stock photograph — invented figures, sitting a
              hand's width above the real ones, which say $4,641.52 and 63%.
              Two win rates on one screen means one of them is a lie, and a
              page whose headline is about not hiding losses cannot be the
              page that ships it. Real cards, real numbers, same job. */}
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pt-10 lg:grid-cols-2 lg:gap-12 lg:pt-14">
            <div className="text-center lg:text-start">
              {/* The record, not a slogan. A visitor who reads this line and
                  clicks it lands on the board it was counted from — the claim
                  and its evidence are one tap apart on purpose, because the
                  claim is only worth making if it survives being checked. */}
              <Reveal eager>
                {accountRecord ? (
                  <Link
                    href="/signals"
                    className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:text-signal-strong lg:justify-start"
                  >
                    <span
                      aria-hidden="true"
                      className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                    />
                    {trf("{trades} işlem · {wins} kazanç · {losses} kayıp · hiçbiri silinmedi", {
                      trades: accountRecord.allTime.trades,
                      wins: accountRecord.allTime.wins,
                      losses: accountRecord.allTime.losses,
                    })}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
                    <span
                      aria-hidden="true"
                      className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                    />
                    {tr("Öğren · İşlem Yap · Büyü")}
                  </span>
                )}
              </Reveal>

              <Reveal eager delay={90}>
                {/* No hard break. At 60px it lands on two lines by itself,
                    and a forced one left "şey" stranded alone on a 375px
                    phone. text-balance lets the browser even the lines out
                    at whatever width it is given.

                    NO LONGER CONDITIONAL ON THE RECORD. The headline it
                    replaces was a claim about the trading account, so it
                    could only stand while there were numbers under it to
                    check; this one is a claim about the product and holds
                    whether or not the database answers. The record still
                    leads the column — it is the line directly above, and
                    that line still steps aside when there is nothing to
                    count.

                    TWO SPANS RATHER THAN ONE STRING, because the second
                    half is coloured. They are separate catalogue entries so
                    each locale can put its own emphasis in the second half
                    rather than having Turkish word order imposed on it —
                    the English pair reads "Not just a signal." / "Something
                    smarter.", which is not a word-for-word translation and
                    is not meant to be. Same pattern as the "Neden
                    FXPARTNER?" heading further down.

                    The gradient is dropped here. bg-clip-text paints the
                    parent's background through every descendant's glyphs,
                    so a coloured child inside it is fighting the fill it
                    sits in; a flat colour and one accent is what the
                    two-tone headline actually wants. */}
                <h1 className="mt-4 font-poppins text-[2rem] font-bold leading-[1.12] tracking-[-0.02em] text-balance text-text-on-ink sm:text-5xl">
                  {tr("Bir sinyalden")}{" "}
                  <span className="bg-gradient-to-r from-[#0891b2] via-[#22b8d6] to-[#7dd3fc] bg-clip-text text-transparent">
                    {tr("daha akıllısı…")}
                  </span>
                </h1>
              </Reveal>

              <Reveal eager delay={150}>
                <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed tracking-[0.01em] text-text-on-ink-muted md:text-base lg:mx-0">
                  {accountRecord
                    ? tr("Her sinyal giriş, zarar durdur ve kâr al seviyesiyle yayınlanır; kapandığında sonucu — kazanç ya da kayıp — panoda kalır. Aynı ekranda ayrıca yapay zeka analizi, ekonomik takvim ve güvenilir broker karşılaştırmaları.")
                    : tr("FXPARTNER, daha akıllı işlem yapmanız için hepsi bir arada platformdur. Sinyaller, yapay zeka içgörüleri, ekonomik takvim, güvenilir brokerlar ve küresel bir topluluk.")}
                </p>
              </Reveal>

              {/* The ask, in the first screen rather than under it.

                  WHAT IT MAY AND MAY NOT PROMISE. FX signals are public —
                  no account, no payment, and they go out openly on Telegram
                  besides (lib/signalAccess.ts). So an account cannot be sold
                  as the way to see them; /paketler's free tier had to be
                  corrected for exactly that once, and doing it here, under a
                  headline about not hiding things, would be worse than doing
                  it there. The line under the buttons says what an account
                  actually adds.

                  Rendered for everybody, signed in or not. This page
                  deliberately does not read the session — that query was
                  taken off the busiest page on the site on purpose — and the
                  header two inches above already says "Hesabım" to a member,
                  so nobody is left confused about which state they are in. */}
              <Reveal eager delay={210}>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link
                    href="/account/register"
                    className="rounded-full bg-signal px-7 py-3.5 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
                  >
                    {tr("Ücretsiz Üye Ol")}
                  </Link>
                  <Link
                    href="/paketler"
                    className="rounded-full border border-hairline px-7 py-3.5 text-sm font-semibold text-text-on-ink transition-colors hover:border-signal hover:text-signal"
                  >
                    {tr("Paketleri İncele")}
                  </Link>
                </div>
              </Reveal>

              <Reveal eager delay={260}>
                <p className="mt-4 text-xs text-text-on-ink-muted">
                  {tr("Forex sinyalleri üyeliksiz ve ücretsiz. Hesap; anlık bildirim ve cashback hesap bağlama ekler.")}
                </p>
              </Reveal>
            </div>

            <Reveal eager delay={200}>
              <HeroEcosystemMockups latestSignal={latestSignal} />
            </Reveal>
          </div>

          {/* The account, directly under the claim it is evidence for.

              This is the same strip /signals carries above its board, from
              the same component, and that is the point: a reader who taps
              through from the headline finds the identical figures rather
              than a marketing version of them. The two pages reach those
              figures differently — the board adds up the rows it is already
              polling, this reads a server-side aggregate over the whole
              post-reset record — so the markup is shared and never copied.

              The risk line is not fine print and is not placed like it. */}
          {accountRecord && (
            <Reveal eager delay={220}>
              <div className="relative mx-auto mt-12 max-w-6xl px-6">
                <AccountSummary
                  realised={accountRecord.realised}
                  today={accountRecord.today}
                  week={accountRecord.week}
                />
                <p className="mx-auto mt-3 max-w-2xl text-center text-[11px] leading-relaxed text-text-on-ink-muted">
                  {tr("FXPARTNER'ın takip edilen MT5 hesabında kapanan gerçek işlemler. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez; kaldıraçlı işlemlerde sermayenizin tamamını kaybedebilirsiniz.")}{" "}
                  <Link href="/signals" className="text-signal hover:text-signal-strong">
                    {tr("Tüm işlem geçmişini gör →")}
                  </Link>
                </p>
              </div>
            </Reveal>
          )}

          {/* Four things the site does, as cards rather than one line.

              WHAT THE COMP ASKED FOR, AND WHY TWO OF THEM CHANGED. It listed
              "Güvenli & Korumalı — verileriniz ve yatırımlarınız en üst
              düzeyde güvende" and "7/24 Uzman Destek". We do not hold
              anybody's investments: the money is at the reader's own broker,
              which is the whole point of the broker section further down. So
              that card would have claimed custody we do not have and a
              protection we could not provide. And support is "öncelikli" on
              the paid tiers, not staffed around the clock. Both are replaced
              with things that are true and, as it happens, more specific. */}
          <Reveal delay={320}>
            <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-12 md:pb-20">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trData(heroPillars).map((pillar) => (
                  <li
                    key={pillar.title}
                    className="rounded-2xl border border-hairline bg-ink-soft/40 p-5"
                  >
                    <PillarIcon name={pillar.icon} />
                    <h3 className="mt-3 font-poppins text-sm font-semibold uppercase tracking-[0.08em] text-text-on-ink">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-text-on-ink-muted">
                      {/* trData() has already translated the body, so the count is
                          interpolated here rather than through a second trf()
                          lookup that would miss on every non-Turkish locale. */}
                      {pillar.body.replace("{count}", String(trackedBrokerCount))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* Neden FXPARTNER — the reasons, beside the thing itself.

            The comp put four points on the left and a phone on the right,
            which is where the product shot and the install buttons went when
            they came out of the hero: a picture of the app belongs next to
            the argument for using it, not stacked under a headline where it
            pushed everything else below the fold.

            The four points are not the four in the row above. Those say what
            the site does; these say why any of it should be believed, which
            is a different question and the only one worth a section. */}
        <section id="neden" className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
            <div>
              <Reveal>
                <h2 className="font-poppins text-3xl font-semibold text-text-on-ink md:text-4xl">
                  {tr("Neden")}{" "}
                  <span className="text-signal">FXPARTNER</span>?
                </h2>
              </Reveal>
              <ul className="mt-8 space-y-6">
                {trData(whyPillars).map((pillar, i) => (
                  <Reveal key={pillar.title} delay={i * 80}>
                    <li className="flex gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-ink-soft/60">
                        <PillarIcon name={pillar.icon} />
                      </span>
                      <div>
                        <h3 className="font-poppins text-base font-semibold uppercase tracking-[0.06em] text-text-on-ink">
                          {pillar.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-text-on-ink-muted">
                          {pillar.body}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div>
              <Reveal delay={120}>
                <HeroProductShot
                  src="/fxpartner-trading-yatay.webp"
                  width={939}
                  height={377}
                  alt={tr("FXPARTNER uygulamasında EUR/USD grafiği")}
                  maxWidthClassName="max-w-xl"
                />
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-6 text-center">
                  <InstallAppButtons />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Ranked broker list */}
        <section id="brokers" className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                {tr("Sıralamalar")}
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-on-ink md:text-4xl">
                {trf("FXPARTNER’ın {year} forex broker sıralaması: {count} broker", {
                  year: 2026,
                  count: brokers.length,
                })}
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                {tr("Her broker; regülasyon gücü, maliyet yapısı, platform desteği ve farklı yatırımcı profillerine uygunluk açısından değerlendirildi.")}
              </p>
              <div className="mt-6">
                <HeroBrokerSearch />
              </div>
            </Reveal>

            <div className="mt-12">
              <BrokerList brokers={localBrokers} reviewStats={brokerReviewStats} />
            </div>

            {/* Below the ranking, not above it: an advertiser does not get to
                stand in front of the list this page exists to publish. TIO
                Markets has no entry in brokers.ts, so the destination is
                passed straight in — a creative can run without us first
                inventing a review to hang it on. */}
            <div className="mt-14">
              <SponsoredLeaderboard
                href="https://tiomarkets.com/register/?cmp=0b1x0w8w&refid=4095&bannerid=3684"
                image="/campaigns/tiomarkets-970x250.png"
                alt={tr("TIO Markets — 250.000’den fazla müşteri tarafından tercih ediliyor")}
                width={970}
                height={250}
              />
            </div>
          </div>
        </section>

        {/* Prop firmalar — brokerlar ve sinyaller gibi ana dikeylerden biri.
            Öne çıkan ortak kartı + rubrik sıralamasının ilk üçü. İkisi görsel
            olarak ayrı tutuluyor: kart ticari yerleşim, liste editoryal
            sıralama. */}
        <section id="prop-firmalar" className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
                {tr("Prop Firmalar")}
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-on-ink md:text-4xl">
                {tr("Firmanın sermayesiyle işlem yapın; riskiniz challenge ücretiyle sınırlı")}
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                {trf(
                  "Funded account veren {count} firma; kural seti, challenge ücreti, drawdown limitleri ve ödeme sicili üzerinden bağımsız olarak puanlandı. Ticari ilişkimiz olan firmalar açıkça etiketlenir.",
                  { count: trData(propFirms).length }
                )}
              </p>
            </Reveal>

            <Reveal className="mt-12">
              <PropFirmFeaturedCard />
            </Reveal>

            <Reveal className="mt-10">
              <div className="grid gap-4 sm:grid-cols-3">
                {trData(propFirmsByScore())
                  .slice(0, 3)
                  .map((firm, i) => (
                    <Link
                      key={firm.slug}
                      href={`/prop-firmalar/${firm.slug}`}
                      className="block rounded-2xl border border-hairline bg-ink-soft/60 p-5 transition-colors hover:border-text-on-ink"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-on-ink-muted">
                          #{i + 1}
                        </span>
                        <span className="font-mono text-sm font-semibold text-gold">
                          {getPropFirmScores(firm).composite.toFixed(1)}
                        </span>
                      </div>
                      <h3 className="mt-3 flex items-center gap-2 font-poppins text-lg font-semibold text-text-on-ink">
                        {firm.name}
                        {firm.isPartner && (
                          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gold">
                            {tr("Ortak")}
                          </span>
                        )}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-text-on-ink-muted">
                        {firm.tagline}
                      </p>
                      <dl className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-text-on-ink-muted">{tr("Kâr payı")}</dt>
                          <dd className="text-text-on-ink">{firm.profitSplit}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-on-ink-muted">{tr("Giriş")}</dt>
                          <dd className="text-text-on-ink">{firm.challengeFeeFrom}</dd>
                        </div>
                      </dl>
                    </Link>
                  ))}
              </div>
            </Reveal>

            <Reveal className="mt-10 text-center">
              <Link
                href="/prop-firmalar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {trf("{count} firmanın tamamını karşılaştır →", { count: trData(propFirms).length })}
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Cashback lead capture */}
        <section className="bg-ink-soft">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mx-auto max-w-lg">
              <HeroCashbackForm />
            </div>
          </div>
        </section>

        <RegulatorBadges />

        {/* At-a-glance stats: what the site covers.

            These four are about our shelf rather than the reader's
            outcome, which is why they no longer open the page — the
            account strip in the hero does that. Down here, next to the
            ranking and the comparison table they describe, they are
            answering the question that section actually raises. */}
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <Reveal>
              <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
                {trData(inventoryStats).map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                      <AnimatedStat
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        <ShowcaseGallery />

        {/* Comparison table */}
        <section id="comparison" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Yan Yana
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                {tr("Karşılaştırma tablosu")}
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                {tr("Karar vermeden önce önemli rakamları tek bakışta görün.")}
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <ComparisonTable />
            </Reveal>
            <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-text-on-ink-muted">
              {tr("* Kaldıraç ve minimum depozit rakamları hesap türüne ve yatırımcının ülkesine göre değişebilir. İşlem yapmadan önce güncel koşulları broker’ın resmi web sitesinden doğrulayın.")}
            </p>
          </div>
        </section>

        {/* How to choose */}
        <section id="how-to-choose" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Rehber
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                {tr("Broker nasıl seçilir?")}
              </h2>
              <p className="mt-4 text-text-muted">
                {tr("Bu dört kriter, her broker profilinde")}{" "}
                <strong className="font-medium text-text-dark">FXPARTNER Endeksi</strong>{" "}
                {tr("olarak 0-10 arası puanlanır.")}
              </p>
            </Reveal>
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
              {trData(steps).map((step, i) => (
                <Reveal key={step.n} delay={i * 90} className="flex gap-5">
                  <span className="font-display text-3xl font-light text-signal">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-text-dark">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Account opening & withdrawal walkthrough */}
        <section id="guides" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                {tr("Adım Adım")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                {tr("Hesap açma ve ilk para çekme işleminiz")}
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                {tr("Yeni bir brokerla ilgili güven sorunlarının çoğu aynı iki anda belirlenir. İşte her birinde nelere dikkat etmeniz gerektiği.")}
              </p>
            </Reveal>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  {tr("Hesap açma")}
                </h3>
                <ol className="mt-4 space-y-4">
                  {trData(accountSteps).map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  {tr("İlk para çekme işleminiz")}
                </h3>
                <ol className="mt-4 space-y-4">
                  {trData(withdrawalSteps).map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Reveal delay={120} className="mt-12">
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                  {tr("Risk uyarısı")}
                </p>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-text-on-ink-muted">
                  {tr("Forex ticareti kaldıraçlıdır ve sermayenizi hızla kaybetme riski taşır. Kaybetmeyi göze alamayacağınızdan fazlasını asla yatırmayın ve yukarıdaki her adımı — KYC, ilk depozit, ilk para çekme — daha fazla fon yatırmadan önce bir test olarak değerlendirin.")}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <TradingVideo />

        {/* FAQ */}
        <section id="faq" className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal className="text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                {tr("SSS")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                {tr("Sıkça sorulan sorular")}
              </h2>
            </Reveal>
            <div className="mt-10 divide-y divide-hairline-light border-t border-hairline-light">
              {trData(faqs).map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium text-text-dark transition-colors group-open:text-signal">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        {/* The closing ask.

            The page has spent everything above this making one argument and
            never once asked for anything after the hero. This is the second
            and last ask, at the point where a reader who has gone all the way
            through the ranking, the guides and the FAQ has either been
            convinced or has not.

            Same rule as the hero's button: it sells the account, not the
            signals, because the signals are already free and saying otherwise
            here would undo the section directly above it. */}
        <section className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="hero-glow-signal pointer-events-none absolute left-1/2 top-0 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-signal/15 blur-[110px]"
          />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                {tr("Hazır mısın?")}
              </span>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 font-poppins text-2xl font-semibold uppercase leading-tight tracking-[-0.01em] text-text-on-ink md:text-3xl">
                {tr("İşlem açıldığı anda haberiniz olsun.")}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-text-on-ink-muted">
                {tr("Sinyalleri izlemek için hesaba gerek yok. Hesap; işlem açıldığı anda bildirim, cashback hesap bağlama ve kişisel işlem takibi için.")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link
                href="/account/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-8 py-4 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
              >
                {tr("Ücretsiz Üye Ol")}
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <Reveal delay={250}>
              <p className="mt-5 text-xs leading-relaxed text-text-on-ink-muted">
                {tr("Forex ticareti kaldıraçlıdır ve sermayenizi hızla kaybetme riski taşır. İçerik yatırım tavsiyesi değildir.")}
              </p>
            </Reveal>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
