"use client";
import { useTr } from "@/components/useTr";

import { useState } from "react";
import Link from "@/components/LocaleLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocaleMenu from "@/components/LocaleMenu";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import { useMoreMenu } from "@/components/MoreMenuContext";
import { useLocale } from "@/components/LocaleProvider";
import { localePath } from "@/lib/i18n";
import { brokers } from "@/data/brokers";

// The 4 highest-ranked partner brokers, shown as a horizontal ad slider at
// the top of the menu — same BrokerAdBanner used elsewhere (blog posts,
// broker pages), so it already carries the "Sponsorlu" disclosure and
// falls back to a logo/tagline/CTA card for any of the four that doesn't
// have a designed adImage yet.
const topAdvertisers = [...brokers].sort((a, b) => a.rank - b.rank).slice(0, 4);

type IconName =
  | "signal"
  | "ai"
  | "ranking"
  | "package"
  | "copy"
  | "calendar"
  | "chart"
  | "search"
  | "category"
  | "cashback"
  | "campaign"
  | "partner"
  | "community"
  | "blog"
  | "complaint"
  | "warning"
  | "info"
  | "account"
  | "register";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function MenuIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    signal: <path d="M3 12h3l2.5-7 4 14 2.5-9L17 12h4" />,
    ai: (
      <>
        <path d="M9 3.5A2.5 2.5 0 0 1 11.5 6v.2A2.5 2.5 0 0 1 14 9v.3a2.6 2.6 0 0 1 2 2.5 2.6 2.6 0 0 1-1.4 2.3 2.6 2.6 0 0 1-2.4 3.6H12a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 9 3.5Z" />
        <path d="M9 6.2a2.5 2.5 0 0 0-4.4 1.6A2.6 2.6 0 0 0 3 10.3a2.6 2.6 0 0 0 1.5 2.4A2.6 2.6 0 0 0 7 16.3h2" />
      </>
    ),
    ranking: (
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6L12 2z" />
    ),
    package: <path d="M12 2 3 6.5v11L12 22l9-4.5v-11L12 2Zm0 0v20M3 6.5 12 11l9-4.5" />,
    copy: <path d="M4 7h11l-3-3M20 17H9l3 3" />,
    calendar: (
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
      </>
    ),
    chart: <path d="m3 17 5-5 4 4 8-9M14 7h6v6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20 16 16" />
      </>
    ),
    category: <path d="M4 20V10M11 20V4M18 20v-7" />,
    cashback: (
      <>
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M3 8V6.5A1.5 1.5 0 0 1 4.5 5H16l4 3M12 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      </>
    ),
    campaign: <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Zm14-3a5 5 0 0 1 0 8m2.5-11a9 9 0 0 1 0 14" />,
    partner: (
      <>
        <circle cx="8.5" cy="8.5" r="2.8" />
        <circle cx="16" cy="9.5" r="2.2" />
        <path d="M3 19c.5-3 2.7-4.8 5.5-4.8S13.5 16 14 19" />
        <path d="M14.5 14.5c2.3.2 4 1.8 4.5 4.5" />
      </>
    ),
    community: (
      <>
        <circle cx="8.5" cy="8.5" r="2.8" />
        <circle cx="16" cy="9.5" r="2.2" />
        <path d="M3 19c.5-3 2.7-4.8 5.5-4.8S13.5 16 14 19" />
        <path d="M14.5 14.5c2.3.2 4 1.8 4.5 4.5" />
      </>
    ),
    blog: <path d="M5 4h11l3 3v13H5V4Zm3 5h8M8 12h8M8 15h5" />,
    complaint: (
      <>
        <path d="M12 9v4M12 16.5h.01" />
        <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z" />
        <path d="M12 8v4.5M12 15.5h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 7.6h.01" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </>
    ),
    // The same person with a plus — the glyph the desktop bar uses for
    // sign-up, so one action does not have two drawings.
    register: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2 20c0-3.3 3.1-6 7-6 1.2 0 2.3.25 3.3.7" />
        <path d="M18 14v6M15 17h6" />
      </>
    ),
  };
  return (
    <svg {...iconProps} className="h-5 w-5">
      {paths[name]}
    </svg>
  );
}

type MenuLink = { href: string; label: string; icon: IconName };

type Group = { key: string; label: string; links: MenuLink[] };

// Real pages, grouped for the icon-grid layout — same destinations as
// primaryLinks/resourceLinks (src/lib/navLinks.ts) elsewhere in the header,
// just organized as tabs+cards instead of a flat list.
const GROUPS: Group[] = [
  {
    key: "popular",
    label: "Popüler",
    links: [
      { href: "/signals", label: "Sinyaller", icon: "signal" },
      { href: "/ai-asistan", label: "AI Asistan", icon: "ai" },
      { href: "/brokerlar", label: "Broker Sıralaması", icon: "ranking" },
      { href: "/paketler", label: "Paketler", icon: "package" },
      { href: "/copytrade", label: "Copytrade", icon: "copy" },
      { href: "/topluluk", label: "Topluluk", icon: "community" },
    ],
  },
  {
    key: "tools",
    label: "Araçlar",
    links: [
      { href: "/ekonomik-takvim", label: "Ekonomik Takvim", icon: "calendar" },
      { href: "/teknik-analiz", label: "Teknik Analiz", icon: "chart" },
      { href: "/piyasa-analizi", label: "Piyasa Analizi", icon: "chart" },
      { href: "/haber-bulteni", label: "Haber Bülteni", icon: "blog" },
      { href: "/broker-lookup", label: "Broker Sorgula", icon: "search" },
      { href: "/categories", label: "Kategoriler", icon: "category" },
    ],
  },
  {
    key: "earn",
    label: "Kazanç",
    links: [
      { href: "/cashback", label: "Cashback", icon: "cashback" },
      { href: "/campaigns", label: "Kampanyalar", icon: "campaign" },
      { href: "/partners", label: "Partner Ol", icon: "partner" },
    ],
  },
  {
    key: "support",
    label: "Destek",
    links: [
      { href: "/blog", label: "Blog", icon: "blog" },
      { href: "/blacklist", label: "Risk Uyarıları", icon: "warning" },
      { href: "/complaint", label: "Şikayet Bildir", icon: "complaint" },
      { href: "/about", label: "Hakkımızda", icon: "info" },
    ],
  },
];

