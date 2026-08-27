import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.privacy.title"],
    description: t["page.privacy.description"],
    alternates: {
      canonical: localePath(locale, "/privacy"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/privacy")])
      ),
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Gizlilik Politikası", url: `${SITE_URL}/privacy` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Yasal
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Gizlilik Politikası")}
            </h1>
            <p className="mt-4 font-mono text-xs text-text-on-ink-muted">
              {tr("Son güncelleme: Temmuz 2026")}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              {tr("Bu politika, FXPARTNER'ın (\"biz\") fxpartner.global üzerinden hangi kişisel verileri topladığını, bunları neden topladığını ve bunları nasıl kontrol edebileceğinizi açıklar. Bu site üzerindeki her form için geçerlidir: hesap girişi, aracı kurum yorumları, şikayet formu ve kazanç iade (cashback) programı.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Ne topluyoruz
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>{tr("Hesap girişi:")}</strong>{" "}
                {tr("ad soyad, telefon numarası, e-posta adresi ve — isteğe bağlı olarak — hangi aracı kurumla işlem yaptığınız.")}
              </li>
              <li>
                <strong>{tr("Aracı kurum yorumları:")}</strong>{" "}
                {tr("yorum metniniz, isteğe bağlı 1-5 puanlama ve — belirtirseniz — ülkeniz (yorumunuzun yanında herkese açık şekilde gösterilir).")}
              </li>
              <li>
                <strong>{tr("Şikayet formu:")}</strong>{" "}
                {tr("ad soyad, telefon, e-posta, ilgili aracı kurum ve sorununuzun açıklaması.")}
              </li>
              <li>
                <strong>{tr("Kazanç iade programı:")}</strong> ad soyad, e-posta,
                işlem hesap numarası ve tanıtım e-postalarına izin verip
                vermediğiniz.
              </li>
              <li>
                <strong>{tr("Otomatik olarak:")}</strong>{" "}
                {tr("aşağıda tek tek listelenen çerezler. Reklam ağlarına ait üçüncü taraf izleme çerezi kullanmıyoruz.")}
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Kullandığımız çerezler")}
            </h2>
            <p className="mt-4">
              {tr(
                "Kullandığımız çerezlerin tamamı budur. İlk üçü olmadan site çalışmaz, bu yüzden onlar için onay istemiyoruz. Son ikisi isteğe bağlıdır ve yalnızca çerez bandında \"Tümünü kabul et\" derseniz yazılır; \"Yalnızca gerekli\" derseniz yazılmaz, daha önce yazılmışsa silinir."
              )}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-start">
                    <th className="py-2 pe-4 text-start font-medium">{tr("Çerez")}</th>
                    <th className="py-2 pe-4 text-start font-medium">{tr("Süre")}</th>
                    <th className="py-2 text-start font-medium">{tr("Ne için")}</th>
                  </tr>
                </thead>
                <tbody className="text-text-dark/80">
                  <tr className="border-b border-hairline">
                    <td className="py-3 pe-4 font-mono text-xs">fxp_lang</td>
                    <td className="py-3 pe-4">{tr("1 yıl")}</td>
                    <td className="py-3">
                      {tr("Siteyi hangi dilde okuduğunuz. İlk ziyarette ülkenize göre seçilir, siz değiştirdiğinizde seçiminiz saklanır.")}
                    </td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pe-4 font-mono text-xs">googtrans</td>
                    <td className="py-3 pe-4">{tr("1 yıl")}</td>
                    <td className="py-3">
                      {tr("Sayfa çevirisi için kullandığımız Google Çeviri bileşeninin kendi çerezi; fxp_lang ile birlikte yazılır. Google'a ait olduğu için üçüncü taraf bir çerezdir, ancak reklam veya profilleme amacı taşımaz.")}
                    </td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pe-4 font-mono text-xs">{tr("oturum çerezi")}</td>
                    <td className="py-3 pe-4">{tr("Oturum boyunca")}</td>
                    <td className="py-3">
                      {tr("Üye girişi yaptığınızda oturumunuzu açık tutar. Yalnızca giriş yapan üyelerde bulunur.")}
                    </td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pe-4 font-mono text-xs">fxp_vid</td>
                    <td className="py-3 pe-4">{tr("2 yıl")}</td>
                    <td className="py-3">
                      {tr("İsteğe bağlı. Tarayıcınıza verilen, adınıza veya e-postanıza bağlı olmayan rastgele bir kimlik. Aynı ziyaretçiye aynı şeyi iki kez göstermemek gibi işler için ayrılmıştır.")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pe-4 font-mono text-xs">fxp_attr</td>
                    <td className="py-3 pe-4">{tr("2 yıl")}</td>
                    <td className="py-3">
                      {tr("İsteğe bağlı. Siteye ilk kez hangi kanaldan geldiğinizi tutar: kaynak, kampanya adı ve giriş yaptığınız sayfanın yolu. Adres satırındaki sorgu bilgisi bilinçli olarak kaydedilmez.")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-text-dark/80">
              {tr(
                "Tercihinizi değiştirmek isterseniz tarayıcınızın site verilerini temizlemeniz yeterlidir; çerez bandı yeniden çıkar ve yeniden seçim yapabilirsiniz."
              )}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Neden topluyoruz
            </h2>
            <ul className="mt-4 space-y-2">
              <li>{tr("Hesabınızı oluşturmak, sürdürmek ve oturumunuzu açık tutmak için.")}</li>
              <li>{tr("Bir aracı kurum hakkında gönderdiğiniz şikayetleri incelemek ve takip etmek için.")}</li>
              <li>{tr("Bağlı işlem hesabınıza göre kazanç iadesini doğrulamak ve takip etmek için.")}</li>
              <li>{tr("Size FXPARTNER VIP Telegram grubuna davet göndermek için.")}</li>
              <li>
                {tr("Size tanıtım veya kampanya e-postaları göndermek için —")}{" "}
                <strong>{tr("yalnızca")}</strong>{" "}
                {tr("kazanç iade formunda açıkça izin verdiyseniz. O onay kutusu işaretlenmeden sizi asla bir pazarlama listesine eklemeyiz.")}
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Kimlerle paylaşıyoruz")}
            </h2>
            <p className="mt-4">
              {tr("Verilerinizi satmıyoruz. Sitenin çalışabilmesi için az sayıda hizmet sağlayıcı bizim adımıza bu verileri işler:")}
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Neon (Postgres)</strong>{" "}
                {tr("— hesap ve gönderim verilerinizi saklar.")}
              </li>
              <li>
                <strong>Resend</strong>{" "}
                {tr("— giriş bağlantılarını ve bildirim e-postalarını iletir.")}
              </li>
              <li>
                <strong>Vercel</strong> {tr("— web sitesini ve uygulamayı barındırır.")}
              </li>
              <li>
                <strong>Telegram</strong>{" "}
                {tr("— VIP grup daveti talep ederseniz, bunu oluşturmak için Telegram’ın API’sini çağırırız.")}
              </li>
              <li>
                <strong>{tr("İlgili aracı kurum")}</strong>{" "}
                {tr("— bir şikayet veya kazanç iade kaydı gönderirseniz, sağladığınız bilgileri inceleyip işleme alabilmesi için ilgili aracı kurumla paylaşırız.")}
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Ne kadar süre saklıyoruz")}
            </h2>
            <p className="mt-4">
              {tr("Hesap, şikayet ve kazanç iade kayıtlarını hesabınız aktif olduğu sürece veya açık bir şikayet ya da kazanç iade talebini sonuçlandırmak için gerektiği kadar saklarız. İstediğiniz zaman silme talebinde bulunabilirsiniz — aşağıdaki \"Haklarınız\" bölümüne bakın.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Haklarınız")}
            </h2>
            <p className="mt-4">
              {tr("Kişisel bilgilerinize erişmemizi, bunları düzeltmemizi ya da silmemizi isteyebilir, veya pazarlama iznini istediğiniz zaman")}{" "}
              <a href="mailto:info@fxpartner.global" className="text-signal hover:text-signal-strong">
                info@fxpartner.global
              </a>{" "}
              {tr("adresine e-posta göndererek geri çekebilirsiniz. Makul bir süre içinde yanıt vereceğiz.")}
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              {tr("Yatırım tavsiyesi değildir")}
            </h2>
            <p className="mt-4">
              {tr("Verilerinizi nasıl işlediğimiz dahil, bu sitedeki hiçbir şey yatırım tavsiyesi değildir. Aracı kurum sıralamaları, kazanç iade oranları ve editoryal içerik yalnızca genel bilgi amaçlıdır.")}
            </p>

            <p className="mt-10 rounded-2xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
              {tr("Bu politika, gerçek veri uygulamalarımızı sade bir dille anlatır. Resmi bir hukuki incelemenin yerini tutmaz — bu politikanın bulunduğunuz bölge için belirli bir düzenleyici çerçeveyi (örn. KVKK veya GDPR) karşılaması gerekiyorsa, yetkin bir avukata inceletin.")}
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
