const POINTS =
  "0,190 60,175 120,200 180,160 240,180 300,130 360,155 420,105 480,130 540,90 600,115 660,65 720,95 780,55 840,80 900,40 960,65 1020,25 1080,50 1140,15 1200,35";

const AREA_POINTS = `${POINTS} 1200,300 0,300`;

function ChartSvg({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
      className="h-full w-full shrink-0"
    >
      <defs>
        <linearGradient id={`hero-chart-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={AREA_POINTS} fill={`url(#hero-chart-fill-${id})`} stroke="none" />
      <polyline
        points={POINTS}
        fill="none"
        stroke="var(--signal)"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HeroChart() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] overflow-hidden [mask-image:linear-gradient(to_top,black,transparent)]"
    >
      <div className="chart-track flex h-full w-[200%]">
        <div className="w-1/2 shrink-0">
          <ChartSvg id="a" />
        </div>
        <div className="w-1/2 shrink-0">
          <ChartSvg id="b" />
        </div>
      </div>
    </div>
  );
}
