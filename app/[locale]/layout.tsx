import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <div className="min-h-screen">{children}</div>
      <div>
        <Footer currentLocale={safeLocale} dictionary={dictionary} />
      </div>
    </div>
  );
}
