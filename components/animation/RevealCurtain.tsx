"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type RevealCurtainProps = {
  children: React.ReactNode;
  className?: string;
  darkPanelColor?: string;
};

export function RevealCurtain({
  children,
  className = "",
  darkPanelColor = "var(--color-bg-base)",
}: RevealCurtainProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const darkPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const darkPanel = darkPanelRef.current;
    if (!root || !darkPanel) return;

    const reveal = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(darkPanel, { clipPath: "inset(0 100% 0 0)" });
        return;
      }

      const timeline = gsap.timeline();
      timeline.to(darkPanel, {
        clipPath: "inset(0 100% 0 0)",
        duration: 0.6,
        ease: "cubic-bezier(0.65, 0, 0.35, 1)",
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        reveal();
      },
      { threshold: 0.2 },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(darkPanel);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <div className="relative z-0 h-full w-full">{children}</div>
      <div
      ref={darkPanelRef}
      className="absolute inset-0 z-10"
      style={{ backgroundColor: darkPanelColor, clipPath: "inset(0 0% 0 0)" }}
      />
    </div>
  );
}
