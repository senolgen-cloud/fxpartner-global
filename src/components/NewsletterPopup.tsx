"use client";
import { useTr } from "@/components/useTr";
import Sheet, { SheetAction, SheetBody, SheetTitle } from "@/components/Sheet";
import { PRIORITY, useInterruptionSlot } from "@/components/interruptionSlot";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/lib/newsletter-actions";

// Sitewide, once-per-visitor. The delay below is this component saying
// when it considers itself relevant; whether the reader actually sees it
// then is interruptionSlot's decision — it holds every sheet to a minimum
// dwell, a cooldown after the previous one, and a cap per visit. Keeping
// its own delay long anyway means it is late in the queue rather than
// racing the broker campaign for the same moment.
//
// Dismissing hides it for 30 days; subscribing hides it forever (both
// stored client-side, no server round-trip needed just to remember that).
const DISMISS_KEY = "fxpartner-newsletter-popup-dismissed-until";
const SUBSCRIBED_KEY = "fxpartner-newsletter-popup-subscribed";
const SHOW_DELAY_MS = 45000;
const DISMISS_DAYS = 30;

const initialState: NewsletterFormState = { ok: false };

export default function NewsletterPopup() {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() < dismissedUntil) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.ok) {
      localStorage.setItem(SUBSCRIBED_KEY, "1");
    }
  }, [state.ok]);

  function close() {
    setOpen(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
  }

  const owns = useInterruptionSlot("newsletter", PRIORITY.offer, open);

  return (
    <Sheet
      open={owns}
      onDismiss={close}
      labelledBy="newsletter-popup-title"
      footer={
        state.ok ? (
          <SheetAction tone="primary" onClick={close}>
            {tr("Kapat")}
          </SheetAction>
        ) : undefined
      }
    >
      {state.ok ? (
        <>
          <SheetTitle id="newsletter-popup-title">{tr("Aramıza hoş geldin")}</SheetTitle>
          <SheetBody>
            {tr("Yalnızca gerçekten değerli bulacağını düşündüğümüz şeyleri göndereceğiz — spam yok.")}
          </SheetBody>
        </>
      ) : (
        <>
          <SheetTitle id="newsletter-popup-title">
            {tr("FXPARTNER'ı ziyaret ettiğin için teşekkür ederim.")}
          </SheetTitle>
          <SheetBody>
            {tr("Bu platformu, forex piyasasında gerçekten güvenilir bilgiye ulaşmanın zor olduğunu görerek kurduk. Seninle bağlantımızı sürdürmek istersen bültenimize abone ol — yeni sinyaller, piyasa analizleri ve broker kampanyaları hakkında yalnızca işine yarayacak güncellemeleri paylaşıyoruz.")}
          </SheetBody>
          <p className="mt-3 text-[13px] leading-[1.4] text-text-on-ink-muted">
            <span className="text-text-on-ink">Erdem Torun</span>
            <br />
            {tr("FXPARTNER Kurucusu")}
          </p>

          <form action={formAction} className="mt-5 flex flex-col gap-2.5">
            <input type="hidden" name="source" value="popup" />
            <label htmlFor="newsletter-popup-email" className="sr-only">
              {tr("E-posta")}
            </label>
            {/* 16px and not smaller: iOS zooms the whole page in when a
                focused input is under 16px, which on a bottom sheet throws
                the layout across the screen mid-typing. */}
            <input
              id="newsletter-popup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={tr("E-posta")}
              className="h-[50px] w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-4 text-[16px] text-text-on-ink outline-none placeholder:text-text-on-ink-muted/70 focus:border-signal sm:h-11 sm:text-[15px]"
            />
            {state.error && <p className="text-[13px] text-alert">{state.error}</p>}
            <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <SheetAction tone="secondary" type="button" onClick={close}>
                {tr("Şimdi değil")}
              </SheetAction>
              <SheetAction tone="primary" type="submit" disabled={pending}>
                {pending ? "…" : tr("Gönder")}
              </SheetAction>
            </div>
          </form>
        </>
      )}
    </Sheet>
  );
}
