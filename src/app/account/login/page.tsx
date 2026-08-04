import Footer from "@/components/Footer";
import SignInForm from "@/components/SignInForm";
import { brokers } from "@/data/brokers";

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
                Account
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold text-text-on-ink">
                Sign in to FXPARTNER
              </h1>
              <p className="mt-3 text-text-on-ink-muted">
                Tell us a bit about yourself and we&apos;ll send you a
                one-time sign-in link. No password needed.
              </p>

              <SignInForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />

              <p className="mt-6 text-xs leading-relaxed text-text-on-ink-muted">
                By signing in you get access to broker reviews, complaint
                tracking, and an invite to the FXPARTNER VIP Telegram group.
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
                  Welcome
                  <br />
                  Back
                </span>
                <p className="mt-4 text-sm text-text-on-ink/80">
                  Broker reviews, cashback tracking, and VIP Telegram access —
                  all in one place.
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
