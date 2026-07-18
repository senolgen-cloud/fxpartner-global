import Link from "next/link";
import { brokers } from "@/data/brokers";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-ink text-text-on-ink-muted">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <span className="font-display text-lg font-semibold text-text-on-ink">
              FXPARTNER
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              Forex brokerlarını düzenleme, maliyet ve platform desteğine göre
              karşılaştıran bir inceleme kaynağıdır. Yatırım tavsiyesi
              niteliği taşımaz.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Erdem Torun tarafından kurulan FXPARTNER eğitim ve CopyTrade
              ekosisteminin bir parçasıdır.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              Broker İncelemeleri
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {brokers.slice(0, 5).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brokerlar/${b.slug}`}
                    className="transition-colors hover:text-text-on-ink"
                  >
                    {b.name} İncelemesi
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
                <Link href="/kategoriler" className="transition-colors hover:text-text-on-ink">
                  Broker Kategorileri
                </Link>
              </li>
              <li>
                <a href="#karsilastirma" className="transition-colors hover:text-text-on-ink">
                  Karşılaştırma Tablosu
                </a>
              </li>
              <li>
                <a href="#nasil-secilir" className="transition-colors hover:text-text-on-ink">
                  Broker Nasıl Seçilir
                </a>
              </li>
              <li>
                <a href="#egitim-videosu" className="transition-colors hover:text-text-on-ink">
                  Eğitim Videosu
                </a>
              </li>
              <li>
                <a href="#sss" className="transition-colors hover:text-text-on-ink">
                  Sıkça Sorulan Sorular
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 text-xs leading-relaxed text-text-on-ink-muted/80">
          <p>
            <strong className="text-text-on-ink-muted">Risk uyarısı:</strong> Kaldıraçlı
            forex ve türev ürün işlemleri yüksek risk içerir ve yatırdığınız
            sermayenin tamamını kaybetmenize neden olabilir. Bu sayfadaki
            içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
            Minimum yatırım, kaldıraç ve düzenleme bilgileri ülkeye ve hesap
            tipine göre değişebilir; işlem yapmadan önce güncel şartları
            brokerin resmi sitesinden doğrulayın.
          </p>
          <p className="mt-3">
            <strong className="text-text-on-ink-muted">Ortaklık bildirimi:</strong> FXPARTNER,
            bu sayfada listelenen brokerların bir kısmıyla ortaklık/referans
            ilişkisi içindedir ve &ldquo;Hesap Aç&rdquo; bağlantıları üzerinden açılan
            hesaplardan komisyon elde edebilir. Bu durum ilgili karta ayrıca
            not düşülmüştür ve sıralama/puanlama kriterlerini etkilemez.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} FXPARTNER. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
