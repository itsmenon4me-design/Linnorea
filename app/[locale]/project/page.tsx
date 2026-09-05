import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { projectListQuery } from "@/lib/sanity/queries";
import type { Project } from "@/lib/sanity/types";

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
  const projects = await sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } });

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-36 md:px-8 md:pt-48">
        <div className="max-w-4xl border-b border-white/15 pb-12">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[var(--color-accent-gold)]">Linnorea Design Works</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.07em] md:text-6xl lg:text-7xl">{dictionary.nav.project}</h1>
        </div>
        {projects.length === 0 ? (
          <div className="border-b border-white/15 py-20 text-sm text-white/65">Belum ada project yang dipublikasikan di Sanity.</div>
        ) : (
          <div className="grid gap-x-8 gap-y-16 pt-12 md:grid-cols-2">
            {projects.map((project) => <ProjectCard key={project._id} project={project} locale={safeLocale} />)}
          </div>
        )}
      </section>
    </main>
  );
}
