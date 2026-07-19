"use client";

import { useActionState } from "react";
import { submitComment, type CommentFormState } from "@/app/brokers/[slug]/actions";

const initialState: CommentFormState = { ok: false };

export default function CommentForm({
  brokerSlug,
  signedIn,
}: {
  brokerSlug: string;
  signedIn: boolean;
}) {
  const action = submitComment.bind(null, brokerSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!signedIn) {
    return (
      <p className="rounded-xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
        <a href="/account/login" className="text-signal hover:text-signal-strong">
          Sign in
        </a>{" "}
        to leave a comment about this broker.
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="rounded-xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
        Thanks — your comment has been posted.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <select
        name="rating"
        defaultValue=""
        className="w-40 rounded-xl border border-hairline-light bg-paper px-3 py-2 text-sm text-text-dark outline-none focus:border-signal"
      >
        <option value="">No rating</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} / 5
          </option>
        ))}
      </select>
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Share your experience with this broker…"
        className="w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
      />
      {state.error && <p className="text-xs text-alert">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post Comment"}
      </button>
    </form>
  );
}
