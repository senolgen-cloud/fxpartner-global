"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalePathname } from "@/components/useLocalePathname";
import { useTr } from "@/components/useTr";
import { isStandalone } from "@/lib/standalone";

const DEPTH_KEY = "fxp:navDepth";

// The bottom nav's tab roots. Reaching one of these is a lateral move
// between sections, not a push onto a stack, and iOS shows no back control
// at the root of a tab — tapping "Anasayfa" from four levels deep into a
// broker review lands on a screen that is the start of something, not the
// middle of it. Without this the button sat on the home screen offering to
// undo the tab switch, which is not what a back chevron means to anyone.
// Kept in sync with MobileBottomNavClient's tabs by hand; both lists are
// short and neither moves often.
const TAB_ROOTS = new Set([
  "/",
  "/signals",
  "/prop-firmalar",
  "/ai-asistan",
  "/account",
  "/account/login",
]);

// Back control for the installed app.
//
// ONLY IN STANDALONE, AND THAT IS THE WHOLE POINT. In a browser tab Safari
// and Chrome both already offer back, and a second one in our header would
// be clutter that does the same job worse. Installed to the Home Screen on
// iOS there is no browser chrome at all and no edge-swipe out of a
// standalone web app, so a reader who taps into a broker review has no way
// out but to kill the app. That is the case this exists for.
//
// It also only appears once the reader has actually navigated somewhere.
// history.length is useless here — it counts the whole tab's history
// including pages from before our app — so the depth is counted for
// ourselves, in sessionStorage, which is scoped to this tab and survives a
// reload exactly as the history entries themselves do.
export default function AppBackButton() {
  const tr = useTr();
  const router = useRouter();
  const pathname = useLocalePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read in an effect, never during render: both the standalone check and
    // sessionStorage are browser-only, and deciding visibility during the
    // first render would make the client's markup disagree with the
    // server's and get the header rehydrated wrong.
    if (!isStandalone()) return;

    let depth = 0;
    try {
      depth = Number(sessionStorage.getItem(DEPTH_KEY) ?? "0");
      if (!Number.isFinite(depth) || depth < 0) depth = 0;
    } catch {
      // Private mode and blocked site data both throw here. No storage
      // means no reliable depth, so the button simply stays hidden rather
      // than offering a back that might leave the app.
      return;
    }

    // The whole decision rests on two browser-only reads — display-mode and
    // sessionStorage — and neither can happen during render: on the server
    // they do not exist, and a render-time read on the client would produce
    // markup disagreeing with what the server sent. Reading after mount and
    // setting state is the intended shape for that, and it settles in one
    // extra render of a control that is hidden for everyone in a browser
    // tab anyway.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(depth > 0 && !TAB_ROOTS.has(pathname));

    // Count this view as one level deeper for whatever comes next. Written
    // after the visibility decision so the page the reader landed on does
    // not count itself.
    try {
      sessionStorage.setItem(DEPTH_KEY, String(depth + 1));
    } catch {
      // Ignore: the button is already showing or hidden correctly for this
      // view, and a failed write only affects the next one.
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        // Decrement before leaving, so arriving back at the previous view
        // sees the depth it had rather than a level that no longer exists.
        try {
          const d = Number(sessionStorage.getItem(DEPTH_KEY) ?? "1");
          sessionStorage.setItem(DEPTH_KEY, String(Math.max(0, d - 2)));
        } catch {
          // Storage gone mid-session; the back itself still works.
        }
        router.back();
      }}
      aria-label={tr("Geri")}
      className="-ms-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-on-ink transition-colors hover:bg-ink-soft active:bg-ink-soft md:hidden"
    >
      {/* Apple's back chevron is thin and large rather than a small heavy
          one; 24px at stroke 2 reads as the system control iOS users are
          reaching for. Mirrored in RTL like every other chevron here. */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="rtl:-scale-x-100"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
