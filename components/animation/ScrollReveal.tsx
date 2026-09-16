"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
  style?: React.CSSProperties;
};

export function ScrollReveal({ children, className, as = "div", style }: ScrollRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const Tag = as;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cleanupScrollReveal = () => {};
    const context = gsap.context(() => {
      const revealBlocks = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-block]"));
      const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
      const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-item]")).filter((element) => !element.closest("[data-reveal-block], [data-reveal-expandable]"));
      const revealImages = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-image]")).filter((element) => !element.closest("[data-reveal-block]"));
      const scrollTargets = [...targets, ...revealItems, ...revealImages];
      if (scrollTargets.length === 0 && revealBlocks.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(root, { opacity: 1, marginTop: 0, clearProps: "transform" });
        gsap.set(scrollTargets, { opacity: 1, y: 0, clearProps: "transform,clipPath" });
        revealBlocks.forEach((block) => {
          gsap.set(block, { opacity: 1, y: 0, clearProps: "transform,clipPath" });
        });
        return;
      }

      [...targets, ...revealItems].forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight * 0.92) {
          element.style.opacity = "0";
          element.style.transform = `translateY(${targets.includes(element) ? 28 : 20}px)`;
        }
      });
      revealImages.forEach((image) => {
        if (image.getBoundingClientRect().top >= window.innerHeight * 0.92) {
          image.style.opacity = "0";
          image.style.clipPath = "inset(12% 0 0 0)";
        }
      });

      revealBlocks.forEach((block) => {
        gsap.set(block, { opacity: 0, clearProps: "y,transform,translate" });

        const blockTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: "top 82%",
            once: true,
          },
        });

        blockTimeline.to(block, {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "y,transform,translate",
        });
      });

      const pending = new Set([...targets, ...revealItems, ...revealImages]);
      const revealVisible = () => {
        pending.forEach((element) => {
          if (element.getBoundingClientRect().top > window.innerHeight * 0.92) return;
          pending.delete(element);
          if (revealImages.includes(element)) {
            gsap.to(element, {
              opacity: 1,
              clipPath: "inset(0% 0 0 0)",
              duration: 0.85,
              ease: "power2.out",
            });
          } else {
            gsap.to(element, {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power2.out",
            });
          }
        });
      };
      let scrollFrame = 0;
      const handleScroll = () => {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0;
          revealVisible();
        });
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.setTimeout(revealVisible, 800);
      cleanupScrollReveal = () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      };

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => {
      cleanupScrollReveal();
      context.revert();
    };
  }, []);

  return <Tag ref={(node) => { rootRef.current = node; }} className={className} style={style}>{children}</Tag>;
}
