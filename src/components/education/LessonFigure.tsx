import { tr } from "@/lib/chrome";
import type { EducationVisual } from "@/lib/educationVisuals";
import FigureDrawdown from "@/components/education/FigureDrawdown";
import FigureLeverage from "@/components/education/FigureLeverage";
import FigurePendingOrders from "@/components/education/FigurePendingOrders";
import FigurePositionSize from "@/components/education/FigurePositionSize";
import FigureRiskReward from "@/components/education/FigureRiskReward";
import FigureSessions from "@/components/education/FigureSessions";

/**
 * The frame every Akademi figure sits in: eyebrow, heading, the drawing, and
 * the sentence that says what it is showing.
 *
 * One frame rather than six, so a figure added later cannot arrive with its
 * own spacing and its own idea of where the caption goes — and so the
 * accessible description is attached the same way every time. The drawings
 * themselves are decorative markup: everything they say is also in `alt`,
 * which is what the figure exposes to a screen reader.
 */

const FIGURES: Record<EducationVisual["id"], () => React.ReactElement> = {
  "position-sizing": FigurePositionSize,
  "risk-reward": FigureRiskReward,
  "drawdown-recovery": FigureDrawdown,
  "pending-orders": FigurePendingOrders,
  "trading-sessions": FigureSessions,
  "leverage-margin": FigureLeverage,
};

export default function LessonFigure({
  visual,
  headingLevel = "h2",
}: {
  visual: EducationVisual;
  /**
   * The gallery lists figures under its own h1 and needs h2s; a lesson page
   * drops one into the middle of an article whose h1 is the lesson title.
   * Same element either way — only the level differs.
   */
  headingLevel?: "h2" | "h3";
}) {
  const Drawing = FIGURES[visual.id];
  const Heading = headingLevel;

  return (
    <figure
      id={visual.slug}
      className="scroll-mt-24 rounded-2xl border border-hairline-light bg-paper p-5 sm:p-7"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
        {tr("Görsel anlatım")}
      </span>
      <Heading className="mt-2 font-poppins text-lg font-semibold leading-snug text-text-dark sm:text-xl">
        {tr(visual.title)}
      </Heading>

      {/* The drawing is hidden from assistive technology and the whole
          figure carries one description instead. A bar chart read out as
          twenty-odd unlabelled spans is worse than silence; the alt text
          says what the picture says. */}
      <div className="mt-6" role="img" aria-label={tr(visual.alt)}>
        <div aria-hidden="true">
          <Drawing />
        </div>
      </div>

      <figcaption className="mt-6 border-t border-hairline-light pt-4 text-[14px] leading-relaxed text-text-muted">
        {tr(visual.caption)}
      </figcaption>
    </figure>
  );
}
