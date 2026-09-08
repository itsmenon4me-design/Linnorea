"use client";

import Image from "next/image";
import { useState } from "react";
import { CarouselDot } from "@/components/ui/CarouselDot";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { urlFor } from "@/lib/sanity/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Project, SanityImage } from "@/lib/sanity/types";

type ProjectCarouselProps = {
  projects: Project[];
  locale: Locale;
  dictionary: Dictionary;
  previousLabel: string;
  nextLabel: string;
};

export function ProjectCarousel({ projects, locale, dictionary, previousLabel, nextLabel }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (projects.length === 0) return null;

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + projects.length) % projects.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <ProjectCard project={projects[activeIndex]} locale={locale} dictionary={dictionary} />
      </div>
      {projects.length > 1 ? (
        <CarouselControls
          activeIndex={activeIndex}
          count={projects.length}
          onPrevious={() => move(-1)}
          onNext={() => move(1)}
          onSelect={setActiveIndex}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        />
      ) : null}
    </div>
  );
}

type ProjectHighlightCarouselProps = {
  images: SanityImage[];
  label: string;
  previousLabel: string;
  nextLabel: string;
};

export function ProjectHighlightCarousel({ images, label, previousLabel, nextLabel }: ProjectHighlightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.slice(0, 4);

  if (slides.length === 0) return null;

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section aria-label={label} className="border-y border-white/15 bg-[var(--color-bg-elevated)]">
      <div className="relative aspect-[16/8] min-h-[18rem] overflow-hidden md:aspect-[16/6]">
        {slides.map((image, index) => (
          <Image
            key={image._key ?? `${image.asset?._ref ?? "highlight"}-${index}`}
            src={urlFor(image).width(1800).height(700).fit("crop").auto("format").quality(80).url()}
            alt={`${label} ${index + 1}`}
            fill
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
            priority={index === 0}
          />
        ))}
        <div className="absolute inset-0 bg-black/20" />
        <CarouselControls
          activeIndex={activeIndex}
          count={slides.length}
          onPrevious={() => move(-1)}
          onNext={() => move(1)}
          onSelect={setActiveIndex}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          className="absolute inset-x-5 bottom-5 justify-between md:inset-x-8"
        />
      </div>
    </section>
  );
}

type CarouselControlsProps = {
  activeIndex: number;
  count: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  previousLabel: string;
  nextLabel: string;
  className?: string;
};

function CarouselControls({ activeIndex, count, onPrevious, onNext, onSelect, previousLabel, nextLabel, className = "" }: CarouselControlsProps) {
  return (
    <div className={`mt-5 flex items-center gap-5 ${className}`}>
      <button type="button" onClick={onPrevious} aria-label={previousLabel} className="flex min-h-11 min-w-11 items-center justify-center border border-white/35 text-lg text-white transition hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-gold)]">
        ←
      </button>
      <div className="flex items-center gap-3" aria-label={`${activeIndex + 1} / ${count}`}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => onSelect(index)}
            className="flex min-h-11 min-w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-gold)]"
          >
            <CarouselDot active={index === activeIndex} passed={index < activeIndex} reducedMotion />
          </button>
        ))}
      </div>
      <button type="button" onClick={onNext} aria-label={nextLabel} className="flex min-h-11 min-w-11 items-center justify-center border border-white/35 text-lg text-white transition hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-gold)]">
        →
      </button>
    </div>
  );
}
