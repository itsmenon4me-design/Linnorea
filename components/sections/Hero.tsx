"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type MuxPlayerElement from "@mux/mux-player";
import { gsap } from "gsap";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { CarouselDot } from "@/components/ui/CarouselDot";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { urlFor } from "@/lib/sanity/image";
import { localizedValue, type HeroSlide } from "@/lib/sanity/types";
import type { Locale } from "@/lib/i18n/config";

type HeroProps = {
  dictionary: Dictionary;
  locale: Locale;
  slides?: HeroSlide[];
};

type HeroTransition = {
  from: number;
  to: number;
  direction: 1 | -1;
};

const AUTO_ADVANCE_MS = 6000;
const SLIDE_TRANSITION_MS = 720;
const VIDEO_PRELOAD_STAGGER_MS = 1800;
const DRAG_THRESHOLD_PX = 96;
const DRAG_PLAY_TRIGGER_RATIO = 0.5;
const MEDIA_ERROR_RETRY_DELAY_MS = 900;
const MEDIA_ERROR_RETRY_TIMEOUT_MS = 6500;
const MAX_MEDIA_ERROR_RETRIES = 3;
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

const waitForMediaReady = (media: HTMLMediaElement, timeoutMs: number) => {
  if (media.readyState >= 3) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Hero media readiness timeout."));
    }, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      media.removeEventListener("canplay", handleReady);
      media.removeEventListener("loadeddata", handleReady);
    };
    const handleReady = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    media.addEventListener("canplay", handleReady, { once: true });
    media.addEventListener("loadeddata", handleReady, { once: true });
  });
};

