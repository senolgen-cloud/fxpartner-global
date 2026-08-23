import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import AuthShell from "@/components/account/AuthShell";
import EmailSignInForm from "@/components/account/EmailSignInForm";
import GoogleSignIn from "@/components/account/GoogleSignIn";
import { submitLogin } from "@/app/[locale]/account/login/simple-actions";
import { configuredProviders } from "@/lib/authProviders";
import { COUNTRIES } from "@/lib/country";
import { setServerLocale } from "@/lib/serverLocale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.account.register.title"],
    description: t["page.account.register.description"],
    alternates: {
      canonical: localePath(locale, "/account/register"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/account/register")])
      ),
    },
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const providers = configuredProviders();

  return (
    <>
      <AuthShell
        eyebrow={tr("Ücretsiz hesap")}
        title={tr("Sinyalleri görmeye başlayın")}
        intro={tr("E-postanız yeterli. Şifre yok, kart yok, iptal yok — çıkmak istediğinizde tek tıkla aboneliğinizi kapatabilirsiniz.")}
        footer={
          <>
            {tr("Zaten üye misiniz?")}{" "}
            <Link href="/account/login" className="text-signal hover:text-signal-strong">
              {tr("Giriş yapın")}
            </Link>
            {". "}
            {tr("Kayıt olarak")}{" "}
            <Link href="/terms" className="text-signal hover:text-signal-strong">
              {tr("Kullanım Şartları")}
            </Link>{" "}
            {tr("ve")}{" "}
            <Link href="/privacy" className="text-signal hover:text-signal-strong">
              {tr("Gizlilik Politikası")}
            </Link>
            {"’"}
            {tr("nı kabul etmiş olursunuz.")}
          </>
        }
      >
        {/* The only field beyond the address, and it is optional: country is
            what decides which brokers and which leverage actually apply to a
            reader, so it earns its place. Name, phone and broker moved to
            /account, where someone who has seen the product can fill them in. */}
        <EmailSignInForm
          action={submitLogin}
          submitLabel={tr("Ücretsiz hesap aç")}
          countries={COUNTRIES}
        />
        {providers.google && <GoogleSignIn />}
      </AuthShell>
      <Footer />
    </>
  );
}
