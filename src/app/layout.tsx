import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FXPARTNER | Forex Broker Karşılaştırma ve İncelemeleri",
  description:
    "XM, AvaTrade, Tickmill, Lite Finance, EXNESS ve daha fazlası — güvenilirlik, spread, kaldıraç ve platform desteğine göre karşılaştırılmış forex broker incelemeleri. FXPARTNER ekosisteminin bir parçasıdır.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-dark">
        {children}
      </body>
    </html>
  );
}
