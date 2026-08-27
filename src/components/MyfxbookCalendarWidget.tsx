import { tr } from "@/lib/chrome";
import { getServerLocale } from "@/lib/serverLocale";
import type { Locale } from "@/lib/i18n";

// Myfxbook's economic calendar, embedded with its outbound traffic shut off
// at the owner's instruction.
//
// TWO SEPARATE LEAKS, AND ONLY ONE OF THEM IS OURS TO CLOSE IN MARKUP:
//
// 1. The embed snippet ships an attribution link to myfxbook.com carrying
//    utm_source=widget13. That link is our HTML, so it is simply not
//    rendered here. The credit line stays as plain text — the traffic is
//    what was asked to stop, and dropping the acknowledgement with it would
//    be taking their work and their name off it in one move.
//
// 2. Every row inside the frame is their document on their origin. Nothing
//    in our stylesheet or our script can reach into a cross-origin frame to
//    rewrite those anchors — that restriction is the browser's and it is not
//    negotiable. The lever that does exist is `sandbox`: withholding
//    allow-popups and allow-top-navigation means a click inside the widget
//    cannot open a tab and cannot navigate the page out from under the
//    reader. allow-scripts and allow-same-origin are granted because the
//    widget fetches its own data and stops rendering without them.
//
//    The honest consequence: clicks on links inside the widget now do
//    nothing at all. That is what closing the redirect means here — there is
//    no version where the link works but goes somewhere else.
const SANDBOX = "allow-scripts allow-same-origin";

// Medium and high impact only (2,3) — the same filter our own board applies,
// so the two views of the week do not disagree about what counts.
const IMPACTS = "2,3";
const SYMBOLS = "AUD,CAD,CHF,CNY,EUR,GBP,JPY,NZD,TRY,UAH,USD,ZAR";

// The widget takes its own language code. Ukrainian is not among the ones
// it offers, so that reader gets English rather than a Turkish table.
const WIDGET_LANG: Record<Locale, string> = {
  tr: "tr",
  en: "en",
  ua: "en",
  ar: "ar",
};

export default function MyfxbookCalendarWidget() {
  const locale = getServerLocale();
  const src =
    `https://widget.myfxbook.com/widget/calendar.html` +
    `?lang=${WIDGET_LANG[locale] ?? "en"}&impacts=${IMPACTS}&symbols=${SYMBOLS}`;

  return (
    <div>
      <div className="h-[620px] w-full overflow-hidden rounded-2xl border border-hairline">
        <iframe
          src={src}
          title={tr("Ekonomik Takvim — Myfxbook")}
          className="h-full w-full border-0"
          sandbox={SANDBOX}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-text-on-ink-muted">
        {tr("Takvim verisi: Myfxbook.com")}
      </p>
    </div>
  );
}
