import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { projectBySlugQuery, projectListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { plainText, portableTextToPlainText, type Project, type SiteSettings } from "@/lib/sanity/types";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { StudioVisual } from "@/components/sections/StudioVisual";

export const revalidate = 60;

type ProjectDetailProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate } });
  const seo = await getSiteSeo();
  if (!project) return { title: { absolute: `${dictionary.nav.project} | ${seo.title}` }, description: seo.description };
  const title = plainText(project.title);
  return { title: { absolute: `${title} | ${seo.title}` }, description: seo.description };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([
    sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate } }),
    sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
  ]);

  if (!project) notFound();

  const title = plainText(project.title) || dictionary.home.untitledProject;
  const style = plainText(project.styleTag);
  const location = plainText(project.location);
  const description = portableTextToPlainText(project.atAGlance) || portableTextToPlainText(project.description);
  const editorialSections = project.editorialSections?.filter((section) => section.heading || section.body?.length || section.image?.asset?._ref) ?? [];
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappText = plainText(settings?.whatsappCtaText) || dictionary.home.cta;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;
  const validCoverImage = project.coverImage?.asset?._ref ? project.coverImage : null;
  const validGallery = (project.gallery ?? []).filter((image) => image.asset?._ref);
  const moreProjects = projects
    .filter((item) => item._id !== project._id && item.slug?.current?.trim())
    .slice(0, 8);

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} variant="editorial" />
      <section className="mx-auto grid max-w-[90rem] gap-10 px-5 pb-20 pt-36 md:grid-cols-[0.35fr_1.65fr] md:gap-16 md:px-10 md:pb-28 md:pt-48">
        <Link href="/project" className="h-fit w-fit text-[10px] font-medium uppercase tracking-[0.25em] underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Projects</Link>
        <div>
          <h1 className="max-w-6xl text-5xl font-normal leading-[0.92] tracking-[-0.07em] md:text-7xl lg:text-[clamp(4.5rem,8vw,8rem)]">{title}</h1>
          {project.homeTagline ? <p className="mt-10 max-w-4xl text-xl leading-[1.35] md:text-3xl">{plainText(project.homeTagline)}</p> : null}
        </div>
      </section>
      <section className="relative mx-5 aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)] md:mx-10">
        {validCoverImage ? (
          <Image src={urlFor(validCoverImage).width(2200).height(1240).fit("crop").auto("format").quality(82).url()} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : <MediaPlaceholder className="absolute inset-0" />}
      </section>

      {description ? (
        <ScrollReveal as="section" className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 md:py-32">
          <div data-reveal className="grid gap-8 border-t border-white/20 pt-6 md:grid-cols-[0.35fr_1.65fr] md:gap-16">
            <p className="text-[10px] uppercase tracking-[0.25em]">At a glance</p>
            <p className="max-w-4xl whitespace-pre-line text-xl leading-[1.45] md:text-2xl">{description}</p>
          </div>
        </ScrollReveal>
      ) : null}

      <section className="mx-auto grid max-w-[90rem] gap-10 border-t border-white/20 px-5 py-16 md:grid-cols-[0.7fr_1fr_1fr_1fr] md:px-10 md:py-24">
        <p className="text-[10px] uppercase tracking-[0.25em]">Project data</p>
        {[
          ["Location", location],
          ["Size", project.area],
          ["Services", project.scopeOfWork || style],
        ].map(([label, value]) => value ? <div key={label}>        <p className="text-[10px] uppercase tracking-[0.25em] text-white/55">{label}</p><p className="mt-4 text-lg">{value}</p></div> : null)}
      </section>

      {validGallery.length ? (
        <section aria-label={`${title} gallery`} className="mx-auto max-w-[90rem] space-y-16 px-5 md:space-y-24 md:px-10">
          {validGallery[0] ? (
            <ScrollReveal as="div">
              <div data-reveal className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)]">
                <Image src={urlFor(validGallery[0]).width(2200).height(1240).fit("crop").auto("format").quality(82).url()} alt={`${title} gallery 1`} fill sizes="100vw" className="object-cover" />
              </div>
            </ScrollReveal>
          ) : null}
          {validGallery.length > 1 ? (
            <div className="grid gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-24">
              {validGallery.slice(1).map((image, index) => {
                const imageUrl = urlFor(image).width(1600).height(1200).fit("crop").auto("format").quality(78).url();
                return (
                  <ScrollReveal key={image._key ?? `${project._id}-${index + 1}`} as="div">
                    <div data-reveal className={`relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)] ${index % 3 === 1 ? "md:mt-24" : ""}`}>
                      <Image src={imageUrl} alt={`${title} gallery ${index + 2}`} fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : (
        <MediaPlaceholder className="mx-5 min-h-40 border-y border-white/20 md:mx-10" />
      )}

      {project.quote ? (
        <section className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 md:py-20">
          <blockquote className="max-w-4xl border-l border-[var(--color-accent-gold)] pl-6 text-2xl leading-tight tracking-[-0.03em] md:pl-10 md:text-5xl">
            "{project.quote}"
            {project.quoteAuthor ? <cite className="mt-6 block text-[10px] not-italic uppercase tracking-[0.25em] text-white/55">By {project.quoteAuthor}</cite> : null}
          </blockquote>
        </section>
      ) : null}

      {editorialSections.map((section, index) => {
        const body = portableTextToPlainText(section.body);
        const image = section.image?.asset?._ref ? section.image : null;
        return (
          <ScrollReveal key={`${section.heading ?? section.label ?? "section"}-${index}`} as="section" className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 md:grid-cols-[0.7fr_1.3fr] md:gap-16 md:px-10 md:py-24">
            <div data-reveal>
              <p className="text-[10px] uppercase tracking-[0.25em]">{section.label || "Project story"}</p>
              {section.heading ? <h2 className="mt-5 max-w-sm text-3xl leading-tight tracking-[-0.04em] md:text-5xl">{section.heading}</h2> : null}
            </div>
            <div data-reveal className="space-y-8">
              {body ? <p className="max-w-3xl whitespace-pre-line text-xl leading-[1.45] md:text-2xl">{body}</p> : null}
              {image ? <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]"><Image src={urlFor(image).width(1800).height(1350).fit("crop").auto("format").quality(78).url()} alt={section.heading || title} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" /></div> : null}
            </div>
          </ScrollReveal>
        );
      })}

      {(settings?.studioVisualVideo || settings?.studioVisualImage) ? (
        <section className="mx-auto grid max-w-[90rem] gap-10 px-5 py-20 md:grid-cols-[0.7fr_1.3fr] md:gap-16 md:px-10 md:py-28">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em]">Linnorea Design Works</p>
            <h2 className="mt-5 max-w-sm text-3xl leading-tight tracking-[-0.04em] md:text-5xl">Where space feels like home.</h2>
            {settings.aboutDescription ?             <p className="mt-6 max-w-sm text-base leading-relaxed text-white/70">{settings.aboutDescription}</p> : null}
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-elevated)]">
            <StudioVisual image={settings.studioVisualImage} video={settings.studioVisualVideo} videoLabel={dictionary.ui.studioVideo} />
          </div>
        </section>
      ) : null}

      {whatsappHref ? (
        <section className="mx-5 border-y border-white/20 py-20 md:mx-8 md:py-28">
          <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.ui.seeThinking}</h2>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{whatsappText}</a>
          </div>
        </section>
      ) : null}

      {moreProjects.length ? (
        <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 md:py-36">
          <div className="mb-8 border-t border-white/20 pt-6 md:mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em]">More projects</p>
          </div>
          <div className="grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {moreProjects.map((item) => {
              const image = item.coverImage?.asset?._ref ? item.coverImage : null;
              const itemTitle = plainText(item.title) || dictionary.home.untitledProject;
              const itemDescription = portableTextToPlainText(item.description);
              return (
                <Link key={item._id} href={`/project/${item.slug?.current?.trim()}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                    {image ? <Image src={urlFor(image).width(1000).height(750).fit("crop").auto("format").quality(78).url()} alt={itemTitle} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : <MediaPlaceholder className="absolute inset-0" />}
                  </div>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/55">{plainText(item.location) || plainText(item.styleTag) || "Project"}</p>
                  <h2 className="mt-3 max-w-sm text-2xl leading-tight tracking-[-0.04em] transition-colors group-hover:opacity-60">{itemTitle}</h2>
                  {itemDescription || item.homeTagline ? <p className="mt-4 max-w-sm text-base leading-snug text-white/70">{itemDescription || plainText(item.homeTagline)}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

    </main>
  );
}
