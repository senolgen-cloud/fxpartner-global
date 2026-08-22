"use client";

import { useActionState } from "react";
import {
  submitPartnerApplication,
  type PartnerApplicationFormState,
} from "@/app/[locale]/partners/actions";

const initialState: PartnerApplicationFormState = { ok: false };

const audienceOptions = [
  { value: "social_media", label: "Sosyal medya takipçi kitlesi (Instagram, YouTube, X…)" },
  { value: "signal_group", label: "Sinyal / topluluk grubu" },
  { value: "website", label: "Kendi web sitem veya blogum" },
  { value: "offline_network", label: "Kişisel / çevrimdışı yatırımcı ağı" },
  { value: "other", label: "Diğer" },
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
          Başvurunuz alındı
        </h2>
        <p className="mt-3 text-text-muted">
          Teşekkür ederiz. Ortaklıklar ekibimiz her başvuruyu inceler ve
          ilgilendiğiniz aracı kurum için Sub-IB kurulumunu anlatmak üzere
          e-posta ile sizinle iletişime geçer.
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
            E-posta
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
            Telefon
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
            Ülke
          </label>
          <input
            name="country"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            Tercih Edilen Aracı Kurum
          </label>
          <select
            name="brokerSlug"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          >
            <option value="">Tercihim yok / henüz emin değilim</option>
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
          Potansiyel müşterilere nasıl ulaşıyorsunuz?
        </label>
        <select
          name="audienceType"
          required
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="" disabled>
            Bir seçenek belirleyin
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
          Kitleniz ve planınız hakkında bize bilgi verin
        </label>
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          placeholder="Yaklaşık kaç kişiye ulaştığınız, bu kişilerin yatırımcı olarak ne kadar aktif olduğu ve onları bir aracı kuruma nasıl yönlendireceğiniz."
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" required className="mt-0.5" />
        Bunun bir başvuru olduğunu, onay veya gelir garantisi vermediğini
        anlıyorum ve FXPARTNER&apos;ın bu konuda benimle iletişime geçmesine
        onay veriyorum.
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Partner Olarak Başvur"}
      </button>
    </form>
  );
}
