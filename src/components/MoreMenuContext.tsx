"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Shared open/close state for the full-screen "more" menu, since it's
// triggered from two places that don't share a DOM ancestor otherwise:
// HeaderNav's hamburger (tablet width) and MobileBottomNav's "Daha Fazla"
// tab (phone width). Only one of those two triggers is ever visible at a
// given breakpoint, but both need to open the same overlay.
const MoreMenuContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function MoreMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MoreMenuContext.Provider value={{ open, setOpen }}>{children}</MoreMenuContext.Provider>;
}

export function useMoreMenu() {
  const ctx = useContext(MoreMenuContext);
  if (!ctx) throw new Error("useMoreMenu must be used within MoreMenuProvider");
  return ctx;
}
