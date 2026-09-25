import { tr } from "@/lib/chrome";

// "Broker'ınızı göremiyor musunuz?" — the broker list's closing invitation.
//
// The list covers 24 brokers and every visitor whose broker is not one of
// them currently reaches the bottom of the page and leaves. This turns that
// dead end into the one thing we actually want from them: which broker they
// trade with. That answer feeds the partnership pipeline, so the copy says
// so plainly rather than pretending it is a feature request form.
//
// The button goes somewhere real. There is no contact form on this site, so
// it opens a mail to the published address with the subject already written
// — a dead "Öner" button that goes nowhere would be worse than no section —
// and Telegram sits under it for people who would rather not send mail.
// Both destinations are ones the site already publishes (Footer).
export default function SuggestBrokerCta() {
  const subject = tr("Broker önerisi");
  const body = tr("Hangi brokerla işlem yapıyorsunuz? Broker adı ve varsa hesap türünüzü yazmanız yeterli.");

  return (
    <section className="border-t border-hairline bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="grid gap-8 rounded-2xl border border-signal/25 bg-gradient-to-br from-signal/[0.08] to-transparent p-7 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 text-signal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                  <path d="M16.5 7.5a3 3 0 0 1 0 5.5" />
                  <path d="M18 19c0-2.2-1-3.8-2.5-4.6" />
                </svg>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal">
                {tr("Toplulukla güçlendirilmiş")}
              </span>
            </div>

            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-text-on-ink md:text-4xl">
              {tr("Broker'ınızı göremiyor musunuz?")}
              <br className="hidden sm:block" />
              <span className="text-signal">{tr("Bir tane önerin.")}</span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-on-ink-muted">
              {tr("Broker ağımızı yatırımcı talebine göre genişletiyoruz. Kiminle işlem yaptığınızı söyleyin, listeye almak için inceleyelim.")}
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-ink-soft/70 p-6 text-center md:p-7">
            <h3 className="font-display text-lg font-semibold text-text-on-ink md:text-xl">
              {tr("Hangi brokerı eklemeliyiz?")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
              {tr("Öneriniz doğrudan ekibimize ulaşır ve bir sonraki ortaklık görüşmelerimizi şekillendirir.")}
            </p>
            <a
              href={`mailto:info@fxpartner.global?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-signal px-6 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
            >
              {tr("Broker Öner")}
              <span aria-hidden="true">→</span>
            </a>
            <p className="mt-3 text-xs text-text-on-ink-muted">
              {tr("ya da Telegram'dan yazın:")}{" "}
              <a
                href="https://t.me/fxpartnerglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal transition-colors hover:text-text-on-ink"
              >
                @fxpartnerglobal
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
