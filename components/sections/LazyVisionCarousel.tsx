"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { VisionSlide } from "@/lib/sanity/types";

const DeferredVisionCarousel = dynamic(
  () => import("./VisionCarousel").then((module) => module.VisionCarousel),
  { ssr: false },
);

type LazyVisionCarouselProps = {
  slides: VisionSlide[];
  locale: Locale;
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
    <div ref={containerRef} className="min-h-[620px]">
      {isNearViewport ? <DeferredVisionCarousel {...props} /> : null}
    </div>
  );
}
