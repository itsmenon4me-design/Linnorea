import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { Footer } from "@/components/layout/Footer";
import { dictionary } from "@/lib/i18n/dictionaries";
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
}>;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();

  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.title}`,
    },
    description: seo.description,
  };
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://stream.mux.com" />
        <link rel="preconnect" href="https://image.mux.com" />
        <link rel="dns-prefetch" href="//stream.mux.com" />
        <link rel="dns-prefetch" href="//image.mux.com" />
      </head>
      <body className="min-h-full bg-[var(--color-bg-base)] text-white">
        <SplashScreen />
        <div className="min-h-screen bg-[var(--color-bg-base)] text-white">
          <div className="min-h-screen">{children}</div>
          <Footer dictionary={dictionary} />
        </div>
      </body>
    </html>
  );
}
