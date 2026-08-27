"use client";
import { useTr } from "@/components/useTr";

import { useActionState, useState } from "react";
import { submitComment, type CommentFormState } from "@/app/[locale]/brokers/[slug]/actions";

const initialState: CommentFormState = { ok: false };

const FIELD =
  "w-full rounded-xl border border-hairline-light bg-paper px-4 py-2.5 text-sm text-text-dark outline-none focus:border-signal";
const LABEL = "block text-sm font-medium text-text-dark";

// The four axes a trader can actually observe. Regulation is deliberately
// absent: it is a matter of record, not experience, and asking a reader to
// score it would produce a number that reads as evidence and is not one.
const AXES = [
  { name: "ratingPlatform", label: "Platform" },
  { name: "ratingPricing", label: "Maliyet" },
  { name: "ratingService", label: "Destek" },
  { name: "ratingWithdrawal", label: "Para çekme" },
] as const;

const EXPERIENCE = [
  { value: "<1", label: "1 yıldan az" },
  { value: "1-3", label: "1-3 yıl" },
  { value: "3-5", label: "3-5 yıl" },
  { value: "5+", label: "5 yıldan fazla" },
] as const;

// The two tables above are data, and tr(row.label) would translate at
// runtime while the extractor — which only reads literal arguments — never
// learned the keys, so every label would ship Turkish to /en, /ua and /ar.
// These two switches are where the literals live.
function useAxisLabel() {
  const tr = useTr();
  return (label: string) => {
    switch (label) {
      case "Platform":
        return tr("Platform");
      case "Maliyet":
        return tr("Maliyet");
      case "Destek":
        return tr("Destek");
      case "Para çekme":
        return tr("Para çekme");
      default:
        return label;
    }
  };
}

function useExperienceLabel() {
  const tr = useTr();
  return (label: string) => {
    switch (label) {
      case "1 yıldan az":
        return tr("1 yıldan az");
      case "1-3 yıl":
        return tr("1-3 yıl");
      case "3-5 yıl":
        return tr("3-5 yıl");
      case "5 yıldan fazla":
        return tr("5 yıldan fazla");
      default:
        return label;
    }
  };
}

function AxisRow({ name, label }: { name: string; label: string }) {
  const axisLabel = useAxisLabel();
  const shown = axisLabel(label);
  const [value, setValue] = useState(0);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-text-dark">{shown}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n === value ? 0 : n)}
            aria-label={`${shown}: ${n}/5`}
            aria-pressed={n <= value}
            className={`h-7 w-7 rounded-md text-sm transition-colors ${
              n <= value ? "text-gold" : "text-text-muted/40 hover:text-text-muted"
            }`}
          >
            ★
          </button>
        ))}
        {/* Empty string when untouched, so the action stores null rather
            than a zero that would drag an average down. */}
        <input type="hidden" name={name} value={value || ""} />
      </div>
    </div>
  );
}

export default function CommentForm({
  brokerSlug,
  signedIn,
}: {
  brokerSlug: string;
  signedIn: boolean;
}) {
  const tr = useTr();
  const experienceLabel = useExperienceLabel();
  const action = submitComment.bind(null, brokerSlug);
  const [state, formAction, pending] = useActionState(action, initialState);
  // The structured half stays folded until asked for. Opening with eight
  // fields is how a review form gets abandoned; the overall verdict and a
  // score are a complete review on their own, and everything else is
  // offered rather than demanded.
  const [expanded, setExpanded] = useState(false);

  if (state.ok) {
    return (
      <p className="rounded-xl border border-hairline-light bg-paper p-5 text-sm text-text-muted">
        {tr("Teşekkürler — yorumunuz yayınlandı.")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
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

      <div className="flex flex-wrap gap-3">
        {!signedIn && (
          <input
            name="guestName"
            required
            maxLength={60}
            placeholder={tr("Adınız")}
            className={`${FIELD} max-w-xs`}
          />
        )}
        <select name="rating" defaultValue="" className={`${FIELD} w-40`}>
          <option value="">{tr("Puan yok")}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL} htmlFor="review-body">
          {tr("Genel değerlendirmeniz")}
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={3}
          placeholder={tr("Bu aracı kurumla deneyiminizi paylaşın…")}
          className={`${FIELD} mt-1.5`}
        />
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="self-start text-sm text-signal underline-offset-4 hover:underline"
        >
          {tr("Detaylı değerlendirme ekle")}
        </button>
      )}

      {expanded && (
        <div className="flex flex-col gap-4 rounded-xl border border-hairline-light bg-paper p-4">
          <div>
            <label className={LABEL} htmlFor="review-title">
              {tr("Başlık")}
            </label>
            <input
              id="review-title"
              name="title"
              maxLength={120}
              placeholder={tr("Deneyiminizi tek cümlede özetleyin")}
              className={`${FIELD} mt-1.5`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="review-experience">
              {tr("Ne kadar süredir kullanıyorsunuz?")}
            </label>
            <select
              id="review-experience"
              name="experience"
              defaultValue=""
              className={`${FIELD} mt-1.5 w-56`}
            >
              <option value="">{tr("Belirtmek istemiyorum")}</option>
              {EXPERIENCE.map((e) => (
                <option key={e.value} value={e.value}>
                  {experienceLabel(e.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Two prompts instead of one box. A reader asked "what did you
              like" and "what would you change" writes something another
              trader can use; the same reader given an empty box writes
              "good broker". */}
          <div>
            <label className={LABEL} htmlFor="review-liked">
              {tr("En çok neyi beğendiniz?")}
            </label>
            <textarea
              id="review-liked"
              name="liked"
              rows={2}
              maxLength={2000}
              className={`${FIELD} mt-1.5`}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="review-improved">
              {tr("Neyi geliştirmelerini isterdiniz?")}
            </label>
            <textarea
              id="review-improved"
              name="improved"
              rows={2}
              maxLength={2000}
              className={`${FIELD} mt-1.5`}
            />
          </div>

          <fieldset>
            <legend className={LABEL}>{tr("Puanlama")}</legend>
            <div className="mt-1 divide-y divide-hairline-light">
              {AXES.map((a) => (
                <AxisRow key={a.name} name={a.name} label={a.label} />
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {state.error && <p className="text-xs text-alert">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? tr("Gönderiliyor…") : tr("Yorum Yap")}
      </button>
    </form>
  );
}
