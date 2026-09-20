import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ServiceExperience } from "@/components/sections/ServiceExperience";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { insightListQuery, projectListQuery, serviceListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { plainText, type Insight, type Service, type ServiceProjectCard, type SiteSettings } from "@/lib/sanity/types";
import { uniqueImageInsights } from "@/lib/sanity/insights";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.service} | ${seo.title}` }, description: seo.description };
}

const defaultProcess = [
  { title: "Understand", description: "We begin with the brief, context, needs, and constraints.", imageUrl: null },
  { title: "Define", description: "We establish a clear spatial and material direction.", imageUrl: null },
  { title: "Develop", description: "We refine the design through visuals, selections, and detail.", imageUrl: null },
  { title: "Deliver", description: "We support the transition from approved design to finished space.", imageUrl: null },
];

export default async function ServicePage() {
  const [services, settings, projects, insights] = await Promise.all([
    sanityClient.fetch<Service[]>(serviceListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<ServiceProjectCard[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<Insight[]>(insightListQuery, {}, { next: { revalidate } }),
  ]);
  const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, "");
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const projectImages = settings?.projectHighlightImages ?? [];
  const serviceItems = services.map((service) => ({
    id: service._id,
    title: plainText(service.title) || dictionary.ui.untitledService,
    description: plainText(service.description) || dictionary.ui.placeholderServiceDescription,
    imageUrl: service.image ? urlFor(service.image).width(1400).height(934).fit("crop").auto("format").quality(78).url() : null,
  }));
  const projectImageItems = projectImages.map((image, index) => ({
    id: image._key ?? `project-${index}`,
    url: urlFor(image).width(1400).height(934).fit("crop").auto("format").quality(78).url(),
    alt: `Linnorea selected project ${index + 1}`,
  }));
  const projectCardItems = projects
    .filter((project) => project.coverImage?.asset?._ref)
    .map((project) => ({
      id: project._id,
      title: plainText(project.title) || "Untitled project",
      href: project.slug?.current ? `/project/${project.slug.current}` : null,
      category: plainText(project.category) || "Project",
      location: plainText(project.location),
      tagline: plainText(project.homeTagline),
      url: urlFor(project.coverImage!).width(1400).height(934).fit("crop").auto("format").quality(78).url(),
    }));
  const insightItems = uniqueImageInsights(insights).map((insight) => ({
    id: insight._id,
    title: plainText(insight.title) || "Untitled insight",
    href: insight.slug?.current ? `/insight/${insight.slug.current}` : null,
    category: plainText(insight.category),
    excerpt: plainText(insight.excerpt),
    url: insight.coverImage ? urlFor(insight.coverImage).width(1400).height(934).fit("crop").auto("format").quality(80).url() : null,
  }));
  const process = settings?.servicesProcess?.length
    ? settings.servicesProcess.map((item) => ({
        title: plainText(item.title),
        description: plainText(item.description),
        imageUrl: item.image ? urlFor(item.image).width(1400).height(1050).fit("crop").auto("format").quality(78).url() : null,
      }))
    : defaultProcess;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />

      <header className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pb-24 md:pt-48">
        <div className="grid gap-12 md:grid-cols-[0.65fr_1.35fr] md:gap-20">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/70">{plainText(settings?.servicesPageLabel) || "Services"}</p>
          <div>
            <h1 className="max-w-5xl text-5xl font-medium leading-[0.9] tracking-[-0.08em] md:text-8xl">
              {plainText(settings?.servicesPageHeading) || "Considered spaces, shaped around the way they are lived."}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              {plainText(settings?.servicesPageDescription) || "Linnorea brings spatial planning, material direction, and detail together to create interiors with a clear sense of place."}
            </p>
          </div>
        </div>
      </header>

      <ScrollReveal as="section" className="border-b border-white/15">
        <div className="mx-auto max-w-[88rem] px-5 py-8 md:px-8 md:py-12">
          <div data-reveal className="relative aspect-video overflow-hidden bg-[var(--color-bg-elevated)]">
            <StudioVisual image={settings?.studioVisualImage} video={settings?.studioVisualVideo} videoLabel={dictionary.ui.studioVideo} />
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal as="section" className="border-b border-white/15">
        <div id="process" className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-32">
          <div data-reveal className="mb-16 grid gap-10 md:mb-24 md:grid-cols-[0.72fr_1.28fr] md:gap-20">
            <div>
              <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">{plainText(settings?.servicesProcessLabel) || "Our approach"}</p>
              <h2 className="mt-6 max-w-sm text-4xl font-medium tracking-[-0.06em] md:text-6xl">{plainText(settings?.servicesProcessHeading) || "From first direction to considered detail."}</h2>
            </div>
            <p className="max-w-2xl border-t border-white/15 pt-6 text-lg leading-8 text-white/70 md:pt-8 md:text-xl md:leading-9">
              {plainText(settings?.servicesProcessDescription) || "Linnorea brings together spatial planning, concept development, material direction, furniture selection, visualisation, and final styling to shape spaces with clarity, warmth, and character."}
            </p>
          </div>

          <div className="space-y-5 md:space-y-8">
            {process.map((stage, index) => {
              const title = stage.title;
              const description = stage.description;
              const serviceVisual = stage.imageUrl || serviceItems[index]?.imageUrl;
              const projectVisual = projectImageItems[index % Math.max(projectImageItems.length, 1)];
              const visualUrl = serviceVisual || projectVisual?.url;
              const visualAlt = serviceItems[index]?.title || projectVisual?.alt || title;
              const reversed = index % 2 === 1;
              return (
                <article key={title} data-reveal className="grid min-h-[26rem] md:grid-cols-2">
                  <div className={`relative min-h-[20rem] overflow-hidden bg-[var(--color-bg-elevated)] ${reversed ? "md:order-2" : ""}`}>
                    {visualUrl ? <Image src={visualUrl} alt={visualAlt} fill quality={80} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : <div className="absolute inset-0 bg-[var(--color-bg-elevated)]" aria-hidden="true" />}
                  </div>
                  <div className={`flex flex-col justify-center bg-white/[0.045] px-7 py-12 md:px-14 md:py-16 ${reversed ? "md:order-1" : ""}`}>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">Our approach</p>
                    <h3 className="mt-5 max-w-md text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-5xl">{title}</h3>
                    <p className="mt-6 max-w-md text-base leading-7 text-white/62 md:text-lg md:leading-8">{description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </ScrollReveal>      <ServiceExperience services={serviceItems} projectImages={projectImageItems} projectCards={projectCardItems} insights={insightItems} />

      {whatsappHref ? (
        <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-32">
          <div className="max-w-xl">
            <p className="text-sm text-white/60">{dictionary.ui.connect}</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.06em] md:text-6xl">{dictionary.ui.seeThinking}</h2>
          </div>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-fit items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition-colors hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">
            {plainText(settings?.whatsappCtaText) || dictionary.home.cta}
          </a>
        </section>
      ) : null}
    </main>
  );
}
