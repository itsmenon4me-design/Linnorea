import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ServiceExperience } from "@/components/sections/ServiceExperience";
import { StudioVisual } from "@/components/sections/StudioVisual";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { projectListQuery, serviceListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { plainText, type Service, type ServiceProjectCard, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.service} | ${seo.title}` }, description: seo.description };
}

const process = [
  ["Understand", "We begin with the brief, context, needs, and constraints."],
  ["Define", "We establish a clear spatial and material direction."],
  ["Develop", "We refine the design through visuals, selections, and detail."],
  ["Deliver", "We support the transition from approved design to finished space."],
];

export default async function ServicePage() {
  const [services, settings, projects] = await Promise.all([
    sanityClient.fetch<Service[]>(serviceListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<ServiceProjectCard[]>(projectListQuery, {}, { next: { revalidate } }),
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

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />

      <header className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-8 md:pb-24 md:pt-48">
        <div className="grid gap-12 md:grid-cols-[0.65fr_1.35fr] md:gap-20">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/70">Services</p>
          <div>
            <h1 className="max-w-5xl text-5xl font-medium leading-[0.9] tracking-[-0.08em] md:text-8xl">
              Considered spaces, shaped around the way they are lived.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              Linnorea brings spatial planning, material direction, and detail together to create interiors with a clear sense of place.
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
      <ServiceExperience services={serviceItems} projectImages={projectImageItems} projectCards={projectCardItems} />

      <ScrollReveal as="section" className="border-b border-white/15">
        <div id="process" className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-32">
          <div className="grid gap-12 md:grid-cols-[0.75fr_1.25fr] md:gap-20">
            <div data-reveal>
              <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Our approach</p>
              <h2 className="mt-6 max-w-sm text-4xl font-medium tracking-[-0.06em] md:text-6xl">From first direction to considered detail.</h2>
            </div>
            <div data-reveal>
              <p className="max-w-2xl border-t border-white/15 pt-6 text-lg leading-8 text-white/70 md:pt-8 md:text-xl md:leading-9">
                Linnorea brings together spatial planning, concept development, material direction, furniture selection, visualisation, and final styling to shape spaces with clarity, warmth, and character.
              </p>
              <div className="mt-16 grid border-t border-white/15 md:mt-24 md:grid-cols-4">
                {process.map(([title, description]) => (
                  <div key={title} className="border-b border-white/15 py-8 md:min-h-64 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0 md:py-8">
                    <h3 className="text-2xl tracking-[-0.04em]">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-white/60">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

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
