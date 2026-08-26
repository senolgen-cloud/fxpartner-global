import Link from "@/components/LocaleLink";
import { tr, trf } from "@/lib/chrome";
import { getRecentSignalStats } from "@/lib/signalStats";
import { formatPercent } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import LocaleSwitcher from "@/components/LocaleSwitcher";

/**
 * The screen behind /account/login and /account/register.
 *
 * Reshaped against the TIO Markets app screens: one screen, one job,
 * everything else off. It used to be a two-column card sitting under the
 * full site — sticky header, broker carousel, tab bar, price tape, chat
 * bubble on the button — and a left panel carrying three bullets, a broker
 * count and a disclaimer before the reader reached the field. ChromeGate
 * takes the furniture away; this takes the essay away.
 *
 * What the reference does well and is worth taking: an enormous headline,
 * room around it, and the action anchored at the bottom of the screen where
 * a thumb already is, with the cross-link beside it rather than buried.
 *
 * What is not taken: their orange, and the whole password apparatus — field,
 * strength meter, "1 büyük harf" chips. This site signs in by emailed link.
 * Copying the furniture of a password form onto a form with no password
 * would be dressing up as a different product.
 *
 * No watermark. The reference has one on its splash screen, where there is
 * nothing else, and none on its login screen — and this screen is the
 * second kind: eyebrow, headline, intro, two fields, submit, proof line,
 * footer and disclaimer, with no empty space for a mark to fill. Faded, the
 * artwork vanished into the black; blended, it put the FX badge behind the
 * eyebrow; pushed off the top, it read as a smudge rather than a mark. Three
 * attempts to make it earn a place it does not have.
 *
 * The proof is one line now instead of a panel. The hit rate is the only
 * number that argues for making an account, it is real, and it comes from
 * the same table /signals renders. Three bullets underneath it were the
 * accessory to take off.
 */
export default async function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const stats = await getRecentSignalStats("all", 30);
  const locale = getServerLocale();

  return (
    <main className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden bg-ink text-text-on-ink">
      {/* flex-1, not a second min-h-[100dvh]: the main already claims the
          viewport, and repeating it here added this element's own padding on
          top of a full screen — 96px of scroll on a screen designed to have
          none. */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-6 sm:px-8">
        {/* Top bar: a way back and a way to read this in your own language.
            Nothing else — every other link is a way to leave. */}
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link
            href="/"
            className="-ms-1 whitespace-nowrap rounded-full px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-on-ink-muted transition-colors hover:text-text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {tr("← Ana sayfa")}
          </Link>
          <LocaleSwitcher compact />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-7 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            {eyebrow}
          </span>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,9vw,3.25rem)] font-semibold leading-[1.05] tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-on-ink-muted">{intro}</p>

          {children}

          {/* One line, and only when it is true. getRecentSignalStats returns
              null below a meaningful sample, and an absent number is better
              than a padded one on the page that asks for trust. */}
          {stats && (
            <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 border-t border-hairline pt-4 text-[13px] leading-snug text-text-on-ink-muted">
              <span className="font-display text-lg font-semibold tabular-stat text-text-on-ink">
                {formatPercent(stats.winRate, locale)}
              </span>
              <span>
                {trf("isabet — son {days} günde kapanan {trades} gerçek işlemde", {
                  days: stats.windowDays,
                  trades: stats.trades,
                })}
              </span>
            </p>
          )}
        </div>

        {/* Anchored to the bottom of the screen, where the thumb is. */}
        <div className="mx-auto w-full max-w-md">
          <div className="text-center text-[13px] leading-relaxed text-text-on-ink-muted">{footer}</div>
          <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-text-on-ink-muted/60">
            {tr("FXPARTNER bir aracı kurum değildir ve yatırım hizmeti sunmaz. İçerikler eğitim ve bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.")}
          </p>
        </div>
      </div>
    </main>
  );
}
