"use client";

import { useActionState } from "react";
import { submitComplaint, type ComplaintFormState } from "@/app/complaint/actions";

const initialState: ComplaintFormState = { ok: false };

export default function ComplaintForm({
  brokers,
}: {
  brokers: { slug: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitComplaint, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text-dark">
          Complaint received
        </h2>
        <p className="mt-3 text-text-muted">
          Thank you. We will try to reach out to the broker within 48 hours
          and follow up by email. If you have an FXPARTNER account, you can
          also track the status from your{" "}
          <a href="/account" className="text-signal hover:text-signal-strong">
            account page
          </a>
          .
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
      <div className="grid gap-5 sm:grid-cols-2">
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
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Broker in Question
        </label>
        <select
          name="brokerSlug"
          required
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="" disabled>
            Select a broker
          </option>
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Detailed Description
        </label>
        <textarea
          name="description"
          required
          rows={6}
          minLength={20}
          placeholder="Describe what happened, including dates and amounts where possible."
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" required className="mt-0.5" />
        I consent to FXPARTNER processing the information above to review my
        complaint and contact the broker and me about it.
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Complaint"}
      </button>
    </form>
  );
}
