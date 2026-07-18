import Reveal from "./Reveal";

const VIDEO_ID = "bAFd9WkdVGs";
const VIDEO_TITLE = "Beginners Guide to Forex by Investopedia";
const CHANNEL_NAME = "Investopedia";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

export default function TradingVideo() {
  return (
    <section id="egitim-videosu" className="border-t border-hairline-light bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Eğitim
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
            Forex&apos;e giriş: temel kavramlar
          </h2>
          <p className="mt-4 max-w-2xl text-text-muted">
            Broker karşılaştırmaya geçmeden önce, piyasanın temel işleyişini
            özetleyen kısa bir video.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-hairline-light">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
              title={VIDEO_TITLE}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </Reveal>

        <p className="mt-3 font-mono text-xs text-text-muted">
          Kaynak: {CHANNEL_NAME} (YouTube). Bu video FXPARTNER tarafından
          üretilmemiştir; genel bilgilendirme amaçlıdır ve yatırım tavsiyesi
          değildir.
        </p>
        <a
          href={VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-xs text-signal transition-colors hover:text-signal-strong"
        >
          Orijinal videoyu YouTube&apos;da izle →
        </a>
      </div>
    </section>
  );
}
