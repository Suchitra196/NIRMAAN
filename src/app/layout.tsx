import type { Metadata } from "next";
import { Inter, Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppProvider from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import DemoDisclaimerBanner from "@/components/common/DemoDisclaimerBanner";

export const metadata: Metadata = {
  title: "NIRMAAN — Government Projects Finance Management System (Academic Demo)",
  description: "Academic demonstration platform for transparent public project finance, fund allocation, and contractor milestone tracking across Maharashtra. All data is sample data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${publicSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <DemoDisclaimerBanner />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
