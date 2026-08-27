"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTr } from "@/components/useTr";

/**
 * Every interruption on this site — consent, install, notifications,
 * newsletter, campaign — is one shape.
 *
 * On a phone that shape is an iOS sheet: it rises from the bottom edge on
 * Apple's own easing curve, carries a grabber, and puts its actions at the
 * bottom where the thumb already is. On a wider screen the same contents
 * become a floating card. The site previously had three treatments for the
 * same job — a centred modal with an ×, two corner toasts, and a full-width
 * bar — which is three chances for a reader to learn a different pattern
 * for the same kind of moment.
 *
 * The grabber is doing real work here. It is the one element that tells a
 * reader, before they have read a word, that this is a sheet rather than an
 * ad, and nothing else on the site uses it.
 *
 * Sheets are set in --font-apple, which resolves to SF Pro on Apple
 * hardware and Geist elsewhere. Deliberately not the site's display face:
 * these are system moments, not editorial ones, and they should read as
 * belonging to the device rather than to the page underneath.
 */

export type SheetVariant =
  /** Dims the page and takes focus. For anything asking a real question. */
  | "modal"
  /** Sits above the page without dimming it. For offers and nudges. */
  | "passive";

export default function Sheet({
  open,
  onDismiss,
  variant = "modal",
  labelledBy,
  ariaLabel,
  children,
  footer,
  desktopAlign = "center",
}: {
  open: boolean;
  /** Omit to make the sheet undismissable — the reader must answer. */
  onDismiss?: () => void;
  variant?: SheetVariant;
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Actions. Stacked full-width on phones, inline from sm up. */
  footer?: ReactNode;
  desktopAlign?: "center" | "end";
}) {
  const tr = useTr();
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes, but only a sheet that can be closed at all. A consent
  // sheet has no dismiss, and Escape must not become a silent third answer.
  useEffect(() => {
    if (!open || !onDismiss) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  // Modal sheets hold focus. Without this, tabbing walks straight out of
  // the sheet and into a page the reader cannot see behind the scrim.
  useEffect(() => {
    if (!open || variant !== "modal") return;
    const panel = panelRef.current;
    if (!panel) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onKeyDown);

    // The page behind a scrim must not scroll under the reader's thumb.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Floating controls go with it. They sit below the sheet and are
    // already unreachable behind the scrim, but at 90% they still read
    // through the material as hard-edged discs sitting on the buttons —
    // and a modal that shows live-looking controls it will not let you
    // press is worse than one that shows none.
    document.body.dataset.sheet = "modal";

    return () => {
      panel.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.sheet;
      previous?.focus?.();
    };
  }, [open, variant]);

  if (!open) return null;

  const alignment =
    desktopAlign === "end" ? "sm:items-end sm:justify-end sm:p-6" : "sm:items-center sm:justify-center sm:p-6";

  return (
    <div
      className={[
        "fixed inset-0 z-[70] flex items-end justify-center",
        alignment,
        variant === "modal" ? "bg-black/60 sheet-scrim-in" : "pointer-events-none",
      ].join(" ")}
      onClick={variant === "modal" && onDismiss ? onDismiss : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={variant === "modal"}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={[
          // Vibrancy, not a new colour: the site's own ink seen through
          // blur, which is how Apple's sheets relate to what is behind them.
          //
          // 90% and not less. At 80% the floating support and quick-access
          // buttons sitting behind the sheet bled through it as legible
          // discs on top of the primary action, which reads as a bug rather
          // than as depth. Apple's own thick material is around here too;
          // the blur still does its work on the large soft areas behind,
          // which is where vibrancy is actually visible.
          "pointer-events-auto w-full border-t border-white/10 bg-ink/90 text-text-on-ink",
          "backdrop-blur-2xl backdrop-saturate-150",
          "sheet-type",
          // Phone: edge-to-edge sheet with rounded top corners.
          "rounded-t-[22px] sheet-rise",
          // Wider: a card that floats clear of every edge.
          "sm:max-w-[26rem] sm:rounded-[20px] sm:border sm:shadow-2xl sm:shadow-black/40 sm:sheet-card-in",
        ].join(" ")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        {/* Grabber. Decorative on desktop, so it goes with the sheet. */}
        <div className="flex justify-center pb-1 pt-2 sm:hidden" aria-hidden="true">
          <span className="h-[5px] w-9 rounded-full bg-white/25" />
        </div>

        <div className="px-6 pb-5 pt-3 sm:px-7 sm:pb-6 sm:pt-6">{children}</div>

        {footer && (
          <div className="flex flex-col gap-2.5 px-6 pb-6 sm:flex-row sm:justify-end sm:px-7">{footer}</div>
        )}

        {/* A passive sheet still needs a way out for keyboard and screen
            reader users, who have no scrim to click. */}
        {variant === "passive" && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="sr-only focus:not-sr-only focus:absolute focus:end-4 focus:top-4 focus:rounded-full focus:bg-white/15 focus:px-4 focus:py-2 focus:text-sm"
          >
            {tr("Kapat")}
          </button>
        )}
      </div>
    </div>
  );
}

/** Sheet title. iOS title weight and tracking, not the site's display face. */
export function SheetTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-text-on-ink">
      {children}
    </h2>
  );
}

/** Sheet body copy. 15px/1.47 is iOS's subhead, and it is what fits. */
export function SheetBody({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[15px] leading-[1.47] text-text-on-ink-muted">{children}</p>;
}

/** Footnote under the actions — disclaimers, small print. */
export function SheetNote({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[13px] leading-[1.4] text-text-on-ink-muted/80">{children}</p>;
}

const BUTTON_BASE =
  "inline-flex h-[50px] items-center justify-center rounded-[14px] px-5 text-[16px] font-medium " +
  "transition-colors disabled:opacity-60 sm:h-11 sm:text-[15px]";

/**
 * Actions are the same size and the same type; only the fill differs.
 *
 * That matters beyond taste on the consent sheet, where refusing has to be
 * as easy to find as accepting — a greyed-out or smaller "no" is the thing
 * regulators actually object to.
 */
export function SheetAction({
  tone = "primary",
  ...props
}: { tone?: "primary" | "secondary" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        BUTTON_BASE,
        tone === "primary"
          ? "bg-signal text-on-signal hover:bg-signal-strong"
          : "bg-white/10 text-text-on-ink hover:bg-white/15",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function SheetLinkAction({
  tone = "primary",
  className = "",
  ...props
}: { tone?: "primary" | "secondary" } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={[
        BUTTON_BASE,
        tone === "primary"
          ? "bg-signal text-on-signal hover:bg-signal-strong"
          : "bg-white/10 text-text-on-ink hover:bg-white/15",
        className,
      ].join(" ")}
    />
  );
}
