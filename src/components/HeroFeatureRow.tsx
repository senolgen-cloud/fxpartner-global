import type { ReactNode } from "react";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features: { key: string; icon: ReactNode; title: string; body: string }[] = [
  {
    key: "signals",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <circle cx="12" cy="12" r="2.4" />
        <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9M4.5 4.5a10.5 10.5 0 0 0 0 15M19.5 4.5a10.5 10.5 0 0 1 0 15" />
      </svg>
    ),
    title: "FX Sinyalleri",
    body: "Gerçek zamanlı işlem fırsatları.",
  },
  {
    key: "ai",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <path d="M9 3.5A2.5 2.5 0 0 1 11.5 6v.2A2.5 2.5 0 0 1 14 9v.3a2.6 2.6 0 0 1 2 2.5 2.6 2.6 0 0 1-1.4 2.3 2.6 2.6 0 0 1-2.4 3.6H12a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 9 3.5Z" />
        <path d="M9 6.2a2.5 2.5 0 0 0-4.4 1.6A2.6 2.6 0 0 0 3 10.3a2.6 2.6 0 0 0 1.5 2.4A2.6 2.6 0 0 0 7 16.3h2" />
      </svg>
    ),
    title: "Yapay Zeka Analizi",
    body: "Yapay zeka destekli piyasa içgörüleri.",
  },
  {
    key: "calendar",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
        <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" />
      </svg>
    ),
    title: "Ekonomik Takvim",
    body: "Gerçek zamanlı ekonomik olaylarla önde kalın.",
  },
  {
    key: "brokers",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Güvenilir Brokerlar",
    body: "Önde gelen küresel brokerlarla ortaklık.",
  },
  {
    key: "community",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <circle cx="8.5" cy="8.5" r="2.8" />
        <circle cx="16" cy="9.5" r="2.2" />
        <path d="M3 19c.5-3 2.7-4.8 5.5-4.8S13.5 16 14 19" />
        <path d="M14.5 14.5c2.3.2 4 1.8 4.5 4.5" />
      </svg>
    ),
    title: "Trading Topluluğu",
    body: "Bağlan. Paylaş. Birlikte büyü.",
  },
];

export default function HeroFeatureRow() {
  return (
    // This row lives in the hero's 1fr column next to a fixed 420px mockup
    // panel, so it never actually gets much wider than ~670px regardless of
    // viewport — a 5-across row (previously lg:grid-cols-5) squeezed each
    // item into ~110px and forced titles like "FX Signals" to break after
    // the first word. Capped at 3 columns and switched to stacked cards,
    // which read fine at that width instead of wrapping awkwardly.
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.key}
          className="flex flex-col items-start gap-3 rounded-2xl border border-hairline/70 bg-ink-soft/40 p-4 transition-colors hover:border-signal/40 hover:bg-ink-soft"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-ink text-signal">
            {f.icon}
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-text-on-ink">
              {f.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-on-ink-muted">
              {f.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
