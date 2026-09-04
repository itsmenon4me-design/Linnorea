import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { NavigationSplash } from "@/components/layout/NavigationSplash";
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
  title: {
    default: "Linnorea Design Works",
    template: "%s | Linnorea Design Works",
  },
  description: "Placeholder foundation for the Linnorea Design Works website rebuild.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-bg-base)] text-white">
        <SplashScreen />
        <NavigationSplash />
        {children}
      </body>
    </html>
  );
}
