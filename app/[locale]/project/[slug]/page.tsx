import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { LazyAutoplayVideo } from "@/components/media/LazyAutoplayVideo";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { projectBySlugQuery, projectListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { localizedValue, portableTextToPlainText, type Project, type SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

type ProjectDetailProps = { params: Promise<{ locale: string; slug: string }> };

type ProjectNavLinkProps = {
  project: Project;
  locale: Locale;
  label: string;
  direction: "left" | "right";
  side: "previous" | "next";
};

function ProjectNavLink({ project, locale, label, direction, side }: ProjectNavLinkProps) {
  const isPrevious = side === "previous";
  const title = localizedValue(project.title, locale);

  return (
    <Link
      href={`/${locale}/project/${project.slug?.current}`}
      className={`group min-w-0 flex items-start gap-4 focus-visible:outline-2 focus-visible:outline-[var(--color-accent-gold)] ${isPrevious ? "border-r border-white/15 pr-8" : "ml-auto pl-8 text-right"}`}
    >
      <span className={`block min-w-0 ${isPrevious ? "" : "text-right"}`}>
        <ArrowAction label={label} direction={direction} />
        <span className="mt-4 block min-w-0 break-words text-xl text-white/85 group-hover:text-[var(--color-accent-gold-light)]">{title}</span>
      </span>
    </Link>
  );
}

export async function generateStaticParams() {
  const projects = await sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } });
  return locales.flatMap((locale) => projects.flatMap((project) => project.slug?.current ? [{ locale, slug: project.slug.current }] : []));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const project = await sanityClient.fetch<Project | null>(projectBySlugQuery, { slug }, { next: { revalidate } });
  const seo = await getSiteSeo(safeLocale);
  if (!project) return { title: { absolute: `${getDictionary(safeLocale).nav.project} | ${seo.title}` }, description: seo.description };
  const title = localizedValue(project.title, safeLocale);
  return { title: { absolute: `${title} | ${seo.title}` }, description: seo.description };
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
  const title = localizedValue(project.title, safeLocale) || dictionary.home.untitledProject;
  const style = localizedValue(project.styleTag, safeLocale);
  const location = localizedValue(project.location, safeLocale);
  const description = portableTextToPlainText(project.description?.[safeLocale]);
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappText = localizedValue(settings?.whatsappCtaText, safeLocale) || dictionary.home.cta;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-[var(--color-bg-elevated)]">
        {project.heroVideo?.asset?.url ? (
          <LazyAutoplayVideo
            src={project.heroVideo.asset.url}
            poster={project.coverImage ? urlFor(project.coverImage).width(1920).height(1280).fit("crop").auto("format").url() : undefined}
            aria-label={`${title} project video`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : project.coverImage ? (
          <Image src={urlFor(project.coverImage).width(1920).height(1280).fit("crop").auto("format").url()} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white/45">{dictionary.ui.placeholderHeroImage}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-black/25 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-40 md:px-8 md:pb-20">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[var(--color-accent-gold)]">{style || project.category || "Project"}</p>
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
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">{dictionary.ui.concept}</p>
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
                <div data-reveal className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)] md:aspect-[16/9]">
                  <Image src={imageUrl} alt={`${title} gallery ${index + 1}`} fill sizes="100vw" className="object-cover" />
                </div>
              </ScrollReveal>
            );
          })}
        </section>
      ) : (
        <div className="mx-5 border-y border-white/15 py-16 text-center text-[10px] uppercase tracking-[0.28em] text-white/45 md:mx-8">{dictionary.ui.placeholderGallery}</div>
      )}

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[0.7fr_1.3fr] md:px-8 md:py-36">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">{dictionary.ui.projectDetails}</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-6">
          {[
            [dictionary.ui.location, location],
            [dictionary.ui.year, project.year],
            [dictionary.ui.area, project.area],
            [dictionary.ui.scope, localizedValue(project.scopeOfWork, safeLocale)],
          ].map(([label, value]) => value ? <div key={label}><dt className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</dt><dd className="mt-2 text-lg text-white/90">{value}</dd></div> : null)}
        </dl>
      </section>

      {whatsappHref ? (
        <section className="mx-5 border-y border-white/15 py-20 md:mx-8 md:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.ui.seeThinking}</h2>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent-gold-light)] transition hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)]">{whatsappText}</a>
          </div>
        </section>
      ) : null}

      <nav aria-label={dictionary.ui.projectNavigation} className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-20 md:px-8 md:py-28">
        {previous ? <ProjectNavLink project={previous} locale={safeLocale} label={dictionary.ui.previous} direction="left" side="previous" /> : <span />}
        {next ? <ProjectNavLink project={next} locale={safeLocale} label={dictionary.ui.next} direction="right" side="next" /> : <span />}
      </nav>
    </main>
  );
}
