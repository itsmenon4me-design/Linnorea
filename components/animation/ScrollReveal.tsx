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
      const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
      const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-item]"));
      const revealImages = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-image]"));
      const scrollTargets = [...targets, ...revealItems, ...revealImages];
      if (scrollTargets.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(root, { opacity: 1, marginTop: 0, clearProps: "transform" });
        gsap.set(scrollTargets, { opacity: 1, y: 0, clearProps: "transform,clipPath" });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });
      timeline.fromTo(root, { opacity: 0, marginTop: "6.25rem" }, {
        opacity: 1,
        marginTop: 0,
        duration: 0.6,
        ease: "power2.out",
      });
      if (targets.length > 0) {
        timeline.fromTo(targets, { opacity: 0, y: 28 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.08,
        }, "<0.12");
      }
      if (revealItems.length > 0) {
        timeline.fromTo(revealItems, { opacity: 0, y: 20 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.1,
        }, "<0.08");
      }
      if (revealImages.length > 0) {
        timeline.fromTo(revealImages, { opacity: 0, clipPath: "inset(12% 0 0 0)" }, {
          opacity: 1,
          clipPath: "inset(0% 0 0 0)",
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.12,
        });
      }
    }, root);

    return () => context.revert();
  }, []);

  return <Tag ref={(node) => { rootRef.current = node; }} className={className}>{children}</Tag>;
}
