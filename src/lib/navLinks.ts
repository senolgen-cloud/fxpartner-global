// Shared between HeaderNav (desktop bar + tablet dropdown) and
// MoreMenuOverlay (the full-screen menu opened from the tablet hamburger
// or the mobile bottom nav's "Daha Fazla" tab) so both always list the
// same set of pages instead of drifting out of sync.
export const primaryLinks = [
  { href: "/brokerlar", label: "Broker Sıralaması" },
  { href: "/prop-firmalar", label: "Prop Firmalar" },
  { href: "/signals", label: "Sinyaller" },
  { href: "/ai-asistan", label: "AI Asistan" },
];

export type ResourceGroup = "İçerik" | "Kazanç Programları" | "Araçlar ve Güven";

export const resourceLinks: {
  href: string;
  label: string;
  description: string;
  group: ResourceGroup;
}[] = [
  {
    href: "/blog",
    label: "Blog",
    description: "Rehberler, broker incelemeleri ve piyasa yazıları",
    group: "İçerik",
  },
  {
    href: "/topluluk",
    label: "Topluluk",
    description: "FXPARTNER topluluğu, tartışmalar ve paylaşılan işlemler",
    group: "İçerik",
  },
  {
    href: "/piyasa-analizi",
    label: "Piyasa Analizi",
    description: "Günlük piyasa yorumu ve teknik görünüm",
    group: "İçerik",
  },
  {
    href: "/teknik-analiz",
    label: "Teknik Analiz",
    description: "Pivot seviyeleri, destek/direnç ve RSI/MACD görünümü",
    group: "İçerik",
  },
  {
    href: "/haber-bulteni",
    label: "Haber Bülteni",
    description: "Günü hareket ettiren başlıkların özgün günlük özeti",
    group: "İçerik",
  },
  {
    href: "/ekonomik-takvim",
    label: "Ekonomik Takvim",
    description: "Canlı makro olaylar ve beklenen piyasa etkileri",
    group: "İçerik",
  },
  {
    href: "/paketler",
    label: "Paketler",
    description: "Ücretsiz, Pro ve VIP üyelik paketleri",
    group: "Kazanç Programları",
  },
  {
    href: "/cashback",
    label: "Cashback",
    description: "Partner brokerlardan komisyon iade programları",
    group: "Kazanç Programları",
  },
  {
    href: "/campaigns",
    label: "Kampanyalar",
    description: "Aktif referans ve yatırım promosyonları",
    group: "Kazanç Programları",
  },
  {
    href: "/partners",
    label: "Ortak Olun",
    description: "Bir Alt-IB hesabı açın ve yönlendirdiğiniz müşterilerden kazanın",
    group: "Kazanç Programları",
  },
  {
    href: "/copytrade",
    label: "Copytrade",
    description: "FXPARTNER'ın takip edilen işlemlerini kendi MT5 hesabınıza otomatik kopyalayın",
    group: "Kazanç Programları",
  },
  {
    href: "/broker-lookup",
    label: "Broker Sorgulama",
    description: "Herhangi bir brokerı kaynaklı bir güven değerlendirmesi için arayın",
    group: "Araçlar ve Güven",
  },
  {
    href: "/pozisyon-hesaplayici",
    label: "Pozisyon Hesaplayıcı",
    description: "Risk seviyenize göre doğru lot büyüklüğünü hesaplayın",
    group: "Araçlar ve Güven",
  },
  {
    href: "/categories",
    label: "Kategoriler",
    description: "Brokerlar en uygun oldukları alana göre gruplandırıldı",
    group: "Araçlar ve Güven",
  },
  {
    href: "/blacklist",
    label: "Risk Uyarıları",
    description: "Ekstra durum tespiti gerektiren brokerlar",
    group: "Araçlar ve Güven",
  },
  {
    href: "/complaint",
    label: "Şikayet",
    description: "Bir brokerla ilgili sorun bildirin",
    group: "Araçlar ve Güven",
  },
  {
    href: "/about",
    label: "Hakkımızda",
    description: "Kim olduğumuz, ilkelerimiz ve ortaklıkların nasıl işlediği",
    group: "Araçlar ve Güven",
  },
];
