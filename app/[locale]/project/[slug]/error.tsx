"use client";

import { useParams } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function ProjectDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const safeLocale = locales.includes(locale as Locale) ? locale as Locale : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  return <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-5 text-white"><div><p className="text-white/60">{dictionary.ui.detailProjectError}</p><button type="button" onClick={reset} className="mt-6 min-h-11 border border-white/25 px-5 text-[10px] uppercase tracking-[0.2em]">{dictionary.ui.tryAgain}</button></div></main>;
}
