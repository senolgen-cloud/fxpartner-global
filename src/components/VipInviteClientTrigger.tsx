"use client";

import { useState, useTransition } from "react";

export default function VipInviteClientTrigger({
  action,
}: {
  action: () => Promise<string>;
}) {
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
        setError("Could not generate an invite link. Please try again.");
      }
    });
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
      >
        Join FXPARTNER VIP →
      </a>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Generating…" : "Get my invite link"}
      </button>
      {error && <p className="mt-2 text-xs text-alert">{error}</p>}
    </div>
  );
}
