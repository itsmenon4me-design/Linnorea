"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { useRef, useState } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { RevealCurtain } from "@/components/animation/RevealCurtain";
import { ArrowAction } from "@/components/ui/ArrowAction";

export type HighlightProject = {
  id: string;
  title: string;
  style: string;
  tagline: string;
  imageUrl: string | null;
  href: string | null;
};

type HighlightProjectsCarouselProps = {
  projects: HighlightProject[];
  discoverLabel: string;
};

export function HighlightProjectsCarousel({ projects, discoverLabel }: HighlightProjectsCarouselProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const initialIndex = 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  if (!projects.length) return null;

  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      initialSlide={initialIndex}
      slidesPerView="auto"
      spaceBetween={40}
      centeredSlides={false}
      slidesOffsetBefore={0}
      slidesOffsetAfter={0}
      speed={700}
      resistanceRatio={0}
      watchOverflow
      grabCursor
      className="!overflow-visible"
      style={{ touchAction: "pan-y" }}
      aria-label="Highlight projects"
    >
      {projects.map((project, index) => {
        const card = (
          <article data-reveal className="group">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)]">
              <RevealCurtain>
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    draggable={false}
                    sizes="(max-width: 768px) 82vw, 33vw"
                    className="select-none object-cover transition-transform duration-[1600ms] ease-out motion-reduce:transition-none group-hover:scale-105"
                  />
                ) : (
                  <MediaPlaceholder className="h-full w-full" />
                )}
              </RevealCurtain>
            </div>
            <div className="border-b border-white/15 py-5">
              <p className="text-sm text-[var(--color-accent-gold)]">{project.style}</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{project.title}</h3>
              {project.tagline ? <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">{project.tagline}</p> : null}
              <ArrowAction label={discoverLabel} className="mt-5 text-[10px] uppercase tracking-[0.25em] text-white" />
            </div>
          </article>
        );

        return (
          <SwiperSlide key={project.id} className="!h-auto !w-[min(72vw,280px)] md:!w-[280px] lg:!w-[280px]">
            {project.href ? (
              <Link
                href={project.href}
                className="block focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-gold)]"
                onClick={(event) => {
                  if (swiperRef.current?.allowClick === false) {
                    event.preventDefault();
                    swiperRef.current.allowClick = true;
                  }
                }}
              >
                {card}
              </Link>
            ) : (
              card
            )}
            {index === activeIndex ? null : <span className="sr-only">Inactive highlight project</span>}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
