import { tr } from "@/lib/chrome";

/**
 * What a given drawdown costs to climb back out of.
 *
 * The identity is 1/(1−d) − 1, and the reason it surprises people is that
 * both numbers are called "percent" while being percentages of two different
 * balances: the loss is taken off what you had, the recovery is earned on
 * what is left. At −%10 the gap is a rounding error. At −%50 the recovery is
 * twice the loss.
 *
 * Drawn as two bars per column against a shared 100-unit scale, because the
 * point is the widening gap between them and a table of eight numbers hides
 * exactly that.
 */

// 1/(1−d) − 1, rounded to whole percent: 11.1, 25, 42.9, 100.
const STEPS = [
  { loss: 10, lossLabel: "−%10", gain: 11, gainLabel: "+%11" },
  { loss: 20, lossLabel: "−%20", gain: 25, gainLabel: "+%25" },
  { loss: 30, lossLabel: "−%30", gain: 43, gainLabel: "+%43" },
  { loss: 50, lossLabel: "−%50", gain: 100, gainLabel: "+%100" },
];

// The tallest bar in the figure. Fixing it at the largest recovery keeps all
// eight bars on one scale — scaling each column to its own maximum would
// draw four identical pictures and lose the entire point.
const SCALE = 100;

export default function FigureDrawdown() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline-light bg-hairline-light sm:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.loss} className="bg-paper-high px-4 py-4">
            {/* Bars first, numbers under them. The eye reads the two heights
                against each other before it reads either label, which is the
                order the figure wants. */}
            <div className="flex h-28 items-end gap-2" aria-hidden="true">
              <div
                className="flex-1 rounded-t-sm bg-tick-down/35"
                style={{ height: `${(step.loss / SCALE) * 100}%` }}
              />
              <div
                className="flex-1 rounded-t-sm bg-signal/45"
                style={{ height: `${(step.gain / SCALE) * 100}%` }}
              />
            </div>

            <div className="mt-3 flex items-baseline gap-2 border-t border-hairline-light pt-3">
              <span className="font-mono text-sm font-semibold tabular-nums text-tick-down">
                {step.lossLabel}
              </span>
              <span aria-hidden="true" className="font-mono text-xs text-text-muted">
                →
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-signal">
                {step.gainLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-tick-down/35" />
          <dt>{tr("Kayıp")}</dt>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-signal/45" />
          <dt>{tr("Başabaşa dönmek için gereken kazanç")}</dt>
        </div>
      </dl>
    </div>
  );
}
