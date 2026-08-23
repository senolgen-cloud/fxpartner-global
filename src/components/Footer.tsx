import Image from "next/image";
import SignalsPromoBanner from "@/components/SignalsPromoBanner";
import { tr } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import { brokers } from "@/data/brokers";
import NewsletterSignup from "@/components/NewsletterSignup";
import ShareButtons from "@/components/ShareButtons";

export default function Footer({
  // The signals page is the one route that should not advertise the signals
  // page. Decided by the caller rather than read from the pathname: Footer
  // is a server component, and a client-side pathname check has to render
  // once before it can hide anything.
  showSignalsPromo = true,
}: {
  showSignalsPromo?: boolean;
} = {}) {
  return (
    <footer className="border-t border-hairline bg-ink text-text-on-ink-muted">
      {/* Sitewide signals banner, here for the same reason the share row is:
          every route renders <Footer />, so a new page gets it without
          anyone remembering to add it. Renders nothing on /signals itself. */}
      {showSignalsPromo && <SignalsPromoBanner />}
      {/* Sitewide share row. Lives here rather than on each page because
          every route renders <Footer /> — so a new page gets the buttons
          without anyone remembering to add them. No title prop: the
          instance is shared by all routes and reads the page's own
          document.title / meta description at click time. */}
      <div className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <ShareButtons tone="dark" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Image
              src="/fxpartner-logo.png"
              alt="FXPARTNER"
              width={900}
              height={232}
              className="h-9 w-auto"
            />
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              {tr("Forex brokerlarını regülasyon, maliyet ve platform desteğine göre karşılaştıran bir inceleme kaynağı. Yatırım tavsiyesi değildir.")}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              {tr("Erdem Torun tarafından kurulan FXPARTNER eğitim ve CopyTrade ekosisteminin bir parçasıdır.")}
            </p>
            {/* Certificate-of-incorporation link disabled 2026-08-17: the
                actual scan (public/legal/fxpartner-certificate-of-
                incorporation.jpg) was never uploaded, so this pointed at a
                dead link/section. Re-enable once the real file exists —
                see /about's "Legal registration" section, also disabled. */}
            <div className="mt-6 max-w-sm">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
                {tr("E-posta ile güncellemeler alın")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                {tr("Yeni sinyaller, piyasa analizleri ve broker kampanyaları — spam yok.")}
              </p>
              <div className="mt-3">
                <NewsletterSignup source="footer" />
              </div>
            </div>

            {/* Official channels only — these mirror organizationSchema()'s
                sameAs list, so a crawler (or a platform reviewing the
                account) can verify site and profile point at each other. */}
            <div className="mt-8">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
                {tr("Bizi takip edin")}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/fxpartner_global/"
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="FXPARTNER Instagram — @fxpartner_global"
                  title="@fxpartner_global"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/fxpartnerglobal"
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="FXPARTNER Telegram — @fxpartnerglobal"
                  title="@fxpartnerglobal"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/fxpartner_TR"
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="FXPARTNER X (Twitter) — @fxpartner_TR"
                  title="@fxpartner_TR"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              {tr("Broker İncelemeleri")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {brokers.slice(0, 5).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brokers/${b.slug}`}
                    title={`${b.name} incelemesi`}
                    className="transition-colors hover:text-text-on-ink"
                  >
                    <span className="notranslate">{b.name} </span>{tr("İncelemesi")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              {tr("Kaynaklar")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-text-on-ink">
                  {tr("Hakkımızda")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition-colors hover:text-text-on-ink">
                  Broker Kategorileri
                </Link>
              </li>
              <li>
                <Link
                  href="/raporlar/forex-broker-duzenleme-raporu"
                  className="transition-colors hover:text-text-on-ink"
                >
                  {tr("Regülasyon Raporu")}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="transition-colors hover:text-text-on-ink">
                  Ortak Olun
                </Link>
              </li>
              <li>
                <Link href="/copytrade" className="transition-colors hover:text-text-on-ink">
                  Copytrade
                </Link>
              </li>
              <li>
                <Link href="/cashback" className="transition-colors hover:text-text-on-ink">
                  Cashback
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="transition-colors hover:text-text-on-ink">
                  Kampanyalar
                </Link>
              </li>
              <li>
                <Link href="/paketler" className="transition-colors hover:text-text-on-ink">
                  Paketler
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-text-on-ink">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/piyasa-analizi" className="transition-colors hover:text-text-on-ink">
                  Piyasa Analizi
                </Link>
              </li>
              <li>
                <Link href="/haber-bulteni" className="transition-colors hover:text-text-on-ink">
                  {tr("Haber Bülteni")}
                </Link>
              </li>
              <li>
                <Link href="/broker-lookup" className="transition-colors hover:text-text-on-ink">
                  Broker Sorgulama
                </Link>
              </li>
              <li>
                <Link href="/pozisyon-hesaplayici" className="transition-colors hover:text-text-on-ink">
                  {tr("Pozisyon Hesaplayıcı")}
                </Link>
              </li>
              <li>
                <Link href="/blacklist" className="transition-colors hover:text-text-on-ink">
                  {tr("Risk Uyarıları")}
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="transition-colors hover:text-text-on-ink">
                  {tr("Şikayet Bildir")}
                </Link>
              </li>
              <li>
                <Link href="/kurulum" className="transition-colors hover:text-text-on-ink">
                  Kurulum Rehberi
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="transition-colors hover:text-text-on-ink">
                  {tr("Karşılaştırma Tablosu")}
                </Link>
              </li>
              <li>
                <Link href="/#how-to-choose" className="transition-colors hover:text-text-on-ink">
                  {tr("Broker Nasıl Seçilir")}
                </Link>
              </li>
              <li>
                <Link href="/#video" className="transition-colors hover:text-text-on-ink">
                  {tr("Eğitim Videosu")}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition-colors hover:text-text-on-ink">
                  {tr("Sıkça Sorulan Sorular")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 text-xs leading-relaxed text-text-on-ink-muted/80">
          <p>
            <strong className="text-text-on-ink-muted">{tr("Risk uyarısı:")}</strong>{" "}
            {tr("Kaldıraçlı forex ve türev ürünlerle işlem yapmak yüksek düzeyde risk taşır ve yatırdığınız sermayenin tamamının kaybedilmesine yol açabilir. Bu sayfadaki içerik yalnızca genel bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. Minimum depozit, kaldıraç ve regülasyon bilgileri ülkeye ve hesap türüne göre değişebilir; işlem yapmadan önce güncel koşulları broker'ın resmi web sitesinden doğrulayın.")}
          </p>
          <p className="mt-3">
            <strong className="text-text-on-ink-muted">{tr("Bağlı kuruluş bilgilendirmesi:")}</strong>{" "}
            {tr("FXPARTNER, bu sayfada listelenen brokerların bazılarıyla ortaklık/referans ilişkisine sahiptir ve “Resmi Sitesi” bağlantıları üzerinden açılan hesaplardan komisyon kazanabilir. Bu durum ilgili kartta ayrıca belirtilir ve sıralama veya puanlama kriterlerimizi etkilemez.")}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} FXPARTNER. {tr("Tüm hakları saklıdır.")}</span>
            <Link href="/privacy" className="transition-colors hover:text-text-on-ink">
              {tr("Gizlilik Politikası")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-text-on-ink">
              {tr("Kullanım Şartları")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
