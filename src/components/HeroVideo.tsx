export default function HeroVideo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_75%,transparent)]"
    >
      <video
        className="h-full w-full object-cover opacity-20 mix-blend-screen"
        src="/videos/finance-chart-stock.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
}
