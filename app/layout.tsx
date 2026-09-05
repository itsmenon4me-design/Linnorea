import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { NavigationSplash } from "@/components/layout/NavigationSplash";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
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

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return (
    <html lang={safeLocale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-bg-base)] text-white">
        <SplashScreen />
        <NavigationSplash />
        {children}
      </body>
    </html>
  );
}
