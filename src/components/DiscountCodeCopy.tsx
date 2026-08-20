"use client";

import { useState } from "react";

/**
 * Kopyalanabilir indirim kodu bloğu.
 *
 * Kod, sayfanın tek eylem çağrısı olduğu için düz metin değil buton:
 * mobilde kodu elle seçip kopyalamak en yaygın sürtünme noktası.
 * Pano erişimi reddedilirse sessizce geçer — kod zaten ekranda okunabilir
 * durumda, yani başarısızlık kullanıcıyı engellemiyor.
 */
export default function DiscountCodeCopy({
  code,
  percent,
}: {
  code: string;
  percent?: number;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            },
            () => {}
          );
        }}
        aria-label={`${code} indirim kodunu kopyala`}
        className="rounded-xl border border-dashed border-signal/60 bg-signal/10 px-6 py-3 font-mono text-2xl font-semibold uppercase tracking-[0.15em] text-signal transition-colors hover:bg-signal/20"
      >
        {code}
      </button>
      {typeof percent === "number" && (
        <span className="font-poppins text-3xl font-semibold text-gold">
          %{percent}
        </span>
      )}
      <span
        aria-live="polite"
        className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted"
      >
        {copied ? "Kopyalandı" : "Kopyalamak için tıklayın"}
      </span>
    </div>
  );
}
