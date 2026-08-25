import { brokers } from "@/data/brokers";
import { localizeBrokers } from "@/lib/localizeContent";
import { translateChrome } from "@/lib/chrome";
import { defaultLocale, type Locale } from "@/lib/i18n";

// The sign-in email.
//
// Auth.js ships a plain unbranded default: one line of text and a bare link.
// It is the first thing a new member ever receives from us and, for a
// magic-link site, it is also the only thing standing between them and their
// account — so it has to look like it came from us and it has to make the
// button obvious.
//
// Written as a table-based HTML string rather than with a component library
// because mail clients are not browsers: Outlook has no flexbox and no grid,
// Gmail strips <style> blocks in some views, and dark mode inverts colours it
// was not told about. Tables and inline styles are the only things that
// render the same everywhere.
//
// Everything below the button is there to answer "what do I get?" while the
// reader is already looking — the five brokers we rank highest, the signal
// tiers, and the one setting (notifications) that decides whether they ever
// come back.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

// Absolute, because a mail client has no page to resolve a relative path
// against, and Gmail proxies images through its own cache either way.
const LOGO = `${SITE}/fxpartner-logo.png`;

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT = "#f1f2f3";
const MUTED = "#9aa0a6";
const SIGNAL = "#22c55e";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brokerRows(locale: Locale): string {
  // The same ranking the site shows, not a hand-kept list that would drift
  // out of step with /brokerlar the first time an order changed.
  const top = localizeBrokers([...brokers], locale)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return top
    .map(
      (b) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};">
            <a href="${SITE}/brokers/${b.slug}" style="color:${TEXT};text-decoration:none;font-size:15px;font-weight:600;">
              ${esc(b.name)}
            </a>
            <div style="color:${MUTED};font-size:13px;line-height:1.5;margin-top:2px;">
              ${esc(b.tagline)}
            </div>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};white-space:nowrap;vertical-align:top;">
            <span style="color:${SIGNAL};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">
              #${String(b.rank).padStart(2, "0")}
            </span>
          </td>
        </tr>`
    )
    .join("");
}

/**
 * The magic-link email, in the reader's language.
 *
 * `url` is the one-time sign-in link Auth.js generated. It is never shortened
 * or wrapped in a tracker: a link that does not visibly go to fxpartner.global
 * is the exact shape of a phishing mail, and this is the message we most need
 * a reader to trust.
 */
export function welcomeEmailHtml(url: string, locale: Locale = defaultLocale): string {
  const t = (text: string) => esc(translateChrome(locale, text));

  return `<!doctype html>
<html lang="${locale === "ua" ? "uk" : locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${t("FXPARTNER'a giriş")}</title>
</head>
<body style="margin:0;padding:0;background:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${INK_SOFT};border:1px solid ${HAIRLINE};border-radius:20px;">

      <tr><td style="padding:32px 32px 0;">
        <img src="${LOGO}" alt="FXPARTNER" width="150" style="display:block;border:0;height:auto;">
      </td></tr>

      <tr><td style="padding:24px 32px 0;">
        <h1 style="margin:0;color:${TEXT};font-family:Helvetica,Arial,sans-serif;font-size:24px;line-height:1.25;font-weight:600;">
          ${t("Hoş geldiniz.")}
        </h1>
        <p style="margin:12px 0 0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">
          ${t("Girmek için aşağıdaki butona dokunun. Bağlantı 24 saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz — hiçbir şey olmaz.")}
        </p>
      </td></tr>

      <tr><td style="padding:24px 32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td style="background:${SIGNAL};border-radius:999px;">
            <a href="${url}" style="display:inline-block;padding:14px 32px;color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">
              ${t("Giriş yap ve doğrula")}
            </a>
          </td></tr>
        </table>
        <p style="margin:14px 0 0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;word-break:break-all;">
          ${t("Buton çalışmazsa bu adresi tarayıcınıza yapıştırın:")}<br>
          <a href="${url}" style="color:${SIGNAL};text-decoration:none;">${esc(url)}</a>
        </p>
      </td></tr>

      <tr><td style="padding:32px 32px 0;">
        <div style="border-top:1px solid ${HAIRLINE};padding-top:24px;">
          <span style="color:${MUTED};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">
            ${t("En yüksek puanlı 5 broker")}
          </span>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            ${brokerRows(locale)}
          </table>
        </div>
      </td></tr>

      <tr><td style="padding:24px 32px 0;">
        <div style="border:1px solid ${HAIRLINE};border-radius:14px;padding:18px;">
          <div style="color:${TEXT};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;">
            ${t("Sinyal paketleri")}
          </div>
          <p style="margin:6px 0 0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;">
            ${t("Ücretsiz katmanda FX sinyalleri açık. Pro’da GOLD, gümüş ve endeksler, VIP’te CopyTrade ve özel analizler açılır.")}
          </p>
          <a href="${SITE}/paketler" style="display:inline-block;margin-top:10px;color:${SIGNAL};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;">
            ${t("Paketleri karşılaştır →")}
          </a>
        </div>
      </td></tr>

      <tr><td style="padding:16px 32px 0;">
        <div style="border:1px solid ${HAIRLINE};border-radius:14px;padding:18px;">
          <div style="color:${TEXT};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;">
            ${t("Bildirimleri açın")}
          </div>
          <p style="margin:6px 0 0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;">
            ${t("Bir sinyal açıldığında ve kapandığında haberiniz olsun. Girdikten sonra tarayıcı bildirimlerine izin vermeniz yeterli — uygulamayı ana ekranınıza da ekleyebilirsiniz.")}
          </p>
          <a href="${SITE}/kurulum" style="display:inline-block;margin-top:10px;color:${SIGNAL};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;">
            ${t("Uygulamayı yükle →")}
          </a>
        </div>
      </td></tr>

      <tr><td style="padding:28px 32px 32px;">
        <p style="margin:0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;">
          ${t("FXPARTNER bir aracı kurum değildir ve yatırım tavsiyesi vermez; içerikler eğitim amaçlıdır. Aracı kurumlarda kaldıraçlı işlem yapmak yüksek risk taşır ve sermayenizin tamamını kaybetmenize yol açabilir.")}
        </p>
        <p style="margin:10px 0 0;color:${MUTED};font-family:Helvetica,Arial,sans-serif;font-size:11px;">
          <a href="${SITE}" style="color:${MUTED};text-decoration:none;">fxpartner.global</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Plain-text alternative, for clients that refuse HTML. */
export function welcomeEmailText(url: string, locale: Locale = defaultLocale): string {
  const t = (text: string) => translateChrome(locale, text);
  return [
    t("Hoş geldiniz."),
    "",
    t("Girmek için bu bağlantıyı açın (24 saat geçerli, tek kullanımlık):"),
    url,
    "",
    t("Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."),
    "",
    "fxpartner.global",
  ].join("\n");
}
