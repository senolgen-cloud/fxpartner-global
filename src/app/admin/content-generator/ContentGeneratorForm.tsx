"use client";

import Link from "next/link";
import { useActionState } from "react";
import { generateBlogDraft, generateCoverImage } from "./actions";

export default function ContentGeneratorForm({
  brokers,
}: {
  brokers: { slug: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(generateBlogDraft, {
    slug: null,
    title: null,
    error: null,
  });
  const [imageState, imageFormAction, isImagePending] = useActionState(generateCoverImage, {
    published: false,
    error: null,
  });

  return (
    <div className="mt-8">
      <form action={formAction} className="space-y-3">
        <input
          name="topic"
          required
          placeholder="Topic, e.g. 'How spreads work and why they vary'"
          className="w-full rounded-lg border border-hairline-light bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <select
          name="brokerSlug"
          defaultValue=""
          className="w-full rounded-lg border border-hairline-light bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
        >
          <option value="">No specific broker (general topic)</option>
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          name="angle"
          placeholder="Angle (optional), e.g. 'compare to ECN brokers'"
          className="w-full rounded-lg border border-hairline-light bg-paper px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          {isPending ? "Generating & publishing…" : "Generate & Publish"}
        </button>
      </form>

      {state.error && (
        <p className="mt-6 rounded-lg border border-hairline-light bg-paper px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.slug && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-hairline-light bg-paper px-4 py-3">
            <p className="text-sm text-text-dark">
              Published: <strong>{state.title}</strong>
            </p>
            <Link
              href={`/blog/${state.slug}`}
              target="_blank"
              className="mt-1 inline-block font-mono text-xs uppercase tracking-[0.1em] text-signal hover:underline"
            >
              View live post →
            </Link>
          </div>

          <div className="border-t border-hairline-light pt-6">
            <p className="mb-1 font-mono text-xs uppercase tracking-[0.1em] text-text-muted">
              Cover image (optional)
            </p>
            <p className="mb-3 text-sm text-text-muted">
              Generates and immediately publishes a cover photo for the post above.
            </p>
            <form action={imageFormAction} className="flex items-center gap-3">
              <input type="hidden" name="imageSlug" value={state.slug} />
              <input type="hidden" name="imageTitle" value={state.title ?? ""} />
              <button
                type="submit"
                disabled={isImagePending}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft disabled:opacity-50"
              >
                {isImagePending ? "Generating & publishing…" : "Generate Cover Image"}
              </button>
            </form>

            {imageState.error && (
              <p className="mt-3 text-sm text-red-600">{imageState.error}</p>
            )}
            {imageState.published && (
              <p className="mt-3 text-sm text-text-muted">
                Cover image published — refresh the live post to see it.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
