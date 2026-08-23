"use client";

import Link from "@/components/LocaleLink";
import { useLocalePathname } from "@/components/useLocalePathname";
import { useMoreMenu } from "@/components/MoreMenuContext";
import { useTr } from "@/components/useTr";

const ICONS = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" />
  ),
  signals: <path d="M3 12h3l2.5-7 4 14 2.5-9L17 12h4" />,
  markets: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  // Prop / funded account: kalkan + yükselen çizgi — "sermaye emanet edildi"
  prop: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z" />
      <path d="M9 12.5l2 2 4-4.5" />
    </>
  ),
  analysis: <path d="m3 17 5-5 4 4 8-9M14 7h6v6" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
} as const;

function TabIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNavClient({ accountHref }: { accountHref: string }) {
  const pathname = useLocalePathname();
  const { open: moreOpen, setOpen: setMoreOpen } = useMoreMenu();
  const tr = useTr();

  const tabs: { href: string; label: string; icon: keyof typeof ICONS }[] = [
    { href: "/", label: "Anasayfa", icon: "home" },
    { href: "/signals", label: "Sinyaller", icon: "signals" },
    // Prop firmalar ana dikey oldu (19.08.2026). Şerit 6 sütunda kalsın diye
    // "Piyasalar" (/piyasa-analizi) buradan çıkarıldı — 7. sütun 360px'lik bir
    // ekranda etiketleri kırıyor. /piyasa-analizi hâlâ üst menüdeki Kaynaklar
    // grubunda ve "Daha Fazla" menüsünde erişilebilir. Geri almak için bu
    // satırı /piyasa-analizi + icon "markets" ile değiştirmek yeterli.
    { href: "/prop-firmalar", label: "Prop", icon: "prop" },
    { href: "/ai-asistan", label: "Analiz", icon: "analysis" },
    { href: accountHref, label: "Profil", icon: "profile" },
  ];

  return (
    <nav
      aria-label={tr("Mobil gezinme")}
      className="grid grid-cols-6 border-t border-hairline bg-ink pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              active ? "text-signal" : "text-text-on-ink-muted"
            }`}
          >
            <TabIcon name={tab.icon} />
            {tr(tab.label)}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setMoreOpen(!moreOpen)}
        aria-expanded={moreOpen}
        className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
          moreOpen ? "text-signal" : "text-text-on-ink-muted"
        }`}
      >
        <TabIcon name="more" />
        {tr("Daha Fazla")}
      </button>
    </nav>
  );
}
