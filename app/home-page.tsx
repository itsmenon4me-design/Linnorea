import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { RevealCurtain } from "@/components/animation/RevealCurtain";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { HorizontalDragScroller } from "@/components/sections/HorizontalDragScroller";
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
    sanityClient.fetch<ProjectListItem[]>(projectListQuery),
    sanityClient.fetch<HeroSlide[]>(heroSlidesQuery),
  ]);
  const normalizedHeroSlides = normalizeHeroEyebrows(heroSlides);
  const featuredProjects = projects.filter((project) => project.featured);
  const highlightProjects = [
    ...featuredProjects,
    ...projects.filter((project) => !project.featured),
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <style>{`.hero-eyebrow { align-self: flex-start; border-left: 1px solid var(--color-accent-gold); padding-left: 1rem; text-align: left; text-transform: none; }`}</style>
      <Header dictionary={dictionary} />
      <Hero dictionary={dictionary} slides={normalizedHeroSlides} />
      {/* VisionCarousel and the previous six-tile Collections mosaic remain available for easy rollback. */}
      <ScrollReveal as="section" className="px-5 py-20 md:px-8 md:py-28">
        <div id="collections" data-reveal className="mx-auto max-w-7xl">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/75">{dictionary.home.highlightsEyebrow}</p>
          <div className="mt-5 flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.home.highlightsTitle}</h2>
            {highlightProjects.length === 0 ? <p className="max-w-xs text-sm leading-6 text-white/55">{dictionary.home.featuredProjectsEmpty}</p> : null}
          </div>
          {highlightProjects.length > 0 ? (
            <HorizontalDragScroller className="mt-10 -mx-5 px-5 md:-mx-8 md:px-8">
              {highlightProjects.map((project) => {
                const title = plainText(project.title) || dictionary.home.untitledProject;
                const style = plainText(project.styleTag) || project.category || dictionary.ui.projectCategory;
                const tagline = plainText(project.homeTagline);
                const imageUrl = project.coverImage ? urlFor(project.coverImage).width(1200).height(900).fit("crop").auto("format").quality(78).url() : null;
                const card = (
                  <article data-reveal className="group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                      <RevealCurtain>
                        {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1600ms] ease-out motion-reduce:transition-none group-hover:scale-105" /> : <MediaPlaceholder className="h-full w-full" />}
                      </RevealCurtain>
                    </div>
                    <div className="border-b border-white/15 py-5">
                      <p className="text-sm text-[var(--color-accent-gold)]">{style}</p>
                      <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{title}</h3>
                      {tagline ? <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">{tagline}</p> : null}
                      <ArrowAction label={dictionary.home.discover} className="mt-5 text-[10px] uppercase tracking-[0.25em] text-white" />
                    </div>
                  </article>
                );
                return project.slug?.current ? (
                  <Link key={project._id} href={`/project/${project.slug.current}`} className="block w-full md:w-[min(42vw,24rem)] md:shrink-0 md:snap-start lg:w-[calc((100vw-8rem)/3)] lg:max-w-[28rem]">
                    {card}
                  </Link>
                ) : (
                  <div key={project._id} className="w-full md:w-[min(42vw,24rem)] md:shrink-0 md:snap-start lg:w-[calc((100vw-8rem)/3)] lg:max-w-[28rem]">
                    {card}
                  </div>
                );
              })}
            </HorizontalDragScroller>
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
