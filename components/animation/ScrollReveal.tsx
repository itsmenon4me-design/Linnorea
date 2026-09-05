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
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

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
    }, root);

    return () => context.revert();
  }, []);

  return <Tag ref={(node) => { rootRef.current = node; }} className={className}>{children}</Tag>;
}
