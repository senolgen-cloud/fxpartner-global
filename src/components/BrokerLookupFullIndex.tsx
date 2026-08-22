import { tr } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import { lookupBrokers, type LookupVerdict } from "@/data/brokerLookup";

// Server-rendered, unfiltered index of every Broker Lookup entry.
//
// BrokerLookupSearch (the interactive search box above this component) is a
// "use client" component: its filtered results only exist in the browser
// DOM after hydration, so an AI crawler or agent fetching /broker-lookup
// without executing JavaScript never sees a specific broker's verdict —
// only the empty search shell. That defeats the page's actual purpose for
// AI answer engines, since "is Octa a scam" / "is HFM regulated" style
// queries are exactly what this page exists to answer.
//
// This component renders the full, unfiltered list as plain server HTML
// (grouped under <details>, same progressive-disclosure pattern already
// used for the broker FAQ sections) so every entry is present in the
// initial response and independently linkable/quotable, while staying out
// of the way of the interactive search for human visitors.
const GROUPS: { verdict: LookupVerdict; heading: string; description: string }[] = [
  {
    verdict: "high-risk",
    heading: "Yüksek Risk Olarak İşaretlendi",
    description:
      "Resmi bir düzenleyici uyarısı/yetkisiz firma listesinde adı geçiyor veya belgelenmiş bir dolandırıcılık/klon örüntüsü içeriyor.",
  },
  {
    verdict: "caution",
    heading: "Dikkatli Olun",
    description:
      "Meşru/faaliyette, ancak daha derinlemesine araştırma yapmak için gerçek bir sebep var — yalnızca offshore lisans, bir düzenleyici uyarısı veya dikkate değer bir şikayet örüntüsü.",
  },
  {
    verdict: "verified",
    heading: "Doğrulanmış / Düzenlenmiş",
    description:
      "Gerçek Tier-1 ve/veya çoklu yargı bölgesi düzenlemesine sahip, araştırma sırasında büyük bir düzenleyici uyarısı bulunamadı.",
  },
];

export default function BrokerLookupFullIndex() {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="font-display text-lg font-semibold text-text-dark">
        {tr("Tam listeye göz atın")}
      </h2>
      <p className="text-sm text-text-muted">
        {tr("Sorgulama veritabanımızdaki her aracı kurum, değerlendirmeye göre gruplandırılmış — aramadan göz atmak için bir bölümü genişletin.")}
      </p>
      {GROUPS.map((group) => {
        const entries = lookupBrokers.filter((b) => b.verdict === group.verdict);
        if (entries.length === 0) return null;
        return (
          <details key={group.verdict} className="group rounded-2xl border border-hairline-light bg-paper">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-medium text-text-dark">
              <span>
                {group.heading}{" "}
                <span className="font-mono text-xs font-normal text-text-muted">
                  ({entries.length})
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="border-t border-hairline-light px-6 pb-6 pt-2">
              <p className="pt-3 text-xs leading-relaxed text-text-muted">{group.description}</p>
              <dl className="mt-4 divide-y divide-hairline-light">
                {entries.map((b) => (
                  <div key={b.name} className="py-4">
                    <dt className="notranslate font-display text-base font-semibold text-text-dark">
                      {b.name}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-text-dark/90">{b.note}</dd>
                    <dd className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {b.regulators && b.regulators.length > 0 && (
                        <span>Düzenleyiciler: {b.regulators.join(", ")}</span>
                      )}
                      <span className="font-mono">Kaynak: {b.source}</span>
                      {b.relatedSlug && (
                        <Link
                          href={`/brokers/${b.relatedSlug}`}
                          title={`${b.name} tam incelemesi`}
                          className="font-mono uppercase tracking-[0.1em] text-signal transition-colors hover:text-signal-strong"
                        >
                          Tam inceleme →
                        </Link>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        );
      })}
    </div>
  );
}
