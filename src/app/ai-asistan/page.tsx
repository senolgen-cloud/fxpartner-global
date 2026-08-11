import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AiMarketAssistant from "@/components/AiMarketAssistant";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/ai-asistan-preview.jpg`;
const TITLE = "AI Market Assistant | FXPARTNER";
const DESCRIPTION =
  "Yatırımcıların tercih ettiği FXPARTNER Piyasa Asistanı — forex, altın, CPI/NFP gibi makro veriler ve teknik/temel analiz stratejileri hakkında sorularınızı yanıtlar.";

export const metadata: Metadata = {
  title: "AI Market Assistant",
  description: DESCRIPTION,
  alternates: { canonical: "/ai-asistan" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/ai-asistan`,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1448, height: 1086 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function AiAssistantPage() {
  return (
    <>
      <main lang="tr" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mb-10 text-center">
          <a
            href="https://t.me/fxpartnerglobal"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-ink-soft px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-signal transition-colors hover:border-signal hover:text-text-on-ink"
          >
            📣 Telegram Kanalımıza Katılın
          </a>
          <h1 className="mb-4 text-3xl font-semibold text-text-on-ink sm:text-4xl md:text-5xl">
            FXPARTNER <span className="text-signal">AI Market Assistant</span>
          </h1>
          <p className="mx-auto max-w-2xl text-text-on-ink-muted">
            7/24 piyasa analizi, senaryo simülasyonları ve strateji değerlendirmesi için yapay zeka
            asistanınız hazır.
          </p>
        </div>

        <AiMarketAssistant />
      </main>
      <Footer />
    </>
  );
}
