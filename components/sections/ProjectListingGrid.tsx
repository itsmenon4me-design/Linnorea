"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/sections/ProjectCard";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Project } from "@/lib/sanity/types";

type ProjectListingGridProps = {
  projects: Project[];
  categories: string[];
  locale: Locale;
  dictionary: Dictionary;
};

export function ProjectListingGrid({ projects, categories, locale, dictionary }: ProjectListingGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const visibleProjects = useMemo(
    () => activeCategory ? projects.filter((project) => project.category?.trim() === activeCategory) : projects,
    [activeCategory, projects],
  );

  return (
    <>
      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-white/15 py-6" aria-label={dictionary.ui.filterProjects}>
          <span className="mr-2 text-sm text-white/55">{dictionary.ui.filterProjects}</span>
          <button type="button" onClick={() => setActiveCategory(null)} aria-pressed={activeCategory === null} className="relative min-h-11 py-3 text-sm text-white transition after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[var(--color-accent-gold)] after:transition-transform after:content-[''] aria-pressed:after:scale-x-100 aria-pressed:after:opacity-100 aria-[pressed=false]:after:scale-x-0 aria-[pressed=false]:after:opacity-0 hover:text-[var(--color-accent-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-gold)]">
            {dictionary.ui.allProjects}
          </button>
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className="relative min-h-11 py-3 text-sm text-white transition after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[var(--color-accent-gold)] after:transition-transform after:content-[''] aria-pressed:after:scale-x-100 aria-pressed:after:opacity-100 aria-[pressed=false]:after:scale-x-0 aria-[pressed=false]:after:opacity-0 hover:text-[var(--color-accent-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-gold)]">
              {category}
            </button>
          ))}
        </div>
      ) : null}
      {visibleProjects.length > 0 ? (
        <div className="grid gap-12 pt-12 md:grid-cols-2 md:gap-x-10 md:gap-y-20">
          {visibleProjects.map((project) => <ProjectCard key={project._id} project={project} locale={locale} dictionary={dictionary} />)}
        </div>
      ) : (
        <div className="border-b border-white/15 py-20 text-sm text-white/65">{dictionary.ui.filteredProjectEmpty}</div>
      )}
    </>
  );
}
