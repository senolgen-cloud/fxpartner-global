import { tr } from "@/lib/chrome";

/**
 * The three sessions across one day, and the block where two of them run at
 * once.
 *
 * Written as a list of opening hours this is three facts to memorise. Drawn
 * on one axis it is a single fact — the middle of the Turkish afternoon is
 * where London and New York are both open — and that is the only part a
 * reader needs to carry around.
 *
 * Hours are Türkiye time (UTC+3, no daylight change since 2016). London and
 * New York do change theirs, so the whole picture slides by an hour twice a
 * year against these labels; the note underneath says so rather than
 * pretending the figure is exact to the minute.
 */

// Percentages of a 24-hour track. Kept as numbers rather than pre-formatted
// strings so the arithmetic is checkable against the hours beside it:
// 03:00 is 3/24 = 12.5%, and a nine-hour session is 9/24 = 37.5%.
const SESSIONS = [
  { name: "Asya", hours: "03:00 – 12:00", start: 3, end: 12 },
  { name: "Londra", hours: "10:00 – 19:00", start: 10, end: 19 },
  { name: "New York", hours: "15:00 – 24:00", start: 15, end: 24 },
];

// Where London and New York are both open.
const OVERLAP = { start: 15, end: 19 };

const TICKS = [0, 4, 8, 12, 16, 20, 24];

const pct = (hour: number) => `${(hour / 24) * 100}%`;

export default function FigureSessions() {
  return (
    <div>
      {/* dir="ltr" on the plotted area, not on the labels. A 24-hour axis
          runs left to right in the Arabic tree too — mirroring it would put
          midnight on the right and silently contradict every hour printed
          under it. */}
      <div dir="ltr" className="relative">
        {/* The overlap band, drawn behind the bars and running the full
            height, so it reads as a column of the day rather than as a
            fourth session. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 rounded-sm border-x border-signal/40 bg-signal/[0.07]"
          style={{
            left: `calc(5.5rem + 0.75rem + (100% - 5.5rem - 0.75rem) * ${OVERLAP.start / 24})`,
            width: `calc((100% - 5.5rem - 0.75rem) * ${(OVERLAP.end - OVERLAP.start) / 24})`,
          }}
        />

        <div className="relative space-y-2.5">
          {SESSIONS.map((s) => (
            <div key={s.name} className="grid grid-cols-[5.5rem_1fr] items-center gap-x-3">
              <div className="min-w-0">
                <span className="block truncate font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dark">
                  {tr(s.name)}
                </span>
                <span className="block font-mono text-[10px] tabular-nums text-text-muted">
                  {s.hours}
                </span>
              </div>
              <div className="relative h-6 rounded-md bg-hairline-light/40">
                <div
                  className="absolute inset-y-0 rounded-md bg-signal/30"
                  style={{ left: pct(s.start), width: pct(s.end - s.start) }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* The axis. Each tick is centred on its hour, so 00 and 24 hang half
            outside the track — which is correct, and why the row has no
            overflow clipping. */}
        <div className="mt-2 grid grid-cols-[5.5rem_1fr] gap-x-3">
          <span />
          <div className="relative h-4">
            {TICKS.map((h) => (
              <span
                key={h}
                className="absolute top-0 -translate-x-1/2 font-mono text-[10px] tabular-nums text-text-muted"
                style={{ left: pct(h) }}
              >
                {String(h).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline-light pt-4">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-signal/50 bg-signal/[0.15]" />
          {tr("Londra ve New York birlikte açık")}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
        {tr("Saatler Türkiye saatiyledir. Londra ve New York yaz saati uyguladığı için bu aralıklar yılda iki kez birer saat kayar; Türkiye'de böyle bir kayma yoktur.")}
      </p>
    </div>
  );
}
