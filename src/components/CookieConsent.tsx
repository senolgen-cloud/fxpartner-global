"use client";

import { useEffect, useState } from "react";
import Link from "@/components/LocaleLink";
import { useTr } from "@/components/useTr";
import { useLocale } from "@/components/LocaleProvider";
import { CONSENT_COOKIE, cookieValue, type Decision } from "@/lib/consent";
import Sheet, { SheetAction, SheetBody, SheetNote, SheetTitle } from "@/components/Sheet";
import { PRIORITY, useInterruptionSlot } from "@/components/interruptionSlot";

const ONE_YEAR = 60 * 60 * 24 * 365;

function hasChosen(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${CONSENT_COOKIE}=`));
}

/**
 * Consent for the two cookies the site does not need in order to work:
 * fxp_vid (a stable anonymous browser id) and fxp_attr (first-touch
 * attribution). The language cookies and the auth session are not offered
 * as a choice — without them the site cannot do what the reader came for —
 * and that is stated on the sheet rather than left implied.
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
 *
 * Rendered as a modal sheet with no dismiss: there is no third answer, and
 * a close button on a consent prompt is one — the reader who takes it has
 * refused, but nothing recorded that they did.
 */
export default function CookieConsent() {
  const tr = useTr();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Never rendered during SSR: the server has no way to know what this
  // browser already chose, and guessing would flash a sheet at readers
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

  // Highest priority in the slot, and the reason the slot exists: a
  // newsletter sheet and a consent sheet both anchor to the bottom edge,
  // so without this they land on top of each other — which is exactly what
  // happened the first time this was tested.
  const owns = useInterruptionSlot("consent", PRIORITY.consent, visible);

  return (
    <Sheet
      open={owns}
      labelledBy="cookie-consent-title"
      footer={
        <>
          <SheetAction tone="secondary" onClick={() => choose("essential")} disabled={saving}>
            {tr("Yalnızca gerekli")}
          </SheetAction>
          <SheetAction tone="primary" onClick={() => choose("all")} disabled={saving}>
            {tr("Tümünü kabul et")}
          </SheetAction>
        </>
      }
    >
      <SheetTitle id="cookie-consent-title">{tr("Çerezler")}</SheetTitle>
      <SheetBody>
        {tr(
          "Dilinizi hatırlayan ve oturumunuzu açık tutan çerezler sitenin çalışması için zorunludur. Bunların dışında, sizi tanıyan anonim bir kimlik ve siteye hangi kanaldan geldiğinizi tutan bir kayıt kullanmak istiyoruz — bunlar isteğe bağlı."
        )}
      </SheetBody>
      <SheetNote>
        <Link href="/privacy" className="underline underline-offset-4 hover:text-text-on-ink">
          {tr("Hangi çerezi ne için kullandığımız")}
        </Link>
      </SheetNote>
    </Sheet>
  );
}
