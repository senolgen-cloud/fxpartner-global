import Link from "next/link";

// Shared VIP upsell CTA — used on /signals (dark theme) and broker review
// pages (light theme). Points at this site's own /paketler checkout — the
// single real membership system (NOWPayments, this site's users/
// vipSubscriptions tables). Previously linked out to fxpartner-vip, a
// separate companion app that used to run its own duplicate signup +
// checkout; that caused members to register in a system this site's own
// records never saw, with no way to reconcile who'd actually paid. Fixed
// 2026-08-17 — fxpartner-vip is now a companion PWA for already-active
// members only, not a second checkout funnel.
export default function VipCtaBanner({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "rounded-2xl border border-gold/30 bg-gradient-to-br from-ink-soft to-ink p-8 text-center sm:p-10"
          : "rounded-2xl border border-gold/25 bg-gold/5 p-8 text-center sm:p-10"
      }
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold">FXPARTNER VIP</span>
      <h2
        className={
          isDark
            ? "mt-3 font-display text-2xl font-semibold text-text-on-ink sm:text-3xl"
            : "mt-3 font-display text-2xl font-semibold text-text-dark sm:text-3xl"
        }
      >
        Tüm sinyalleri anlık gör, AI piyasa asistanına sor
      </h2>
      <p
        className={
          isDark
            ? "mx-auto mt-3 max-w-xl text-sm text-text-on-ink-muted sm:text-base"
            : "mx-auto mt-3 max-w-xl text-sm text-text-dark/70 sm:text-base"
        }
      >
        Her sinyal açılır açılmaz bildirim al, geçmiş performansın tamamına eriş ve piyasa sorularını 7/24 AI
        asistana sor.
      </p>
      <Link
        href="/paketler"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 font-semibold text-ink transition hover:brightness-110"
      >
        VIP&apos;e Katıl
      </Link>
    </div>
  );
}
