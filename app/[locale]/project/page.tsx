import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ProjectCarousel, ProjectHighlightCarousel } from "@/components/sections/ProjectCarousel";
import { ProjectListingGrid } from "@/components/sections/ProjectListingGrid";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { projectListQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import type { Project, SiteSettings } from "@/lib/sanity/types";

export const revalidate = 60;

type ProjectListingProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: ProjectListingProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const seo = await getSiteSeo(safeLocale);
  return { title: { absolute: `${getDictionary(safeLocale).nav.project} | ${seo.title}` }, description: seo.description };
}

export default async function ProjectListingPage({ params }: ProjectListingProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const [projects, siteSettings] = await Promise.all([
    sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery, {}, { next: { revalidate } }),
  ]);
  const ongoingProjects = projects.filter((project) => project.status?.trim().toLowerCase() === "ongoing");
  const categories = Array.from(new Set(projects.map((project) => project.category?.trim()).filter((category): category is string => Boolean(category))));

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      {siteSettings?.projectHighlightImages?.length ? (
        <ProjectHighlightCarousel
          images={siteSettings.projectHighlightImages}
          label={dictionary.ui.projectHighlights}
          previousLabel={dictionary.ui.previous}
          nextLabel={dictionary.ui.next}
        />
      ) : null}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-36 md:px-8 md:pt-48">
        <div className="max-w-4xl border-b border-white/15 pb-12">
          <p className="text-xs tracking-[0.2em] text-[var(--color-accent-gold)]">Linnorea design works</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.project}</h1>
        </div>
        {ongoingProjects.length > 0 ? (
          <section className="border-b border-white/15 py-12 md:py-16" aria-labelledby="ongoing-projects-title">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 id="ongoing-projects-title" className="max-w-md text-3xl font-medium tracking-[-0.05em] md:text-4xl">{dictionary.ui.ongoingProjects}</h2>
              <p className="max-w-xs text-right text-xs leading-5 text-white/60">{dictionary.ui.ongoingProjectsDescription}</p>
            </div>
            <ProjectCarousel
              projects={ongoingProjects}
              locale={safeLocale}
              dictionary={dictionary}
              previousLabel={dictionary.ui.previous}
              nextLabel={dictionary.ui.next}
            />
          </section>
        ) : null}
        {projects.length === 0 ? (
          <div className="border-b border-white/15 py-20 text-sm text-white/65">{dictionary.ui.projectEmpty}</div>
        ) : (
          <ProjectListingGrid projects={projects} categories={categories} locale={safeLocale} dictionary={dictionary} />
        )}
      </section>
    </main>
  );
}
