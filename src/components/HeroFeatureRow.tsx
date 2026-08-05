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
    title: "FX Signals",
    body: "Real-time trading opportunities.",
  },
  {
    key: "ai",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <path d="M9 3.5A2.5 2.5 0 0 1 11.5 6v.2A2.5 2.5 0 0 1 14 9v.3a2.6 2.6 0 0 1 2 2.5 2.6 2.6 0 0 1-1.4 2.3 2.6 2.6 0 0 1-2.4 3.6H12a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 9 3.5Z" />
        <path d="M9 6.2a2.5 2.5 0 0 0-4.4 1.6A2.6 2.6 0 0 0 3 10.3a2.6 2.6 0 0 0 1.5 2.4A2.6 2.6 0 0 0 7 16.3h2" />
      </svg>
    ),
    title: "AI Analysis",
    body: "AI-powered market insights.",
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
    title: "Economic Calendar",
    body: "Stay ahead with real-time economic events.",
  },
  {
    key: "brokers",
    icon: (
      <svg {...iconProps} className="h-5 w-5">
        <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Trusted Brokers",
    body: "Partnered with leading global brokers.",
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
    title: "Trading Community",
    body: "Connect. Share. Grow together.",
  },
];

export default function HeroFeatureRow() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {features.map((f) => (
        <div key={f.key} className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-ink-soft text-signal">
            {f.icon}
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-text-on-ink">
              {f.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-on-ink-muted">
              {f.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
