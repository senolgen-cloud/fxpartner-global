"use client";

import { useActionState } from "react";
import { submitCashbackSetup, type SetupState } from "@/app/cashback/[slug]/setup/actions";

const initialState: SetupState = { ok: false };

export default function CashbackSetupForm({ brokerSlug }: { brokerSlug: string }) {
  const action = submitCashbackSetup.bind(null, brokerSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-poppins text-2xl font-semibold text-text-dark">
          You&apos;re set up
        </h2>
        <p className="mt-3 text-text-muted">
          We&apos;ll verify your account against our partner dashboard and
          start tracking your cashback. If you have an FXPARTNER account,
          you can also check its status from your account page.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Trading Account Number
        </label>
        <input
          name="accountNumber"
          required
          placeholder="e.g. 12345678"
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Open this account through our link first if you haven&apos;t
          already — cashback only applies to accounts referred by
          FXPARTNER.
        </p>
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5" />
        Yes, email me about relevant promotions and campaigns. (Optional —
        not required to receive cashback.)
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Set Up Cashback"}
      </button>

      <p className="text-xs leading-relaxed text-text-muted">
        We use this information to verify your account with the broker and
        track your cashback. It won&apos;t be used for anything else unless
        you check the box above.
      </p>
    </form>
  );
}
