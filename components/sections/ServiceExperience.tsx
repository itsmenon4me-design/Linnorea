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

type ServiceExperienceProps = {
  services: ServiceItem[];
  projectImages: ProjectImage[];
  projectCards: ProjectCard[];
};

export function ServiceExperience({ services, projectImages, projectCards = [] }: ServiceExperienceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeProject, setActiveProject] = useState(0);
  const marketSwiper = useRef<SwiperInstance | null>(null);
  const suppressClick = useRef(false);
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

  function moveProject(direction: number) {
    if (marketCards.length < 2) return;
    const next = Math.max(0, Math.min(activeProject + direction, marketCards.length - 1));
    setActiveProject(next);
  }

  return (
    <ScrollReveal as="section" className="border-b border-white/15">
      <div className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-32">
        <label className="sr-only" htmlFor="service-select">Choose a service</label>
        <select
          id="service-select"
          value={activeTab}
          onChange={(event) => setActiveTab(Number(event.target.value))}
          className="min-h-12 w-full border border-white/35 bg-[var(--color-bg-base)] px-4 text-sm text-white md:hidden"
        >
          {services.map((service, index) => <option key={service.id} value={index}>{service.title}</option>)}
        </select>
        <div data-reveal className="hidden gap-7 overflow-x-auto border-b border-white/15 pb-5 text-sm [scrollbar-width:none] md:flex md:justify-center md:gap-16 [&::-webkit-scrollbar]:hidden">
          {services.map((service, index) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`min-h-11 shrink-0 whitespace-nowrap border px-5 transition-colors ${
                activeTab === index
                  ? "border-white text-white"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
              aria-pressed={activeTab === index}
            >
              {service.title}
            </button>
          ))}
        </div>

        {services.length ? (
          <div className="mt-12 md:mt-16">
            <div data-reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm text-white/60">A considered approach to every brief.</p>
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
                  <p className="text-sm text-[var(--color-accent-gold)]">01</p>
                  <h3 className="mt-3 text-3xl tracking-[-0.05em]">{activeService?.title ?? "Service details"}</h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-white/60">
                  {activeService?.description ?? "Service information will appear here once it is added in Sanity."}
                </p>
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
                            <Link href={card.href} className="text-xl underline decoration-white/40 underline-offset-4">{card.title}</Link>
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
      {projectCards.length ? (
        <div className="border-t border-white/15 px-5 py-20 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1336px]">
            <p data-reveal className="text-sm tracking-[0.18em] text-white/60">INSIGHTS</p>
            <div data-reveal className="mt-8 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
              {projectCards.map((card) => (
                <article key={card.id} className="grid grid-cols-[134px_minmax(0,1fr)] gap-x-7 border-b border-white/15 pb-12 last:border-b-0 sm:block sm:border-b-0 sm:pb-0">
                  {card.href ? (
                    <Link href={card.href} className="block">
                      <div className="relative col-start-1 row-span-4 aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                        <Image src={card.url} alt={card.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />
                      </div>
                    </Link>
                  ) : (
                    <div className="relative col-start-1 row-span-4 aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
                      <Image src={card.url} alt={card.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    </div>
                  )}
                  <p className="col-start-2 text-xs tracking-[0.16em] text-white/60 sm:mt-7">{card.category}</p>
                  {card.href ? <h3 className="col-start-2 mt-4 text-xl font-medium leading-tight tracking-[-0.04em] sm:mt-5 sm:text-2xl"><Link href={card.href} className="hover:underline">{card.title}</Link></h3> : <h3 className="col-start-2 mt-4 text-xl font-medium leading-tight tracking-[-0.04em] sm:mt-5 sm:text-2xl">{card.title}</h3>}
                  {card.tagline ? <p className="col-start-2 mt-4 text-base leading-7 text-white/65">{card.tagline}</p> : null}
                  {card.location ? <p className="col-start-2 mt-4 text-sm text-white/45">{card.location}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </ScrollReveal>
  );
}