export function Hero({ dictionary, locale, slides = [] }: HeroProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const muxPlayerRefs = useRef<Array<MuxPlayerElement | null>>([]);
  const mediaPanelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const slideTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const videoAdvancedRef = useRef(false);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const mounted = true;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [autoAdvanceResetKey, setAutoAdvanceResetKey] = useState(0);
  const [readyVideoIndexes, setReadyVideoIndexes] = useState<Set<number>>(() => new Set());
  const [transition, setTransition] = useState<HeroTransition | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const transitionRef = useRef<HeroTransition | null>(null);
  const playbackGenerationRef = useRef(0);
  const pendingPlayCleanupRef = useRef<(() => void) | null>(null);

  const resolvedSlides = useMemo<HeroSlide[]>(
    () =>
      slides.length > 0
        ? slides
        : [
            {
              _id: "fallback-hero-slide",
              eyebrow: { [locale]: dictionary.home.eyebrow },
              headline: { [locale]: dictionary.home.headline },
              subheadline: { [locale]: dictionary.home.subheadline },
            },
          ],
    [dictionary.home.eyebrow, dictionary.home.headline, dictionary.home.subheadline, locale, slides],
  );
  const activeSlide = resolvedSlides[activeIndex] ?? resolvedSlides[0];
  const eyebrow = activeSlide?.eyebrow ? localizedValue(activeSlide.eyebrow, locale) : dictionary.home.eyebrow;
  const headline = activeSlide?.headline ? localizedValue(activeSlide.headline, locale) : dictionary.home.headline;
  const subheadline = activeSlide?.subheadline ? localizedValue(activeSlide.subheadline, locale) : dictionary.home.subheadline;
  const playbackIds = useMemo(
    () =>
      resolvedSlides.map((slide) => {
        const videoAsset = slide.heroVideo?.asset;
        return videoAsset?.status === "ready" ? videoAsset.playbackId ?? null : null;
      }),
    [resolvedSlides],
  );
  const activePlaybackId = playbackIds[activeIndex] ?? null;
  const nextIndex = playbackIds.length > 1 ? (activeIndex + 1) % playbackIds.length : null;
  const activeIndexRef = useRef(activeIndex);
  const nextIndexRef = useRef<number | null>(nextIndex);
  const mediaRetryAttemptsRef = useRef<Map<number, number>>(new Map());
  const mediaRetryTimersRef = useRef<Map<number, number>>(new Map());
  const mediaErrorCleanupRef = useRef<Map<number, () => void>>(new Map());
  const mediaErrorLogRef = useRef<Map<string, number>>(new Map());
  const lifecycleQueuesRef = useRef<Map<number, Promise<void>>>(new Map());
  const preloadStartedRef = useRef<Set<number>>(new Set());
  const preloadInFlightRef = useRef<Set<number>>(new Set());
  const preloadQueueRef = useRef<Array<{
    index: number;
    operation: (media: HTMLMediaElement) => Promise<void> | void;
  }>>([]);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lockedAxis: "horizontal" | "vertical" | null;
    targetIndex: number | null;
    playTriggered: boolean;
    incomingPaused: boolean;
  } | null>(null);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    nextIndexRef.current = nextIndex;
  }, [activeIndex, nextIndex]);
  const queueMediaOperation = (
    index: number,
    player: MuxPlayerElement,
    operation: (media: HTMLMediaElement) => Promise<void> | void,
  ) => {
    const media = player.mediaController?.media;
    if (!media) {
      return Promise.reject(new Error(`Hero media instance is unavailable for slide ${index}.`));
    }
    const previous = lifecycleQueuesRef.current.get(index) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(() => operation(media));
    lifecycleQueuesRef.current.set(index, next);
    void next.finally(() => {
      if (lifecycleQueuesRef.current.get(index) === next) {
        lifecycleQueuesRef.current.delete(index);
      }
    });
    return next;
  };
  const drainPreloadQueue = () => {
    while (preloadQueueRef.current.length > 0) {
      preloadQueueRef.current.sort((a, b) => {
        const active = activeIndexRef.current;
        return Number(b.index === active) - Number(a.index === active);
      });
      const activeIndex = activeIndexRef.current;
      const activeQueued = preloadQueueRef.current.some((item) => item.index === activeIndex);
      const activeInFlight = preloadInFlightRef.current.has(activeIndex);
      const maxInFlight = activeQueued || activeInFlight ? 2 : 1;
      if (preloadInFlightRef.current.size >= maxInFlight) {
        return;
      }
      const next = preloadQueueRef.current.shift();
      if (!next || preloadInFlightRef.current.has(next.index)) {
        continue;
      }

      const player = muxPlayerRefs.current[next.index];
      if (!player) {
        continue;
      }

      preloadInFlightRef.current.add(next.index);
      void queueMediaOperation(next.index, player, next.operation)
        .catch((error: unknown) => {
          console.warn("Hero managed preload failed.", { index: next.index, error });
        })
        .finally(() => {
          preloadInFlightRef.current.delete(next.index);
          drainPreloadQueue();
        });
    }
  };
  const requestManagedPreload = (
    index: number,
    operation: (media: HTMLMediaElement) => Promise<void> | void,
  ) => {
    if (preloadInFlightRef.current.has(index) || preloadQueueRef.current.some((item) => item.index === index)) {
      return;
    }
    preloadQueueRef.current.push({ index, operation });
    drainPreloadQueue();
  };
  const playActiveVideo = (player: MuxPlayerElement) => {
    const media = player.mediaController?.media;
    const playerIndex = muxPlayerRefs.current.indexOf(player);
    const generation = playbackGenerationRef.current;
    if (!media) {
      return;
    }
    const startPlayback = () => {
      pendingPlayCleanupRef.current?.();
      pendingPlayCleanupRef.current = null;
      if (generation !== playbackGenerationRef.current) {
        return;
      }

      void queueMediaOperation(playerIndex, player, async (queuedMedia) => {
        if (
          queuedMedia.ended ||
          (Number.isFinite(queuedMedia.duration) && queuedMedia.duration > 0 && queuedMedia.currentTime >= queuedMedia.duration - 0.05)
        ) {
          queuedMedia.currentTime = 0;
        }
        await queuedMedia.play();
        if (playerIndex === activeIndexRef.current) {
          console.info("Hero video playback succeeded.", {
            index: playerIndex,
            playbackId: player.getAttribute("playback-id"),
            outcome: "video-playing",
          });
        }
      }).catch((error: unknown) => {
        if (generation === playbackGenerationRef.current) {
          console.warn("Hero video could not be played.", error);
        }
      });
    };

    if (media.readyState >= 3) {
      startPlayback();
      return;
    }

    pendingPlayCleanupRef.current?.();
    const handleReady = () => startPlayback();
    const cleanup = () => {
      media.removeEventListener("canplay", handleReady);
      media.removeEventListener("loadeddata", handleReady);
      if (pendingPlayCleanupRef.current === cleanup) {
        pendingPlayCleanupRef.current = null;
      }
    };
    pendingPlayCleanupRef.current = cleanup;
    media.addEventListener("canplay", handleReady, { once: true });
    media.addEventListener("loadeddata", handleReady, { once: true });
  };

  const handleVideoCanPlay = (index: number) => {
    setReadyVideoIndexes((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });

    if ((index === activeIndex || index === transitionRef.current?.to) && !isPaused && isHeroInView && isTabVisible) {
      const player = muxPlayerRefs.current[index];
      if (player) playActiveVideo(player);
      window.dispatchEvent(new Event("linnorea:hero-ready"));
    }
  };

  const handleVideoFailure = (index: number) => {
    if (index === activeIndex) {
      window.dispatchEvent(new Event("linnorea:hero-ready"));
    }
  };

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const errorCleanups = mediaErrorCleanupRef.current;
    const retryTimers = mediaRetryTimersRef.current;

    const retryVideoAfterError = (index: number, player: MuxPlayerElement, errorEvent: Event) => {
      const eventTarget = errorEvent.currentTarget as (HTMLMediaElement | MuxPlayerElement | null);
      const eventMedia = eventTarget instanceof HTMLMediaElement ? eventTarget : null;
      const media = player.mediaController?.media ?? eventMedia;
      const playbackId = player.getAttribute("playback-id");
      if (!media) {
        console.warn("Hero video retry skipped because the media instance is unavailable.", {
          index,
          playbackId,
        });
        return;
      }
      const eventError =
        eventMedia?.error ??
        (eventTarget !== null && "error" in eventTarget ? eventTarget.error : null);
      const mediaError = eventError ?? media.error;
      const isActive = index === activeIndexRef.current;
      const isNext = index === nextIndexRef.current;
      const errorKey = `${playbackId ?? "unknown"}:${index}:${mediaError?.code ?? "unknown"}:${mediaError?.message ?? "unknown"}`;
      const now = performance.now();
      const previousErrorAt = mediaErrorLogRef.current.get(errorKey);
      if (previousErrorAt !== undefined && now - previousErrorAt < 1000) {
        return;
      }
      mediaErrorLogRef.current.set(errorKey, now);
      mediaErrorLogRef.current.forEach((timestamp, key) => {
        if (now - timestamp >= 1000) {
          mediaErrorLogRef.current.delete(key);
        }
      });

      console.warn("Hero video media error detected.", {
        index,
        playbackId,
        role: isActive ? "active" : isNext ? "next" : "inactive",
        code: mediaError?.code ?? null,
        message: mediaError?.message ?? null,
        readyState: media.readyState,
        networkState: media.networkState,
      });

      setReadyVideoIndexes((current) => {
        if (!current.has(index)) return current;
        const next = new Set(current);
        next.delete(index);
        return next;
      });

      if (mediaRetryTimersRef.current.has(index)) {
        return;
      }

      const attempts = (mediaRetryAttemptsRef.current.get(index) ?? 0) + 1;
      mediaRetryAttemptsRef.current.set(index, attempts);
      if (attempts > MAX_MEDIA_ERROR_RETRIES) {
        console.warn("Hero video retry limit reached; keeping poster fallback.", {
          index,
          playbackId,
          attempts: attempts - 1,
          outcome: "poster-fallback",
        });
        return;
      }

      const retryTimer = window.setTimeout(() => {
        mediaRetryTimersRef.current.delete(index);
        const currentPlayer = muxPlayerRefs.current[index];
        const currentMedia = currentPlayer?.mediaController?.media;
        if (!currentPlayer || !currentMedia) {
          console.warn("Hero video retry skipped because the media instance is unavailable.", {
            index,
            playbackId,
            attempt: attempts,
          });
          return;
        }

        console.info("Retrying Hero video after media error.", {
          index,
          playbackId,
          attempt: attempts,
        });
        void queueMediaOperation(index, currentPlayer, async (queuedMedia) => {
          queuedMedia.preload = "auto";
          queuedMedia.load();
          await waitForMediaReady(queuedMedia, MEDIA_ERROR_RETRY_TIMEOUT_MS);

          const currentlyActive = index === activeIndexRef.current;
          const currentlyNext = index === nextIndexRef.current;
          if (!currentlyActive && !currentlyNext) {
            return;
          }
          await queuedMedia.play();
          if (!currentlyActive) {
            queuedMedia.pause();
          }
        })
          .then(() => {
            setReadyVideoIndexes((current) => {
              const next = new Set(current);
              next.add(index);
              return next;
            });
            console.info("Hero video retry succeeded.", { index, playbackId, attempt: attempts });
            mediaRetryAttemptsRef.current.delete(index);
          })
          .catch((retryError: unknown) => {
            const timeout = retryError instanceof Error && retryError.message.includes("timeout");
            console.warn(timeout ? "Hero video retry timeout." : "Hero video retry failed.", {
              index,
              playbackId,
              attempt: attempts,
              error: retryError,
            });
            retryVideoAfterError(index, currentPlayer, new Event("error"));
          });
      }, MEDIA_ERROR_RETRY_DELAY_MS);
      mediaRetryTimersRef.current.set(index, retryTimer);
    };

    const attachErrorListeners = () => {
      node.querySelectorAll<MuxPlayerElement>("mux-player").forEach((player, index) => {
        const media = player.mediaController?.media;
        const existingCleanup = errorCleanups.get(index);
        if (existingCleanup) {
          existingCleanup();
          errorCleanups.delete(index);
        }

        const handleError = (event: Event) => retryVideoAfterError(index, player, event);
        player.addEventListener("error", handleError);
        media?.addEventListener("error", handleError);
        errorCleanups.set(index, () => {
          player.removeEventListener("error", handleError);
          media?.removeEventListener("error", handleError);
        });
      });
    };

    attachErrorListeners();
    const listenerRetryId = window.setInterval(attachErrorListeners, 250);
    const stopListenerRetryId = window.setTimeout(() => {
      window.clearInterval(listenerRetryId);
    }, 5000);

    return () => {
      window.clearTimeout(stopListenerRetryId);
      window.clearInterval(listenerRetryId);
      errorCleanups.forEach((cleanup) => cleanup());
      errorCleanups.clear();
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      retryTimers.clear();
    };
  }, [activeIndex, nextIndex, playbackIds.length]);

  useEffect(() => {
    transitionRef.current = transition;
  }, [transition]);

  useEffect(() => {
    if (!mounted || (!activePlaybackId && !activeSlide?.image)) {
      window.dispatchEvent(new Event("linnorea:hero-ready"));
    }
  }, [activePlaybackId, activeSlide?.image, mounted]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const syncPlayers = () => {
      node.querySelectorAll<MuxPlayerElement>("mux-player").forEach((player, index) => {
        muxPlayerRefs.current[index] = player;
        player.preload = "auto";
        if (index === nextIndex || index === activeIndex) {
          player.minPreloadSegments = 1;
          const media = player.mediaController?.media;
          if (media && media.readyState === 0 && !preloadStartedRef.current.has(index)) {
            preloadStartedRef.current.add(index);
            requestManagedPreload(index, async (queuedMedia) => {
              queuedMedia.preload = "auto";
              queuedMedia.load();
              await waitForMediaReady(queuedMedia, MEDIA_ERROR_RETRY_TIMEOUT_MS);
              await queuedMedia.play();
              if (index !== activeIndex) {
                queuedMedia.pause();
              }
            });
          }
        }
      });

      const activePlayer = muxPlayerRefs.current[activeIndex];
      if (activePlayer && !isPaused && isHeroInView && isTabVisible) {
        playActiveVideo(activePlayer);
      }
    };

    syncPlayers();
    const syncTimeoutId = window.setTimeout(syncPlayers, 100);
    const syncRetryId = window.setInterval(syncPlayers, 250);
    const stopSyncRetryId = window.setTimeout(() => {
      window.clearInterval(syncRetryId);
    }, 5000);
    const observer = new MutationObserver(syncPlayers);
    observer.observe(node, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(syncTimeoutId);
      window.clearTimeout(stopSyncRetryId);
      window.clearInterval(syncRetryId);
      observer.disconnect();
    };
  }, [activeIndex, isHeroInView, isPaused, isTabVisible, nextIndex]);

  useEffect(() => {
    pendingPlayCleanupRef.current?.();
    playbackGenerationRef.current += 1;
    const player = muxPlayerRefs.current[activeIndex];
    if (!mounted || !player) {
      return;
    }

    const handlePlay = () => setIsPaused(false);
    const handleCanPlay = () => {
      if (!isPaused && isHeroInView && isTabVisible) {
        playActiveVideo(player);
      }
    };

    player.addEventListener("play", handlePlay);
    player.addEventListener("canplay", handleCanPlay);
    handleCanPlay();

    return () => {
      pendingPlayCleanupRef.current?.();
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("canplay", handleCanPlay);
    };
  }, [activeIndex, activePlaybackId, isHeroInView, isPaused, isTabVisible, mounted]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = node.querySelectorAll("[data-animate]");

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(elements, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.12 },
      );
    }, node);

    return () => ctx.revert();
  }, [activeIndex]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateReducedMotion);
      return () => mediaQuery.removeEventListener("change", updateReducedMotion);
    }

    mediaQuery.addListener(updateReducedMotion);
    return () => mediaQuery.removeListener(updateReducedMotion);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    videoAdvancedRef.current = false;
  }, [activeIndex, activePlaybackId, resolvedSlides.length]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    playbackGenerationRef.current += 1;

    muxPlayerRefs.current.forEach((player, index) => {
      if (!player) {
        return;
      }

      if (index !== activeIndex && index !== nextIndex) {
        void queueMediaOperation(index, player, (media) => {
          media.pause();
          media.currentTime = 0;
        });
      }
      player.setAttribute("preload", "auto");
    });

  }, [activeIndex, activePlaybackId, mounted, nextIndex, playbackIds]);

  useEffect(() => {
    if (!transition || isPaused || !isHeroInView || !isTabVisible) return;
    const incomingPlayer = muxPlayerRefs.current[transition.to];
    if (incomingPlayer) {
      playActiveVideo(incomingPlayer);
    }
  }, [isHeroInView, isPaused, isTabVisible, transition]);

  useEffect(() => {
    const activePlayer = muxPlayerRefs.current[activeIndex];
    if (!activePlayer) {
      return;
    }

    if (isPaused || !isHeroInView || !isTabVisible) {
      void queueMediaOperation(activeIndex, activePlayer, (media) => media.pause());
      return;
    }

    playActiveVideo(activePlayer);
    const retryId = window.setTimeout(() => playActiveVideo(activePlayer), 50);
    return () => window.clearTimeout(retryId);
  }, [activeIndex, isHeroInView, isPaused, isTabVisible]);

  useEffect(() => {
    muxPlayerRefs.current.forEach((player, index) => {
      if (!player) {
        return;
      }

      player.preload = "auto";
      if (index === nextIndex || index === activeIndex) {
        player.minPreloadSegments = 1;
        if (player.readyState === 0 && !preloadStartedRef.current.has(index)) {
          preloadStartedRef.current.add(index);
          requestManagedPreload(index, (media) => media.load());
        }
      }
    });
  }, [activeIndex, nextIndex]);

  useEffect(() => {
    const preloadTimers: number[] = [];
    const startPreload = (index: number) => {
      const player = muxPlayerRefs.current[index];
      const media = player?.mediaController?.media;
      if (!player || !media || preloadStartedRef.current.has(index)) return;

      preloadStartedRef.current.add(index);
      requestManagedPreload(index, async (queuedMedia) => {
        queuedMedia.preload = "auto";
        queuedMedia.load();
        await waitForMediaReady(queuedMedia, MEDIA_ERROR_RETRY_TIMEOUT_MS);
        await queuedMedia.play();
        if (index !== activeIndexRef.current) queuedMedia.pause();
      });
    };

    resolvedSlides.forEach((slide, index) => {
      if (!playbackIds[index]) return;
      const timer = window.setTimeout(() => startPreload(index), index === 0 ? 0 : index * VIDEO_PRELOAD_STAGGER_MS);
      preloadTimers.push(timer);
    });

    return () => preloadTimers.forEach((timer) => window.clearTimeout(timer));
  }, [playbackIds, resolvedSlides]);

  useEffect(() => {
    if (!transition) return;

    const outgoingPanel = mediaPanelRefs.current[transition.from];
    const incomingPanel = mediaPanelRefs.current[transition.to];
    if (!outgoingPanel || !incomingPanel) return;

    slideTimelineRef.current?.kill();
    const incomingX = transition.direction * 100;
    const outgoingX = transition.direction * -100;
    gsap.set(outgoingPanel, { xPercent: 0 });
    gsap.set(incomingPanel, { xPercent: incomingX });

    const timeline = gsap.timeline({
      defaults: {
        duration: reducedMotion ? 0.12 : SLIDE_TRANSITION_MS / 1000,
        ease: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      onComplete: () => {
        gsap.set(incomingPanel, { clearProps: "visibility" });
        setActiveIndex(transition.to);
        transitionRef.current = null;
        setTransition(null);
      },
    });
    timeline.to(outgoingPanel, { xPercent: outgoingX }, 0).to(incomingPanel, { xPercent: 0 }, 0);
    slideTimelineRef.current = timeline;

    return () => {
      timeline.kill();
      if (transitionRef.current?.from === transition.from && transitionRef.current?.to === transition.to) {
        transitionRef.current = null;
      }
    };
  }, [reducedMotion, transition]);

  useEffect(() => {
    if (reducedMotion || resolvedSlides.length <= 1 || activePlaybackId || isPaused || !isHeroInView || !isTabVisible) {
      return;
    }

    let animationFrameId: number | null = null;
    let imageTimerId: number | null = null;

    const advance = () => {
      setProgress(1);
      const nextActiveIndex = (activeIndex + 1) % resolvedSlides.length;
      setActiveIndex(nextActiveIndex);
    };

    const startedAt = performance.now() - progressRef.current * AUTO_ADVANCE_MS;
    const updateImageProgress = (now: number) => {
      const elapsed = now - startedAt;
      const nextProgress = Math.min(elapsed / AUTO_ADVANCE_MS, 1);
      setProgress(nextProgress);
      if (elapsed < AUTO_ADVANCE_MS) {
        animationFrameId = window.requestAnimationFrame(updateImageProgress);
      }
    };

    animationFrameId = window.requestAnimationFrame(updateImageProgress);
    imageTimerId = window.setTimeout(advance, AUTO_ADVANCE_MS);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (imageTimerId !== null) {
        window.clearTimeout(imageTimerId);
      }
    };
  }, [activeIndex, activePlaybackId, autoAdvanceResetKey, isHeroInView, isPaused, isTabVisible, reducedMotion, resolvedSlides.length]);

  const goToSlide = (index: number, isManualNavigation = false) => {
    const normalizedIndex = (index + resolvedSlides.length) % resolvedSlides.length;
    if (normalizedIndex === activeIndex || transitionRef.current) return;

    const direction: 1 | -1 = normalizedIndex > activeIndex || (activeIndex === resolvedSlides.length - 1 && normalizedIndex === 0) ? 1 : -1;
    const nextTransition = { from: activeIndex, to: normalizedIndex, direction };
    transitionRef.current = nextTransition;
    setTransition(nextTransition);
    setIsPaused(false);

    if (isManualNavigation) {
      videoAdvancedRef.current = false;
      progressRef.current = 0;
      setProgress(0);
      setAutoAdvanceResetKey((key) => key + 1);

      muxPlayerRefs.current.forEach((player, playerIndex) => {
        if (player && playerIndex !== normalizedIndex && playerIndex !== activeIndex && playerIndex !== nextIndex) {
          void queueMediaOperation(playerIndex, player, (media) => {
            media.pause();
            media.currentTime = 0;
          });
        }
      });

    }
  };

  const togglePause = () => {
    const activePlayer = muxPlayerRefs.current[activeIndex];
    if (activePlayer) {
      if (activePlayer.paused) {
        setIsPaused(false);
        void queueMediaOperation(activeIndex, activePlayer, (media) => media.play()).catch((error: unknown) => {
          console.warn("Hero video could not be played.", error);
        });
      } else {
        setIsPaused(true);
        void queueMediaOperation(activeIndex, activePlayer, (media) => media.pause());
      }
      return;
    }

    setIsPaused((current) => !current);
  };

  const handleVideoTimeUpdate = (event: Event) => {
    if (isPaused) {
      return;
    }

    const video = event.currentTarget as HTMLMediaElement;
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    const nextProgress = Math.min(video.currentTime / video.duration, 1);
    setProgress(nextProgress);

    if (!videoAdvancedRef.current && video.currentTime >= video.duration - 0.25) {
      videoAdvancedRef.current = true;
      goToSlide(activeIndex + 1);
    }
  };

  const handleVideoEnded = (endedIndex: number) => {
    if (endedIndex !== activeIndex || videoAdvancedRef.current) {
      return;
    }

    videoAdvancedRef.current = true;
    setIsPaused(false);
    goToSlide(endedIndex + 1);
  };

  const resetDragIncomingVideo = (index: number) => {
    const player = muxPlayerRefs.current[index];
    if (!player) {
      return;
    }

    void queueMediaOperation(index, player, (media) => {
      media.pause();
      media.currentTime = 0;
    }).catch((error: unknown) => {
      console.warn("Hero drag video could not be reset.", { index, error });
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (transitionRef.current || resolvedSlides.length <= 1 || event.target instanceof Element && event.target.closest("button, a")) return;
    setDragTargetIndex(null);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lockedAxis: null,
      targetIndex: null,
      playTriggered: false,
      incomingPaused: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || transitionRef.current) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    drag.lastX = event.clientX;
    if (!drag.lockedAxis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 10) {
      drag.lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (drag.lockedAxis !== "horizontal") return;

    event.preventDefault();
    const direction: 1 | -1 = deltaX < 0 ? 1 : -1;
    const targetIndex = (activeIndex + direction + resolvedSlides.length) % resolvedSlides.length;
    if (drag.targetIndex !== null && drag.targetIndex !== targetIndex) {
      resetDragIncomingVideo(drag.targetIndex);
      drag.playTriggered = false;
      drag.incomingPaused = false;
    }
    drag.targetIndex = targetIndex;
    setDragTargetIndex(targetIndex);
    const width = rootRef.current?.clientWidth ?? window.innerWidth;
    const distanceRatio = Math.abs(deltaX) / Math.max(width, 1);
    const incomingPlayer = muxPlayerRefs.current[targetIndex];
    if (distanceRatio < DRAG_PLAY_TRIGGER_RATIO) {
      if (!drag.incomingPaused) {
        resetDragIncomingVideo(targetIndex);
        drag.incomingPaused = true;
      }
    } else if (!drag.playTriggered && incomingPlayer) {
      drag.playTriggered = true;
      drag.incomingPaused = false;
      playActiveVideo(incomingPlayer);
    }
    const deltaPercent = (deltaX / Math.max(width, 1)) * 100;
    const outgoingPanel = mediaPanelRefs.current[activeIndex];
    const incomingPanel = mediaPanelRefs.current[targetIndex];
    if (!outgoingPanel || !incomingPanel) return;

    gsap.set(outgoingPanel, { xPercent: deltaPercent });
    gsap.set(incomingPanel, { xPercent: deltaPercent + direction * 100, visibility: "visible" });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.lockedAxis !== "horizontal" || drag.targetIndex === null) {
      setDragTargetIndex(null);
      return;
    }

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) >= DRAG_THRESHOLD_PX) {
      goToSlide(drag.targetIndex, true);
      setDragTargetIndex(null);
      return;
    }

    resetDragIncomingVideo(drag.targetIndex);
    const outgoingPanel = mediaPanelRefs.current[activeIndex];
    const incomingPanel = mediaPanelRefs.current[drag.targetIndex];
    const direction: 1 | -1 = distance < 0 ? 1 : -1;
    gsap.timeline({ defaults: { duration: 0.25, ease: "power2.out" } })
      .to(outgoingPanel, { xPercent: 0 }, 0)
      .to(incomingPanel, { xPercent: direction * 100 }, 0)
      .eventCallback("onComplete", () => {
        gsap.set(incomingPanel, { clearProps: "visibility" });
        setDragTargetIndex(null);
      });
  };

  return (
    <section
      ref={rootRef}
      data-home-hero
      className="hero-section relative isolate flex flex-col overflow-hidden bg-[var(--color-bg-base)] text-white"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ height: "100svh", minHeight: 640, touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
    >
      <div className="absolute inset-0">
        {resolvedSlides.map((slide, index) => {
          const slidePlaybackId = playbackIds[index];
          const slideMediaUrl = slide.image ? urlFor(slide.image).width(1800).height(1100).fit("crop").auto("format").quality(78).url() : null;
          const slidePosterUrl = slideMediaUrl ?? (slidePlaybackId ? `https://image.mux.com/${slidePlaybackId}/thumbnail.jpg?time=0` : null);
          const isActive = index === activeIndex;
          const isTransitionIncoming = transition?.to === index;
          const isDragIncoming = dragTargetIndex === index;
          const isTransitionVisible = isActive || isTransitionIncoming || isDragIncoming;

          return (
            <div
              key={slide._id ?? `hero-media-${index}`}
              ref={(panel) => {
                mediaPanelRefs.current[index] = panel;
              }}
              className={`absolute inset-0 ${isTransitionVisible ? "z-10" : "pointer-events-none invisible"}`}
              aria-hidden={!isTransitionVisible}
            >
              <div className="hero-media-frame">
                {slidePosterUrl ? (
                  <Image
                    src={slidePosterUrl}
                    alt={isActive ? headline : ""}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    onLoad={isActive ? () => window.dispatchEvent(new Event("linnorea:hero-ready")) : undefined}
                    className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${isTransitionVisible && readyVideoIndexes.has(index) ? "opacity-0" : "opacity-100"}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(116,120,127,0.25),rgba(14,17,21,0.82))] px-6 text-center text-[10px] font-medium uppercase tracking-[0.6em] text-white/40">
                    {dictionary.ui.placeholderHeroImage}
                  </div>
                )}
                {slidePlaybackId && mounted ? (
                  <MuxPlayer
                    ref={(player) => {
                      muxPlayerRefs.current[index] = player;
                      if (player) {
                        player.preload = "auto";
                        player.minPreloadSegments = 1;
                      }
                    }}
                    playbackId={slidePlaybackId}
                    autoPlay={isActive || index === nextIndex || isTransitionIncoming}
                    muted
                    playsInline
                    preload="auto"
                    minPreloadSegments={index === nextIndex || isActive ? 1 : undefined}
                    poster={slidePosterUrl ?? undefined}
                    theme="microvideo"
                    nohotkeys
                    defaultHiddenCaptions
                    noVolumePref
                    disablePictureInPicture
                    style={{
                      "--controls": "none",
                      "--time-range": "none",
                      "--volume-range": "none",
                      "--media-control-display": "none",
                      "--media-control-bar-display": "none",
                      "--media-time-range-display": "none",
                      "--media-preview-time-display": "none",
                      "--media-play-button-display": "none",
                      "--media-loading-indicator-display": "none",
                      background: "transparent",
                    }}
                    onTimeUpdate={isActive ? handleVideoTimeUpdate : undefined}
                    onEnded={() => handleVideoEnded(index)}
                    onCanPlay={() => handleVideoCanPlay(index)}
                    onError={() => handleVideoFailure(index)}
                    onStalled={() => handleVideoFailure(index)}
                    className={`pointer-events-none h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${isTransitionVisible || index === nextIndex ? "visible" : "invisible"} ${isTransitionVisible && (!slideMediaUrl || readyVideoIndexes.has(index)) ? "opacity-100" : "opacity-0"}`}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,8,10,0.9),rgba(7,8,10,0.3),rgba(7,8,10,0.7))]" />
      <button
        type="button"
        aria-label={isPaused ? dictionary.ui.playHeroMedia : dictionary.ui.pauseHeroMedia}
        aria-pressed={isPaused}
        onClick={togglePause}
        className="arrow-circle-button hero-pause-button group absolute bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center bg-black/30 text-white/90 backdrop-blur-sm transition-colors duration-200 hover:!bg-white hover:!text-black focus-visible:!bg-white focus-visible:!text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:bottom-10 md:right-10"
      >
        {isPaused ? (
          <svg viewBox="0 0 12 14" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M11.2 7 1.4 13.1V.9L11.2 7Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 10 14" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M0 0h3v14H0zM7 0h3v14H7z" />
          </svg>
        )}
      </button>

      <div
        className="hero-content-layer relative z-10 flex flex-col items-center px-5 pb-10 pt-28 text-center md:pb-12 md:pt-36"
        style={{ flex: "1 1 auto", minHeight: 0, justifyContent: "flex-end", userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
      >
        <div className="flex w-full max-w-[526.7px] flex-col items-center">
          <p
            data-animate
            className="hero-eyebrow mb-6 text-[13px] uppercase leading-none tracking-[0.35em] text-white/70"
            style={{ marginBottom: 24 }}
          >
            {eyebrow}
          </p>
          <h1 className="mb-10 text-[32px] font-medium leading-[0.95] tracking-[-0.04em]" style={{ marginBottom: 40, fontSize: 32 }}>
            {headline}
          </h1>
          <a
            href="#collections"
            data-animate
            className="group pointer-events-auto flex items-center gap-1 text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-accent-gold)]"
            aria-label={`${dictionary.home.discover} collections`}
          >
            <ArrowAction label={dictionary.home.discover} size="md" className="text-[10px] uppercase tracking-[0.35em] md:text-xs" />
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2.5 md:mt-4">
          {resolvedSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            const buttonSizeClass = isActive ? "h-5 w-5" : "h-2.5 w-2.5";
            return (
              <button
                key={slide._id ?? `hero-slide-${index}`}
                type="button"
                aria-label={`${dictionary.ui.showSlide} ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => goToSlide(index, true)}
                className={`relative m-0 flex ${buttonSizeClass} items-center justify-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                <CarouselDot active={isActive} passed={index < activeIndex} progress={progress} resetKey={`hero-dot-${activeIndex}`} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
