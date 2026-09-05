"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage, MuxVideo } from "@/lib/sanity/types";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type StudioVisualProps = {
  image?: SanityImage;
  video?: MuxVideo;
  placeholderLabel: string;
  videoLabel: string;
};

export function StudioVisual({ image, video, placeholderLabel, videoLabel }: StudioVisualProps) {
  const playbackId = video?.asset?.status === "ready" ? video.asset.playbackId : null;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (!playbackId) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [playbackId]);

  if (playbackId) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        {isNearViewport ? (
          <MuxPlayer
            playbackId={playbackId}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`}
            aria-label={videoLabel}
            theme="microvideo"
            nohotkeys
            defaultHiddenCaptions
            noVolumePref
            disablePictureInPicture
            style={{
              "--controls": "none",
              "--media-control-display": "none",
              "--media-control-bar-display": "none",
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-[var(--color-bg-elevated)]" />
        )}
      </div>
    );
  }

  if (image) {
    return <Image src={urlFor(image).width(1920).height(1280).fit("crop").auto("format").url()} alt="Linnorea studio" fill sizes="100vw" className="object-cover" />;
  }

  return <div className="absolute inset-0 flex items-center justify-center text-center text-[10px] uppercase tracking-[0.32em] text-white/40">{placeholderLabel}</div>;
}
