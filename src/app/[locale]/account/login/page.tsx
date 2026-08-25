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
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);


  // A link already sitting in someone's inbox still points back here, and so
  // does any bookmark. Whoever arrives signed in is done signing in — send
  // them to the panel rather than showing them the form again, which reads
  // as the sign-in having failed.
  if ((await auth())?.user) {
    redirect(localePath(isLocale(pageLocale) ? pageLocale : defaultLocale, "/account"));
  }

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
