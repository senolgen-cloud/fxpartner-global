"use client";
import { useTr, useTrf } from "@/components/useTr";
import Sheet, { SheetAction, SheetBody, SheetLinkAction, SheetNote, SheetTitle } from "@/components/Sheet";
import { PRIORITY, useInterruptionSlot } from "@/components/interruptionSlot";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBrokerBySlug } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-bonus-popup-dismissed";

const PROMOS = [
  {
    slug: "xm",
    headline: "Yeni Hesaplara %100 Bonus",
    body: "FXPARTNER partner koduyla XM hesabı açan yeni yatırımcılar %100 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "avatrade",
    headline: "FXPARTNER'a Özel %15 Bonus",
    body: "FXPARTNER partner koduyla AvaTrade hesabı açan yeni yatırımcılar özel %15 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "lite-finance",
    headline: "FXPARTNER'a Özel %20 Bonus",
    body: "FXPARTNER partner koduyla Lite Finance hesabı açan yeni yatırımcılar özel %20 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "tickmill",
    headline: "30$ Hoş Geldin Bonusu",
    body: "FXPARTNER partner koduyla Tickmill hesabı açan yeni yatırımcılar 30$ hoş geldin bonusu talep edebilir. Bonus uygunluğu hesap türüne ve ülkeye göre değişir.",
  },
] as const;

// Shown only on the review page of a broker that actually has a promo
// below (see /brokers/[slug]/page.tsx) — no more sitewide random-broker
// popup stacked behind the Telegram one, which is what made every fresh
// visit feel like a wall of back-to-back popups.
export default function BonusPopup({ slug }: { slug: string }) {
  const tr = useTr();
  const trf = useTrf();
  const [open, setOpen] = useState(false);

  const promo = PROMOS.find((p) => p.slug === slug);
  const broker = promo ? getBrokerBySlug(promo.slug) : undefined;

  useEffect(() => {
    if (!promo) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    // Ready early, shown when it is polite: interruptionSlot will not let
    // this onto the screen inside the first seconds of a visit or of this
    // page, or within the quiet period after another sheet. 1.5s used to
    // be when a reader saw it, and landing on a broker page and being
    // interrupted a second and a half later is the complaint this whole
    // policy exists to answer.
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [promo]);

  function close() {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  // The hook has to run on every render, so the slot is claimed on
  // `open` alone and the missing-promo case is handled by the Sheet's own
  // `open` prop rather than by returning early above it.
  const ready = open && !!promo && !!broker;
  const owns = useInterruptionSlot("bonus", PRIORITY.offer, ready);
  if (!promo || !broker) return null;

  return (
    <Sheet
      open={owns}
      onDismiss={close}
      labelledBy="bonus-popup-title"
      footer={
        <>
          <SheetAction tone="secondary" onClick={close}>
            {tr("Şimdi değil")}
          </SheetAction>
          <SheetLinkAction
            tone="primary"
            href={broker.referralUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={close}
          >
            {trf("{broker} - Siteye Git", { broker: broker.name })}
          </SheetLinkAction>
        </>
      }
    >
      {/* The one sheet that keeps the site's own eyebrow: it is a brand
          speaking, not the device, and the broker's name is the first
          thing the reader needs. The system sheets drop it. */}
      <div className="flex items-center gap-3">
        {broker.logo && (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-white p-1.5">
            <Image src={broker.logo} alt={broker.name} fill sizes="40px" className="object-contain" />
          </div>
        )}
        <span className="text-[13px] font-medium text-signal">
          <span className="notranslate">{broker.name}</span> {tr("Kampanyası")}
        </span>
      </div>

      {/* Translated like every other string in this sheet. They were the
          two that were not, and because they are read out of PROMOS rather
          than written as literals in the JSX, check-untranslated-jsx never
          saw them: it reads text nodes, and `{promo.headline}` is an
          expression. The visible result was a Ukrainian page whose buttons
          and small print were Ukrainian around a Turkish headline and a
          Turkish paragraph. */}
      <div className="mt-3.5">
        <SheetTitle id="bonus-popup-title">{tr(promo.headline)}</SheetTitle>
      </div>
      <SheetBody>{tr(promo.body)}</SheetBody>
      <SheetNote>
        {trf(
          "Güncel bonus koşulları için {broker}'in resmi sitesini kontrol edin · Bonus kampanyaları bazı bölgelerde/hesap türlerinde geçerli olmayabilir · Şartlar ve koşullar geçerlidir",
          { broker: broker.name }
        )}
      </SheetNote>
    </Sheet>
  );
}
