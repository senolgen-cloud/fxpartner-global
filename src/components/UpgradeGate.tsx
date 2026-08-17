import Link from "next/link";

// Shared "you need to sign in / upgrade" panel — used in place of a gated
// feature (AI Assistant chat, Copytrade inquiry form, Community page) when
// the viewer doesn't qualify. `dark` matches the page's own section
// background so the gate doesn't look like a foreign element dropped in.
export default function UpgradeGate({
  eyebrow,
  title,
  description,
  signedIn,
  dark = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  signedIn: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border px-6 py-14 text-center ${
        dark
          ? "border-hairline bg-ink-soft text-text-on-ink"
          : "border-hairline-light bg-paper text-text-dark"
      }`}
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">{eyebrow}</span>
      <h2 className={`mt-3 font-display text-2xl font-semibold ${dark ? "text-text-on-ink" : "text-text-dark"}`}>
        {title}
      </h2>
      <p className={`mt-3 max-w-md text-sm leading-relaxed ${dark ? "text-text-on-ink-muted" : "text-text-muted"}`}>
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/paketler"
          className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
        >
          Paketleri İncele →
        </Link>
        {!signedIn && (
          <Link
            href="/account/login"
            className={`rounded-full border px-6 py-3 text-sm font-medium transition-colors ${
              dark
                ? "border-hairline text-text-on-ink hover:border-signal hover:text-signal"
                : "border-hairline-light text-text-dark hover:border-signal hover:text-signal"
            }`}
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </div>
  );
}
