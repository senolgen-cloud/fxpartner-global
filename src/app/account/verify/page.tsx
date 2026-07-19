import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VerifyRequestPage() {
  return (
    <>
      <Header />
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
