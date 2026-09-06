import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { LazyVisionCarousel } from "@/components/sections/LazyVisionCarousel";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { RevealCurtain } from "@/components/animation/RevealCurtain";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { heroSlidesQuery, projectListQuery, visionSlidesQuery } from "@/lib/sanity/queries";
import { localizedValue, type HeroSlide, type SanityImage, type VisionSlide } from "@/lib/sanity/types";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

type ProjectListItem = {
  _id: string;
  title?: {
    id?: string;
    en?: string;
    [key: string]: string | undefined;
  };
  category?: string;
  featured?: boolean;
  slug?: { current?: string };
  coverImage?: SanityImage;
  styleTag?: { id?: string; en?: string; [key: string]: string | undefined };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const dictionary = getDictionary(safeLocale);
  const [projects, heroSlides, visionSlides] = await Promise.all([
    sanityClient.fetch<ProjectListItem[]>(projectListQuery),
    sanityClient.fetch<HeroSlide[]>(heroSlidesQuery),
    sanityClient.fetch<VisionSlide[]>(visionSlidesQuery),
  ]);
  const featuredProjects = projects.filter((project) => project.featured);
  const mosaicTiles = Array.from({ length: 6 }, (_, index) => featuredProjects[index] ?? null);

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-white">
      <Header currentLocale={safeLocale} dictionary={dictionary} />
      <Hero dictionary={dictionary} locale={safeLocale} slides={heroSlides} />
      <LazyVisionCarousel
        slides={visionSlides}
        locale={safeLocale}
        readMoreLabel={dictionary.ui.readMore}
        previousLabel={dictionary.ui.previous}
        nextLabel={dictionary.ui.next}
        dictionary={dictionary}
      />

      <ScrollReveal as="section" className="px-5 py-20 md:px-8 md:py-28">
        <div id="collections" className="scroll-mt-20" />
        <div data-reveal className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">{dictionary.home.collections}</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.05em] md:text-5xl">{dictionary.home.selectedSpaces}</h2>
          </div>
          {featuredProjects.length === 0 ? <p className="max-w-xs text-right text-xs leading-5 text-white/55">{dictionary.home.featuredProjectsEmpty}</p> : null}
        </div>
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          {mosaicTiles.map((project, index) => {
            const title = project ? localizedValue(project.title, safeLocale) || dictionary.home.untitledProject : dictionary.home.featuredProjectPlaceholder;
            const style = project ? localizedValue(project.styleTag, safeLocale) : dictionary.home.awaitingFeaturedProject;
            const imageUrl = project?.coverImage ? urlFor(project.coverImage).width(1400).height(1000).fit("crop").auto("format").quality(78).url() : null;
            const tile = (
              <article data-reveal className="group relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                <RevealCurtain>
                  {imageUrl ? <Image src={imageUrl} alt={title} width={1200} height={900} sizes="(max-width: 768px) 100vw, 50vw" className="h-[116%] w-full origin-bottom object-cover transition-transform duration-[2400ms] ease-out motion-reduce:transition-none group-hover:scale-[1.1]" /> : <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#171b1f,var(--color-bg-base))] px-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/45">{dictionary.home.featuredImagePlaceholder}</div>}
                </RevealCurtain>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">{style}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white md:text-4xl">{title}</h3>
                  <ArrowAction label={project ? dictionary.home.discover : dictionary.ui.comingSoon} className={`mt-5 uppercase tracking-[0.25em] text-white ${project ? "text-[10px]" : "text-xs"}`} />
                </div>
              </article>
            );
            return project?.slug?.current ? <Link key={project._id} href={`/${safeLocale}/project/${project.slug.current}`}>{tile}</Link> : <div key={`placeholder-${index}`}>{tile}</div>;
          })}
        </div>
      </ScrollReveal>

    </main>
  );
}
