"use client";
import { useTr } from "@/components/useTr";

import { useState, useTransition } from "react";

export default function VipInviteClientTrigger({
  action,
}: {
  action: () => Promise<string>;
}) {
  const tr = useTr();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const url = await action();
        setLink(url);
      } catch {
        setError("Davet bağlantısı oluşturulamadı. Lütfen tekrar deneyin.");
      }
    });
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
      >
        {tr("FXPARTNER VIP'e Katıl →")}
      </a>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Oluşturuluyor…" : "Davet bağlantımı al"}
      </button>
      {error && <p className="mt-2 text-xs text-alert">{error}</p>}
    </div>
  );
}
