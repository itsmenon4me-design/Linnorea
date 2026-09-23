"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MAX_INITIAL_WAIT_MS = 10000;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let pageLoaded = document.readyState === "complete";
    let heroReady = false;
    let hideTimeoutId: number | null = null;
    let maxWaitTimeoutId: number | null = null;

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

      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
      setIsReady(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hideTimeoutId = window.setTimeout(() => setIsVisible(false), 450);
      }
    };

    const restartSplash = () => {
      setIsReady(false);
      setIsVisible(true);
      pageLoaded = true;
      heroReady = true;
      maybeHide();
    };

    window.addEventListener("load", markPageLoaded);
    window.addEventListener("linnorea:hero-ready", markHeroReady);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        restartSplash();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    maxWaitTimeoutId = window.setTimeout(() => {
      heroReady = true;
      maybeHide();
    }, MAX_INITIAL_WAIT_MS);
    if (pageLoaded) {
      maybeHide();
    }

    return () => {
      window.removeEventListener("load", markPageLoaded);
      window.removeEventListener("linnorea:hero-ready", markHeroReady);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (maxWaitTimeoutId !== null) {
        window.clearTimeout(maxWaitTimeoutId);
      }
      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
    };
  }, []);

  const handleLogoAnimationIteration = () => {
    if (isReady && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(false);
    }
  };

  return (
    <div
      aria-hidden="true"
      suppressHydrationWarning
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
