"use client";

import { useEffect, useRef, useState } from "react";

type LazyAutoplayVideoProps = {
  src: string;
  poster?: string;
  ariaLabel: string;
  className: string;
};

export function LazyAutoplayVideo({ src, poster, ariaLabel, className }: LazyAutoplayVideoProps) {
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
      { rootMargin: "300px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {isNearViewport ? (
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
          className={className}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[var(--color-bg-elevated)]" />
      )}
    </div>
  );
}
