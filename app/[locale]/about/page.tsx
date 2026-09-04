import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { localizedValue, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;
type AboutProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: AboutProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return { title: getDictionary(safeLocale).nav.about };
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const settings = await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } });
  const story = localizedValue(settings?.brandStatement, safeLocale) || "[Placeholder brand story, awaiting approved copy]";
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-[var(--color-bg-elevated)]">
        <div className="absolute inset-0 flex items-center justify-center text-center text-[10px] uppercase tracking-[0.32em] text-white/40">[Placeholder studio visual]</div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-40 md:px-8 md:pb-20">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[var(--color-accent-gold)]">Linnorea Design Works</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.about}</h1>
        </div>
      </section>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
        <div data-reveal className="grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Our philosophy</p>
          <div className="space-y-6 text-xl leading-[1.3] tracking-[-0.03em] text-white/90 md:text-4xl">
            {story.split(/\n\n+/).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}
          </div>
        </div>
      </ScrollReveal>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div className="border-t border-white/15 pt-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Approach</p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {["Listen before designing.", "Let the room lead.", "Make daily rituals feel considered."].map((value, index) => (
              <ScrollReveal key={value} className="border-b border-white/15 pb-8">
                <div data-reveal>
                  <span className="text-sm text-[var(--color-accent-gold)]">0{index + 1}</span>
                  <h2 className="mt-8 max-w-xs text-2xl leading-tight tracking-[-0.04em] text-white/90">{value}</h2>
                  <p className="mt-5 text-sm leading-6 text-white/55">[Placeholder approach copy, awaiting final content]</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-5 border-y border-white/15 py-16 md:mx-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Team</p>
          <p className="mt-6 text-sm text-white/65">Team and founder information has not been confirmed yet.</p>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-start gap-7 px-5 py-24 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="max-w-xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">See how the thinking becomes space.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${safeLocale}/project`} className="inline-flex min-h-11 items-center border border-white/25 px-5 text-[10px] uppercase tracking-[0.22em] transition hover:bg-white hover:text-[var(--color-bg-base)]">{dictionary.ui.viewProjects}</Link>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{localizedValue(settings?.whatsappCtaText, safeLocale) || dictionary.home.cta}</a> : null}
        </div>
      </section>
    </main>
  );
}
