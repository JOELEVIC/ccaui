import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/lib/toaster";

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cameroonchessacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cameroon Chess Academy",
    template: "%s | Cameroon Chess Academy",
  },
  description:
    "DChessAcademy and Chess Group Cameroon: chess as philosophy for intellectual development, ethical leadership, and life skills. National platform for competitive excellence. Discipline. Strategy. Excellence.",
  keywords: [
    "DChessAcademy",
    "Chess Group Cameroon",
    "Cameroon Chess Academy",
    "chess philosophy",
    "leadership",
    "youth development",
    "mentorship",
    "critical thinking",
    "chess",
    "Cameroon",
    "chess academy",
    "tournaments",
    "rankings",
    "chess training",
  ],
  authors: [{ name: "Cameroon Chess Academy" }],
  creator: "Cameroon Chess Academy",
  openGraph: {
    type: "website",
    locale: "en",
    url: siteUrl,
    siteName: "Cameroon Chess Academy",
    title: "Cameroon Chess Academy",
    description: "National Platform for Competitive Excellence. Discipline. Strategy. Excellence.",
    images: [{ url: "/cca-logo.png", width: 1200, height: 630, alt: "Cameroon Chess Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cameroon Chess Academy",
    description: "National Platform for Competitive Excellence. Discipline. Strategy. Excellence.",
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
