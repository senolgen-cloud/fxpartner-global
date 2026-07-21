import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignInForm from "@/components/SignInForm";
import { brokers } from "@/data/brokers";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-md px-6 py-20">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Account
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">
            Sign in to FXPARTNER
          </h1>
          <p className="mt-3 text-text-muted">
            Tell us a bit about yourself and we&apos;ll send you a one-time
            sign-in link. No password needed.
          </p>

          <SignInForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />

          <p className="mt-6 text-xs leading-relaxed text-text-muted">
            By signing in you get access to broker reviews, complaint
            tracking, and an invite to the FXPARTNER VIP Telegram group.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
