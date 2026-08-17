import Image from "next/image";
import Link from "next/link";
import { brokers } from "@/data/brokers";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-ink text-text-on-ink-muted">
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
              Forex brokerlarını regülasyon, maliyet ve platform desteğine
              göre karşılaştıran bir inceleme kaynağı. Yatırım tavsiyesi
              değildir.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Erdem Torun tarafından kurulan FXPARTNER eğitim ve CopyTrade
              ekosisteminin bir parçasıdır.
            </p>
            {/* Certificate-of-incorporation link disabled 2026-08-17: the
                actual scan (public/legal/fxpartner-certificate-of-
                incorporation.jpg) was never uploaded, so this pointed at a
                dead link/section. Re-enable once the real file exists —
                see /about's "Legal registration" section, also disabled. */}
            <div className="mt-6 max-w-sm">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
                E-posta ile güncellemeler alın
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                Yeni sinyaller, piyasa analizleri ve broker kampanyaları —
                spam yok.
              </p>
              <div className="mt-3">
                <NewsletterSignup source="footer" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              Broker İncelemeleri
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {brokers.slice(0, 5).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brokers/${b.slug}`}
                    title={`${b.name} incelemesi`}
                    className="transition-colors hover:text-text-on-ink"
                  >
                    <span className="notranslate">{b.name} </span>İncelemesi
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              Kaynaklar
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-text-on-ink">
                  Hakkımızda
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
                  Regülasyon Raporu
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
                  Haber Bülteni
                </Link>
              </li>
              <li>
                <Link href="/broker-lookup" className="transition-colors hover:text-text-on-ink">
                  Broker Sorgulama
                </Link>
              </li>
              <li>
                <Link href="/pozisyon-hesaplayici" className="transition-colors hover:text-text-on-ink">
                  Pozisyon Hesaplayıcı
                </Link>
              </li>
              <li>
                <Link href="/blacklist" className="transition-colors hover:text-text-on-ink">
                  Risk Uyarıları
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="transition-colors hover:text-text-on-ink">
                  Şikayet Bildir
                </Link>
              </li>
              <li>
                <Link href="/kurulum" className="transition-colors hover:text-text-on-ink">
                  Kurulum Rehberi
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="transition-colors hover:text-text-on-ink">
                  Karşılaştırma Tablosu
                </Link>
              </li>
              <li>
                <Link href="/#how-to-choose" className="transition-colors hover:text-text-on-ink">
                  Broker Nasıl Seçilir
                </Link>
              </li>
              <li>
                <Link href="/#video" className="transition-colors hover:text-text-on-ink">
                  Eğitim Videosu
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition-colors hover:text-text-on-ink">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 text-xs leading-relaxed text-text-on-ink-muted/80">
          <p>
            <strong className="text-text-on-ink-muted">Risk uyarısı:</strong> Kaldıraçlı
            forex ve türev ürünlerle işlem yapmak yüksek düzeyde risk taşır
            ve yatırdığınız sermayenin tamamının kaybedilmesine yol
            açabilir. Bu sayfadaki içerik yalnızca genel bilgilendirme
            amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. Minimum
            depozit, kaldıraç ve regülasyon bilgileri ülkeye ve hesap
            türüne göre değişebilir; işlem yapmadan önce güncel koşulları
            broker&apos;ın resmi web sitesinden doğrulayın.
          </p>
          <p className="mt-3">
            <strong className="text-text-on-ink-muted">Bağlı kuruluş bilgilendirmesi:</strong> FXPARTNER,
            bu sayfada listelenen brokerların bazılarıyla ortaklık/referans
            ilişkisine sahiptir ve &ldquo;Hesap Aç&rdquo; bağlantıları
            üzerinden açılan hesaplardan komisyon kazanabilir. Bu durum
            ilgili kartta ayrıca belirtilir ve sıralama veya puanlama
            kriterlerimizi etkilemez.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} FXPARTNER. Tüm hakları saklıdır.</span>
            <Link href="/privacy" className="transition-colors hover:text-text-on-ink">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="transition-colors hover:text-text-on-ink">
              Kullanım Şartları
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
