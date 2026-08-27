"use client";

import { useEffect, useState } from "react";
import Link from "@/components/LocaleLink";
import { useTr } from "@/components/useTr";
import { useLocale } from "@/components/LocaleProvider";
import { CONSENT_COOKIE, cookieValue, type Decision } from "@/lib/consent";

const ONE_YEAR = 60 * 60 * 24 * 365;

function hasChosen(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${CONSENT_COOKIE}=`));
}

/**
 * Consent for the two cookies the site does not need in order to work:
 * fxp_vid (a stable anonymous browser id) and fxp_attr (first-touch
 * attribution). The language cookies and the auth session are not offered
 * as a choice — without them the site cannot do what the reader came for —
 * and that is stated on the banner rather than left implied.
 *
 * proxy.ts writes nothing gated until this cookie says "all", so the
 * default before any answer is the strict one. Declining also clears
 * whatever a previous visit left behind.
 *
 * The choice reloads the page on purpose. fxp_attr records where the
 * reader arrived from, and only the middleware can see the utm parameters
 * and the referrer; by the time they navigate away, the landing URL is
 * gone. Reloading the same URL lets the middleware write it from exactly
 * the request the reader consented on, instead of losing first-touch to
 * the price of asking.
 */
export default function CookieConsent() {
  const tr = useTr();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Never rendered during SSR: the server has no way to know what this
  // browser already chose, and guessing would flash a banner at readers
  // who answered months ago.
  useEffect(() => {
    if (!hasChosen()) setVisible(true);
  }, []);

  // The record is written first so its id can go into the cookie, but a
  // failure to record must never cost the reader their choice: on any
  // error the cookie is still written, just without an id.
  async function choose(decision: Decision) {
    if (saving) return;
    setSaving(true);

    let id: string | null = null;
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, locale }),
      });
      if (res.ok) id = (await res.json())?.id ?? null;
    } catch {
      // Offline, blocked, or down — fall through and honour the choice.
    }

    document.cookie =
      `${CONSENT_COOKIE}=${cookieValue(decision, id)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
    setVisible(false);
    window.location.reload();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={tr("Çerez tercihi")}
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-hairline bg-ink/95 text-text-on-ink backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm leading-relaxed text-text-on-ink-muted">
          <p className="font-poppins text-base font-semibold text-text-on-ink">
            {tr("Çerezler hakkında")}
          </p>
          <p className="mt-1.5">
            {tr(
              "Dilinizi hatırlayan ve oturumunuzu açık tutan çerezler sitenin çalışması için zorunludur. Bunların dışında, sizi tanıyan anonim bir kimlik ve siteye hangi kanaldan geldiğinizi tutan bir kayıt kullanmak istiyoruz — bunlar isteğe bağlı."
            )}{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-text-on-ink">
              {tr("Ayrıntılar gizlilik sayfamızda.")}
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => choose("essential")}
            disabled={saving}
            className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {tr("Yalnızca gerekli")}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            disabled={saving}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {tr("Tümünü kabul et")}
          </button>
        </div>
      </div>
    </div>
  );
}
