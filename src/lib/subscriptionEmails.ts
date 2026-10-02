import { sendEmail } from "@/lib/email";

// The three subscription emails: a free month granted, a reminder before a
// paid period runs out, and a note once it has.
//
// Turkish only, like the checkout itself: /paketler sells in Turkish and
// the member records carry no language, so guessing one here would be a
// guess. Same table-and-inline-style shape as welcomeEmail.ts, for the same
// reason — mail clients are not browsers.
//
// Nothing here promises a result. The signals are a record of a real
// account, not a forecast, and the copy says what the package contains and
// when it ends — nothing about what the member will earn with it.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const LOGO = `${SITE}/fxpartner-logo.png`;

const INK = "#0b0c0e";
const INK_SOFT = "#17191c";
const HAIRLINE = "#232629";
const TEXT = "#f1f2f3";
const MUTED = "#9aa0a6";
const SIGNAL = "#22c55e";

// UTM-tagged so a renewal that comes from an email shows up as one in the
// subscription's attribution rather than as "direct".
function link(path: string, campaign: string): string {
  return `${SITE}${path}?utm_source=email&utm_medium=lifecycle&utm_campaign=${campaign}`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function tierName(tier: string | null): string {
  return tier === "vip" ? "VIP" : "Pro";
}

function layout(params: {
  preheader: string;
  heading: string;
  paragraphs: string[];
  cta: { label: string; href: string };
  footnote?: string;
}): string {
  const body = params.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;color:${MUTED};font-size:15px;line-height:1.6;">${p}</p>`
    )
    .join("");

  return `<!doctype html>
<html lang="tr">
<body style="margin:0;padding:0;background:${INK};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(params.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${INK_SOFT};border:1px solid ${HAIRLINE};border-radius:16px;">
        <tr><td style="padding:28px 28px 8px;">
          <img src="${LOGO}" alt="FXPARTNER" width="140" style="display:block;border:0;height:auto;" />
        </td></tr>
        <tr><td style="padding:16px 28px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
          <h1 style="margin:0 0 16px;color:${TEXT};font-size:22px;line-height:1.3;">${params.heading}</h1>
          ${body}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;">
            <tr><td style="border-radius:999px;background:${SIGNAL};">
              <a href="${params.cta.href}" style="display:inline-block;padding:13px 26px;color:${INK};font-size:15px;font-weight:700;text-decoration:none;">
                ${esc(params.cta.label)}
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;border-top:1px solid ${HAIRLINE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
          ${params.footnote ? `<p style="margin:0 0 10px;color:${MUTED};font-size:13px;line-height:1.5;">${params.footnote}</p>` : ""}
          <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.5;">
            Yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir; sermayenizin tamamını kaybedebilirsiniz.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function greeting(name: string | null | undefined): string {
  const first = name?.trim().split(/\s+/)[0];
  return first ? `Merhaba ${esc(first)},` : "Merhaba,";
}

export async function sendProTrialEmail(params: {
  to: string;
  name: string | null;
  tier: string | null;
  until: Date;
}) {
  const tier = tierName(params.tier);
  await sendEmail({
    to: params.to,
    subject: `Cashback hesabın doğrulandı — 1 ay ${tier} hesabına tanımlandı`,
    html: layout({
      preheader: `${formatDate(params.until)} tarihine kadar ${tier} erişimin açık.`,
      heading: `1 ay ${tier} hesabına tanımlandı`,
      paragraphs: [
        greeting(params.name),
        `Cashback hesabın doğrulandı. Teşekkür olarak hesabına <strong style="color:${TEXT};">30 günlük ${tier} erişimi</strong> tanımladık. Ödeme gerekmiyor, bir şey yapman da gerekmiyor.`,
        `Erişimin <strong style="color:${TEXT};">${formatDate(params.until)}</strong> tarihine kadar açık: GOLD, gümüş ve endeks sinyalleri, günlük teknik analiz ve Telegram VIP kanalı.`,
      ],
      cta: { label: "Sinyal panosuna git", href: link("/tr/signals", "cashback-pro-ay") },
      footnote: "Bu hediye her üyeye bir kez tanımlanır. Süre bitmeden önce sana hatırlatma göndereceğiz.",
    }),
  });
}

export async function sendRenewalReminderEmail(params: {
  to: string;
  name: string | null;
  tier: string | null;
  until: Date;
  daysLeft: number;
}) {
  const tier = tierName(params.tier);
  const when = params.daysLeft <= 1 ? "yarın" : `${params.daysLeft} gün sonra`;
  await sendEmail({
    to: params.to,
    subject: `${tier} paketin ${when} bitiyor`,
    html: layout({
      preheader: `${formatDate(params.until)} tarihinde erişimin kapanacak. 3 aylık pakette daha az ödüyorsun.`,
      heading: `${tier} paketin ${when} bitiyor`,
      paragraphs: [
        greeting(params.name),
        `${tier} erişimin <strong style="color:${TEXT};">${formatDate(params.until)}</strong> tarihinde sona eriyor. Kripto ödeme otomatik yenilenmediği için devam etmek istersen yenilemeyi senin yapman gerekiyor.`,
        `Şimdi yenilersen kalan günlerin kaybolmaz; yeni süre mevcut bitiş tarihinin üstüne eklenir. <strong style="color:${TEXT};">3 aylık paket</strong> üç ayrı aylık ödemeden daha ucuz.`,
      ],
      cta: { label: "Paketimi yenile", href: link("/tr/paketler", `yenileme-${params.daysLeft}g`) },
      footnote: "Yenilemek istemiyorsan bir şey yapmana gerek yok; hesabın ücretsiz katmanda açık kalır.",
    }),
  });
}

export async function sendLapsedEmail(params: { to: string; name: string | null; tier: string | null }) {
  const tier = tierName(params.tier);
  await sendEmail({
    to: params.to,
    subject: `${tier} erişimin sona erdi`,
    html: layout({
      preheader: "Hesabın ücretsiz katmanda açık. İstediğin zaman geri dönebilirsin.",
      heading: `${tier} erişimin sona erdi`,
      paragraphs: [
        greeting(params.name),
        `${tier} paketinin süresi doldu. Hesabın ve geçmişin yerinde; forex sinyalleri ve broker karşılaştırmaları ücretsiz katmanda açık kalmaya devam ediyor.`,
        `GOLD, endeks ve diğer ${tier} sinyallerine geri dönmek istersen paketini istediğin zaman yenileyebilirsin.`,
      ],
      cta: { label: "Paketleri gör", href: link("/tr/paketler", "sure-doldu") },
    }),
  });
}
