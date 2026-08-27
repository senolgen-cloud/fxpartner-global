"use client";
import { useTr } from "@/components/useTr";

import { useActionState } from "react";
import { submitCashbackSetup, type SetupState } from "@/app/[locale]/cashback/[slug]/setup/actions";

const initialState: SetupState = { ok: false };

export default function CashbackSetupForm({ brokerSlug }: { brokerSlug: string }) {
  const tr = useTr();
  const action = submitCashbackSetup.bind(null, brokerSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-poppins text-2xl font-semibold text-text-dark">
          {tr("Kurulum tamamlandı")}
        </h2>
        <p className="mt-3 text-text-muted">
          {tr("Hesabınızı partner panelimizle doğrulayıp kazanç iadenizi takip etmeye başlayacağız. Bir FXPARTNER hesabınız varsa, durumunu hesap sayfanızdan da kontrol edebilirsiniz.")}
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
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          {tr("E-posta")}
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
          {tr("İşlem Hesap Numarası")}
        </label>
        <input
          name="accountNumber"
          required
          placeholder={tr("örn. 12345678")}
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          {tr("Henüz açmadıysanız bu hesabı önce bizim bağlantımız üzerinden açın — kazanç iadesi yalnızca FXPARTNER tarafından yönlendirilen hesaplar için geçerlidir.")}
        </p>
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5" />
        {tr("Evet, ilgili tanıtım ve kampanyalar hakkında bana e-posta gönderin. (İsteğe bağlı — kazanç iadesi almak için gerekli değildir.)")}
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Cashback Kurulumunu Tamamla"}
      </button>

      <p className="text-xs leading-relaxed text-text-muted">
        {tr("Bu bilgileri hesabınızı aracı kurumla doğrulamak ve kazanç iadenizi takip etmek için kullanıyoruz. Yukarıdaki kutuyu işaretlemediğiniz sürece başka bir amaç için kullanılmaz.")}
      </p>
    </form>
  );
}
