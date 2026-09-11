"use client";

import { dictionary } from "@/lib/i18n/dictionaries";

export default function ProjectDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-5 text-white"><div><p className="text-white/60">{dictionary.ui.detailProjectError}</p><button type="button" onClick={reset} className="mt-6 min-h-11 border border-white/25 px-5 text-[10px] uppercase tracking-[0.2em]">{dictionary.ui.tryAgain}</button></div></main>;
}
