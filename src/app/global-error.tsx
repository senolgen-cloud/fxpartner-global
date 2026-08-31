"use client";

/**
 * The last resort: the root layout itself failed.
 *
 * [locale]/error.tsx handles a page that failed inside a working layout,
 * which is almost every failure and the good case — the header, the footer
 * and the locale context survive, so the reader gets a translated page with
 * a way onward. This one only runs when the layout could not render at all,
 * and it replaces the whole document, <html> included.
 *
 * Everything here is therefore deliberately primitive. No Tailwind (the
 * stylesheet is imported by the layout that just died), no dictionary
 * lookup, no locale context — whatever broke may well be one of those, and
 * a fallback that depends on the machinery it is catching for is not a
 * fallback. Inline styles and two hardcoded sentences.
 *
 * Two sentences, because the locale is genuinely unknown at this point: the
 * reader could be in any of the four trees, and Turkish plus English is the
 * widest net two lines can cast. Guessing from the URL would work right up
 * until the failure is in the routing.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c1114",
          color: "#eef2f3",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "12px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#0891b2",
            }}
          >
            FXPARTNER
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 600 }}>
            Site şu an yanıt veremiyor
          </h1>
          <p style={{ margin: "0 0 8px", color: "#93a1a6" }}>
            Geçici bir sorun yaşıyoruz. Birkaç dakika içinde tekrar deneyin.
          </p>
          <p style={{ margin: "0 0 20px", color: "#93a1a6" }}>
            We are having a temporary problem. Please try again in a few minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: "6px",
              background: "#0891b2",
              color: "#f1f2f3",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tekrar dene / Retry
          </button>
          {error.digest && (
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#93a1a6", fontFamily: "monospace" }}>
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
