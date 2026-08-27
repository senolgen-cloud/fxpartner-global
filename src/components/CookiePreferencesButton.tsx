"use client";

import { useTr } from "@/components/useTr";
import { CONSENT_COOKIE } from "@/lib/consent";

/**
 * Withdrawing has to be as easy as giving, so the privacy page carries a
 * control that puts the banner back rather than telling the reader to go
 * clear their browser's site data.
 *
 * It only expires the consent cookie and reloads. The middleware then sees
 * no decision, which it already treats as a refusal — fxp_vid and fxp_attr
 * are cleared on that same request — and the banner asks again. Answering
 * writes a new consent record, so a withdrawal leaves its own trace next
 * to the consent it replaced.
 */
export default function CookiePreferencesButton() {
  const tr = useTr();

  function reopen() {
    document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={reopen}
      className="mt-4 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-text-dark/5"
    >
      {tr("Çerez tercihimi değiştir")}
    </button>
  );
}
