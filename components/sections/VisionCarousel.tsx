"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { CarouselDot } from "@/components/ui/CarouselDot";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { urlFor } from "@/lib/sanity/image";
import { localizedValue, type VisionSlide } from "@/lib/sanity/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const AUTO_ADVANCE_MS = 6000;

const fallbackSlides = [
  {
    label: "VISION / 01",
    headline: "[Placeholder Vision Statement 1]",
    description: "[Placeholder description for the first vision statement. Final storytelling copy will be added here.]",
    image: undefined,
  },
  {
    label: "GOALS / 02",
    headline: "[Placeholder Goal Statement 2]",
    description: "[Placeholder description for the second storytelling slide. Final goals copy will be added here.]",
    image: undefined,
  },
  {
    label: "APPROACH / 03",
    headline: "[Placeholder Approach Statement 3]",
    description: "[Placeholder description for the third storytelling slide. Final approach copy will be added here.]",
    image: undefined,
  },
];

type SlideData = {
  label: string;
  headline: string;
  description: string;
  image?: VisionSlide["image"];
};

type SlideTransition = {
  from: number;
  to: number;
  direction: 1 | -1;
};

type TextSlideProps = {
  slide: SlideData;
  readMoreLabel: string;
};

const TextSlide = forwardRef<HTMLDivElement, TextSlideProps>(function TextSlide({ slide, readMoreLabel }, ref) {
  return (
    <div ref={ref} className="absolute inset-0">
      <p data-slide-element className="text-[10px] uppercase tracking-[0.35em] text-white/55">{slide.label}</p>
      <h2 data-slide-element className="mt-5 max-w-xl text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] text-white md:text-4xl">
        {slide.headline.split(" ").map((word, index) => (
          <span key={`${word}-${index}`} data-headline-word className="inline-block">{`${word}${index < slide.headline.split(" ").length - 1 ? "\u00a0" : ""}`}</span>
        ))}
      </h2>
      <p data-slide-element className="mt-6 max-w-md text-sm leading-6 text-white/65 md:text-base">{slide.description}</p>
      <a data-slide-element href="#collections" className="group mt-8 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <ArrowAction label={readMoreLabel} />
      </a>
    </div>
  );
});

type PanelSlideProps = {
  slide: SlideData;
  isIncoming?: boolean;
};

const PanelSlide = forwardRef<HTMLDivElement, PanelSlideProps>(function PanelSlide({ slide, isIncoming = false }, ref) {
  return (
    <div ref={ref} className={`absolute inset-0 ${isIncoming ? "z-10" : "z-0"}`}>
      {slide.image ? (
        <Image data-panel-image src={urlFor(slide.image).width(1400).height(1000).fit("crop").auto("format").quality(78).url()} alt={slide.headline} fill sizes="(min-width: 768px) 60vw, 100vw" loading={isIncoming ? "eager" : undefined} className="object-cover" />
      ) : (
        <MediaPlaceholder className="absolute inset-0" />
      )}
    </div>
  );
});

type VisionCarouselProps = {
  slides: VisionSlide[];
  locale: Locale;
  readMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
  dictionary: Dictionary;
};

