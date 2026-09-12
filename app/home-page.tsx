import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { HighlightProjectsCarousel, type HighlightProject } from "@/components/sections/HighlightProjectsCarousel";
import { dictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { heroSlidesQuery, projectListQuery } from "@/lib/sanity/queries";
import { plainText, type HeroSlide, type SanityImage } from "@/lib/sanity/types";

export const revalidate = 60;

type ProjectListItem = {
  _id: string;
  title?: string;
  category?: string;
  featured?: boolean;
  slug?: { current?: string };
  coverImage?: SanityImage;
  styleTag?: string;
  homeTagline?: string;
};

function normalizeEyebrow(value: string | undefined) {
  const text = value?.trim();
  if (!text) return value;
  return text.toLowerCase().replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

function normalizeHeroEyebrows(slides: HeroSlide[]) {
  return slides.map((slide) => ({
    ...slide,
    eyebrow: normalizeEyebrow(plainText(slide.eyebrow)),
  }));
}

export default async function HomePage() {
  const [projects, heroSlides] = await Promise.all([
    sanityClient.fetch<ProjectListItem[]>(projectListQuery, {}, { next: { revalidate } }),
    sanityClient.fetch<HeroSlide[]>(heroSlidesQuery, {}, { next: { revalidate } }),
  ]);
  const normalizedHeroSlides = normalizeHeroEyebrows(heroSlides);
  const featuredProjects = projects.filter((project) => project.featured);
  const highlightProjects = [
    ...featuredProjects,
    ...projects.filter((project) => !project.featured),
  ];
  const highlightsEyebrow = `${highlightProjects.length} ${dictionary.home.highlightProject}${highlightProjects.length === 1 ? "" : "s"}`;

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />
      <Hero dictionary={dictionary} slides={normalizedHeroSlides} />
      {/* VisionCarousel and the previous six-tile Collections mosaic remain available for easy rollback. */}
      <ScrollReveal as="section" className="px-5 py-20 md:px-8 md:py-28">
        <div id="collections" data-reveal className="mx-auto max-w-7xl">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/75">{highlightsEyebrow}</p>
          <div className="mt-5 flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.home.highlightsTitle}</h2>
            {highlightProjects.length === 0 ? <p className="max-w-xs text-sm leading-6 text-white/55">{dictionary.home.featuredProjectsEmpty}</p> : null}
          </div>
          {highlightProjects.length > 0 ? (
            <div className="mt-10 -mx-5 overflow-hidden px-5 md:-mx-8 md:px-8">
              <HighlightProjectsCarousel
                projects={highlightProjects.map<HighlightProject>((project) => ({
                  id: project._id,
                  title: plainText(project.title) || dictionary.home.untitledProject,
                  style: plainText(project.styleTag) || project.category || dictionary.ui.projectCategory,
                  tagline: plainText(project.homeTagline),
                  imageUrl: project.coverImage ? urlFor(project.coverImage).width(1200).height(900).fit("crop").auto("format").quality(78).url() : null,
                  href: project.slug?.current ? `/project/${project.slug.current}` : null,
                }))}
                discoverLabel={dictionary.home.discover}
              />
            </div>
          ) : null}
          <Link
            href="/project"
            className="mt-12 inline-flex text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-gold)]"
          >
            <ArrowAction label={dictionary.home.discoverMore} className="text-[10px] uppercase tracking-[0.25em]" />
          </Link>
        </div>
      </ScrollReveal>

    </main>
  );
}
