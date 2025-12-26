import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/lib/providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.navo.live"),
  title: {
    default: "navo — acompanhe preços de passagens",
    template: "%s | navo",
  },
  description: "preços mudam. a gente acompanha. compare passagens aéreas e encontre o melhor momento para comprar.",
  keywords: ["passagens aéreas", "voos baratos", "comparador de preços", "alertas de preço", "viagem"],
  authors: [{ name: "navo" }],
  creator: "navo",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: "en_US",
    url: "https://www.navo.live",
    siteName: "navo",
    title: "navo — acompanhe preços de passagens",
    description: "preços mudam. a gente acompanha. compare passagens aéreas e encontre o melhor momento para comprar.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "navo - acompanhe preços de passagens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "navo — acompanhe preços de passagens",
    description: "preços mudam. a gente acompanha.",
    images: ["/og.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>{children}</Providers>
        {/* Portal root para modais e popovers - Camada 3: Overlays */}
        <div id="overlay-root" />
        {/* Google Analytics 4 */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
