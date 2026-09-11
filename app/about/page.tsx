import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { plainText, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.about} | ${seo.title}` }, description: seo.description };
}

export default async function AboutPage() {
  const settings = await sanityClient.fetch<SiteSettings | null>(
    siteSettingsQuery,
    {},
    { next: { revalidate } },
  );
  const established = plainText(settings?.aboutEstablished) || dictionary.about.establishedPlaceholder;
  const description = plainText(settings?.aboutDescription) || dictionary.about.descriptionPlaceholder;
  const keyItems = settings?.aboutKey ?? [];
  const missionItems = settings?.aboutMission ?? [];
  const processItems = settings?.aboutProcess ?? [];
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-[var(--color-bg-elevated)]">
        <StudioVisual image={settings?.studioVisualImage} video={settings?.studioVisualVideo} videoLabel={dictionary.ui.studioVideo} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-40 md:px-8 md:pb-20">
          <p className="text-xs tracking-[0.2em] text-[var(--color-accent-gold)]">Linnorea design works</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.about}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-7 text-white/80 md:text-2xl md:leading-9">{description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 md:px-8 md:pt-14">
        <p className="text-xs uppercase tracking-[0.2em] text-white/55">
          {dictionary.about.establishedLabel.replace("{date}", established)}
        </p>
      </div>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div data-reveal className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.ourKey}</p>
          <ul className="mt-10 min-w-0 max-w-3xl space-y-10 text-left text-base leading-7 tracking-[-0.01em] text-white/90 md:mt-12 md:space-y-12 md:text-lg md:leading-8">
            {keyItems.length ? keyItems.map((item, index) => <li key={`${plainText(item.label)}-${index}`} className="flex items-start gap-5 border-b border-white/10 pb-8"><span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-gold)]" /><span>{plainText(item.label)}</span></li>) : <li>{dictionary.about.keyPlaceholder}</li>}
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
       <div className="border-t border-white/15 pt-6">
         <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{dictionary.about.vision}</p>
         <div data-reveal className="mt-10 max-w-3xl text-xl leading-8 tracking-[-0.02em] text-white/90 md:text-3xl md:leading-10">
           <p>{plainText(settings?.aboutVision) || dictionary.about.visionPlaceholder}</p>
         </div>
       </div>
      </ScrollReveal>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.mission}</p>
          <ul className="mt-10 min-w-0 max-w-3xl space-y-10 text-left text-base leading-7 tracking-[-0.01em] text-white/90 md:mt-12 md:space-y-12 md:text-lg md:leading-8">
            {missionItems.length ? missionItems.map((item, index) => <li key={`${plainText(item)}-${index}`} className="flex items-start gap-5 border-b border-white/10 pb-8"><span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-gold)]" /><span>{plainText(item)}</span></li>) : <li>{dictionary.about.missionPlaceholder}</li>}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
        <div className="min-w-0 border-t border-white/15 pt-6">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-left text-sm text-white/60">{dictionary.about.process}</p>
          <div className="mt-10 min-w-0 space-y-12 md:mt-12">
            {processItems.length ? processItems.map((item, index) => {
              const title = plainText(item.title) || `${dictionary.about.processStage} ${index + 1}`;
              const subtitle = plainText(item.subtitle);
              const imageUrl = item.image ? urlFor(item.image).width(1200).height(800).fit("crop").auto("format").quality(78).url() : null;
              return (
                <article key={`${title}-${index}`} className="grid min-w-0 gap-6 border-b border-white/15 pb-12 md:grid-cols-[auto_minmax(0,1fr)] md:gap-6">
                  <span className="self-start justify-self-start pt-1 text-left text-sm leading-none text-[var(--color-accent-gold)]">0{index + 1}</span>
                  <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-start">
                    <div className="min-w-0 text-left"><h2 className="text-3xl tracking-[-0.04em]">{title}</h2>{subtitle ? <p className="mt-3 max-w-xl text-base text-white/80">{subtitle}</p> : null}<p className="mt-5 max-w-xl text-sm leading-6 text-white/60">{plainText(item.description) || dictionary.about.processDescriptionPlaceholder}</p></div>
                    <div className="relative min-w-0 aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">{imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /> : <MediaPlaceholder className="absolute inset-0" />}</div>
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
          <Link href="/project" className="inline-flex min-h-11 items-center border border-white/25 px-5 text-[10px] uppercase tracking-[0.22em] transition hover:bg-white hover:text-[var(--color-bg-base)]">{dictionary.ui.viewProjects}</Link>
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{plainText(settings?.whatsappCtaText) || dictionary.home.cta}</a> : null}
        </div>
      </section>
    </main>
  );
}
