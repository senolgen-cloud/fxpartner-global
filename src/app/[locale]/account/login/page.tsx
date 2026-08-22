import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import SimpleSignInForm from "@/components/SimpleSignInForm";

export default function LoginPage() {
  return (
    <>
      <main className="relative flex-1 overflow-hidden bg-ink">
        {/* Ambient glow, same drifting-blob language as the homepage hero */}
        <div
          className="hero-glow-signal pointer-events-none absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, var(--signal) 30%, transparent)" }}
        />
        <div
          className="hero-glow-gold pointer-events-none absolute -bottom-40 -right-16 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, var(--signal) 18%, transparent)" }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-20">
          <div
            className="grid overflow-hidden rounded-[28px] border border-signal/30 bg-ink-soft shadow-[0_0_0_1px_color-mix(in_srgb,var(--signal)_25%,transparent),0_0_70px_-15px_var(--signal)] md:grid-cols-[1.15fr_0.85fr]"
          >
            {/* Form side */}
            <div className="p-8 md:p-12">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
                Hesap
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold text-text-on-ink">
                Tekrar hoş geldiniz
              </h1>
              <p className="mt-3 text-text-on-ink-muted">
                E-postanızı girin, size tek kullanımlık bir giriş bağlantısı
                gönderelim. Şifreye gerek yok.
              </p>

              <SimpleSignInForm />

              <p className="mt-6 text-xs leading-relaxed text-text-on-ink-muted">
                Henüz üye değil misiniz?{" "}
                <Link href="/account/register" className="text-signal hover:text-signal-strong">
                  Ücretsiz kayıt olun
                </Link>
                .
              </p>
            </div>

            {/* Diagonal accent side — matches the reference's glowing split panel */}
            <div
              className="relative hidden md:block"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--signal) 55%, var(--ink)) 0%, var(--ink) 75%)",
                clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
              }}
            >
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <span className="text-4xl font-bold uppercase tracking-tight text-text-on-ink">
                  Tekrar
                  <br />
                  Hoş Geldiniz
                </span>
                <p className="mt-4 text-sm text-text-on-ink/80">
                  Broker incelemeleri, cashback takibi ve VIP Telegram
                  erişimi — hepsi tek bir yerde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