export function VisionCarousel({ slides: cmsSlides, locale, readMoreLabel, previousLabel, nextLabel, dictionary }: VisionCarouselProps) {
  const slides: SlideData[] = cmsSlides.length > 0
    ? cmsSlides.map((slide) => ({
        label: localizedValue(slide.label, locale) || dictionary.ui.visionSlide,
        headline: localizedValue(slide.headline, locale) || dictionary.ui.placeholderHeadline,
        description: localizedValue(slide.description, locale) || dictionary.ui.placeholderDescription,
        image: slide.image,
      }))
    : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<SlideTransition | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const transitionRef = useRef<SlideTransition | null>(null);
  const currentPanelRef = useRef<HTMLDivElement | null>(null);
  const incomingPanelRef = useRef<HTMLDivElement | null>(null);
  const currentTextRef = useRef<HTMLDivElement | null>(null);
  const incomingTextRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;
  const preloadImages = useMemo(() => {
    if (slideCount <= 1) return [];

    const adjacentIndexes = new Set([
      (activeIndex + 1) % slideCount,
      (activeIndex - 1 + slideCount) % slideCount,
    ]);

    return Array.from(adjacentIndexes)
      .map((index) => slides[index].image)
      .filter((image): image is NonNullable<SlideData["image"]> => Boolean(image))
      .map((image) => urlFor(image).width(1400).height(1000).fit("crop").auto("format").quality(78).url());
  }, [activeIndex, slideCount, slides]);

  const changeSlide = useCallback((nextIndex: number) => {
    const normalizedIndex = (nextIndex + slideCount) % slideCount;
    if (normalizedIndex === activeIndex || transitionRef.current) return;

    const nextTransition: SlideTransition = {
      from: activeIndex,
      to: normalizedIndex,
      direction: nextIndex > activeIndex ? 1 : -1,
    };
    transitionRef.current = nextTransition;
    setProgress(0);
    progressRef.current = 0;
    setTransition(nextTransition);
  }, [activeIndex, slideCount]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeSlide(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        changeSlide(activeIndex + 1);
      }
    };

    section.addEventListener("keydown", handleKeyDown);
    return () => {
      section.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, changeSlide]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateReducedMotion);
      return () => mediaQuery.removeEventListener("change", updateReducedMotion);
    }

    mediaQuery.addListener(updateReducedMotion);
    return () => mediaQuery.removeListener(updateReducedMotion);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(Boolean(entry && entry.isIntersecting));
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !isInView || slideCount <= 1 || transition) {
      return;
    }

    const countdown = gsap.to(progressRef, {
      current: 1,
      duration: AUTO_ADVANCE_MS / 1000,
      ease: "none",
      onUpdate: () => setProgress(progressRef.current),
      onComplete: () => changeSlide(activeIndex + 1),
    });

    return () => {
      countdown.kill();
    };
  }, [activeIndex, changeSlide, isInView, reducedMotion, slideCount, transition]);

  useEffect(() => {
    if (!transition) return;

    const currentPanel = currentPanelRef.current;
    const incomingPanel = incomingPanelRef.current;
    const currentText = currentTextRef.current;
    const incomingText = incomingTextRef.current;
    if (!currentPanel || !incomingPanel || !currentText || !incomingText) return;

    if (reducedMotion) {
      gsap.set(incomingPanel, { x: `${transition.direction * 100}%` });
      const timeline = gsap.timeline({
        defaults: { duration: 0.12, ease: "power1.out" },
        onComplete: () => {
          setActiveIndex(transition.to);
          transitionRef.current = null;
          setTransition(null);
        },
      });
      timeline
        .to(currentPanel, { x: `${-transition.direction * 100}%` })
        .to(incomingPanel, { x: "0%" }, "<")
        .to(currentText, { opacity: 0 })
        .set(incomingText, { opacity: 1 });
      return () => {
        timeline.kill();
        gsap.set([currentPanel, incomingPanel, currentText, incomingText], { clearProps: "all" });
      };
    }

    const context = gsap.context(() => {
      const currentElements = currentText.querySelectorAll<HTMLElement>("[data-slide-element]");
      const incomingElements = incomingText.querySelectorAll<HTMLElement>("[data-slide-element]");
      const incomingImage = incomingPanel.querySelector<HTMLElement>("[data-panel-image]");
      const incomingHeadline = incomingElements[1];
      const timeline = gsap.timeline({
        defaults: { ease: "cubic-bezier(0.65, 0, 0.35, 1)" },
        onComplete: () => {
          setActiveIndex(transition.to);
          transitionRef.current = null;
          setTransition(null);
        },
      });

      gsap.set(currentPanel, { x: "0%" });
      gsap.set(incomingPanel, { x: `${transition.direction * 100}%` });
      gsap.set(incomingImage, { scale: 1.08, transformOrigin: "50% 50%" });
      gsap.set(incomingElements, { opacity: 0, y: 24 });
      gsap.set(incomingHeadline, { clipPath: "inset(0 0 100% 0)" });
      timeline
        .to(currentElements, { opacity: 0, y: -15, duration: 0.28, stagger: 0.04, ease: "power2.in" }, 0)
        .to(currentPanel, { x: `${-transition.direction * 100}%`, duration: 0.65 }, 0)
        .to(incomingPanel, { x: "0%", duration: 0.65 }, 0)
        .to(incomingImage, { scale: 1, duration: 0.65 }, 0)
        .to(incomingElements[0], { opacity: 1, y: 0, duration: 0.18 }, 0.25)
        .to(incomingHeadline, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.2 }, 0.32)
        .to(incomingElements[2], { opacity: 1, y: 0, duration: 0.18 }, 0.43)
        .to(incomingElements[3], { opacity: 1, y: 0, duration: 0.18 }, 0.47);
    }, sectionRef);

    return () => context.revert();
  }, [reducedMotion, transition]);

  return (
    <>
      {isNearViewport ? preloadImages.map((href) => <link key={href} rel="preload" as="image" href={href} />) : null}
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label={dictionary.ui.visionCarousel}
      className="border-y border-white/10 bg-[var(--color-bg-elevated)] px-5 py-16 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 md:px-8 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16">
        <div className="relative min-h-[300px] md:min-h-[340px]">
          {transition ? (
            <>
              <TextSlide ref={currentTextRef} slide={slides[transition.from]} readMoreLabel={readMoreLabel} />
              <TextSlide ref={incomingTextRef} slide={slides[transition.to]} readMoreLabel={readMoreLabel} />
            </>
          ) : <TextSlide ref={currentTextRef} slide={activeSlide} readMoreLabel={readMoreLabel} />}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-transparent">
          {transition ? (
            <div className="absolute inset-0">
              <PanelSlide ref={currentPanelRef} slide={slides[transition.from]} />
              <PanelSlide ref={incomingPanelRef} slide={slides[transition.to]} isIncoming />
            </div>
          ) : <PanelSlide ref={currentPanelRef} slide={activeSlide} />}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl items-center justify-between gap-6">
        <button type="button" onClick={() => changeSlide(activeIndex - 1)} disabled={Boolean(transition)} aria-label={previousLabel} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none">
          <ArrowIcon direction="left" className="h-[55%] w-[55%]" />
        </button>
        <div className="flex items-center gap-2.5" role="tablist" aria-label={dictionary.ui.visionSlides}>
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${dictionary.ui.showSlide} ${index + 1}`}
                onClick={() => changeSlide(index)}
                disabled={Boolean(transition)}
                className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40"
              >
                <CarouselDot
                  active={isActive}
                  passed={index < activeIndex}
                  progress={progress}
                  reducedMotion={reducedMotion}
                  resetKey={`progress-${activeIndex}`}
                />
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => changeSlide(activeIndex + 1)} disabled={Boolean(transition)} aria-label={nextLabel} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none">
          <ArrowIcon className="h-[55%] w-[55%]" />
        </button>
      </div>
    </section>
    </>
  );
}
