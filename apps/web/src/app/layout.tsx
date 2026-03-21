import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAYPO — Agent finance on institutional rails",
  description:
    "Everything an agent needs. One SDK. Checking, savings, credit, exchange, and investment — powered by USDCx and the Machine Payments Protocol.",
  openGraph: {
    title: "CAYPO — Agent finance on institutional rails",
    description:
      "Everything an agent needs. One SDK. Agent finance on Canton Network with USDCx and MPP.",
    url: "https://caypo.xyz",
    siteName: "CAYPO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAYPO — AI Agent Banking on Canton Network",
    description: "Everything an agent needs. One SDK.",
  },
  metadataBase: new URL("https://caypo.xyz"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
