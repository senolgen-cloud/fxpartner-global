"use client";
import { useTr } from "@/components/useTr";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/lib/newsletter-actions";

const initialState: NewsletterFormState = { ok: false };

export default function NewsletterSignup({ source }: { source: string }) {
  const tr = useTr();
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  if (state.ok) {
    return (
      <p className="text-sm text-text-on-ink">
        {tr("Teşekkürler — listeye eklendiniz. Size yalnızca gerçek güncellemeler gönderiyoruz, spam yok.")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="source" value={source} />
      <input
        name="email"
        type="email"
        required
        placeholder="siz@email.com"
        className="w-full min-w-0 rounded-full border border-hairline bg-ink-soft px-4 py-2.5 text-sm text-text-on-ink outline-none focus:border-signal sm:flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "…" : "Abone Ol"}
      </button>
      {state.error && <p className="text-xs text-alert sm:basis-full">{state.error}</p>}
    </form>
  );
}
