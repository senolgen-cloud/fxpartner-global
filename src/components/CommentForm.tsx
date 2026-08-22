"use client";
import { useTr } from "@/components/useTr";

import { useActionState } from "react";
import { submitComment, type CommentFormState } from "@/app/[locale]/brokers/[slug]/actions";

const initialState: CommentFormState = { ok: false };

export default function CommentForm({
  brokerSlug,
  signedIn,
}: {
  brokerSlug: string;
  signedIn: boolean;
}) {
  const tr = useTr();
  const action = submitComment.bind(null, brokerSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.ok) {
    return (
      <p className="rounded-xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
        {tr("Teşekkürler — yorumunuz yayınlandı.")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {/* Honeypot — hidden from real visitors via CSS, not just visually
          off-screen, so a bot's own "fill every field" pass still finds
          and fills it. Real users never see or touch this. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      {!signedIn && (
        <input
          name="guestName"
          required
          maxLength={60}
          placeholder={tr("Adınız")}
          className="w-full max-w-xs rounded-xl border border-hairline-light bg-paper px-4 py-2.5 text-sm text-text-dark outline-none focus:border-signal"
        />
      )}
      <select
        name="rating"
        defaultValue=""
        className="w-40 rounded-xl border border-hairline-light bg-paper px-3 py-2 text-sm text-text-dark outline-none focus:border-signal"
      >
        <option value="">Puan yok</option>
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
        placeholder={tr("Bu aracı kurumla deneyiminizi paylaşın…")}
        className="w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
      />
      {state.error && <p className="text-xs text-alert">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Yorum Yap"}
      </button>
    </form>
  );
}
