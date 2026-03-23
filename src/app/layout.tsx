import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/lib/toaster";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "DChessAcademy";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dchessacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "Online chess: play, puzzles, tournaments, and analysis.",
  keywords: ["chess", "online chess", "tournaments", "puzzles", "analysis", appName],
  authors: [{ name: appName }],
  creator: appName,
  openGraph: {
    type: "website",
    locale: "en",
    url: siteUrl,
    siteName: appName,
    title: appName,
    description: "Play, learn, and compete.",
    images: [{ url: "/cca-logo.png", width: 1200, height: 630, alt: appName }],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: "Play, learn, and compete.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${oswald.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
