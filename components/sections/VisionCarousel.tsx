"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { urlFor } from "@/lib/sanity/image";
import { localizedValue, type VisionSlide } from "@/lib/sanity/types";
import type { Locale } from "@/lib/i18n/config";

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
  isIncoming?: boolean;
  readMoreLabel: string;
};

const TextSlide = forwardRef<HTMLDivElement, TextSlideProps>(function TextSlide({ slide, isIncoming = false, readMoreLabel }, ref) {
  return (
    <div ref={ref} className={isIncoming ? "absolute inset-0" : undefined}>
      <p data-slide-element className="text-[10px] uppercase tracking-[0.35em] text-white/55">{slide.label}</p>
      <h2 data-slide-element className="mt-5 max-w-xl text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] text-white md:text-4xl">{slide.headline}</h2>
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
        <Image src={urlFor(slide.image).width(1400).height(1000).fit("crop").auto("format").url()} alt={slide.headline} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.35em] text-white/40">[Placeholder vision image]</div>
      )}
      {!slide.image ? <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.25em] text-white/45">Image placeholder</span> : null}
    </div>
  );
});

type VisionCarouselProps = {
  slides: VisionSlide[];
  locale: Locale;
  readMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
};

export function VisionCarousel({ slides: cmsSlides, locale, readMoreLabel, previousLabel, nextLabel }: VisionCarouselProps) {
  const slides: SlideData[] = cmsSlides.length > 0
    ? cmsSlides.map((slide) => ({
        label: localizedValue(slide.label, locale) || "Vision slide",
        headline: localizedValue(slide.headline, locale) || "[Placeholder headline]",
        description: localizedValue(slide.description, locale) || "[Placeholder description]",
        image: slide.image,
      }))
    : fallbackSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<SlideTransition | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const transitionRef = useRef<SlideTransition | null>(null);
  const currentPanelRef = useRef<HTMLDivElement | null>(null);
  const incomingPanelRef = useRef<HTMLDivElement | null>(null);
  const currentTextRef = useRef<HTMLDivElement | null>(null);
  const incomingTextRef = useRef<HTMLDivElement | null>(null);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;
  const dotRadius = 9;
  const dotCircumference = 2 * Math.PI * dotRadius;

  const changeSlide = useCallback((nextIndex: number) => {
    const normalizedIndex = (nextIndex + slideCount) % slideCount;
    if (normalizedIndex === activeIndex || transitionRef.current) return;

    if (reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIndex(normalizedIndex);
      return;
    }

    const nextTransition: SlideTransition = {
      from: activeIndex,
      to: normalizedIndex,
      direction: normalizedIndex > activeIndex || (activeIndex === slideCount - 1 && normalizedIndex === 0) ? 1 : -1,
    };
    transitionRef.current = nextTransition;
    setActiveIndex(normalizedIndex);
    setTransition(nextTransition);
  }, [activeIndex, reducedMotion, slideCount]);

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
    if (reducedMotion || !isInView) {
      return;
    }

    const intervalId = window.setInterval(() => {
      changeSlide((activeIndex + 1) % slideCount);
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeIndex, changeSlide, isInView, reducedMotion, slideCount]);

  useEffect(() => {
    if (!transition) return;

    const currentPanel = currentPanelRef.current;
    const incomingPanel = incomingPanelRef.current;
    const currentText = currentTextRef.current;
    const incomingText = incomingTextRef.current;
    if (!currentPanel || !incomingPanel || !currentText || !incomingText) return;

    const currentElements = currentText.querySelectorAll<HTMLElement>("[data-slide-element]");
    const incomingElements = incomingText.querySelectorAll<HTMLElement>("[data-slide-element]");
    if (reducedMotion) {
      gsap.set([currentPanel, incomingPanel], { clearProps: "all" });
      gsap.set(incomingElements, { opacity: 1, y: 0, clearProps: "transform" });
      window.setTimeout(() => {
        setActiveIndex(transition.to);
        transitionRef.current = null;
        setTransition(null);
      }, 0);
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          setActiveIndex(transition.to);
          transitionRef.current = null;
          setTransition(null);
        },
      });

      gsap.set(incomingPanel, { xPercent: transition.direction * 100 });
      gsap.set(incomingElements, { opacity: 0, y: 18 });
      timeline
        .to(currentElements, { opacity: 0, y: -8, duration: 0.24, stagger: 0.03 }, 0)
        .to(currentPanel, { xPercent: transition.direction * -100, duration: 0.72, ease: "power2.inOut" }, 0)
        .to(incomingPanel, { xPercent: 0, duration: 0.72, ease: "power2.inOut" }, 0)
        .to(incomingElements, { opacity: 1, y: 0, duration: 0.46, stagger: 0.12, ease: "power2.out" }, 0.18);
    }, sectionRef);

    return () => context.revert();
  }, [reducedMotion, transition]);

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label="Vision and goals carousel"
      className="border-y border-white/10 bg-[#0d0f12] px-5 py-16 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 md:px-8 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16">
        <div className={transition ? "relative min-h-[300px] md:min-h-[340px]" : undefined}>
          {transition ? (
            <>
              <TextSlide ref={currentTextRef} slide={slides[transition.from]} readMoreLabel={readMoreLabel} />
              <TextSlide ref={incomingTextRef} slide={slides[transition.to]} isIncoming readMoreLabel={readMoreLabel} />
            </>
          ) : <TextSlide ref={currentTextRef} slide={activeSlide} readMoreLabel={readMoreLabel} />}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-[linear-gradient(135deg,#252a30,#101216)]">
          {transition ? (
            <>
              <PanelSlide ref={currentPanelRef} slide={slides[transition.from]} />
              <PanelSlide ref={incomingPanelRef} slide={slides[transition.to]} isIncoming />
            </>
          ) : <PanelSlide ref={currentPanelRef} slide={activeSlide} />}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl items-center justify-between gap-6">
        <button type="button" onClick={() => changeSlide(activeIndex - 1)} aria-label={previousLabel} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
          <ArrowIcon direction="left" className="h-[55%] w-[55%]" />
        </button>
        <div className="flex items-center gap-3" role="tablist" aria-label="Vision slides">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const progressStyle = reducedMotion
              ? { strokeDashoffset: 0 }
              : { animationDuration: `${AUTO_ADVANCE_MS}ms` };

            return (
              <button
                key={slide.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => changeSlide(index)}
                className={`relative flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none ${isActive ? "h-4 w-4 bg-transparent" : "h-2.5 w-2.5 border border-white/25 bg-white/80"}`}
              >
                {isActive ? (
                  <svg key={`progress-${activeIndex}`} viewBox="0 0 24 24" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="12" cy="12" r={dotRadius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.6" />
                    <circle
                      cx="12"
                      cy="12"
                      r={dotRadius}
                      fill="none"
                      stroke="#d9302f"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray={dotCircumference}
                      strokeDashoffset={dotCircumference}
                      className={reducedMotion || !isInView ? "" : "dot-progress-ring"}
                      style={progressStyle}
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => changeSlide(activeIndex + 1)} aria-label={nextLabel} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
          <ArrowIcon className="h-[55%] w-[55%]" />
        </button>
      </div>
    </section>
  );
}
