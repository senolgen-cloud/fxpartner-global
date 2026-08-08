"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/lib/newsletter-actions";

const initialState: NewsletterFormState = { ok: false };

export default function NewsletterSignup({ source }: { source: string }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  if (state.ok) {
    return (
      <p className="text-sm text-text-on-ink">
        Thanks — you&apos;re on the list. We&apos;ll only email you real updates,
        no spam.
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
        placeholder="you@email.com"
        className="w-full min-w-0 rounded-full border border-hairline bg-ink-soft px-4 py-2.5 text-sm text-text-on-ink outline-none focus:border-signal sm:flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "…" : "Subscribe"}
      </button>
      {state.error && <p className="text-xs text-alert sm:basis-full">{state.error}</p>}
    </form>
  );
}
