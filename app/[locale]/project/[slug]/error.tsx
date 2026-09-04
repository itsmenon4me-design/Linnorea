"use client";

export default function ProjectDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-5 text-white"><div><p className="text-white/60">Detail project tidak dapat dimuat.</p><button type="button" onClick={reset} className="mt-6 min-h-11 border border-white/25 px-5 text-[10px] uppercase tracking-[0.2em]">Coba lagi</button></div></main>;
}
