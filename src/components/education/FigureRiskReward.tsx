import { tr } from "@/lib/chrome";

/**
 * Three risk/reward ratios and the win rate each one needs to break even.
 *
 * The number that matters here is not the ratio, it is 1/(1+R) — the share
 * of trades that has to win before the ratio pays for itself. Printing the
 * ratio without it is how "1:3 is better than 1:1" becomes a slogan; printing
 * them together is the whole lesson, because it also says the opposite thing:
 * a wider target is not free, it is bought with a lower hit rate.
 *
 * The bars are drawn on a fixed six-unit track so the three rows share a
 * scale. Reward is 1, 2 and 3 units against a risk of 1, which is what makes
 * the second and third rows visibly longer than the first rather than three
 * bars of the same length with different captions.
 */

// Break-even win rate is 1/(1+R), rounded to whole percent: 50, 33.3, 25.
// Stored rather than computed, because the rounding is a display decision
// and a formula in the markup would invite someone to add a fourth row
// without checking what it rounds to.
const ROWS = [
  { ratio: "1 : 1", rewardUnits: 1, breakEven: "%50" },
  { ratio: "1 : 2", rewardUnits: 2, breakEven: "%33" },
  { ratio: "1 : 3", rewardUnits: 3, breakEven: "%25" },
];

const TRACK_UNITS = 6;

export default function FigureRiskReward() {
  return (
    <div>
      <div className="space-y-4">
        {ROWS.map((row) => (
          <div
            key={row.ratio}
            className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 sm:grid-cols-[3.5rem_1fr_auto]"
          >
            <span className="font-mono text-sm font-semibold tabular-nums text-text-dark">
              {row.ratio}
            </span>

            {/* Risk on the left, reward on the right, one continuous track.
                Percentages rather than flex-grow so the risk block is
                identical in all three rows — that is the constant the reader
                is meant to measure the reward against. */}
            <div className="flex h-7 items-stretch overflow-hidden rounded-md bg-hairline-light/40">
              <div
                className="flex items-center justify-center bg-tick-down/25 font-mono text-[10px] uppercase tracking-[0.1em] text-text-dark"
                style={{ width: `${(1 / TRACK_UNITS) * 100}%` }}
              >
                <span className="truncate px-1">{tr("Risk")}</span>
              </div>
              <div
                className="flex items-center justify-center bg-signal/30 font-mono text-[10px] uppercase tracking-[0.1em] text-text-dark"
                style={{ width: `${(row.rewardUnits / TRACK_UNITS) * 100}%` }}
              >
                <span className="truncate px-1">{tr("Ödül")}</span>
              </div>
            </div>

            {/* Under the bar on a phone, beside it from the sm breakpoint —
                col-span-2 is what puts it on its own line in the two-column
                layout instead of squeezing the track. The note underneath
                the figure says "her satırdaki" rather than "sağdaki" for
                exactly this reason. */}
            <span className="col-span-2 font-mono text-sm font-semibold tabular-nums text-signal sm:col-span-1 sm:w-16 sm:text-end">
              {row.breakEven}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-hairline-light pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-text-muted">
        {tr("Her satırdaki oran, o risk/ödül oranında başabaş kalmak için gereken kazanma oranıdır")}
      </p>
    </div>
  );
}
