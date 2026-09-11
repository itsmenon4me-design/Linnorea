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
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { plainText, type HeroSlide } from "@/lib/sanity/types";

type HeroProps = {
  dictionary: Dictionary;
  slides?: HeroSlide[];
};

type HeroTransition = {
  from: number;
  to: number;
  direction: 1 | -1;
};

const AUTO_ADVANCE_MS = 6000;
const SLIDE_TRANSITION_MS = 720;
const VIDEO_PRELOAD_STAGGER_MS = 450;
const MAX_HERO_SLIDES = 3;
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

export function Hero({ dictionary, slides = [] }: HeroProps) {
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlayingIndex, setDragPlayingIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState(0);
  const playingIndexRef = useRef(0);
  const dragCommitRef = useRef(false);
  const transitionRef = useRef<HeroTransition | null>(null);
  const dragSwapActiveRef = useRef(false);
  const playbackGenerationRef = useRef(0);
  const pendingPlayCleanupRef = useRef<(() => void) | null>(null);

  const resolvedSlides = useMemo<HeroSlide[]>(
    () =>
      slides.length > 0
        ? slides.slice(0, MAX_HERO_SLIDES)
        : [
            {
              _id: "fallback-hero-slide",
              eyebrow: dictionary.home.eyebrow,
              headline: dictionary.home.headline,
              subheadline: dictionary.home.subheadline,
            },
          ],
    [dictionary.home.eyebrow, dictionary.home.headline, dictionary.home.subheadline, slides],
  );
  const activeSlide = resolvedSlides[activeIndex] ?? resolvedSlides[0];
  const eyebrow = plainText(activeSlide?.eyebrow) || dictionary.home.eyebrow;
  const headline = plainText(activeSlide?.headline) || dictionary.home.headline;
  const subheadline = plainText(activeSlide?.subheadline) || dictionary.home.subheadline;
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
  const initialHeroLoadCompleteRef = useRef(false);
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
    swapActive: boolean;
  } | null>(null);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    nextIndexRef.current = nextIndex;
    dragSwapActiveRef.current = false;
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
      const maxInFlight = !initialHeroLoadCompleteRef.current
        ? 1
        : activeQueued || activeInFlight
          ? 2
          : 1;
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
          if (next.index === 0) {
            initialHeroLoadCompleteRef.current = true;
          }
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
        if (generation !== playbackGenerationRef.current) {
          return;
        }
        if (
          queuedMedia.ended ||
          (Number.isFinite(queuedMedia.duration) && queuedMedia.duration > 0 && queuedMedia.currentTime >= queuedMedia.duration - 0.05)
        ) {
          queuedMedia.currentTime = 0;
        }
        await queuedMedia.play();
        if (generation !== playbackGenerationRef.current) {
          return;
        }
        playingIndexRef.current = playerIndex;
        setPlayingIndex(playerIndex);
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

    if ((index === activeIndex || index === transitionRef.current?.to) && !dragSwapActiveRef.current && !isPaused && isHeroInView && isTabVisible) {
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
        if (playbackIds[index]) {
          player.minPreloadSegments = 1;
          const media = player.mediaController?.media;
          if (media && media.readyState === 0 && !preloadStartedRef.current.has(index)) {
            preloadStartedRef.current.add(index);
            requestManagedPreload(index, async (queuedMedia) => {
              queuedMedia.preload = "auto";
              queuedMedia.load();
              await waitForMediaReady(queuedMedia, MEDIA_ERROR_RETRY_TIMEOUT_MS);
              if (dragSwapActiveRef.current && index === activeIndexRef.current) {
                queuedMedia.pause();
                return;
              }
              await queuedMedia.play();
              if (index !== activeIndex) {
                queuedMedia.pause();
              }
            });
          }
        }
      });

      const activePlayer = muxPlayerRefs.current[activeIndex];
      if (activePlayer && !dragSwapActiveRef.current && !isPaused && isHeroInView && isTabVisible) {
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
      if (!dragSwapActiveRef.current && !isPaused && isHeroInView && isTabVisible) {
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
    const resumePlayingVideo = () => {
      if (document.hidden || isPaused || !isHeroInView) {
        return;
      }

      const playingPlayer = muxPlayerRefs.current[playingIndexRef.current];
      if (playingPlayer?.paused) {
        playActiveVideo(playingPlayer);
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("visibilitychange", resumePlayingVideo);
    window.addEventListener("focus", resumePlayingVideo);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("visibilitychange", resumePlayingVideo);
      window.removeEventListener("focus", resumePlayingVideo);
    };
  }, [isHeroInView, isPaused]);

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
      if (playbackIds[index]) {
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

  const goToSlide = (index: number, isManualNavigation = false) => {
    const normalizedIndex = (index + resolvedSlides.length) % resolvedSlides.length;
    if (normalizedIndex === activeIndex || transitionRef.current) return;

    const direction: 1 | -1 =
      normalizedIndex > activeIndex || (activeIndex === resolvedSlides.length - 1 && normalizedIndex === 0) ? 1 : -1;
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

  useEffect(() => {
    if (!transition) return;

    const outgoingPanel = mediaPanelRefs.current[transition.from];
    const incomingPanel = mediaPanelRefs.current[transition.to];
    if (!outgoingPanel || !incomingPanel) return;

    slideTimelineRef.current?.kill();
    const incomingX = transition.direction * 100;
    const outgoingX = transition.direction * -100;
    if (!dragCommitRef.current) {
      gsap.set(outgoingPanel, { xPercent: 0 });
      gsap.set(incomingPanel, { xPercent: incomingX });
    }

    const timeline = gsap.timeline({
      defaults: {
        duration: reducedMotion ? 0.12 : SLIDE_TRANSITION_MS / 1000,
        ease: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      onComplete: () => {
        gsap.set(incomingPanel, { clearProps: "visibility" });
        setActiveIndex(transition.to);
        setDragPlayingIndex(null);
        dragCommitRef.current = false;
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
    if (
      reducedMotion ||
      resolvedSlides.length <= 1 ||
      activePlaybackId ||
      isPaused ||
      !isHeroInView ||
      !isTabVisible ||
      isDragging ||
      dragTargetIndex !== null ||
      transition !== null
    ) {
      return;
    }

    let animationFrameId: number | null = null;
    let imageTimerId: number | null = null;

    const advance = () => {
      setProgress(1);
      const nextActiveIndex = (activeIndex + 1) % resolvedSlides.length;
      goToSlide(nextActiveIndex);
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
  }, [
    activeIndex,
    activePlaybackId,
    autoAdvanceResetKey,
    dragTargetIndex,
    isHeroInView,
    isDragging,
    isPaused,
    isTabVisible,
    reducedMotion,
    resolvedSlides.length,
    transition,
  ]);

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
    if (isPaused || isDragging || dragTargetIndex !== null || transition !== null) {
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
    const isDragGestureActive = isDragging || dragTargetIndex !== null;
    if (
      isDragGestureActive &&
      (endedIndex === activeIndex || endedIndex === dragPlayingIndex || endedIndex === dragTargetIndex)
    ) {
      const player = muxPlayerRefs.current[endedIndex];
      if (player) {
        void queueMediaOperation(endedIndex, player, async (media) => {
          media.currentTime = 0;
          await media.play();
        }).catch((error: unknown) => {
          console.warn("Hero drag video could not be looped.", { index: endedIndex, error });
        });
      }
      return;
    }

    if (endedIndex !== activeIndex || videoAdvancedRef.current) {
      return;
    }

    videoAdvancedRef.current = true;
    setIsPaused(false);
    goToSlide(endedIndex + 1);
  };

  const resetDragMedia = (index: number) => {
    const player = muxPlayerRefs.current[index];
    if (!player) {
      return;
    }

    const media = player.mediaController?.media;
    media?.pause();
    player.currentTime = 0;
    void queueMediaOperation(index, player, (media) => {
      media.pause();
      media.currentTime = 0;
    }).catch((error: unknown) => {
      console.warn("Hero drag video could not be reset.", { index, error });
    });
  };

  useEffect(() => {
    if (transition !== null) {
      return;
    }

    setDragPlayingIndex(null);
  }, [activeIndex, transition]);

  const pauseDragMedia = (index: number) => {
    const player = muxPlayerRefs.current[index];
    if (!player) {
      return;
    }

    player.mediaController?.media?.pause();
    void queueMediaOperation(index, player, (media) => media.pause()).catch((error: unknown) => {
      console.warn("Hero drag video could not be paused.", { index, error });
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (transitionRef.current || resolvedSlides.length <= 1 || event.target instanceof Element && event.target.closest("button, a")) return;
    slideTimelineRef.current?.kill();
    slideTimelineRef.current = null;
    setDragTargetIndex(null);
    setIsDragging(true);
    setDragPlayingIndex(activeIndex);
    mediaPanelRefs.current.forEach((panel) => {
      if (panel) {
        gsap.killTweensOf(panel);
      }
    });
    mediaPanelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      gsap.set(panel, {
        xPercent: index === activeIndex ? 0 : 100,
        visibility: index === activeIndex ? "visible" : "hidden",
      });
    });
    console.log("[Hero drag transform]", {
      phase: "pointer-down-reset",
      timestamp: new Date().toISOString(),
      activeIndex,
      transformOwner: "drag-pointer",
    });
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lockedAxis: null,
      targetIndex: null,
      swapActive: false,
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
    const targetChanged = drag.targetIndex !== targetIndex;
    if (drag.targetIndex !== null && targetChanged) {
      resetDragMedia(drag.targetIndex);
      setDragPlayingIndex(activeIndex);
      if (drag.swapActive) {
        dragSwapActiveRef.current = false;
        const activePlayer = muxPlayerRefs.current[activeIndex];
        if (activePlayer) playActiveVideo(activePlayer);
        drag.swapActive = false;
      }
    }
    drag.targetIndex = targetIndex;
    setDragTargetIndex(targetIndex);
    const width = rootRef.current?.clientWidth ?? window.innerWidth;
    const incomingPlayer = muxPlayerRefs.current[targetIndex];
    const passedPlayTrigger = Math.abs(deltaX) / Math.max(width, 1) >= DRAG_PLAY_TRIGGER_RATIO;
    if (targetChanged && incomingPlayer && !passedPlayTrigger) {
      resetDragMedia(targetIndex);
    }
    if (passedPlayTrigger && !drag.swapActive && incomingPlayer) {
      dragSwapActiveRef.current = true;
      playbackGenerationRef.current += 1;
      pauseDragMedia(activeIndex);
      playActiveVideo(incomingPlayer);
      setDragPlayingIndex(targetIndex);
      drag.swapActive = true;
    } else if (!passedPlayTrigger && drag.swapActive) {
      resetDragMedia(targetIndex);
      dragSwapActiveRef.current = false;
      playbackGenerationRef.current += 1;
      const activePlayer = muxPlayerRefs.current[activeIndex];
      if (activePlayer) playActiveVideo(activePlayer);
      setDragPlayingIndex(activeIndex);
      drag.swapActive = false;
    }
    const deltaPercent = (deltaX / Math.max(width, 1)) * 100;
    const outgoingPanel = mediaPanelRefs.current[activeIndex];
    const incomingPanel = mediaPanelRefs.current[targetIndex];
    if (!outgoingPanel || !incomingPanel) return;

    if (targetChanged) {
      gsap.set(incomingPanel, { xPercent: direction * 100 });
    }
    gsap.set(outgoingPanel, { xPercent: deltaPercent });
    gsap.set(incomingPanel, { xPercent: deltaPercent + direction * 100, visibility: "visible" });
    console.log("[Hero drag transform]", {
      phase: "pointer-move",
      timestamp: new Date().toISOString(),
      deltaPercent: Number(deltaPercent.toFixed(2)),
      direction,
      activeIndex,
      targetIndex,
      targetChanged,
      passedPlayTrigger,
      outgoingXPercent: Number(gsap.getProperty(outgoingPanel, "xPercent")),
      incomingXPercent: Number(gsap.getProperty(incomingPanel, "xPercent")),
      transformOwner: "drag-pointer",
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.lockedAxis !== "horizontal" || drag.targetIndex === null) {
      setDragTargetIndex(null);
      setDragPlayingIndex(null);
      return;
    }

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) >= DRAG_THRESHOLD_PX && drag.swapActive) {
      dragCommitRef.current = true;
      console.log("[Hero drag transform]", {
        phase: "commit-settle",
        timestamp: new Date().toISOString(),
        from: activeIndex,
        to: drag.targetIndex,
        transformOwner: "commit-timeline",
      });
      goToSlide(drag.targetIndex, true);
      dragSwapActiveRef.current = false;
      setDragTargetIndex(null);
      return;
    }

    resetDragMedia(drag.targetIndex);
    if (drag.swapActive) {
      dragSwapActiveRef.current = false;
      const activePlayer = muxPlayerRefs.current[activeIndex];
      if (activePlayer) playActiveVideo(activePlayer);
    }
    progressRef.current = 0;
    setProgress(0);
    setAutoAdvanceResetKey((key) => key + 1);
    setDragPlayingIndex(activeIndex);
    const outgoingPanel = mediaPanelRefs.current[activeIndex];
    const incomingPanel = mediaPanelRefs.current[drag.targetIndex];
    const direction: 1 | -1 = distance < 0 ? 1 : -1;
    gsap.timeline({ defaults: { duration: 0.25, ease: "power2.out" } })
      .to(outgoingPanel, { xPercent: 0 }, 0)
      .to(incomingPanel, { xPercent: direction * 100 }, 0)
      .eventCallback("onComplete", () => {
        gsap.set(incomingPanel, { clearProps: "visibility" });
        setDragTargetIndex(null);
        setDragPlayingIndex(null);
      });
  };

  return (
    <section
      ref={rootRef}
      data-home-hero
      className="hero-section relative isolate flex flex-col overflow-hidden bg-[var(--color-bg-base)] text-white"
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
      onPointerCancelCapture={handlePointerUp}
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
          const shouldLoopDuringDrag =
            (isDragging || dragTargetIndex !== null) &&
            (isActive || index === dragPlayingIndex || isDragIncoming);

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
                  <MediaPlaceholder className="h-full w-full bg-[linear-gradient(135deg,rgba(116,120,127,0.25),rgba(14,17,21,0.82))]" />
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
                    loop={shouldLoopDuringDrag}
                    muted
                    playsInline
                    preload="auto"
                    minPreloadSegments={slidePlaybackId ? 1 : undefined}
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
          <h1 data-animate className="mb-10 text-[32px] font-medium leading-[0.95] tracking-[-0.04em]" style={{ marginBottom: 40, fontSize: 32 }}>
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
            const isDragGestureActive = isDragging || dragTargetIndex !== null || dragPlayingIndex !== null || transition !== null;
            const visualActiveIndex = isDragGestureActive ? dragPlayingIndex ?? playingIndex : playingIndex;
            const isIndicatorActive = visualActiveIndex === index;
            const buttonSizeClass = isIndicatorActive ? "h-5 w-5" : "h-2.5 w-2.5";
            return (
              <button
                key={slide._id ?? `hero-slide-${index}`}
                type="button"
                aria-label={`${dictionary.ui.showSlide} ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => goToSlide(index, true)}
                className={`relative m-0 flex ${buttonSizeClass} items-center justify-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                {isDragGestureActive ? (
                  isIndicatorActive ? (
                  <span className="block h-5 w-5 rounded-full border-2 border-white/55" aria-hidden="true" />
                  ) : (
                    <span
                      className="block h-[6.8px] w-[6.8px] rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                      aria-hidden="true"
                    />
                  )
                ) : (
                  <CarouselDot
                    active={isIndicatorActive}
                    passed={index < playingIndex}
                    progress={progress}
                    resetKey={`hero-dot-${playingIndex}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
