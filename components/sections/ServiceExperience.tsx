"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
};

type ProjectImage = {
  id: string;
  url: string;
  alt: string;
};

type ProjectCard = {
  id: string;
  title: string;
  href: string | null;
  category: string;
  location: string;
  tagline: string;
  url: string;
};

type InsightCard = {
  id: string;
  title: string;
  href: string | null;
  category: string;
  excerpt: string;
  url: string | null;
};

type ServiceExperienceProps = {
  services: ServiceItem[];
  projectImages: ProjectImage[];
  projectCards: ProjectCard[];
  insights: InsightCard[];
};

export function ServiceExperience({ services, projectImages, projectCards = [], insights = [] }: ServiceExperienceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const marketSwiper = useRef<SwiperInstance | null>(null);
  const suppressClick = useRef(false);
  const serviceMenuRef = useRef<HTMLDivElement | null>(null);
  const activeService = services[activeTab % Math.max(services.length, 1)];
  const marketCards = projectCards.length ? projectCards : projectImages.map((image) => ({
    id: image.id,
    title: image.alt,
    href: null,
    category: "Selected work",
    location: "",
    tagline: "",
    url: image.url,
  }));

  useEffect(() => {
    marketSwiper.current?.slideTo(activeProject, 0);
  }, [activeProject]);

  useEffect(() => {
    function closeServiceMenu(event: MouseEvent) {
      if (!serviceMenuRef.current?.contains(event.target as Node)) {
        setIsServiceMenuOpen(false);
      }
    }
    function closeServiceMenuWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsServiceMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeServiceMenu);
    document.addEventListener("keydown", closeServiceMenuWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeServiceMenu);
      document.removeEventListener("keydown", closeServiceMenuWithEscape);
    };
  }, []);

  function moveProject(direction: number) {
    if (marketCards.length < 2) return;
    const next = Math.max(0, Math.min(activeProject + direction, marketCards.length - 1));
    setActiveProject(next);
  }

  return (
    <ScrollReveal as="section" className="border-b border-white/15">
      <div className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-32">
        {services.length ? (
          <div className="mt-12 md:mt-16">
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.16em] text-white/60 md:mb-10">Design services</p>
            <div ref={serviceMenuRef} className="service-menu relative mx-auto w-full max-w-[50rem]">
                      <button
                        type="button"
                        onClick={() => setIsServiceMenuOpen((isOpen) => !isOpen)}
                        aria-expanded={isServiceMenuOpen}
                        aria-controls="service-options"
                        className="service-menu__trigger flex min-h-16 w-full items-center justify-between gap-6 border-b border-white/35 text-left text-xl tracking-[-0.04em] text-white transition-colors hover:text-white/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:min-h-20 md:text-2xl"
                      >
                        <span>{activeService?.title ?? "Choose a service"}</span>
                        <span aria-hidden="true" className={`service-menu__chevron ${isServiceMenuOpen ? "service-menu__chevron--open" : ""}`} />
                      </button>
                      <div id="service-options" className={`service-menu__options ${isServiceMenuOpen ? "service-menu__options--open" : ""}`}>
                        <div className="service-menu__options-inner" role="listbox" aria-label="Choose a service">
                          {services.map((service, index) => (
                            <button
                              key={service.id}
                              type="button"
                              role="option"
                              aria-selected={activeTab === index}
                              onClick={() => {
                                setActiveTab(index);
                                setIsServiceMenuOpen(false);
                              }}
                              className={`service-menu__option ${activeTab === index ? "service-menu__option--active" : ""}`}
                            >
                              {service.title}
                            </button>
                          ))}
                        </div>
                      </div>
            </div>
            <div key={`service-content-${activeService?.id ?? "empty"}`} className="service-selection-content">
                      <div data-reveal className="mx-auto max-w-3xl text-center">
                        <h2 className="mt-6 text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-7xl">
                          From first conversation to final detail.
                        </h2>
                      </div>
                      <div data-reveal className="mx-auto mt-16 max-w-[41rem]">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                          {activeService?.imageUrl ? (
                            <Image src={activeService.imageUrl} alt={activeService.title} fill sizes="(max-width: 768px) 100vw, 832px" className="object-cover" />
                          ) : (
                            <MediaPlaceholder className="absolute inset-0" />
                          )}
                        </div>
                        <div className="mt-6 flex flex-col gap-3 border-b border-white/15 pb-8 md:flex-row md:items-start md:justify-between md:gap-12">
                          <div>
                            <h3 className="mt-3 text-3xl tracking-[-0.05em]">{activeService?.title ?? "Service details"}</h3>
                          </div>
                          <p className="max-w-md text-sm leading-6 text-white/60">
                            {activeService?.description ?? "Service information will appear here once it is added in Sanity."}
                          </p>
                        </div>
                      </div>
            </div>
          </div>
        ) : <p className="mt-14 border-t border-white/15 py-8 text-sm text-white/60">Service information will appear here once it is added in Sanity.</p>}

        <div className="mt-24 border-t border-white/15 pt-16 md:mt-48 md:pt-32">
          <div data-reveal className="flex items-end justify-between gap-8">
            <div>
              <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/60">Markets</p>
              <h2 className="mt-6 text-4xl font-medium leading-[0.95] tracking-[-0.06em] md:text-8xl">Spaces in context.</h2>
            </div>
          </div>
          {marketCards.length ? (
            <>
              <div data-reveal className="mt-10 overflow-hidden md:mt-16">
                <Swiper
                  onSwiper={(swiper) => {
                    marketSwiper.current = swiper;
                    swiper.slideTo(activeProject, 0);
                  }}
                  onSlideChange={(swiper) => setActiveProject(swiper.activeIndex)}
                  onSliderMove={() => {
                    suppressClick.current = true;
                  }}
                  initialSlide={activeProject}
                  centeredSlides={false}
                  slidesOffsetBefore={0}
                  slidesOffsetAfter={0}
                  slidesPerView="auto"
                  spaceBetween={40}
                  speed={700}
                  resistanceRatio={0}
                  watchOverflow
                  grabCursor
                  allowTouchMove
                  breakpoints={{
                    768: {
                      centeredSlides: true,
                      centeredSlidesBounds: true,
                    },
                  }}
                  className="!overflow-visible"
                  style={{ touchAction: "pan-y" }}
                >
                  {marketCards.map((card, index) => (
                    <SwiperSlide key={`${card.id}-${index}`} className="!h-auto !w-[calc(100vw-40px)] md:!w-[min(82vw,648px)]">
                      <div className="relative aspect-[4/3] select-none overflow-hidden bg-[var(--color-bg-elevated)]" draggable={false}>
                        <Image
                          src={card.url}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 82vw, 648px"
                          loading="eager"
                          unoptimized
                          draggable={false}
                          className="object-cover"
                        />
                      </div>
                      {index === activeProject ? (
                        <div
                          className="mt-5"
                          onClickCapture={(event) => {
                            if (!suppressClick.current) return;
                            event.preventDefault();
                            event.stopPropagation();
                            suppressClick.current = false;
                          }}
                        >
                          {card.href ? (
                            <Link href={card.href} className="text-xl underline decoration-transparent underline-offset-4 transition hover:decoration-white/40 focus-visible:decoration-white/40">{card.title}</Link>
                          ) : (
                            <p className="text-xl">{card.title}</p>
                          )}
                          <p className="mt-2 text-sm text-white/55">{[card.category, card.location].filter(Boolean).join(" / ")}</p>
                        </div>
                      ) : null}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {marketCards.length > 1 ? (
                <div data-reveal className="mt-8 flex justify-between gap-3 md:justify-center">
                  <button type="button" onClick={() => moveProject(-1)} disabled={activeProject === 0} className="carousel-arrow-button arrow-circle-button arrow-circle-button--md relative flex items-center justify-center text-white" aria-label="Previous project">
                    <svg className="pointer-events-none absolute inset-[-2px] h-[calc(100%+4px)] w-[calc(100%+4px)] -rotate-90" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="26" stroke="white" strokeOpacity="0.7" strokeWidth="1" />
                      <circle className="carousel-arrow-fill" cx="28" cy="28" r="26" stroke="var(--color-accent-progress)" strokeWidth="1.5" strokeDasharray="163.36" strokeDashoffset="163.36" strokeLinecap="round" />
                    </svg>
                    <ArrowIcon direction="left" className="h-[56%] w-[56%]" />
                  </button>
                  <button type="button" onClick={() => moveProject(1)} disabled={activeProject === marketCards.length - 1} className="carousel-arrow-button arrow-circle-button arrow-circle-button--md relative flex items-center justify-center text-white" aria-label="Next project">
                    <svg className="pointer-events-none absolute inset-[-2px] h-[calc(100%+4px)] w-[calc(100%+4px)] -rotate-90" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="26" stroke="white" strokeOpacity="0.7" strokeWidth="1" />
                      <circle className="carousel-arrow-fill" cx="28" cy="28" r="26" stroke="var(--color-accent-progress)" strokeWidth="1.5" strokeDasharray="163.36" strokeDashoffset="163.36" strokeLinecap="round" />
                    </svg>
                    <ArrowIcon className="h-[56%] w-[56%]" />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-12 border-t border-white/15 py-8 text-sm text-white/60">Project imagery will appear here once it is added in Sanity.</p>
          )}
        </div>
      </div>
      <section className="border-t border-white/15 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1336px]">
        <p data-reveal className="text-sm tracking-[0.18em] text-white/60">PROJECTS</p>
        {projectCards[0] ? (
          <article data-reveal className="mt-8">
            {projectCards[0].href ? (
              <Link href={projectCards[0].href} className="block">
                <div className="relative aspect-[16/8] overflow-hidden bg-[var(--color-bg-elevated)]">
                  <Image src={projectCards[0].url} alt={projectCards[0].title} fill sizes="(max-width: 768px) 100vw, 1336px" className="object-cover" />
                </div>
              </Link>
            ) : (
              <div className="relative aspect-[16/8] overflow-hidden bg-[var(--color-bg-elevated)]">
                <Image src={projectCards[0].url} alt={projectCards[0].title} fill sizes="(max-width: 768px) 100vw, 1336px" className="object-cover" />
              </div>
            )}
            <div className="mt-5">
              {projectCards[0].href ? (
                <Link href={projectCards[0].href} className="text-xl underline decoration-transparent underline-offset-4 transition hover:decoration-white/40 focus-visible:decoration-white/40">{projectCards[0].title}</Link>
              ) : (
                <p className="text-xl">{projectCards[0].title}</p>
              )}
            </div>
          </article>
        ) : null}
        <div data-reveal className="mx-auto mt-24 max-w-2xl md:mt-32">
          <p className="text-lg leading-8 text-white/70 md:text-xl md:leading-9">
            Linnorea brings together spatial planning, concept development, material direction, furniture selection, visualisation, and final styling to shape spaces with clarity, warmth, and character.
          </p>
          <Link
            href="/project"
            className="mt-12 inline-flex min-h-11 w-fit items-center gap-3 rounded-full border border-white/45 px-7 text-sm text-white transition hover:border-white hover:bg-white hover:text-[var(--color-bg-base)] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white"
          >
            See our projects
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>
      </section>
      {insights.length ? (
        <div className="border-t border-white/15 px-5 py-20 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1336px]">
            <p data-reveal className="text-sm tracking-[0.18em] text-white/60">INSIGHTS</p>
            <div data-reveal className="mt-8 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
              {insights.map((insight) => (
                <article key={insight.id} className="min-w-0 border-b border-white/15 pb-12 last:border-b-0 sm:border-b-0 sm:pb-0">
                  {insight.href ? (
                    <Link href={insight.href} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                        {insight.url ? <Image src={insight.url} alt={insight.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /> : <MediaPlaceholder className="h-full w-full" />}
                      </div>
                      <p className="mt-7 text-xs tracking-[0.16em] text-white/60">{insight.category}</p>
                      <h3 className="mt-4 text-xl font-medium leading-tight tracking-[-0.04em] underline decoration-transparent underline-offset-4 transition group-hover:decoration-white/40 sm:text-2xl">{insight.title}</h3>
                      {insight.excerpt ? <p className="mt-4 text-base leading-7 text-white/65">{insight.excerpt}</p> : null}
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-white/15 px-5 py-20 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1336px]">
            <p className="text-sm tracking-[0.18em] text-white/60">INSIGHTS</p>
            <p className="mt-8 border-t border-white/15 pt-8 text-sm text-white/60">No insights have been published yet.</p>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
}
