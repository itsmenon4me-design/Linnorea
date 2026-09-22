"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MAX_INITIAL_WAIT_MS = 10000;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    let pageLoaded = true;
    let heroReady = true;
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

      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
      hideTimeoutId = window.setTimeout(() => {
        setIsReady(true);
        setIsVisible(false);
      }, 0);
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
      className={`splash-screen ${isVisible && !isReady ? "splash-screen--visible" : "splash-screen--hidden"} ${isReady ? "splash-screen--ready" : ""}`}
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
