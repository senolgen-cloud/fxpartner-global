import Link from "@/components/LocaleLink";
import { tr } from "@/lib/chrome";
import Footer from "@/components/Footer";
import AuthShell from "@/components/account/AuthShell";
import EmailSignInForm from "@/components/account/EmailSignInForm";
import GoogleSignIn from "@/components/account/GoogleSignIn";
import { submitLogin } from "@/app/[locale]/account/login/simple-actions";
import { configuredProviders } from "@/lib/authProviders";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function LoginPage({
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
        eyebrow={tr("Hesap")}
        title={tr("Tekrar hoş geldiniz")}
        intro={tr("E-postanızı girin, size tek kullanımlık bir giriş bağlantısı gönderelim.")}
        footer={
          <>
            {tr("Henüz üye değil misiniz?")}{" "}
            <Link href="/account/register" className="text-signal hover:text-signal-strong">
              {tr("Ücretsiz kayıt olun")}
            </Link>
            .
          </>
        }
      >
        {/* No country field here: a returning member already has one, and
            asking again would overwrite what they set from /account. */}
        <EmailSignInForm action={submitLogin} submitLabel={tr("Giriş bağlantısı gönder")} />
        {providers.google && <GoogleSignIn />}
      </AuthShell>
      <Footer />
    </>
  );
}
