import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { NavigationSplash } from "@/components/layout/NavigationSplash";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteSeo } from "@/lib/sanity/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>;

async function getSafeLocale(locale?: string) {
  const requestHeaders = await headers();
  const requestedLocale = locale ?? requestHeaders.get("x-locale") ?? undefined;
  return locales.includes(requestedLocale as Locale) ? (requestedLocale as Locale) : defaultLocale;
}

export async function generateMetadata({ params }: Omit<RootLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = await getSafeLocale(locale);
  const seo = await getSiteSeo(safeLocale);

  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.title}`,
    },
    description: seo.description,
  };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const safeLocale = await getSafeLocale(locale);

  return (
    <html lang={safeLocale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://stream.mux.com" />
        <link rel="preconnect" href="https://image.mux.com" />
        <link rel="dns-prefetch" href="//stream.mux.com" />
        <link rel="dns-prefetch" href="//image.mux.com" />
      </head>
      <body className="min-h-full bg-[var(--color-bg-base)] text-white">
        <SplashScreen />
        <NavigationSplash />
        {children}
      </body>
    </html>
  );
}
