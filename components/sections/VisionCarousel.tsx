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
  readMoreLabel: string;
};

const TextSlide = forwardRef<HTMLDivElement, TextSlideProps>(function TextSlide({ slide, readMoreLabel }, ref) {
  return (
    <div ref={ref} className="absolute inset-0">
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/55">{slide.label}</p>
      <h2 className="mt-5 max-w-xl text-2xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] text-white md:text-4xl">{slide.headline}</h2>
      <p className="mt-6 max-w-md text-sm leading-6 text-white/65 md:text-base">{slide.description}</p>
      <a href="#collections" className="group mt-8 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
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
  const imageCurtainRef = useRef<HTMLDivElement | null>(null);
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
    const imageCurtain = imageCurtainRef.current;
    const currentText = currentTextRef.current;
    const incomingText = incomingTextRef.current;
    if (!currentPanel || !incomingPanel || !imageCurtain || !currentText || !incomingText) return;

    if (reducedMotion) {
      gsap.set([currentPanel, incomingPanel, imageCurtain], { clearProps: "all" });
      gsap.set([currentText, incomingText], { clearProps: "all" });
      window.setTimeout(() => {
        setActiveIndex(transition.to);
        transitionRef.current = null;
        setTransition(null);
      }, 0);
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          setActiveIndex(transition.to);
          transitionRef.current = null;
          setTransition(null);
        },
      });

      gsap.set(incomingPanel, { opacity: 0 });
      gsap.set(incomingText, { xPercent: transition.direction * 100 });
      timeline
        .to(currentPanel, { opacity: 0, duration: 0.16, ease: "power1.out" }, 0)
        .to(imageCurtain, { scaleX: 0.08, duration: 0.2, ease: "power2.inOut" }, 0.16)
        .to(imageCurtain, { scaleX: 1, duration: 0.24, ease: "power2.inOut" }, 0.36)
        .to(incomingPanel, { opacity: 1, duration: 0.14, ease: "power1.out" }, 0.6)
        .to(currentText, { xPercent: transition.direction * -100, duration: 0.72, ease: "power2.inOut" }, 0)
        .to(incomingText, { xPercent: 0, duration: 0.72, ease: "power2.inOut" }, 0);
    }, sectionRef);

    return () => context.revert();
  }, [reducedMotion, transition]);

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label="Vision and goals carousel"
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

        <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-[#d2d2d2]">
          {transition ? (
            <div ref={imageCurtainRef} className="absolute inset-0 origin-center">
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
                disabled={Boolean(transition)}
                className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40"
              >
                {isActive ? (
                  <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
                    <svg key={`progress-${activeIndex}`} viewBox="0 0 24 24" className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="12" cy="12" r={dotRadius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.6" />
                      <circle
                        cx="12"
                        cy="12"
                        r={dotRadius}
                        fill="none"
                        stroke="var(--color-accent-progress)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeDasharray={dotCircumference}
                        strokeDashoffset={dotCircumference}
                        className={reducedMotion || !isInView ? "" : "dot-progress-ring"}
                        style={progressStyle}
                      />
                    </svg>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border border-white/25 bg-white/80" />
                )}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => changeSlide(activeIndex + 1)} disabled={Boolean(transition)} aria-label={nextLabel} className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none">
          <ArrowIcon className="h-[55%] w-[55%]" />
        </button>
      </div>
    </section>
  );
}
