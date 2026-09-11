"use client";

import { dictionary } from "@/lib/i18n/dictionaries";

export default function ProjectError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-5 text-white">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent-gold)]">{dictionary.ui.projectUnavailable}</p>
        <h1 className="mt-5 text-3xl font-medium">{dictionary.ui.sanityPageError}</h1>
        <button type="button" onClick={reset} className="mt-8 min-h-11 border border-white/25 px-5 text-[10px] uppercase tracking-[0.2em] transition hover:bg-white hover:text-[var(--color-bg-base)]">
          {dictionary.ui.tryAgain}
        </button>
      </div>
    </main>
  );
}
