"use client";

import { useActionState, useState } from "react";
import Link from "@/components/LocaleLink";
import { submitComplaint, type ComplaintFormState } from "@/app/[locale]/complaint/actions";

const initialState: ComplaintFormState = { ok: false };
const OTHER_VALUE = "other";

export default function ComplaintForm({
  brokers,
}: {
  brokers: { slug: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitComplaint, initialState);
  const [brokerSlug, setBrokerSlug] = useState("");

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text-dark">
          Şikayetiniz alındı
        </h2>
        <p className="mt-3 text-text-muted">
          Teşekkür ederiz. 48 saat içinde brokerla iletişime geçmeye
          çalışacağız ve e-posta ile geri dönüş yapacağız. Bir FXPARTNER
          hesabınız varsa, durumu{" "}
          <Link href="/account" className="text-signal hover:text-signal-strong">
            hesap sayfanızdan
          </Link>{" "}
          da takip edebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Ad Soyad
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
            Telefon
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
            E-posta
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
          İlgili Aracı Kurum
        </label>
        <select
          name="brokerSlug"
          required
          value={brokerSlug}
          onChange={(e) => setBrokerSlug(e.target.value)}
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="" disabled>
            Bir aracı kurum seçin
          </option>
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
          <option value={OTHER_VALUE}>Diğer (listede yok)</option>
        </select>
        {brokerSlug === OTHER_VALUE && (
          <input
            name="otherBrokerName"
            required
            placeholder="Aracı kurum adı"
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        )}
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Detaylı Açıklama
        </label>
        <textarea
          name="description"
          required
          rows={6}
          minLength={20}
          placeholder="Mümkünse tarih ve tutarlarla birlikte ne olduğunu açıklayın."
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" required className="mt-0.5" />
        FXPARTNER&apos;ın yukarıdaki bilgileri şikayetimi incelemek ve
        broker ile benimle bu konuda iletişime geçmek için işlemesine
        onay veriyorum.
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Şikayet Gönder"}
      </button>
    </form>
  );
}
