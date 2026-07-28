"use client";

import { useActionState } from "react";
import {
  submitPartnerApplication,
  type PartnerApplicationFormState,
} from "@/app/partners/actions";

const initialState: PartnerApplicationFormState = { ok: false };

const audienceOptions = [
  { value: "social_media", label: "Social media following (Instagram, YouTube, X…)" },
  { value: "signal_group", label: "Trading signal / community group" },
  { value: "website", label: "My own website or blog" },
  { value: "offline_network", label: "Personal / offline network of traders" },
  { value: "other", label: "Other" },
];

export default function PartnerApplicationForm({
  brokers,
}: {
  brokers: { slug: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitPartnerApplication, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text-dark">
          Application received
        </h2>
        <p className="mt-3 text-text-muted">
          Thank you. Our partnerships team reviews every application and will
          reach out by email to walk through the Sub-IB setup for the broker
          you&apos;re interested in.
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
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            Country
          </label>
          <input
            name="country"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            Preferred Broker
          </label>
          <select
            name="brokerSlug"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          >
            <option value="">No preference / not sure yet</option>
            {brokers.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          How do you reach potential clients?
        </label>
        <select
          name="audienceType"
          required
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="" disabled>
            Select an option
          </option>
          {audienceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Tell us about your audience and plan
        </label>
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          placeholder="Roughly how many people you reach, how active they are as traders, and how you'd introduce them to a broker."
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" required className="mt-0.5" />
        I understand this is an application, not a guarantee of approval or
        income, and I consent to FXPARTNER contacting me about it.
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Apply as a Partner"}
      </button>
    </form>
  );
}
