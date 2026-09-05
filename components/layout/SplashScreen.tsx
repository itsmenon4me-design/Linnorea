"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 500;
const MAX_INITIAL_WAIT_MS = 10000;

type SplashScreenProps = {
  mode?: "initial" | "navigation";
};

export function SplashScreen({ mode = "initial" }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mode === "navigation") {
      const timeoutId = window.setTimeout(() => setIsReady(true), MIN_DISPLAY_MS);
      return () => window.clearTimeout(timeoutId);
    }

    let pageLoaded = document.readyState === "complete";
    let heroReady = !document.querySelector("[data-home-hero]");
    const startedAt = performance.now();
    let hideTimeoutId: number | null = null;
    const maxWaitTimeoutId = window.setTimeout(() => setIsReady(true), MAX_INITIAL_WAIT_MS);

    const markPageLoaded = () => {
      pageLoaded = true;
      maybeHide();
    };
    const markHeroReady = () => {
      heroReady = true;
      maybeHide();
    };
    const maybeHide = () => {
      if (!pageLoaded || !heroReady) {
        return;
      }

      const remaining = Math.max(MIN_DISPLAY_MS - (performance.now() - startedAt), 0);
      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
      hideTimeoutId = window.setTimeout(() => setIsReady(true), remaining);
    };

    window.addEventListener("load", markPageLoaded);
    window.addEventListener("linnorea:hero-ready", markHeroReady);
    maybeHide();

    return () => {
      window.removeEventListener("load", markPageLoaded);
      window.removeEventListener("linnorea:hero-ready", markHeroReady);
      window.clearTimeout(maxWaitTimeoutId);
      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
    };
  }, [mode]);

  const handleLogoAnimationIteration = () => {
    if (isReady && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(false);
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`splash-screen ${isVisible ? "splash-screen--visible" : "splash-screen--hidden"} ${isReady ? "splash-screen--ready" : ""}`}
    >
      <Image
        src="/assets/logo-mark.png"
        alt=""
        width={72}
        height={72}
        priority
        onAnimationIteration={handleLogoAnimationIteration}
        className="splash-screen__logo"
      />
    </div>
  );
}
