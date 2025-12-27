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
  description:
    "preços mudam. a gente acompanha. compare passagens aéreas e encontre o melhor momento para comprar.",
  keywords: [
    "passagens aéreas",
    "voos baratos",
    "comparador de preços",
    "alertas de preço",
    "viagem",
    "milhas",
    "promoção de passagens",
  ],
  authors: [{ name: "navo" }],
  creator: "navo",
  publisher: "navo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: "en_US",
    url: "https://www.navo.live",
    siteName: "navo",
    title: "navo — acompanhe preços de passagens",
    description:
      "preços mudam. a gente acompanha. compare passagens aéreas e encontre o melhor momento para comprar.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@navolive",
    creator: "@navolive",
    title: "navo — acompanhe preços de passagens",
    description: "preços mudam. a gente acompanha.",
  },
  manifest: "/manifest.json",
  category: "travel",
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
