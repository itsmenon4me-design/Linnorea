import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { projectBySlugQuery, projectListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { localizedValue, portableTextToPlainText, type Project, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

type ProjectDetailProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const projects = await sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } });
  return locales.flatMap((locale) => projects.flatMap((project) => project.slug?.current ? [{ locale, slug: project.slug.current }] : []));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const project = await sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate } });
  if (!project) return { title: getDictionary(safeLocale).nav.project };
  const title = localizedValue(project.title, safeLocale);
  return { title, description: portableTextToPlainText(project.description?.[safeLocale]) };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { locale, slug } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const [project, projects, settings] = await Promise.all([
    sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate } }),
    sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
  ]);

  if (!project) notFound();

  const currentIndex = projects.findIndex((item) => item._id === project._id);
  const previous = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  const title = localizedValue(project.title, safeLocale) || "Untitled project";
  const style = localizedValue(project.styleTag, safeLocale);
  const location = localizedValue(project.location, safeLocale);
  const description = portableTextToPlainText(project.description?.[safeLocale]);
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappText = localizedValue(settings?.whatsappCtaText, safeLocale) || dictionary.home.cta;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[#07080a] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-[#17191c]">
        {project.heroVideo?.asset?.url ? (
          <video
            src={project.heroVideo.asset.url}
            autoPlay
            muted
            loop
            playsInline
            aria-label={`${title} project video`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : project.coverImage ? (
          <Image src={urlFor(project.coverImage).width(1920).height(1280).fit("crop").auto("format").url()} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white/45">[Placeholder hero image]</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-black/25 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-40 md:px-8 md:pb-20">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#c8a875]">{style || project.category || "Project"}</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{title}</h1>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/75">
            {location ? <span>{location}</span> : null}
            {project.year ? <span>{project.year}</span> : null}
            {style ? <span>{style}</span> : null}
          </div>
        </div>
      </section>

      {description ? (
        <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div data-reveal className="grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Concept</p>
            <p className="max-w-3xl whitespace-pre-line text-xl leading-[1.3] tracking-[-0.03em] text-white/90 md:text-4xl">{description}</p>
          </div>
        </ScrollReveal>
      ) : null}

      {project.gallery?.length ? (
        <section className="space-y-4 px-3 md:space-y-8 md:px-8">
          {project.gallery.map((image, index) => {
            const imageUrl = urlFor(image).width(2200).height(index % 3 === 1 ? 1300 : 1500).fit("crop").auto("format").url();
            return (
              <ScrollReveal key={image._key ?? `${project._id}-${index}`} as="div">
                <div data-reveal className="relative aspect-[4/3] overflow-hidden bg-[#17191c] md:aspect-[16/9]">
                  <Image src={imageUrl} alt={`${title} gallery ${index + 1}`} fill sizes="100vw" className="object-cover" />
                </div>
              </ScrollReveal>
            );
          })}
        </section>
      ) : (
        <div className="mx-5 border-y border-white/15 py-16 text-center text-[10px] uppercase tracking-[0.28em] text-white/45 md:mx-8">[Placeholder gallery, awaiting project images]</div>
      )}

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[0.7fr_1.3fr] md:px-8 md:py-36">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Project details</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-6">
          {[
            ["Location", location],
            ["Year", project.year],
            ["Area", project.area],
            ["Scope", localizedValue(project.scopeOfWork, safeLocale)],
          ].map(([label, value]) => value ? <div key={label}><dt className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</dt><dd className="mt-2 text-lg text-white/90">{value}</dd></div> : null)}
        </dl>
      </section>

      {whatsappHref ? (
        <section className="mx-5 border-y border-white/15 py-20 md:mx-8 md:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-medium tracking-[-0.055em] md:text-6xl">Punya ruang yang ingin diwujudkan?</h2>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[#c8a875] px-5 text-[10px] uppercase tracking-[0.22em] text-[#e3c995] transition hover:bg-[#c8a875] hover:text-[#07080a]">{whatsappText}</a>
          </div>
        </section>
      ) : null}

      <nav aria-label="Project navigation" className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-20 md:px-8 md:py-28">
        {previous ? (
          <Link href={`/${safeLocale}/project/${previous.slug?.current}`} className="group flex items-start gap-4 border-r border-white/15 pr-5 focus-visible:outline-2 focus-visible:outline-[#c8a875]">
            <span className="block">
              <ArrowAction label={dictionary.ui.previous} direction="left" />
              <span className="mt-4 block text-xl text-white/85 transition group-hover:text-[#e3c995]">{localizedValue(previous.title, safeLocale)}</span>
            </span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/${safeLocale}/project/${next.slug?.current}`} className="group ml-auto flex items-start justify-end gap-4 pl-5 text-right focus-visible:outline-2 focus-visible:outline-[#c8a875]">
            <span className="block text-right">
              <span className="mt-4 block text-xl text-white/85 transition group-hover:text-[#e3c995]">{localizedValue(next.title, safeLocale)}</span>
            </span>
            <ArrowAction label={dictionary.ui.next} />
          </Link>
        ) : <span />}
      </nav>
    </main>
  );
}
