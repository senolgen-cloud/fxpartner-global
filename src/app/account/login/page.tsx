import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "@/auth";

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
            Enter your email and we&apos;ll send you a one-time sign-in link.
            No password needed.
          </p>

          <form
            action={async (formData) => {
              "use server";
              await signIn("resend", {
                email: formData.get("email"),
                redirectTo: "/account",
              });
            }}
            className="mt-8 flex flex-col gap-3"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
            />
            <button
              type="submit"
              className="rounded-full bg-signal px-5 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
            >
              Send sign-in link
            </button>
          </form>

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
