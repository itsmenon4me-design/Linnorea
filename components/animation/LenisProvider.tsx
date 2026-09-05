"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      lerp: 0.08,
    });

    const handleScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    const refresh = () => ScrollTrigger.refresh();

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(tick);
    ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("load", refresh);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
