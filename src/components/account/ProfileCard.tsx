"use client";

import { useState, useTransition } from "react";
import { useTr } from "@/components/useTr";
import { ACCENTS, accentHex } from "@/lib/accents";

/**
 * The editable half of the profile.
 *
 * Four things, and no more: the name to be called by, the colour behind the
 * monogram, the country, and the broker the member actually trades with. Each
 * one is used somewhere — the country decides which brokers and which
 * leverage apply, the broker is what cashback attaches to — so none of them
 * is a field asked for because a profile form usually has fields.
 *
 * Saving is optimistic in the only way that matters: the monogram and its
 * colour update as you type and pick, so the choice is visible before the
 * round trip. Nothing else moves.
 */
export default function ProfileCard({
  action,
  initialName,
  initialAccent,
  initialCountry,
  initialBroker,
  email,
  countries,
  brokers,
}: {
  action: (formData: FormData) => Promise<void>;
  initialName: string;
  initialAccent: string;
  initialCountry: string;
  initialBroker: string;
  email: string;
  countries: { code: string; name: string }[];
  brokers: { slug: string; name: string }[];
}) {
  const tr = useTr();
  const [name, setName] = useState(initialName);
  const [accent, setAccent] = useState(initialAccent);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const initial = (name.trim() || email)[0]?.toLocaleUpperCase("tr-TR") ?? "?";
  const hex = accentHex(accent);

  const accentLabel: Record<string, string> = {
    signal: tr("Turkuaz"),
    gold: tr("Altın"),
    green: tr("Yeşil"),
    violet: tr("Mor"),
    rose: tr("Gül"),
    slate: tr("Gri"),
  };

  const field =
    "w-full rounded-xl border border-hairline-light bg-ink px-4 py-3 text-[15px] text-text-on-ink outline-none transition-colors focus:border-signal";
  const label = "mb-2 block text-sm font-medium text-text-on-ink";

  return (
    <section className="rounded-2xl border border-hairline bg-ink-soft p-6">
      <h2 className="font-display text-lg font-semibold text-text-on-ink">{tr("Profiliniz")}</h2>
      <p className="mt-1 text-sm text-text-on-ink-muted">
        {tr("Sizi nasıl çağıracağımızı ve panelinizin rengini siz seçin.")}
      </p>

      <form
        action={(fd) =>
          startTransition(async () => {
            await action(fd);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          })
        }
        className="mt-6"
      >
        <div className="flex items-center gap-5">
          {/* Updates as you type and pick — the point of choosing a colour is
              seeing it, and a save round trip is too late for that. */}
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold transition-colors duration-300"
            style={{ backgroundColor: `${hex}22`, color: hex, border: `2px solid ${hex}66` }}
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor="displayName" className={label}>
              {tr("Görünen ad")}
            </label>
            <input
              id="displayName"
              name="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={email.split("@")[0]}
              className={field}
            />
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className={label}>{tr("Vurgu rengi")}</legend>
          <input type="hidden" name="accentColor" value={accent} />
          <div className="grid max-w-[17rem] grid-cols-6 gap-2 sm:gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccent(a.id)}
                aria-pressed={accent === a.id}
                aria-label={accentLabel[a.id] ?? a.id}
                className="flex aspect-square w-full items-center justify-center rounded-full text-ink transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                style={{
                  backgroundColor: a.hex,
                  boxShadow: accent === a.id ? `0 0 0 2px var(--color-ink-soft), 0 0 0 4px ${a.hex}` : undefined,
                }}
              >
                {accent === a.id && (
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className={label}>
              {tr("Ülke")}
            </label>
            <select id="country" name="country" defaultValue={initialCountry} className={field}>
              <option value="">{tr("Belirtmek istemiyorum")}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="preferredBroker" className={label}>
              {tr("Kullandığınız broker")}
            </label>
            <select
              id="preferredBroker"
              name="preferredBroker"
              defaultValue={initialBroker}
              className={field}
            >
              <option value="">{tr("Seçilmedi")}</option>
              {brokers.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {pending ? tr("Kaydediliyor…") : tr("Profili kaydet")}
          </button>
          {saved && (
            <span className="text-sm text-tick-up motion-safe:animate-[fadeIn_0.2s_ease-out]">
              {tr("Kaydedildi")}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
