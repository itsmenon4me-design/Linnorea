"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { VisionSlide } from "@/lib/sanity/types";

const DeferredVisionCarousel = dynamic(
  () => import("./VisionCarousel").then((module) => module.VisionCarousel),
  { ssr: false },
);

type LazyVisionCarouselProps = {
  slides: VisionSlide[];
  readMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
  dictionary: Dictionary;
};

export function LazyVisionCarousel(props: LazyVisionCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[49.5rem] md:min-h-[50rem]">
      {isNearViewport ? (
        <DeferredVisionCarousel {...props} />
      ) : (
        <section aria-hidden="true" className="border-y border-white/10 bg-[var(--color-bg-elevated)] px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16">
            <div className="min-h-[300px] md:min-h-[340px]" />
            <div className="aspect-[4/3] border border-white/10" />
          </div>
          <div className="mx-auto mt-10 h-8 max-w-7xl" />
        </section>
      )}
    </div>
  );
}
