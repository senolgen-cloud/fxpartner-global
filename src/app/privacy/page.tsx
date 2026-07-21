import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FXPARTNER collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 font-mono text-xs text-text-on-ink-muted">
              Last updated: July 2026
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              This policy explains what personal information FXPARTNER
              (&quot;we&quot;, &quot;us&quot;) collects through fxpartner.global, why we
              collect it, and how you can control it. It applies to every
              form on this site: account sign-in, broker comments, the
              complaint form, and the cashback program.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              What we collect
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Account sign-in:</strong> full name, phone number,
                email address, and — optionally — which broker you trade
                with.
              </li>
              <li>
                <strong>Broker comments:</strong> your comment text, an
                optional 1–5 rating, and — if you set it — your country
                (shown publicly next to your comment).
              </li>
              <li>
                <strong>Complaint form:</strong> full name, phone, email,
                the broker involved, and your description of the issue.
              </li>
              <li>
                <strong>Cashback program:</strong> full name, email, trading
                account number, and whether you opted in to promotional
                emails.
              </li>
              <li>
                <strong>Automatically:</strong> a session cookie that keeps
                you signed in. We don&apos;t use third-party advertising or
                tracking cookies.
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Why we collect it
            </h2>
            <ul className="mt-4 space-y-2">
              <li>To create and maintain your account, and keep you signed in.</li>
              <li>To review and follow up on complaints you submit about a broker.</li>
              <li>To verify and track cashback against your linked trading account.</li>
              <li>To send you an invite to the FXPARTNER VIP Telegram group.</li>
              <li>
                To send you promotional or campaign emails — <strong>only</strong>{" "}
                if you explicitly opted in on the cashback form. We never
                add you to a marketing list without that checkbox being
                checked.
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Who we share it with
            </h2>
            <p className="mt-4">
              We don&apos;t sell your data. A small number of service
              providers process it on our behalf so the site can function:
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Neon (Postgres)</strong> — stores your account and
                submission data.
              </li>
              <li>
                <strong>Resend</strong> — delivers sign-in links and
                notification emails.
              </li>
              <li>
                <strong>Vercel</strong> — hosts the website and application.
              </li>
              <li>
                <strong>Telegram</strong> — if you request a VIP group
                invite, we call Telegram&apos;s API to generate it.
              </li>
              <li>
                <strong>The relevant broker</strong> — if you submit a
                complaint or cashback signup, we share the details you
                provided with that broker so they can investigate or
                process it.
              </li>
            </ul>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              How long we keep it
            </h2>
            <p className="mt-4">
              We keep account, complaint, and cashback records for as long
              as your account is active or as needed to resolve an open
              complaint or cashback claim. You can request deletion at any
              time — see &quot;Your rights&quot; below.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Your rights
            </h2>
            <p className="mt-4">
              You can ask us to access, correct, or delete your personal
              information, or to withdraw marketing consent, at any time by
              emailing{" "}
              <a href="mailto:senolgen@gmail.com" className="text-signal hover:text-signal-strong">
                senolgen@gmail.com
              </a>
              . We&apos;ll respond within a reasonable time.
            </p>

            <h2 className="mt-10 font-poppins text-2xl font-semibold text-text-dark">
              Not investment advice
            </h2>
            <p className="mt-4">
              Nothing on this site, including how we process your data, is
              investment advice. Broker rankings, cashback rates, and
              editorial content are for general information only.
            </p>

            <p className="mt-10 rounded-2xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
              This policy describes our actual data practices in plain
              language. It isn&apos;t a substitute for formal legal review —
              if you need this policy to meet a specific regulatory
              framework (e.g. KVKK or GDPR) for your jurisdiction, have a
              qualified lawyer review it.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
