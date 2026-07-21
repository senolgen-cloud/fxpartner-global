"use client";

import { useActionState } from "react";
import { submitSignIn, type SignInState } from "@/app/account/login/actions";

const initialState: SignInState = { ok: false };

export default function SignInForm({
  brokers,
}: {
  brokers: { slug: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitSignIn, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Full Name
        </label>
        <input
          name="fullName"
          required
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Phone
        </label>
        <input
          name="phone"
          type="tel"
          required
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Which broker do you trade with? <span className="normal-case text-text-muted/70">(optional)</span>
        </label>
        <select
          name="preferredBroker"
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="">Prefer not to say</option>
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-signal px-5 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
