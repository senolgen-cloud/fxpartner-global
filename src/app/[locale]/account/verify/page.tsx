import Footer from "@/components/Footer";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export default async function VerifyRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  return (
    <>
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Check your inbox
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">
            We sent you a sign-in link
          </h1>
          <p className="mt-3 text-text-muted">
            Click the link in the email to finish signing in. You can close
            this tab.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
