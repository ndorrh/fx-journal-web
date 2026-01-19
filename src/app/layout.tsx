import type { Metadata } from "next";
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
  title: "FX Mastery Journal - Track, Analyze, Dominate",
  description: "The ultimate trading journal for Forex, Crypto, and Indices. Plan your trades, track your psychology, and analyze your performance with advanced metrics.",
  applicationName: "FX Mastery Journal",
  appleWebApp: {
    title: "FX Journal",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "FX Mastery Journal",
    description: "Track. Analyze. Dominate the Markets.",
    type: "website",
    siteName: "FX Mastery Journal",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <AppLayout>
              {children}
            </AppLayout>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
