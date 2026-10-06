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
  title: "Lato-Lato Online: Simulasi Interaktif & Sensor Gyro",
  description: "Mainkan simulasi permainan tradisional Lato-Lato di HP dan desktop dengan kontrol sensor gerak Gyroscope, Touch Drag, audio clack realistis, dan dynamic neon themes.",
  keywords: ["lato-lato", "clackers", "game lato lato", "gyroscope game", "nextjs", "web audio"],
  authors: [{ name: "Lato-Lato Master" }],
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