// Full-screen menu, opened from either HeaderNav's tablet-width hamburger
// or MobileBottomNav's "Daha Fazla" tab (phone width) — see
// MoreMenuContext for why this needs to live outside either of those. The
// component itself is mounted at the top level in layout.tsx (not nested
// inside the sticky header), so its z-index isn't trapped inside a lower
// stacking context than the fixed mobile bottom nav/ticker.
export default function MoreMenuOverlay({
  signedIn,
  accountHref,
}: {
  signedIn: boolean;
  accountHref: string;
}) {
  const tr = useTr();
  const { open, setOpen } = useMoreMenu();
  const locale = useLocale();
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].key);

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  const active = GROUPS.find((g) => g.key === activeGroup) ?? GROUPS[0];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-text-on-ink motion-safe:animate-[fadeIn_0.15s_ease-out]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-4 md:h-16 md:px-6">
        <span className="font-display text-lg font-semibold">{tr("Daha Fazla")}</span>
        <div className="flex items-center gap-2">
          <Link
            href={accountHref}
            onClick={close}
            aria-label={signedIn ? tr("Hesabım") : tr("Giriş Yap")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
          >
            <MenuIcon name="account" />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label={tr("Menüyü kapat")}
            className="flex h-9 w-9 items-center justify-center text-text-on-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Partner ad slider — horizontal, snap-scroll, each card peeking
            the next so it reads as swipeable. */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-5 pb-1 md:px-6">
          {topAdvertisers.map((broker) => (
            <div key={broker.slug} className="w-[85%] shrink-0 snap-start sm:w-[360px]">
              <BrokerAdBanner broker={broker} />
            </div>
          ))}
        </div>

        <div className="px-4 pt-5 md:px-6">
          {/* Two controls that look alike and are not.
              LocaleMenu moves between the four trees the site is actually
              written in; LanguageSwitcher hands the page to Google Translate
              for everything else. Swapping the four locale chips for the
              desktop dropdown made them identical globes stacked on top of
              each other, which is worse than the mismatch it fixed — so
              each now says which it is. A reader deserves to know which one
              gives them a page someone wrote and which gives them a machine
              rendering of it. */}
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div>
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Site dili")}
              </span>
              <div className="inline-flex rounded-lg border border-hairline">
                <LocaleMenu />
              </div>
            </div>
            <div>
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Otomatik çeviri")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-1 md:px-6">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActiveGroup(g.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeGroup === g.key
                  ? "bg-text-on-ink text-ink"
                  : "bg-ink-soft text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {tr(g.label)}
            </button>
          ))}
        </div>

        {/* Icon grid for the active category */}
        <div className="px-4 py-6 md:px-6">
          <h2 className="mb-3 font-display text-xl font-semibold">{tr(active.label)}</h2>
          <div className="grid grid-cols-3 gap-3">
            {active.links.map((link, i) => (
              <a
                key={link.href}
                href={localePath(locale, link.href)}
                onClick={close}
                style={{ animationDelay: `${i * 30}ms` }}
                className="menu-item-in flex flex-col items-center gap-2 rounded-2xl bg-ink-soft px-2 py-4 text-center transition-colors hover:bg-ink-soft/70"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-signal">
                  <MenuIcon name={link.icon} />
                </span>
                <span className="text-xs font-medium leading-tight text-text-on-ink">{tr(link.label)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Same pair as the desktop bar: icon, white label, and the board's
            buy-and-sell colour as a stripe on the leading edge rather than
            a ring. Sign-in used to be muted grey text and sign-up a signal-
            coloured link — two different weights for two halves of one
            choice.

            The "Broker Karşılaştır" pill that filled the foot of this menu
            is gone for the reason it went from the header: it pointed at
            /brokerlar, which is already the third card in the Popüler grid
            a thumb's width above it. */}
        <div className="mt-2 border-t border-hairline px-4 py-6 md:px-6">
          {signedIn ? (
            <Link
              href={accountHref}
              onClick={close}
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border-s-[3px] border-s-tick-up bg-ink-soft/70 px-4 text-sm font-semibold text-text-on-ink transition-colors hover:bg-ink-soft"
            >
              <MenuIcon name="account" />
              {tr("Hesabım")}
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/account/login"
                onClick={close}
                className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-s-[3px] border-s-tick-up bg-ink-soft/70 px-4 text-sm font-semibold text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                <MenuIcon name="account" />
                {tr("Giriş Yap")}
              </Link>
              <Link
                href="/account/register"
                onClick={close}
                className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-s-[3px] border-s-tick-down bg-ink-soft/70 px-4 text-sm font-semibold text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                <MenuIcon name="register" />
                {tr("Üye Ol")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
