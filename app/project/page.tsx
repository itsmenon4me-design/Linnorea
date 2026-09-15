import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ProjectListingGrid } from "@/components/sections/ProjectListingGrid";
import { dictionary } from "@/lib/i18n/dictionaries";
import { getSiteSeo } from "@/lib/sanity/metadata";
import { sanityClient } from "@/lib/sanity/client";
import { projectListQuery } from "@/lib/sanity/queries";
import type { Project } from "@/lib/sanity/types";
import { fallbackProjects } from "@/lib/sanity/fallbackProjects";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function fetchProjectsSafely() {
  try {
    const projects = await Promise.race([
      sanityClient.fetch<Project[]>(projectListQuery, {}, { next: { revalidate } }),
      new Promise<Project[]>((_, reject) => {
        setTimeout(() => reject(new Error("Project data request timed out")), 5000);
      }),
    ]);
    return projects.length > 0 ? projects : fallbackProjects;
  } catch (error) {
    console.warn("Project data could not be loaded. Rendering the local preview dataset.", error);
    return fallbackProjects;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return { title: { absolute: `${dictionary.nav.project} | ${seo.title}` }, description: seo.description };
}

export default async function ProjectListingPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  const projects = params.demo === "1" ? fallbackProjects : await fetchProjectsSafely();
  const categories = Array.from(new Set(projects.map((project) => project.category?.trim()).filter((category): category is string => Boolean(category))));

  return (
    <main className="project-archive-page min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-0 md:px-8" style={{ paddingTop: "4.75rem" }}>
        <div className="sr-only">
          <h1>{dictionary.nav.project}</h1>
        </div>
        {projects.length === 0 ? (
          <div className="border-b border-white/10 py-20 text-sm text-white/65">{dictionary.ui.projectEmpty}</div>
        ) : (
          <ProjectListingGrid projects={projects} categories={categories} dictionary={dictionary} />
        )}
      </section>
    </main>
  );
}
