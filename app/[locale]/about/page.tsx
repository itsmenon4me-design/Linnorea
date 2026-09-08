import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
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
  const seo = await getSiteSeo(safeLocale);
  return { title: { absolute: `${getDictionary(safeLocale).nav.about} | ${seo.title}` }, description: seo.description };
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const settings = await sanityClient.fetch<SiteSettings | null>(
    siteSettingsQuery,
    {},
    { next: { revalidate } },
  );
  const established = localizedValue(settings?.aboutEstablished, safeLocale) || dictionary.about.establishedPlaceholder;
  const description = localizedValue(settings?.aboutDescription, safeLocale) || dictionary.about.descriptionPlaceholder;
  const keyItems = settings?.aboutKey ?? [];
  const missionItems = settings?.aboutMission ?? [];
  const processItems = settings?.aboutProcess ?? [];
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-[var(--color-bg-elevated)]">
        <StudioVisual image={settings?.studioVisualImage} video={settings?.studioVisualVideo} placeholderLabel={dictionary.ui.placeholderStudioImage} videoLabel={dictionary.ui.studioVideo} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-40 md:px-8 md:pb-20">
          <p className="text-xs tracking-[0.2em] text-[var(--color-accent-gold)]">Linnorea design works</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.about}</h1>
          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-white/65">{established}</p>
          <p className="mt-6 max-w-2xl text-lg leading-7 text-white/80 md:text-2xl md:leading-9">{description}</p>
        </div>
      </section>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
       <div data-reveal className="grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
         <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{dictionary.about.ourKey}</p>
         <div className="max-w-3xl space-y-7 text-2xl leading-[1.15] tracking-[-0.04em] text-white/90 md:text-5xl">
           {keyItems.length ? keyItems.map((item, index) => <p key={`${localizedValue(item.label, safeLocale)}-${index}`} className={index === 0 ? "font-medium text-[1.12em]" : "pl-8 text-[0.82em] text-white/75 md:pl-16"}>{localizedValue(item.label, safeLocale)}</p>) : <p>{dictionary.about.keyPlaceholder}</p>}
         </div>
       </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
       <div className="border-t border-white/15 pt-6">
         <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{dictionary.about.vision}</p>
         <div data-reveal className="mt-10 max-w-3xl text-xl leading-8 tracking-[-0.02em] text-white/90 md:text-3xl md:leading-10">
           <p>{localizedValue(settings?.aboutVision, safeLocale) || dictionary.about.visionPlaceholder}</p>
         </div>
       </div>
      </ScrollReveal>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
       <div className="grid gap-10 border-t border-white/15 pt-6 md:grid-cols-[0.7fr_1.3fr]">
         <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{dictionary.about.mission}</p>
         <ul className="max-w-3xl space-y-10 text-base leading-7 tracking-[-0.01em] text-white/90 md:space-y-12 md:text-lg md:leading-8">
           {missionItems.length ? missionItems.map((item, index) => <li key={`${localizedValue(item, safeLocale)}-${index}`} className="flex gap-5 border-b border-white/10 pb-8"><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-gold)]" /><span>{localizedValue(item, safeLocale)}</span></li>) : <li>{dictionary.about.missionPlaceholder}</li>}
         </ul>
       </div>
      </section>

      <section className="mx-5 border-y border-white/15 py-16 md:mx-8 md:py-24">
       <div className="mx-auto max-w-7xl">
         <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">{dictionary.about.process}</p>
         <div className="mt-12 space-y-12">
           {processItems.length ? processItems.map((item, index) => {
             const title = localizedValue(item.title, safeLocale) || `${dictionary.about.processStage} ${index + 1}`;
             const subtitle = localizedValue(item.subtitle, safeLocale);
             const imageUrl = item.image ? urlFor(item.image).width(1200).height(800).fit("crop").auto("format").quality(78).url() : null;
             return (
               <article key={`${title}-${index}`} className="grid gap-6 border-b border-white/15 pb-12 md:grid-cols-[0.15fr_0.85fr] md:gap-10">
                 <span className="text-sm text-[var(--color-accent-gold)]">0{index + 1}</span>
                 <div className="grid gap-8 md:grid-cols-[1fr_0.9fr] md:items-start">
                   <div><h2 className="text-3xl tracking-[-0.04em]">{title}</h2>{subtitle ? <p className="mt-3 max-w-xl text-base text-white/80">{subtitle}</p> : null}<p className="mt-5 max-w-xl text-sm leading-6 text-white/60">{localizedValue(item.description, safeLocale) || dictionary.about.processDescriptionPlaceholder}</p></div>
                   <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">{imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /> : <div className="flex h-full items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/45">{dictionary.about.processImagePlaceholder}</div>}</div>
                 </div>
               </article>
             );
           }) : <p className="text-sm leading-6 text-white/60">{dictionary.about.processPlaceholder}</p>}
         </div>
       </div>
      </section>

      {/* Approach and Team data remain in Sanity and can be restored here when approved. */}
      <section className="mx-auto flex max-w-7xl flex-col items-start gap-7 px-5 py-24 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="max-w-xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.ui.seeThinking}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${safeLocale}/project`} className="inline-flex min-h-11 items-center border border-white/25 px-5 text-[10px] uppercase tracking-[0.22em] transition hover:bg-white hover:text-[var(--color-bg-base)]">{dictionary.ui.viewProjects}</Link>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{localizedValue(settings?.whatsappCtaText, safeLocale) || dictionary.home.cta}</a> : null}
        </div>
      </section>
    </main>
  );
}
