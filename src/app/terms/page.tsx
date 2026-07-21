import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to using fxpartner.global.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Legal
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 font-mono text-xs text-text-on-ink-muted">
              Last updated: July 2026
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              These terms apply when you use fxpartner.global. By using the
              site, you agree to them. If you don&apos;t agree, please don&apos;t
              use the site.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Not investment advice
            </h2>
            <p className="mt-4">
              FXPARTNER publishes broker reviews, rankings, comparisons, and
              general educational content about forex and CFD trading. None
              of it is personal investment, financial, or legal advice.
              Trading leveraged forex and derivative products carries a
              high level of risk and can result in the loss of all your
              invested capital. Do your own research and, if needed,
              consult a licensed professional before trading with any
              broker.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Affiliate relationships
            </h2>
            <p className="mt-4">
              FXPARTNER has a partnership/referral relationship with some
              of the brokers listed on this site and may earn a commission
              when you open an account through our links, at no extra cost
              to you. This is disclosed on every broker card and does not
              influence our scoring criteria — including for brokers we
              partner with.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Accounts
            </h2>
            <p className="mt-4">
              You&apos;re responsible for the accuracy of the information you
              submit when creating an account, filing a complaint, or
              signing up for cashback, and for keeping access to your email
              inbox secure, since that&apos;s how you sign in.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Comments
            </h2>
            <p className="mt-4">
              When you leave a comment on a broker review, you&apos;re
              confirming it reflects your genuine experience or opinion. We
              may remove comments that are false, abusive, spam, or
              unrelated to the broker being reviewed.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Complaints and cashback
            </h2>
            <p className="mt-4">
              Submitting a complaint doesn&apos;t guarantee a resolution or
              compensation — FXPARTNER isn&apos;t a regulator and can&apos;t force a
              broker to act. Cashback is paid by the relevant broker
              directly into your trading account, based on your real
              trading volume; published rates are estimates and may change.
              We track cashback manually against our own partner records
              and aren&apos;t responsible for delays on the broker&apos;s side.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Risk warnings page
            </h2>
            <p className="mt-4">
              Our risk-warnings page flags brokers based on independent
              trust scores and complaint patterns found in published
              reviews. It&apos;s a signal for further research, not a legal
              finding of wrongdoing.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Changes
            </h2>
            <p className="mt-4">
              We may update these terms or our broker rankings, scoring, or
              content at any time as new information becomes available.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Contact
            </h2>
            <p className="mt-4">
              Questions about these terms? Email{" "}
              <a href="mailto:senolgen@gmail.com" className="text-signal hover:text-signal-strong">
                senolgen@gmail.com
              </a>
              .
            </p>

            <p className="mt-10 rounded-2xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
              These terms describe how the site actually operates in plain
              language. They aren&apos;t a substitute for formal legal review —
              have a qualified lawyer review them if you need specific
              regulatory or liability protections for your jurisdiction.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
