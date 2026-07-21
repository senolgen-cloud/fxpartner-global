import Link from "next/link";
import { brokers } from "@/data/brokers";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-ink text-text-on-ink-muted">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <span className="font-display text-lg font-semibold text-text-on-ink">
              FXPARTNER
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              A review resource comparing forex brokers by regulation, cost,
              and platform support. Not investment advice.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Part of the FXPARTNER education and CopyTrade ecosystem,
              founded by Erdem Torun.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              Broker Reviews
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {brokers.slice(0, 5).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brokers/${b.slug}`}
                    className="transition-colors hover:text-text-on-ink"
                  >
                    {b.name} Review
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink">
              Resources
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/categories" className="transition-colors hover:text-text-on-ink">
                  Broker Categories
                </Link>
              </li>
              <li>
                <Link href="/cashback" className="transition-colors hover:text-text-on-ink">
                  Cashback
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-text-on-ink">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/blacklist" className="transition-colors hover:text-text-on-ink">
                  Risk Warnings
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="transition-colors hover:text-text-on-ink">
                  File a Complaint
                </Link>
              </li>
              <li>
                <a href="#comparison" className="transition-colors hover:text-text-on-ink">
                  Comparison Table
                </a>
              </li>
              <li>
                <a href="#how-to-choose" className="transition-colors hover:text-text-on-ink">
                  How to Choose a Broker
                </a>
              </li>
              <li>
                <a href="#video" className="transition-colors hover:text-text-on-ink">
                  Educational Video
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-text-on-ink">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 text-xs leading-relaxed text-text-on-ink-muted/80">
          <p>
            <strong className="text-text-on-ink-muted">Risk warning:</strong> Trading
            leveraged forex and derivative products carries a high level of
            risk and can result in the loss of all your invested capital.
            The content on this page is for general informational purposes
            only and does not constitute investment advice. Minimum deposit,
            leverage, and regulatory information may vary by country and
            account type; verify current terms on the broker&apos;s official
            website before trading.
          </p>
          <p className="mt-3">
            <strong className="text-text-on-ink-muted">Affiliate disclosure:</strong> FXPARTNER
            has a partnership/referral relationship with some of the brokers
            listed on this page and may earn a commission on accounts opened
            through &ldquo;Open Account&rdquo; links. This is noted separately on the
            relevant card and does not affect our ranking or scoring
            criteria.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} FXPARTNER. All rights reserved.</span>
            <Link href="/privacy" className="transition-colors hover:text-text-on-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-text-on-ink">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
