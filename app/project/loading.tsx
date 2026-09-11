 "use client";

import { dictionary } from "@/lib/i18n/dictionaries";

export default function ProjectLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-24 pt-36 text-white md:px-8 md:pt-48">
      <p className="text-[10px] uppercase tracking-[0.38em] text-white/55">{dictionary.ui.loadingProject}</p>
      <div className="mt-8 h-16 w-2/3 animate-pulse bg-white/10" />
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse bg-white/10" />
        <div className="aspect-[4/3] animate-pulse bg-white/10" />
      </div>
    </main>
  );
}
