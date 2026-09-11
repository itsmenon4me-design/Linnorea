"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export function ScrollReveal({ children, className, as = "div" }: ScrollRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const Tag = as;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const targets = root.querySelectorAll("[data-reveal]");
      const revealItems = root.querySelectorAll("[data-reveal-item]");
      const revealImages = root.querySelectorAll("[data-reveal-image]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([targets, revealItems, revealImages], { opacity: 1, y: 0, clearProps: "transform,clipPath" });
        return;
      }

      gsap.set(revealItems, { opacity: 0, y: 20 });
      gsap.set(revealImages, { opacity: 0, clipPath: "inset(12% 0 0 0)" });
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: root,
            start: "top 82%",
            once: true,
          },
        },
      );
      gsap.to(revealItems, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });
      gsap.to(revealImages, {
        opacity: 1,
        clipPath: "inset(0% 0 0 0)",
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => context.revert();
  }, []);

  return <Tag ref={(node) => { rootRef.current = node; }} className={className}>{children}</Tag>;
}
