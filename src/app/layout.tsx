import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bubble Keberuntungan",
  description: "Mainkan mini-game Bubble Keberuntungan. Cari 1 gelembung rahasia dari 60 gelembung sebelum nyawa habis!",
  keywords: ["bubble wrap", "game gelembung", "bubble keberuntungan", "mini game"],
  authors: [{ name: "Bubble Keberuntungan" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-hidden`}
    >
      <body className="h-full w-full overflow-hidden bg-black text-slate-100 flex flex-col font-sans select-none">
        {children}
      </body>
    </html>
  );
}
